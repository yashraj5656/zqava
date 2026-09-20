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
          message: "Authentication required.",
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
          message: "User not found.",
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
        city: user.city,
        bio: user.bio,
        profilePhoto: user.profilePhoto,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Profile GET error:", error);

    return NextResponse.json(
      {
        message: "Unable to load profile.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        {
          message: "Authentication required.",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    await connectDB();

    const user = await User.findByIdAndUpdate(
      session.userId,
      {
        firstName: body.firstName?.trim(),
        lastName: body.lastName?.trim(),
        city: body.city?.trim(),
        bio: body.bio?.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        city: user.city,
        bio: user.bio,
        profilePhoto: user.profilePhoto,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Profile PATCH error:", error);

    return NextResponse.json(
      {
        message: "Unable to update profile.",
      },
      {
        status: 500,
      }
    );
  }
}