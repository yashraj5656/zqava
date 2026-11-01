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

    const tickets = await Ticket.find({
      buyerId: userId,
      // Hide dead reservations from the "My tickets" UI
      status: { $in: ["paid", "checked_in", "cancelled", "refunded"] },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "partyId",
        select:
          "title coverImage venue city date startTime endTime status hostId",
        populate: {
          path: "hostId",
          select: "name profilePhoto",
        },
      })
      .lean();

    // Drop tickets whose party was deleted — nothing useful to render
    const valid = tickets.filter((t) => t.partyId);

    return NextResponse.json({
      success: true,
      tickets: valid,
    });
  } catch (err) {
    console.error("GET /api/tickets:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load tickets." },
      { status: 500 }
    );
  }
}