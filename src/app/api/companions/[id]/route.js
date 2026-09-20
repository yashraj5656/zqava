import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid companion ID.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      _id: id,
      role: "companion",
    }).lean();

    if (!user || !user.companionProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "Companion not found.",
        },
        { status: 404 }
      );
    }

    const profile = user.companionProfile;

    const hourlyRate = Number(profile.hourlyRate || 0);

    const name =
      profile.displayName ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      "Companion";

    const profilePhoto =
      profile.profilePhoto || "";

    return NextResponse.json({
      success: true,
      companion: {
        id: String(user._id),
        name,
        hourlyRate,
        profilePhoto,
        image: profilePhoto,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/companions/[id] ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load companion.",
      },
      { status: 500 }
    );
  }
}