import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Booking from "@/models/Booking";

const JWT_SECRET = process.env.JWT_SECRET;

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("zqava_session")?.value;

  if (!token) return null;

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
        { message: "You must be logged in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const { status } = body;

    if (!["confirmed", "rejected", "completed", "cancelled"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid booking status." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404 }
      );
    }

    /*
     * Companion permissions
     */

    if (status === "confirmed" || status === "rejected") {
      if (booking.companion.toString() !== userId.toString()) {
        return NextResponse.json(
          { message: "You are not authorized to manage this booking." },
          { status: 403 }
        );
      }

      if (booking.status !== "pending") {
        return NextResponse.json(
          {
            message: `This booking is already ${booking.status}.`,
          },
          { status: 400 }
        );
      }

      booking.status = status;
    }

    /*
     * Companion can mark a confirmed booking as completed.
     */

    if (status === "completed") {
      if (booking.companion.toString() !== userId.toString()) {
        return NextResponse.json(
          { message: "You are not authorized to complete this booking." },
          { status: 403 }
        );
      }

      if (booking.status !== "confirmed") {
        return NextResponse.json(
          {
            message: "Only confirmed bookings can be marked as completed.",
          },
          { status: 400 }
        );
      }

      booking.status = "completed";
    }

    /*
     * Customer can cancel their own pending/confirmed booking.
     */

    if (status === "cancelled") {
      if (booking.customer.toString() !== userId.toString()) {
        return NextResponse.json(
          { message: "You are not authorized to cancel this booking." },
          { status: 403 }
        );
      }

      if (!["pending", "confirmed"].includes(booking.status)) {
        return NextResponse.json(
          {
            message: "This booking cannot be cancelled.",
          },
          { status: 400 }
        );
      }

      booking.status = "cancelled";
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate(
        "customer",
        "firstName lastName email profilePhoto city"
      )
      .populate(
        "companion",
        "firstName lastName email profilePhoto city companionProfile"
      );

    return NextResponse.json({
      message: "Booking updated successfully.",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("BOOKING STATUS ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to update booking.",
      },
      { status: 500 }
    );
  }
}