import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET;

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

export async function POST(request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please log in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const code = String(body.code || "").trim().toUpperCase();

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Ticket code is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const ticket = await Ticket.findOne({ ticketCode: code })
      .populate({
        path: "partyId",
        select: "title hostId date venue city",
        populate: { path: "hostId", select: "name" },
      })
      .populate({ path: "buyerId", select: "name email" })
      .lean();

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: "Ticket not found." },
        { status: 404 }
      );
    }

    // Only the host of THIS party can check in this ticket
    if (String(ticket.partyId?.hostId?._id) !== String(userId)) {
      return NextResponse.json(
        { success: false, message: "This ticket is not for your party." },
        { status: 403 }
      );
    }

    if (ticket.status === "checked_in") {
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        message: "Already checked in.",
        ticket: {
          ticketCode: ticket.ticketCode,
          quantity: ticket.quantity,
          buyerName: ticket.buyerId?.name || "Guest",
          checkedInAt: ticket.updatedAt,
        },
      });
    }

    if (ticket.status !== "paid") {
      return NextResponse.json(
        {
          success: false,
          message: `Ticket is ${ticket.status}. Cannot check in.`,
        },
        { status: 400 }
      );
    }

    // Check in
    const updated = await Ticket.findByIdAndUpdate(
      ticket._id,
      { $set: { status: "checked_in" } },
      { new: true }
    ).lean();

    return NextResponse.json({
      success: true,
      message: "Checked in successfully.",
      ticket: {
        ticketCode: updated.ticketCode,
        quantity: updated.quantity,
        buyerName: ticket.buyerId?.name || "Guest",
        status: updated.status,
      },
    });
  } catch (err) {
    console.error("POST /api/tickets/verify:", err);
    return NextResponse.json(
      { success: false, message: "Verification failed." },
      { status: 500 }
    );
  }
}