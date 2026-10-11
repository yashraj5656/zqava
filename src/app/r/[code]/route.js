
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Creator from "@/models/Creator";

export async function GET(request, { params }) {
  try {
    const { code } = await params;
    const referralCode = code?.trim().toUpperCase();

    await connectDB();

    const creator = await Creator.findOne({
      referralCode,
      status: "approved",
    }).select("_id referralCode");

    const signupUrl = new URL("/signup", request.url);
    const response = NextResponse.redirect(signupUrl);

    if (creator) {
      response.cookies.set("zqava_referral", creator.referralCode, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (error) {
    console.error("Referral redirect error:", error);

    return NextResponse.redirect(new URL("/signup", request.url));
  }
}
