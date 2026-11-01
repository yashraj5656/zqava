import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Booking from "@/models/Booking";

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

/* =========================================================
   GET — fetch a single booking (used by check-in page)
========================================================= */
export async function GET(_request, { params }) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "You must be logged in." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Booking not found." },
        { status: 404 }
      );
    }

    await connectDB();

    const booking = await Booking.findById(id)
      .populate("customer", "firstName lastName profilePhoto city")
      .populate("companion", "firstName lastName profilePhoto")
      .lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found." },
        { status: 404 }
      );
    }

    const isCustomer = String(booking.customer?._id) === String(userId);
    const isCompanion = String(booking.companion?._id) === String(userId);

    if (!isCustomer && !isCompanion) {
      return NextResponse.json(
        { success: false, message: "You do not have access to this booking." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, booking });
  } catch (err) {
    console.error("GET /api/bookings/[id]:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load booking." },
      { status: 500 }
    );
  }
}

/* =========================================================
   PATCH — update booking status
========================================================= */
const ALLOWED_STATUSES = [
  "confirmed",
  "rejected",
  "checked_in",
  "completed",
  "cancelled",
];

export async function PATCH(request, { params }) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "You must be logged in." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Booking not found." },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { status } = body;

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid booking status." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found." },
        { status: 404 }
      );
    }

    /* COMPANION — confirm / reject (from pending) */
    if (status === "confirmed" || status === "rejected") {
      if (String(booking.companion) !== String(userId)) {
        return NextResponse.json(
          { success: false, message: "You are not authorized to manage this booking." },
          { status: 403 }
        );
      }

      if (booking.status === status) {
        // Idempotent
      } else if (booking.status !== "pending") {
        return NextResponse.json(
          { success: false, message: `This booking is already ${booking.status}.` },
          { status: 400 }
        );
      } else {
        booking.status = status;
      }
    }

    /* COMPANION — check in (from confirmed) */
    if (status === "checked_in") {
      if (String(booking.companion) !== String(userId)) {
        return NextResponse.json(
          { success: false, message: "You are not authorized to check in this booking." },
          { status: 403 }
        );
      }

      if (booking.status === "checked_in") {
        // Idempotent
      } else if (booking.status !== "confirmed") {
        return NextResponse.json(
          { success: false, message: "Only confirmed bookings can be checked in." },
          { status: 400 }
        );
      } else {
        booking.status = "checked_in";
        booking.checkedInAt = new Date();
      }
    }

    /* COMPANION — complete (from checked_in) */
    if (status === "completed") {
      if (String(booking.companion) !== String(userId)) {
        return NextResponse.json(
          { success: false, message: "You are not authorized to complete this booking." },
          { status: 403 }
        );
      }

      if (booking.status === "completed") {
        // Idempotent
      } else if (booking.status !== "checked_in") {
        return NextResponse.json(
          { success: false, message: "Guest must be checked in before completing." },
          { status: 400 }
        );
      } else {
        booking.status = "completed";
        booking.completedAt = new Date();
      }
    }

    /* CUSTOMER — cancel (from pending / confirmed) */
    if (status === "cancelled") {
      if (String(booking.customer) !== String(userId)) {
        return NextResponse.json(
          { success: false, message: "You are not authorized to cancel this booking." },
          { status: 403 }
        );
      }

      if (booking.status === "cancelled") {
        // Idempotent
      } else if (!["pending", "confirmed"].includes(booking.status)) {
        return NextResponse.json(
          { success: false, message: "This booking cannot be cancelled." },
          { status: 400 }
        );
      } else {
        booking.status = "cancelled";
      }
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("customer", "firstName lastName profilePhoto city")
      .populate("companion", "firstName lastName profilePhoto")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully.",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("BOOKING STATUS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update booking." },
      { status: 500 }
    );
  }
}