
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Creator from "@/models/Creator";
import Referral from "@/models/Referral";
import { createSession } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();

    const firstName = body.firstName?.trim();
    const lastName = body.lastName?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: "All required fields must be completed." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must contain at least 8 characters." },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "user",
    });

    // Attribute the signup to an approved creator, if a valid
    // referral cookie exists. Referral failure must not prevent
    // the user from signing up.
    const cookieStore = await cookies();
    const referralCode = cookieStore
      .get("zqava_referral")
      ?.value
      ?.trim()
      .toUpperCase();

    if (referralCode) {
      try {
        const creator = await Creator.findOne({
          referralCode,
          status: "approved",
        });

        if (
          creator &&
          creator.userId.toString() !== user._id.toString()
        ) {
          await Referral.create({
            creatorId: creator._id,
            referredUserId: user._id,
          });
        }
      } catch (referralError) {
        console.error("Referral attribution error:", referralError);
      }
    }

    await createSession(user);

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );

    response.cookies.delete("zqava_referral");

    return response;
  } catch (error) {
    console.error("Signup error:", error);

    return NextResponse.json(
      { message: "Something went wrong while creating your account." },
      { status: 500 }
    );
  }
}
