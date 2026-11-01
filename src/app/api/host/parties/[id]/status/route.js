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

export async function PATCH(request, { params }) {
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

    const body = await request.json();
    const nextStatus = body.status;

    if (!["live", "cancelled", "draft"].includes(nextStatus)) {
      return NextResponse.json(
        { success: false, message: "Invalid status." },
        { status: 400 }
      );
    }

    await connectDB();

    const party = await Party.findById(id);
    if (!party || String(party.hostId) !== String(userId)) {
      return NextResponse.json(
        { success: false, message: "Party not found." },
        { status: 404 }
      );
    }

    // If cancelling — flip all paid tickets to cancelled (refund path)
    if (nextStatus === "cancelled") {
      await Ticket.updateMany(
        { partyId: id, status: { $in: ["paid", "reserved"] } },
        { $set: { status: "cancelled" } }
      );
    }

    party.status = nextStatus;
    await party.save();

    return NextResponse.json({ success: true, party });
  } catch (err) {
    console.error("PATCH /api/host/parties/[id]/status:", err);
    return NextResponse.json(
      { success: false, message: "Update failed." },
      { status: 500 }
    );
  }
}