import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
import Razorpay from "razorpay";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Booking from "@/models/Booking";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET;

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* =========================================================
   AUTH
========================================================= */

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();

  const token = cookieStore.get("zqava_session")?.value;

  if (!token || !JWT_SECRET) {
    return null;
  }

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
   TIME HELPERS
========================================================= */

function parseTimeToMinutes(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toUpperCase();

  /*
   * Supports:
   * 10:00 AM
   * 10:30 PM
   * 10:00
   * 22:00
   */

  const twelveHourMatch = normalized.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/
  );

  if (twelveHourMatch) {
    let hour = Number(twelveHourMatch[1]);
    const minute = Number(twelveHourMatch[2]);
    const period = twelveHourMatch[3];

    if (
      !Number.isInteger(hour) ||
      !Number.isInteger(minute) ||
      hour < 1 ||
      hour > 12 ||
      minute < 0 ||
      minute > 59
    ) {
      return null;
    }

    if (period === "AM") {
      if (hour === 12) hour = 0;
    } else {
      if (hour !== 12) hour += 12;
    }

    return hour * 60 + minute;
  }

  const twentyFourHourMatch = normalized.match(
    /^(\d{1,2}):(\d{2})$/
  );

  if (twentyFourHourMatch) {
    const hour = Number(twentyFourHourMatch[1]);
    const minute = Number(twentyFourHourMatch[2]);

    if (
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return null;
    }

    return hour * 60 + minute;
  }

  return null;
}

/* =========================================================
   DATE HELPERS
========================================================= */

