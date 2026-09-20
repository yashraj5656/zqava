import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
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

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "You must be logged in." },
        { status: 401 }
      );
    }

    await connectDB();

    const bookings = await Booking.find({
      companion: userId,
      status: {
        $in: ["confirmed", "completed"],
      },
    })
      .populate(
        "customer",
        "firstName lastName profilePhoto city"
      )
      .sort({ createdAt: -1 })
      .lean();

    /*
     * Companion earnings are based on subtotal.
     * ZQAVA's service fee is not included.
     */
    const totalEarnings = bookings.reduce(
      (sum, booking) =>
        sum + Number(booking.subtotal || 0),
      0
    );

    /*
     * Only completed bookings count as completed earnings.
     */
    const completedBookings = bookings.filter(
      (booking) => booking.status === "completed"
    );

    const completedEarnings = completedBookings.reduce(
      (sum, booking) =>
        sum + Number(booking.subtotal || 0),
      0
    );

    /*
     * payoutPaid === true means ZQAVA has paid
     * this booking's earnings to the companion.
     */
    const paidToBank = bookings.reduce(
      (sum, booking) => {
        if (
          booking.status === "completed" &&
          booking.payoutPaid === true
        ) {
          return sum + Number(booking.subtotal || 0);
        }

        return sum;
      },
      0
    );

    /*
     * Completed earnings that have not yet been paid.
     */
    const pendingPayout = Math.max(
      completedEarnings - paidToBank,
      0
    );

    /*
     * Current month earnings.
     */
    const currentDate = new Date();

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthlyEarnings = bookings.reduce(
      (sum, booking) => {
        const bookingDate = new Date(booking.date);

        if (
          bookingDate.getMonth() === currentMonth &&
          bookingDate.getFullYear() === currentYear
        ) {
          return sum + Number(booking.subtotal || 0);
        }

        return sum;
      },
      0
    );

    /*
     * Individual earnings records.
     */
    const earnings = bookings.map((booking) => ({
      id: booking._id.toString(),

      customer: booking.customer
        ? {
            id: booking.customer._id.toString(),

            name:
              `${booking.customer.firstName || ""} ${
                booking.customer.lastName || ""
              }`.trim() || "Guest",

            profilePhoto:
              booking.customer.profilePhoto || "",

            city:
              booking.customer.city || "",
          }
        : null,

      date: booking.date,
      time: booking.time,
      duration: booking.duration,

      amount: Number(
        booking.subtotal || 0
      ),

      bookingStatus: booking.status,

      /*
       * Simple boolean payout system.
       */
      payoutPaid:
        booking.payoutPaid === true,

      createdAt: booking.createdAt,
    }));

    return NextResponse.json({
      summary: {
        totalEarnings,
        completedEarnings,
        paidToBank,
        pendingPayout,
        monthlyEarnings,
        totalBookings: bookings.length,
        completedBookings:
          completedBookings.length,
      },

      earnings,
    });
  } catch (error) {
    console.error(
      "COMPANION EARNINGS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to load earnings.",
      },
      { status: 500 }
    );
  }
}