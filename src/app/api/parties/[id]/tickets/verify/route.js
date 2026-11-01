import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import crypto from "crypto";
import Razorpay from "razorpay";

import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import Party from "@/models/Party";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET;

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("zqava_session")?.value;

  if (!token || !JWT_SECRET) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    return payload.userId || payload.id || null;
  } catch {
    return null;
  }
}

export async function POST(request, { params }) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please log in before verifying payment." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Missing payment verification details." },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("RAZORPAY_KEY_SECRET is missing.");
      return NextResponse.json(
        { success: false, message: "Payment configuration error." },
        { status: 500 }
      );
    }

    /* ---------- SIGNATURE ---------- */
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const generatedBuffer = Buffer.from(generatedSignature, "utf8");
    const receivedBuffer = Buffer.from(razorpay_signature, "utf8");

    if (
      generatedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(generatedBuffer, receivedBuffer)
    ) {
      return NextResponse.json(
        { success: false, message: "Payment verification failed." },
        { status: 400 }
      );
    }

    /* ---------- FETCH ORDER ---------- */
    const order = await razorpay.orders.fetch(razorpay_order_id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Razorpay order could not be found." },
        { status: 400 }
      );
    }

    if (String(order.notes?.customerId || "") !== String(userId)) {
      return NextResponse.json(
        { success: false, message: "This payment order does not belong to you." },
        { status: 403 }
      );
    }

    /* ---------- FETCH PAYMENT ---------- */
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Razorpay payment could not be found." },
        { status: 400 }
      );
    }

    if (String(payment.order_id || "") !== String(razorpay_order_id)) {
      return NextResponse.json(
        { success: false, message: "Payment does not belong to this order." },
        { status: 400 }
      );
    }

    if (Number(payment.amount) !== Number(order.amount)) {
      return NextResponse.json(
        { success: false, message: "Payment amount does not match the order." },
        { status: 400 }
      );
    }

    if (String(payment.currency || "") !== String(order.currency || "")) {
      return NextResponse.json(
        { success: false, message: "Payment currency does not match the order." },
        { status: 400 }
      );
    }

    if (payment.status !== "captured") {
      return NextResponse.json(
        {
          success: false,
          message: `Payment has not been captured. Current status: ${payment.status}.`,
        },
        { status: 400 }
      );
    }

    /* ---------- FIND TICKET (by order + buyer only) ---------- */
    await connectDB();

    let ticket = await Ticket.findOne({
      razorpayOrderId: razorpay_order_id,
      buyerId: userId,
    });

    /* ---------- RECOVERY if ticket is missing ---------- */
    if (!ticket) {
      console.warn(
        "[VERIFY-RECOVERY] No ticket for order:",
        razorpay_order_id,
        "| URL id:",
        id
      );

      const notePartyId = order.notes?.partyId;
      const noteBuyerId = order.notes?.customerId;
      const noteQuantity = Number(order.notes?.quantity || 1);

      if (
        notePartyId &&
        noteBuyerId &&
        String(noteBuyerId) === String(userId)
      ) {
        const party = await Party.findById(notePartyId);

        if (party) {
          const unitPrice = party.ticketPrice || 0;
          const subtotal = unitPrice * noteQuantity;
          const serviceFee = Math.round(subtotal * 0.1);
          const totalAmount = subtotal + serviceFee;

          const ticketCode =
            "ZQ-" + crypto.randomBytes(5).toString("hex").toUpperCase();

          const reserved = await Party.findOneAndUpdate(
            {
              _id: party._id,
              $expr: {
                $lte: [
                  { $add: ["$ticketsSold", noteQuantity] },
                  "$totalTickets",
                ],
              },
            },
            { $inc: { ticketsSold: noteQuantity } },
            { new: true }
          );

          if (reserved) {
            ticket = await Ticket.create({
              partyId: party._id,
              buyerId: userId,
              quantity: noteQuantity,
              unitPrice,
              totalAmount,
              ticketCode,
              status: "paid",
              razorpayOrderId: razorpay_order_id,
              razorpayPaymentId: razorpay_payment_id,
              razorpaySignature: razorpay_signature,
            });

            console.log(
              "[VERIFY-RECOVERY] Ticket recreated:",
              ticket.ticketCode
            );
          } else {
            console.error(
              "[VERIFY-RECOVERY] Cannot reserve slot — party full. Refund required. Payment:",
              razorpay_payment_id
            );
          }
        }
      }
    }

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment received but we could not locate your ticket. Please contact support with your payment ID.",
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
        },
        { status: 500 }
      );
    }

    /* ---------- IDEMPOTENCY ---------- */
    if (ticket.status === "paid") {
      return NextResponse.json({
        success: true,
        message: "Payment already verified.",
        ticket: {
          _id: ticket._id,
          ticketCode: ticket.ticketCode,
          quantity: ticket.quantity,
          totalAmount: ticket.totalAmount,
          status: ticket.status,
        },
      });
    }

    /* ---------- MARK PAID ---------- */
    ticket.status = "paid";
    ticket.razorpayPaymentId = razorpay_payment_id;
    ticket.razorpaySignature = razorpay_signature;
    await ticket.save();

    /* ---------- SOLD-OUT (uses ticket.partyId, not URL id) ---------- */
    const party = await Party.findById(ticket.partyId);

    if (party && party.ticketsSold >= party.totalTickets) {
      party.status = "sold_out";
      await party.save();
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully.",
      payment: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method || "",
        status: payment.status,
      },
      ticket: {
        _id: ticket._id,
        ticketCode: ticket.ticketCode,
        quantity: ticket.quantity,
        totalAmount: ticket.totalAmount,
        status: ticket.status,
      },
    });
  } catch (error) {
    console.error("PARTY VERIFY ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to verify payment." },
      { status: 500 }
    );
  }
}