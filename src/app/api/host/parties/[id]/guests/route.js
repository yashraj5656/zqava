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

    const party = await Party.findById(id).select("hostId").lean();

    if (!party || String(party.hostId) !== String(userId)) {
      return NextResponse.json(
        { success: false, message: "Party not found." },
        { status: 404 }
      );
    }

    const tickets = await Ticket.find({
      partyId: id,
      status: { $in: ["paid", "checked_in"] },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "buyerId",
        select: "name profilePhoto",
        options: { strictPopulate: false },
      })
      .lean();

    return NextResponse.json({ success: true, tickets });
  } catch (err) {
    console.error("GET /api/host/parties/[id]/guests:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load guests." },
      { status: 500 }
    );
  }
}