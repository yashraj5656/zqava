import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Party from "@/models/Party";
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

export async function GET(_request, { params }) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Party not found." },
        { status: 404 }
      );
    }

    await connectDB();

    const party = await Party.findById(id).lean();

    if (!party || String(party.hostId) !== String(userId)) {
      return NextResponse.json(
        { success: false, message: "Party not found." },
        { status: 404 }
      );
    }

    const stats = await Ticket.aggregate([
      { $match: { partyId: party._id } },
      {
        $group: {
          _id: null,
          paid: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] } },
          checkedIn: {
            $sum: { $cond: [{ $eq: ["$status", "checked_in"] }, 1, 0] },
          },
          reserved: {
            $sum: { $cond: [{ $eq: ["$status", "reserved"] }, 1, 0] },
          },
          revenue: {
            $sum: {
              $cond: [
                { $in: ["$status", ["paid", "checked_in"]] },
                "$totalAmount",
                0,
              ],
            },
          },
        },
      },
    ]);

    const s = stats[0] || {
      paid: 0,
      checkedIn: 0,
      reserved: 0,
      revenue: 0,
    };

    const grossRevenue = s.revenue || 0;
    const platformFee = Math.round(grossRevenue * 0.1);
    const hostPayout = grossRevenue - platformFee;

    return NextResponse.json({
      success: true,
      party: {
        ...party,
        stats: {
          paid: s.paid,
          checkedIn: s.checkedIn,
          reserved: s.reserved,
          revenue: grossRevenue,
          platformFee,
          hostPayout,
          ticketsLeft: Math.max(
            0,
            party.totalTickets - (party.ticketsSold || 0)
          ),
        },
      },
    });
  } catch (err) {
    console.error("GET /api/host/parties/[id]:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load party." },
      { status: 500 }
    );
  }
}