function isValidDateString(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const [year, month, day] = date
    .split("-")
    .map(Number);

  const parsed = new Date(
    Date.UTC(year, month - 1, day)
  );

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function isDateInPast(date) {
  /*
   * Comparing YYYY-MM-DD strings works safely for
   * normalized ISO dates.
   */
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return date < today;
}

function getWeekday(date) {
  const [year, month, day] = date
    .split("-")
    .map(Number);

  const parsed = new Date(
    Date.UTC(year, month - 1, day)
  );

  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  return days[parsed.getUTCDay()];
}

/* =========================================================
   AVAILABILITY
========================================================= */

function isWithinWeeklyAvailability({
  availability,
  date,
  startMinutes,
  duration,
}) {
  if (!availability) {
    return false;
  }

  const weeklySchedule =
    Array.isArray(availability.weeklySchedule)
      ? availability.weeklySchedule
      : [];

  const weekday = getWeekday(date);

  const daySchedule = weeklySchedule.find(
    (day) => day.day === weekday
  );

  if (!daySchedule || !daySchedule.enabled) {
    return false;
  }

  const slots = Array.isArray(daySchedule.slots)
    ? daySchedule.slots
    : [];

  const requestedEnd =
    startMinutes + duration * 60;

  return slots.some((slot) => {
    const slotStart = parseTimeToMinutes(
      slot.start
    );

    const slotEnd = parseTimeToMinutes(slot.end);

    if (
      slotStart === null ||
      slotEnd === null
    ) {
      return false;
    }

    /*
     * Normal availability slot.
     */
    if (slotEnd > slotStart) {
      return (
        startMinutes >= slotStart &&
        requestedEnd <= slotEnd
      );
    }

    /*
     * Overnight availability.
     * Example: 10 PM → 2 AM
     */
    if (slotEnd < slotStart) {
      const overnightEnd = slotEnd + 24 * 60;

      let normalizedStart = startMinutes;

      if (normalizedStart < slotStart) {
        normalizedStart += 24 * 60;
      }

      const normalizedEnd =
        normalizedStart + duration * 60;

      return (
        normalizedStart >= slotStart &&
        normalizedEnd <= overnightEnd
      );
    }

    return false;
  });
}

/* =========================================================
   BOOKING OVERLAP
========================================================= */

async function hasOverlappingBooking({
  companionId,
  date,
  startMinutes,
  duration,
}) {
  const bookings = await Booking.find({
    companion: companionId,
    date,
    status: {
      $in: ["pending", "confirmed"],
    },
  })
    .select("time duration")
    .lean();

  const requestedEnd =
    startMinutes + duration * 60;

  return bookings.some((booking) => {
    const existingStart = parseTimeToMinutes(
      booking.time
    );

    if (existingStart === null) {
      return false;
    }

    const existingEnd =
      existingStart +
      Number(booking.duration || 0) * 60;

    return (
      startMinutes < existingEnd &&
      requestedEnd > existingStart
    );
  });
}

/* =========================================================
   POST
========================================================= */

export async function POST(request) {
  try {
    const userId =
      await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in before booking.",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const {
      companionId,
      date,
      time,
      duration,
      message,
    } = body;

    /* =====================================================
       BASIC VALIDATION
    ===================================================== */

    if (!companionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Companion ID is required.",
        },
        { status: 400 }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        companionId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid companion ID.",
        },
        { status: 400 }
      );
    }

    if (
      String(companionId) === String(userId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot book yourself.",
        },
        { status: 400 }
      );
    }

    if (!date || !isValidDateString(date)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking date.",
        },
        { status: 400 }
      );
    }

    if (isDateInPast(date)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot book a date in the past.",
        },
        { status: 400 }
      );
    }

    if (!time) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking time is required.",
        },
        { status: 400 }
      );
    }

    const startMinutes =
      parseTimeToMinutes(time);

    if (startMinutes === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking time.",
        },
        { status: 400 }
      );
    }

    const bookingDuration = Number(duration);

    if (
      !Number.isInteger(bookingDuration) ||
      bookingDuration < 1 ||
      bookingDuration > 24
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking duration.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       DATABASE
    ===================================================== */

    await connectDB();

    const companion = await User.findOne({
      _id: companionId,
      role: "companion",
    }).lean();

    if (
      !companion ||
      !companion.companionProfile
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Companion not found.",
        },
        { status: 404 }
      );
    }

    const profile =
      companion.companionProfile;

    if (
      profile.applicationStatus !== "approved"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This companion is not currently available for bookings.",
        },
        { status: 400 }
      );
    }

    if (profile.available === false) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This companion is currently unavailable.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       WEEKLY AVAILABILITY
    ===================================================== */

    const available = isWithinWeeklyAvailability({
      availability: profile.availability,
      date,
      startMinutes,
      duration: bookingDuration,
    });

    if (!available) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The companion is not available at this date and time.",
        },
        { status: 409 }
      );
    }

    /* =====================================================
       EXISTING BOOKING OVERLAP
    ===================================================== */

    const overlapping =
      await hasOverlappingBooking({
        companionId,
        date,
        startMinutes,
        duration: bookingDuration,
      });

    if (overlapping) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This time overlaps another booking.",
        },
        { status: 409 }
      );
    }

    /* =====================================================
       PRICE
    ===================================================== */

    const hourlyRate = Number(
      profile.hourlyRate || 0
    );

    if (
      !Number.isFinite(hourlyRate) ||
      hourlyRate <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This companion does not have a valid hourly rate.",
        },
        { status: 400 }
      );
    }

    const subtotal =
      hourlyRate * bookingDuration;

      const serviceFee = Math.round(subtotal * 10 / 100);

    const total =
      subtotal + serviceFee;

    const amountInPaise = Math.round(
      total * 100
    );

    if (amountInPaise <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking amount.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       MESSAGE
    ===================================================== */

    const cleanMessage =
      typeof message === "string"
        ? message.trim().slice(0, 1000)
        : "";

    /* =====================================================
       RAZORPAY ORDER
    ===================================================== */

    const receipt =
      `zqava_${String(userId).slice(-8)}_${Date.now()}`;

    const order =
      await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt,

        notes: {
          customerId: String(userId),
          companionId: String(companionId),
          date,
          time,
          duration: String(bookingDuration),
        },
      });

      return NextResponse.json({
        success: true,
      
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
        },
      
        amount: total,
        subtotal,
        serviceFee,
        total,
        hourlyRate,
        duration: bookingDuration,
      });
  } catch (error) {
    console.error(
      "CREATE RAZORPAY ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to create payment order.",
      },
      { status: 500 }
    );
  }
}