import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        {
          user: null,
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    const user = await User.findById(
      session.userId
    ).lean();

    if (!user) {
      return NextResponse.json(
        {
          user: null,
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        city: user.city,
        bio: user.bio,
        profilePhoto: user.profilePhoto,
        emailVerified: user.emailVerified,
        companionProfile: user.companionProfile,
      },
    });
  } catch (error) {
    console.error("Me error:", error);

    return NextResponse.json(
      {
        message: "Unable to load your account.",
      },
      {
        status: 500,
      }
    );
  }
}