import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/mongodb";
import PushSubscription from "@/models/PushSubscription";

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("zqava_session")?.value;

  if (!token || !process.env.JWT_SECRET) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    return payload.userId || payload.id || null;
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Please log in first." },
        { status: 401 }
      );
    }

    const subscription = await request.json();

    if (
      !subscription?.endpoint ||
      !subscription?.keys?.p256dh ||
      !subscription?.keys?.auth
    ) {
      return NextResponse.json(
        { message: "Invalid push subscription." },
        { status: 400 }
      );
    }

    await connectDB();

    await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        $set: {
          user: userId,
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: "Push notifications enabled.",
    });
  } catch (error) {
    console.error("Push subscription error:", error);

    return NextResponse.json(
      { message: "Could not save push subscription." },
      { status: 500 }
    );
  }
}