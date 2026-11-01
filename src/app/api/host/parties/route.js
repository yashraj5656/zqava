import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
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

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please log in." },
        { status: 401 }
      );
    }

    await connectDB();

    const parties = await Party.find({ hostId: userId })
      .sort({ date: -1 })
      .lean();

    if (parties.length === 0) {
      return NextResponse.json({
        success: true,
        parties: [],
        summary: {
          paidToBankTotal: 0,
          hostPayoutTotal: 0,
          pendingPayoutTotal: 0,
        },
      });
    }

    const partyIds = parties.map((p) => p._id);

    const stats = await Ticket.aggregate([
      { $match: { partyId: { $in: partyIds } } },
      {
        $group: {
          _id: "$partyId",
          paid: {
            $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] },
          },
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

    const statsMap = new Map(stats.map((s) => [String(s._id), s]));

    let paidToBankTotal = 0;
    let hostPayoutTotal = 0;

    const enriched = parties.map((party) => {
      const s = statsMap.get(String(party._id)) || {
        paid: 0,
        checkedIn: 0,
        reserved: 0,
        revenue: 0,
      };

      const grossRevenue = s.revenue || 0;
      const platformFee = Math.round(grossRevenue * 0.1);
      const hostPayout = grossRevenue - platformFee;

      // Manually set in MongoDB
      const paidToBank = Number(party.paidToBank || 0);

      // Cap so paid can never exceed earned
      const settledPaid = Math.min(paidToBank, hostPayout);

      paidToBankTotal += settledPaid;
      hostPayoutTotal += hostPayout;

      return {
        ...party,
        stats: {
          paid: s.paid || 0,
          checkedIn: s.checkedIn || 0,
          reserved: s.reserved || 0,
          revenue: grossRevenue,
          platformFee,
          hostPayout,
          paidToBank: settledPaid,
          pendingPayout: Math.max(0, hostPayout - settledPaid),
          ticketsLeft: Math.max(
            0,
            party.totalTickets - (party.ticketsSold || 0)
          ),
        },
      };
    });

    return NextResponse.json({
      success: true,
      parties: enriched,
      summary: {
        paidToBankTotal,
        hostPayoutTotal,
        pendingPayoutTotal: Math.max(
          0,
          hostPayoutTotal - paidToBankTotal
        ),
      },
    });
  } catch (err) {
    console.error("GET /api/host/parties:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load parties." },
      { status: 500 }
    );
  }
}