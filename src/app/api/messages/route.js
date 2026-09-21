import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Booking from "@/models/Booking";
import Message from "@/models/Message";
import Notification from "@/models/Notification";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET;

/* =========================================================
   AUTH
========================================================= */

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();

  const token = cookieStore.get("zqava_session")?.value;

  if (!token) {
    return null;
  }

  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not configured.");
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );

    return payload.userId || payload.id || null;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

/* =========================================================
   BOOKING ACCESS
========================================================= */

async function getAuthorizedBooking(bookingId, userId) {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    return {
      error: "Invalid booking ID.",
      status: 400,
    };
  }

  const booking = await Booking.findById(bookingId)
    .populate(
      "customer",
      "firstName lastName email profilePhoto"
    )
    .populate(
      "companion",
      "firstName lastName email profilePhoto companionProfile"
    );

  if (!booking) {
    return {
      error: "Booking not found.",
      status: 404,
    };
  }

  const customerId = booking.customer?._id?.toString();
  const companionId = booking.companion?._id?.toString();
  const currentUserId = userId.toString();

  const isCustomer = customerId === currentUserId;
  const isCompanion = companionId === currentUserId;

  /*
   * The user must actually belong to this booking.
   */
  if (!isCustomer && !isCompanion) {
    return {
      error: "You are not authorized to access this conversation.",
      status: 403,
    };
  }

  /*
   * Messaging is only available after payment.
   */
  if (booking.paymentStatus !== "paid") {
    return {
      error:
        "Messaging is available only after the booking has been paid.",
      status: 403,
    };
  }

  /*
   * Don't allow communication on cancelled/rejected bookings.
   */
  if (
    booking.status === "cancelled" ||
    booking.status === "rejected"
  ) {
    return {
      error:
        "Messaging is unavailable for this booking.",
      status: 403,
    };
  }

  return {
    booking,
    isCustomer,
    isCompanion,
  };
}

/* =========================================================
   GET MESSAGES
   GET /api/messages?bookingId=...
========================================================= */

export async function GET(request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in first.",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const bookingId = searchParams.get("bookingId");

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const access = await getAuthorizedBooking(
      bookingId,
      userId
    );

    if (access.error) {
      return NextResponse.json(
        {
          success: false,
          message: access.error,
        },
        { status: access.status }
      );
    }

    const {
      booking,
      isCustomer,
      isCompanion,
    } = access;

    const messages = await Message.find({
      booking: booking._id,
    })
      .populate(
        "sender",
        "firstName lastName profilePhoto role companionProfile"
      )
      .sort({ createdAt: 1 })
      .lean();

    /*
     * Mark messages sent by the other person as read.
     */
    await Message.updateMany(
      {
        booking: booking._id,
        receiver: userId,
        read: false,
      },
      {
        $set: {
          read: true,
        },
      }
    );

    const customer = booking.customer;
    const companion = booking.companion;

    const customerName =
      `${customer?.firstName || ""} ${
        customer?.lastName || ""
      }`.trim() || "Customer";

    const companionName =
      companion?.companionProfile?.displayName ||
      `${companion?.firstName || ""} ${
        companion?.lastName || ""
      }`.trim() ||
      "Companion";

    return NextResponse.json({
      success: true,

      viewer: {
        role: isCustomer ? "customer" : "companion",
        id: userId.toString(),
      },

      booking: {
        id: booking._id.toString(),

        date: booking.date,
        time: booking.time,
        duration: booking.duration,

        status: booking.status,
        paymentStatus: booking.paymentStatus,

        customer: {
          id: customer?._id?.toString(),
          name: customerName,
          profilePhoto: customer?.profilePhoto || "",
        },

        companion: {
          id: companion?._id?.toString(),
          name: companionName,
          profilePhoto:
            companion?.companionProfile?.profilePhoto ||
            companion?.profilePhoto ||
            "",
        },
      },

      messages,
    });
  } catch (error) {
    console.error(
      "GET /api/messages error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load messages.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   POST MESSAGE
   POST /api/messages
========================================================= */

export async function POST(request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in first.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const bookingId = body.bookingId;
    const text = body.text;

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is required.",
        },
        { status: 400 }
      );
    }

    if (typeof text !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Message text is required.",
        },
        { status: 400 }
      );
    }

    const cleanText = text.trim();

    if (!cleanText) {
      return NextResponse.json(
        {
          success: false,
          message: "Message cannot be empty.",
        },
        { status: 400 }
      );
    }

    if (cleanText.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Message cannot be longer than 2000 characters.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const access = await getAuthorizedBooking(
      bookingId,
      userId
    );

    if (access.error) {
      return NextResponse.json(
        {
          success: false,
          message: access.error,
        },
        { status: access.status }
      );
    }

    const {
      booking,
      isCustomer,
      isCompanion,
    } = access;

    /*
     * Server determines the receiver.
     * Client cannot choose who receives the message.
     */

    let receiverId;

    if (isCustomer) {
      receiverId = booking.companion._id;
    } else if (isCompanion) {
      receiverId = booking.customer._id;
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 403 }
      );
    }

    const message = await Message.create({
      booking: booking._id,
      sender: userId,
      receiver: receiverId,
      text: cleanText,
      read: false,
    });

    /* =========================================================
   CREATE NOTIFICATION FOR RECEIVER
========================================================= */

try {
  const sender = await User.findById(userId)
    .select("firstName lastName companionProfile")
    .lean();

  const senderName =
    sender?.companionProfile?.displayName ||
    `${sender?.firstName || ""} ${sender?.lastName || ""}`.trim() ||
    "Someone";

  await Notification.create({
    recipient: receiverId,
    type: "message",
    title: `New message from ${senderName}`,
    message:
      cleanText.length > 80
        ? `${cleanText.substring(0, 80)}...`
        : cleanText,
    bookingId: booking._id,
  });
} catch (notificationError) {
  /*
   * Notification failure should NOT cause
   * the actual message to fail.
   */
  console.error(
    "Message notification creation failed:",
    notificationError
  );
}

    const populatedMessage =
      await Message.findById(message._id)
        .populate(
          "sender",
          "firstName lastName profilePhoto role companionProfile"
        )
        .lean();

    return NextResponse.json(
      {
        success: true,
        message: populatedMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/messages error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to send message.",
      },
      { status: 500 }
    );
  }
}