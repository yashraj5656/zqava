
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import PushSubscription from "@/models/PushSubscription";

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("zqava_session")?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    const userId = payload.userId || payload.id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return null;
    }

    return userId;
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Please log in first." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { endpoint, keys, expirationTime } = body || {};

    if (
      typeof endpoint !== "string" ||
      !endpoint.startsWith("https://") ||
      !keys ||
      typeof keys.p256dh !== "string" ||
      typeof keys.auth !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid push subscription." },
        { status: 400 }
      );
    }

    await connectDB();

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        $set: {
          userId,
          endpoint,
          keys: {
            p256dh: keys.p256dh,
            auth: keys.auth,
          },
          expirationTime:
            typeof expirationTime === "number"
              ? expirationTime
              : null,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Push notifications enabled.",
    });
  } catch (error) {
    console.error("Push subscription error:", error);

    return NextResponse.json(
      { error: "Could not save your push subscription." },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Please log in first." },
        { status: 401 }
      );
    }

    const { endpoint } = await request.json();

    if (typeof endpoint !== "string") {
      return NextResponse.json(
        { error: "Invalid subscription endpoint." },
        { status: 400 }
      );
    }

    await connectDB();

    await PushSubscription.deleteOne({
      userId,
      endpoint,
    });

    return NextResponse.json({
      success: true,
      message: "Push notifications disabled.",
    });
  } catch (error) {
    console.error("Push unsubscribe error:", error);

    return NextResponse.json(
      { error: "Could not disable push notifications." },
      { status: 500 }
    );
  }
}
