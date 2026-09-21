import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
import Razorpay from "razorpay";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Booking from "@/models/Booking";
import Notification from "@/models/Notification";

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
   TIME
========================================================= */

function parseTimeToMinutes(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toUpperCase();

  const twelveHourMatch =
    normalized.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/
    );

  if (twelveHourMatch) {
    let hour = Number(
      twelveHourMatch[1]
    );

    const minute = Number(
      twelveHourMatch[2]
    );

    const period =
      twelveHourMatch[3];

    if (
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

  const twentyFourHourMatch =
    normalized.match(
      /^(\d{1,2}):(\d{2})$/
    );

  if (twentyFourHourMatch) {
    const hour = Number(
      twentyFourHourMatch[1]
    );

    const minute = Number(
      twentyFourHourMatch[2]
    );

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
   DATE
========================================================= */

function isValidDateString(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const [year, month, day] =
    date.split("-").map(Number);

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
  const today =
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

  return date < today;
}

function getWeekday(date) {
  const [year, month, day] =
    date.split("-").map(Number);

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
   WEEKLY AVAILABILITY
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
    Array.isArray(
      availability.weeklySchedule
    )
      ? availability.weeklySchedule
      : [];

  const weekday = getWeekday(date);

  const daySchedule =
    weeklySchedule.find(
      (day) => day.day === weekday
    );

  if (
    !daySchedule ||
    !daySchedule.enabled
  ) {
    return false;
  }

  const slots =
    Array.isArray(daySchedule.slots)
      ? daySchedule.slots
      : [];

  const requestedEnd =
    startMinutes + duration * 60;

  return slots.some((slot) => {
    const slotStart =
      parseTimeToMinutes(slot.start);

    const slotEnd =
      parseTimeToMinutes(slot.end);

    if (
      slotStart === null ||
      slotEnd === null
    ) {
      return false;
    }

    if (slotEnd > slotStart) {
      return (
        startMinutes >= slotStart &&
        requestedEnd <= slotEnd
      );
    }

    if (slotEnd < slotStart) {
      const overnightEnd =
        slotEnd + 24 * 60;

      let normalizedStart =
        startMinutes;

      if (normalizedStart < slotStart) {
        normalizedStart += 24 * 60;
      }

      const normalizedEnd =
        normalizedStart +
        duration * 60;

      return (
        normalizedStart >= slotStart &&
        normalizedEnd <= overnightEnd
      );
    }

    return false;
  });
}

/* =========================================================
   OVERLAPPING BOOKINGS
========================================================= */

async function hasOverlappingBooking({
  companionId,
  date,
  startMinutes,
  duration,
}) {
  const bookings =
    await Booking.find({
      companion: companionId,
      date,
      status: {
        $in: [
          "pending",
          "confirmed",
        ],
      },
    })
      .select("time duration")
      .lean();

  const requestedEnd =
    startMinutes + duration * 60;

  return bookings.some((booking) => {
    const existingStart =
      parseTimeToMinutes(
        booking.time
      );

    if (existingStart === null) {
      return false;
    }

    const existingEnd =
      existingStart +
      Number(booking.duration || 0) *
        60;

    return (
      startMinutes < existingEnd &&
      requestedEnd > existingStart
    );
  });
}

/* =========================================================
   VERIFY RAZORPAY PAYMENT
========================================================= */

async function verifyRazorpayPayment({
  userId,
  orderId,
  paymentId,
}) {
  const order =
    await razorpay.orders.fetch(
      orderId
    );

  if (!order) {
    throw new Error(
      "Razorpay order not found."
    );
  }

  if (
    String(
      order.notes?.customerId || ""
    ) !== String(userId)
  ) {
    throw new Error(
      "This payment order does not belong to you."
    );
  }

  const payment =
    await razorpay.payments.fetch(
      paymentId
    );

  if (!payment) {
    throw new Error(
      "Razorpay payment not found."
    );
  }

  if (
    String(payment.order_id || "") !==
    String(orderId)
  ) {
    throw new Error(
      "Payment does not belong to this order."
    );
  }

  if (
    Number(payment.amount) !==
    Number(order.amount)
  ) {
    throw new Error(
      "Payment amount does not match the order."
    );
  }

  if (
    String(payment.currency || "") !==
    String(order.currency || "")
  ) {
    throw new Error(
      "Payment currency does not match the order."
    );
  }

  if (
    payment.status !== "captured"
  ) {
    throw new Error(
      `Payment is not captured. Current status: ${payment.status}.`
    );
  }

  return {
    order,
    payment,
  };
}

/* =========================================================
   GET BOOKINGS
========================================================= */

export async function GET(request) {
  try {
    const userId =
      await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } =
      new URL(request.url);

    const type =
      searchParams.get("type") ||
      "customer";

    if (
      !["customer", "companion"].includes(
        type
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid booking type.",
        },
        { status: 400 }
      );
    }

    if (type === "companion") {
      const user =
        await User.findById(userId)
          .select("role")
          .lean();

      if (!user || user.role !== "companion") {
        return NextResponse.json(
          {
            message:
              "Only companions can access companion bookings.",
          },
          { status: 403 }
        );
      }
    }

    const filter =
      type === "companion"
        ? { companion: userId }
        : { customer: userId };

    const bookings =
      await Booking.find(filter)
        .populate(
          "customer",
          "firstName lastName email profilePhoto"
        )
        .populate(
          "companion",
          "firstName lastName companionProfile"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error(
      "GET BOOKINGS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load bookings.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   CREATE BOOKING
========================================================= */

export async function POST(request) {
  try {
    const userId =
      await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please log in before booking.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    const {
      companionId,
      date,
      time,
      duration,
      message,
      razorpayOrderId,
      razorpayPaymentId,
    } = body;

    /* =====================================================
       BASIC VALIDATION
    ===================================================== */

    if (
      !companionId ||
      !date ||
      !time ||
      !duration ||
      !razorpayOrderId ||
      !razorpayPaymentId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required booking or payment details.",
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
          message:
            "Invalid companion ID.",
        },
        { status: 400 }
      );
    }

    if (
      String(companionId) ===
      String(userId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot book yourself.",
        },
        { status: 400 }
      );
    }

    const numericDuration =
      Number(duration);

    if (
      !Number.isInteger(
        numericDuration
      ) ||
      numericDuration < 1 ||
      numericDuration > 24
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid booking duration.",
        },
        { status: 400 }
      );
    }

    if (
      !isValidDateString(date)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid booking date.",
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

    const startMinutes =
      parseTimeToMinutes(time);

    if (startMinutes === null) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid booking time.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       DUPLICATE PAYMENT CHECK
    ===================================================== */

    const existingPaymentBooking =
      await Booking.findOne({
        $or: [
          {
            razorpayPaymentId,
          },
          {
            razorpayOrderId,
          },
        ],
      });

    if (existingPaymentBooking) {
      /*
       * Idempotent response.
       *
       * If the browser retries the same request after
       * the booking was already created, return the
       * existing booking instead of creating another.
       */
      if (
        String(
          existingPaymentBooking.customer
        ) === String(userId)
      ) {
        return NextResponse.json({
          success: true,
          message:
            "Booking already created.",
          booking: existingPaymentBooking,
          alreadyCreated: true,
        });
      }

      return NextResponse.json(
        {
          success: false,
          message:
            "This payment has already been used.",
        },
        { status: 409 }
      );
    }

    /* =====================================================
       VERIFY PAYMENT WITH RAZORPAY
    ===================================================== */

    let verified;

    try {
      verified =
        await verifyRazorpayPayment({
          userId,
          orderId:
            razorpayOrderId,
          paymentId:
            razorpayPaymentId,
        });
    } catch (paymentError) {
      console.error(
        "RAZORPAY BOOKING VERIFICATION ERROR:",
        paymentError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            paymentError?.message ||
            "Payment verification failed.",
        },
        { status: 400 }
      );
    }

    const {
      order,
      payment,
    } = verified;

    /* =====================================================
       MAKE SURE ORDER DETAILS MATCH REQUEST
    ===================================================== */

    if (
      String(
        order.notes?.companionId || ""
      ) !== String(companionId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment order does not match the companion.",
        },
        { status: 400 }
      );
    }

    if (
      String(order.notes?.date || "") !==
      String(date)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment order does not match the booking date.",
        },
        { status: 400 }
      );
    }

    if (
      String(order.notes?.time || "") !==
      String(time)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment order does not match the booking time.",
        },
        { status: 400 }
      );
    }

    if (
      Number(
        order.notes?.duration || 0
      ) !== numericDuration
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment order does not match the booking duration.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       COMPANION
    ===================================================== */

    const companion =
      await User.findOne({
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
          message:
            "Companion not found.",
        },
        { status: 404 }
      );
    }

    const profile =
      companion.companionProfile;

    if (
      profile.applicationStatus !==
      "approved"
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

    if (
      profile.available === false
    ) {
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
       AVAILABILITY
    ===================================================== */

    const available =
      isWithinWeeklyAvailability({
        availability:
          profile.availability,
        date,
        startMinutes,
        duration:
          numericDuration,
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
       OVERLAP
    ===================================================== */

    const overlapping =
      await hasOverlappingBooking({
        companionId,
        date,
        startMinutes,
        duration:
          numericDuration,
      });

    if (overlapping) {
      /*
       * Important:
       * Payment has already happened.
       *
       * In this situation you should have a refund/
       * reconciliation flow rather than silently
       * losing the payment.
       */
      return NextResponse.json(
        {
          success: false,
          paymentCaptured: true,
          refundRequired: true,
          message:
            "This time slot has just been booked by someone else. Your payment was received and requires refund processing.",
        },
        { status: 409 }
      );
    }

    /* =====================================================
       PRICE FROM DATABASE
    ===================================================== */

    const hourlyRate =
      Number(
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
            "Companion pricing is unavailable.",
        },
        { status: 400 }
      );
    }

    const subtotal =
      hourlyRate *
      numericDuration;

    const serviceFee = 0;

    const total =
      subtotal + serviceFee;

    const expectedAmountInPaise =
      Math.round(total * 100);

    if (
      Number(payment.amount) !==
      expectedAmountInPaise
    ) {
      return NextResponse.json(
        {
          success: false,
          paymentCaptured: true,
          refundRequired: true,
          message:
            "The paid amount does not match the current booking price. Refund processing is required.",
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
       CREATE BOOKING
    ===================================================== */

    try {
      const booking =
        await Booking.create({
          customer: userId,
          companion: companionId,

          date,
          time,

          duration:
            numericDuration,

          hourlyRate,

          subtotal,

          serviceFee,

          total,

          message: cleanMessage,

          paymentMethod:
            payment.method ||
            "razorpay",

          razorpayOrderId,
          razorpayPaymentId,

          paymentStatus: "paid",

          /*
           * Payment is complete.
           * Companion still needs to accept/confirm.
           */
          status: "pending",
        });

  // ============================================
  // CREATE COMPANION NOTIFICATION
  // ============================================

  await Notification.create({
    recipient: companionId,
    type: "booking_created",
    title: "New Booking Request",
    message: `You received a new booking request for ${date} at ${time}.`,
    bookingId: booking._id,
  });

      return NextResponse.json(
        {
          success: true,
          message:
            "Booking request created successfully.",
          booking,
        },
        { status: 201 }
      );
    } catch (createError) {
      /*
       * Duplicate payment/order can happen if the
       * browser retries very quickly.
       */
      if (
        createError?.code === 11000
      ) {
        const existing =
          await Booking.findOne({
            $or: [
              {
                razorpayPaymentId,
              },
              {
                razorpayOrderId,
              },
            ],
          });

        if (existing) {
          return NextResponse.json({
            success: true,
            message:
              "Booking already created.",
            booking: existing,
            alreadyCreated: true,
          });
        }
      }

      throw createError;
    }
  } catch (error) {
    console.error(
      "CREATE BOOKING ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create booking.",
      },
      { status: 500 }
    );
  }
}