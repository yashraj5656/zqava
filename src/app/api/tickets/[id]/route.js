import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
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

    // Stricter check — 24-char hex only
    if (
      !id ||
      typeof id !== "string" ||
      id.length !== 24 ||
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        { success: false, message: "Ticket not found." },
        { status: 404 }
      );
    }

    await connectDB();

    const ticket = await Ticket.findById(id)
      .populate({
        path: "partyId",
        select:
          "title coverImage venue city date startTime endTime status hostId ageLimit category",
        populate: {
          path: "hostId",
          select: "name profilePhoto city",
          options: { strictPopulate: false },
        },
        options: { strictPopulate: false },
      })
      // ⚠️ Removed "email" — hosts shouldn't see buyer emails
      .populate({
        path: "buyerId",
        select: "name profilePhoto",
        options: { strictPopulate: false },
      })
      .lean();

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: "Ticket not found." },
        { status: 404 }
      );
    }

    const isBuyer = String(ticket.buyerId?._id) === String(userId);
    const isHost =
      ticket.partyId?.hostId &&
      String(ticket.partyId.hostId._id) === String(userId);

    if (!isBuyer && !isHost) {
      return NextResponse.json(
        { success: false, message: "You do not have access to this ticket." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, ticket });
  } catch (err) {
    console.error("GET /api/tickets/[id]:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load ticket." },
      { status: 500 }
    );
  }
}