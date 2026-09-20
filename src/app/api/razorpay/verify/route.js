import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import crypto from "crypto";
import Razorpay from "razorpay";

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
          message:
            "Please log in before verifying payment.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing payment verification details.",
        },
        { status: 400 }
      );
    }

    const secret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      console.error(
        "RAZORPAY_KEY_SECRET is missing."
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment configuration error.",
        },
        { status: 500 }
      );
    }

    /* =====================================================
       SIGNATURE
    ===================================================== */

    const generatedSignature =
      crypto
        .createHmac("sha256", secret)
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    const generatedBuffer =
      Buffer.from(generatedSignature, "utf8");

    const receivedBuffer =
      Buffer.from(razorpay_signature, "utf8");

    if (
      generatedBuffer.length !==
      receivedBuffer.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment verification failed.",
        },
        { status: 400 }
      );
    }

    const isValid =
      crypto.timingSafeEqual(
        generatedBuffer,
        receivedBuffer
      );

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment verification failed.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       FETCH RAZORPAY ORDER
    ===================================================== */

    const order =
      await razorpay.orders.fetch(
        razorpay_order_id
      );

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay order could not be found.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       MAKE SURE ORDER BELONGS TO THIS USER
    ===================================================== */

    if (
      String(order.notes?.customerId || "") !==
      String(userId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This payment order does not belong to you.",
        },
        { status: 403 }
      );
    }

    /* =====================================================
       FETCH PAYMENT
    ===================================================== */

    const payment =
      await razorpay.payments.fetch(
        razorpay_payment_id
      );

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay payment could not be found.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       PAYMENT MUST BELONG TO ORDER
    ===================================================== */

    if (
      String(payment.order_id || "") !==
      String(razorpay_order_id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment does not belong to this order.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       AMOUNT
    ===================================================== */

    if (
      Number(payment.amount) !==
      Number(order.amount)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment amount does not match the order.",
        },
        { status: 400 }
      );
    }

    if (
      String(payment.currency || "") !==
      String(order.currency || "")
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment currency does not match the order.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       PAYMENT STATUS
    ===================================================== */

    if (payment.status !== "captured") {
      return NextResponse.json(
        {
          success: false,
          message:
            `Payment has not been captured. Current status: ${payment.status}.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,

      message:
        "Payment verified successfully.",

      payment: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method || "",
        status: payment.status,
      },

      bookingDetails: {
        companionId:
          order.notes?.companionId || "",
        date: order.notes?.date || "",
        time: order.notes?.time || "",
        duration: Number(
          order.notes?.duration || 0
        ),
      },
    });
  } catch (error) {
    console.error(
      "PAYMENT VERIFICATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to verify payment.",
      },
      { status: 500 }
    );
  }
}