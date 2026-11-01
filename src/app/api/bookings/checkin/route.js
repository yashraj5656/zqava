import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
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

    const booking = await Booking.findOne({ checkinCode: code })
      .populate("customer", "firstName lastName profilePhoto city")
      .populate("companion", "firstName lastName")
      .lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Ticket not found." },
        { status: 404 }
      );
    }

    if (String(booking.companion._id) !== String(userId)) {
      return NextResponse.json(
        { success: false, message: "This ticket is not for your session." },
        { status: 403 }
      );
    }

    if (booking.status === "checked_in") {
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        message: "Already checked in.",
        booking: {
          checkinCode: booking.checkinCode,
          customerName:
            `${booking.customer?.firstName || ""} ${
              booking.customer?.lastName || ""
            }`.trim() || "Guest",
          duration: booking.duration,
          checkedInAt: booking.checkedInAt,
        },
      });
    }

    if (booking.status !== "confirmed") {
      return NextResponse.json(
        {
          success: false,
          message: `This booking is ${booking.status}. Cannot check in.`,
        },
        { status: 400 }
      );
    }

    const updated = await Booking.findByIdAndUpdate(
      booking._id,
      {
        $set: {
          status: "checked_in",
          checkedInAt: new Date(),
        },
      },
      { new: true }
    ).lean();

    return NextResponse.json({
      success: true,
      message: "Checked in successfully.",
      booking: {
        checkinCode: updated.checkinCode,
        customerName:
          `${booking.customer?.firstName || ""} ${
            booking.customer?.lastName || ""
          }`.trim() || "Guest",
        duration: updated.duration,
        status: updated.status,
      },
    });
  } catch (err) {
    console.error("POST /api/bookings/checkin:", err);
    return NextResponse.json(
      { success: false, message: "Check-in failed." },
      { status: 500 }
    );
  }
}