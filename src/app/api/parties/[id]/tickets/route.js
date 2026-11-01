import { NextResponse } from "next/server";
import mongoose from "mongoose";
import crypto from "crypto";
import Razorpay from "razorpay";
import { connectDB } from "@/lib/mongodb";
import Party from "@/models/Party";
import Ticket from "@/models/Ticket";
import { getSession } from "@/lib/auth";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Party not found." },
        { status: 404 }
      );
    }

    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, message: "Please log in to buy tickets." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const quantity = Math.max(1, Math.min(10, Number(body.quantity || 1)));

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

    if (String(party.hostId) === String(session.userId)) {
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

    const left = party.totalTickets - party.ticketsSold;
    if (quantity > left) {
      return NextResponse.json(
        { success: false, message: `Only ${left} ticket(s) left.` },
        { status: 400 }
      );
    }

    // ── 1. Atomically reserve tickets ─────────────────────
    const updated = await Party.findOneAndUpdate(
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

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Tickets just sold out." },
        { status: 409 }
      );
    }

    const unitPrice = updated.ticketPrice; // INR
    const totalAmount = unitPrice * quantity;

    // Free party → skip Razorpay entirely
    if (totalAmount === 0) {
      const ticketCode =
        "ZQ-" + crypto.randomBytes(5).toString("hex").toUpperCase();

      const ticket = await Ticket.create({
        partyId: updated._id,
        buyerId: session.userId,
        quantity,
        unitPrice,
        totalAmount,
        ticketCode,
        status: "paid",
      });

      if (updated.ticketsSold >= updated.totalTickets) {
        updated.status = "sold_out";
        await updated.save();
      }

      return NextResponse.json(
        { success: true, free: true, ticket },
        { status: 201 }
      );
    }

    // ── 2. Create Razorpay order ──────────────────────────
    const order = await razorpay.orders.create({
      amount: totalAmount * 100, // ₹ → paise
      currency: "INR",
      receipt: `party_${updated._id}_${Date.now()}`,
      notes: {
        partyId: String(updated._id),
        buyerId: String(session.userId),
        quantity,
      },
    });

    // ── 3. Save ticket as "reserved" (NOT paid yet) ───────
    const ticketCode =
      "ZQ-" + crypto.randomBytes(5).toString("hex").toUpperCase();

    const ticket = await Ticket.create({
      partyId: updated._id,
      buyerId: session.userId,
      quantity,
      unitPrice,
      totalAmount,
      ticketCode,
      status: "reserved",
      razorpayOrderId: order.id,
    });

    // ── 4. Return order details — client opens checkout ───
    return NextResponse.json({
      success: true,
      ticket: {
        _id: ticket._id,
        ticketCode: ticket.ticketCode,
        quantity: ticket.quantity,
        totalAmount: ticket.totalAmount,
        status: ticket.status,
      },
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      party: {
        id: updated._id,
        title: updated.title,
        date: updated.date,
        venue: updated.venue,
        city: updated.city,
      },
    });
  } catch (err) {
    console.error("POST /api/parties/[id]/tickets:", err);
    return NextResponse.json(
      { success: false, message: "Ticket booking failed." },
      { status: 500 }
    );
  }
}