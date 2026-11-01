import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import crypto from "crypto";

import { connectDB } from "@/lib/mongodb";
import Party from "@/models/Party";
import Ticket from "@/models/Ticket";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET;

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* =========================================================
   AUTH — identical to your companion booking route
========================================================= */

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

/* =========================================================
   POST /api/parties/[id]/tickets/create-order
========================================================= */

export async function POST(request, { params }) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please log in before buying tickets." },
        { status: 401 }
      );
    }

    // Next 15 — params is a Promise
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Party not found." },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const quantity = Math.max(1, Math.min(10, Number(body.quantity || 1)));

    await connectDB();

    const party = await Party.findById(id);

    if (!party) {
      return NextResponse.json(
        { success: false, message: "Party not found." },
        { status: 404 }
      );
    }

    if (party.status !== "live") {
      return NextResponse.json(
        { success: false, message: "This party is not accepting bookings." },
        { status: 400 }
      );
    }

    if (String(party.hostId) === String(userId)) {
      return NextResponse.json(
        { success: false, message: "You cannot buy a ticket to your own party." },
        { status: 400 }
      );
    }

    if (quantity > party.maxGuestsPerBooking) {
      return NextResponse.json(
        {
          success: false,
          message: `Maximum ${party.maxGuestsPerBooking} tickets per booking.`,
        },
        { status: 400 }
      );
    }

    /* =====================================================
       ATOMIC RESERVATION
       Prevents over-selling under concurrency
    ===================================================== */

    const reserved = await Party.findOneAndUpdate(
      {
        _id: party._id,
        status: "live",
        $expr: {
          $lte: [{ $add: ["$ticketsSold", quantity] }, "$totalTickets"],
        },
      },
      { $inc: { ticketsSold: quantity } },
      { new: true }
    );

    if (!reserved) {
      return NextResponse.json(
        { success: false, message: "Tickets just sold out." },
        { status: 409 }
      );
    }

    const unitPrice = Number(reserved.ticketPrice || 0);
    const subtotal = unitPrice * quantity;

    /* =====================================================
       FREE PARTY — skip Razorpay entirely
    ===================================================== */

    if (subtotal === 0) {
      const ticketCode =
        "ZQ-" + crypto.randomBytes(5).toString("hex").toUpperCase();

      const ticket = await Ticket.create({
        partyId: reserved._id,
        buyerId: userId,
        quantity,
        unitPrice: 0,
        totalAmount: 0,
        ticketCode,
        status: "paid",
      });

      if (reserved.ticketsSold >= reserved.totalTickets) {
        reserved.status = "sold_out";
        await reserved.save();
      }

      return NextResponse.json({
        success: true,
        free: true,
        ticket: {
          _id: ticket._id,
          ticketCode: ticket.ticketCode,
          quantity: ticket.quantity,
          totalAmount: ticket.totalAmount,
          status: ticket.status,
        },
      });
    }

    /* =====================================================
       PAID PARTY — create Razorpay order
       Match your companion-booking fee structure exactly (10%)
    ===================================================== */

    const serviceFee = Math.round(subtotal * 10 / 100);
    const total = subtotal + serviceFee;
    const amountInPaise = Math.round(total * 100);

    if (amountInPaise <= 0) {
      // Roll back the reservation since we can't charge
      await Party.updateOne(
        { _id: reserved._id },
        { $inc: { ticketsSold: -quantity } }
      );

      return NextResponse.json(
        { success: false, message: "Invalid booking amount." },
        { status: 400 }
      );
    }

    const receipt = `zqava_party_${String(userId).slice(-8)}_${Date.now()}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        customerId: String(userId),
        partyId: String(reserved._id),
        quantity: String(quantity),
      },
    });

    /* =====================================================
       CREATE TICKET IN "reserved" STATE
       This locks the inventory until verify is called or expires.
    ===================================================== */

    const ticketCode =
      "ZQ-" + crypto.randomBytes(5).toString("hex").toUpperCase();

    const ticket = await Ticket.create({
      partyId: reserved._id,
      buyerId: userId,
      quantity,
      unitPrice,
      totalAmount: total,
      ticketCode,
      status: "reserved",
      razorpayOrderId: order.id,
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      ticket: {
        _id: ticket._id,
        ticketCode: ticket.ticketCode,
        quantity: ticket.quantity,
      },
      subtotal,
      serviceFee,
      total,
    });
  } catch (error) {
    console.error("PARTY CREATE ORDER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to create payment order." },
      { status: 500 }
    );
  }
}