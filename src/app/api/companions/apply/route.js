import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";

export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();

    const fullName = formData.get("fullName")?.toString().trim();
    const displayName = formData.get("displayName")?.toString().trim();
    const email = formData.get("email")?.toString().trim().toLowerCase();
    const phone = formData.get("phone")?.toString().trim();
    const city = formData.get("city")?.toString().trim();
    const bio = formData.get("bio")?.toString().trim();

    const companionshipRaw =
      formData.get("companionship")?.toString() || "";

    const interestsRaw =
      formData.get("interests")?.toString() || "";

  //  const availabilityRaw =
  //    formData.get("availability")?.toString() || "";

    const rate = Number(formData.get("rate") || 0);

    const photo = formData.get("photo");

    if (!fullName || !displayName || !email || !phone || !city) {
      return NextResponse.json(
        {
          message: "Please complete all required personal details.",
        },
        { status: 400 }
      );
    }

    if (!bio) {
      return NextResponse.json(
        {
          message: "Please provide a profile bio.",
        },
        { status: 400 }
      );
    }

    if (!rate || rate < 100) {
      return NextResponse.json(
        {
          message: "Hourly rate must be at least ₹100.",
        },
        { status: 400 }
      );
    }

    const companionshipStyles = companionshipRaw
      ? JSON.parse(companionshipRaw)
      : [];

      const availabilityRaw =
      formData.get("availability")?.toString().trim() || "";
    
    const availability = {
      timezone: "Asia/Kolkata",
      weeklySchedule: [],
    };

    const interests = interestsRaw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    // --------------------------------
    // Upload profile photo
    // --------------------------------

    let profilePhoto = "";

    if (photo && typeof photo !== "string" && photo.size > 0) {
      if (!photo.type.startsWith("image/")) {
        return NextResponse.json(
          {
            message: "Profile photo must be an image.",
          },
          { status: 400 }
        );
      }

      if (photo.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          {
            message: "Profile photo must be smaller than 5MB.",
          },
          { status: 400 }
        );
      }

      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadedImage = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "zqava/companions",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        uploadStream.end(buffer);
      });

      profilePhoto = uploadedImage.secure_url;
    }

    // --------------------------------
    // Split full name
    // --------------------------------

    const nameParts = fullName.split(/\s+/);

    const firstName = nameParts.shift() || "";
    const lastName = nameParts.join(" ");

    // --------------------------------
    // Find existing user
    // --------------------------------

    let user = await User.findOne({ email });

    if (user) {
      user.firstName = firstName;
      user.lastName = lastName;
      user.city = city;
      user.role = "companion";

      user.companionProfile = {
        ...(user.companionProfile?.toObject?.() ||
          user.companionProfile ||
          {}),

        displayName,
        city,
        bio,
        phone,
        hourlyRate: rate,
        interests,
        companionshipStyles,
        availability,
        profilePhoto:
          profilePhoto ||
          user.companionProfile?.profilePhoto ||
          "",

        available: true,

        profileCompleted: true,

        applicationStatus: "approved",

        verified:
          user.companionProfile?.verified || false,
      };

      await user.save();
    } else {
      // --------------------------------
      // Create new companion account
      // --------------------------------

      const temporaryPassword = crypto.randomBytes(32).toString("hex");

      const hashedPassword = await bcrypt.hash(
        temporaryPassword,
        12
      );

      user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: "companion",
        city,

        companionProfile: {
          displayName,
          city,
          bio,
          phone,
          hourlyRate: rate,
          interests,
          companionshipStyles,
          availability,
          profilePhoto,
          available: true,
          profileCompleted: true,
          applicationStatus: "approved",
          verified: false,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Companion application submitted successfully.",
        companion: {
          id: user._id.toString(),
          name: displayName,
          city,
          profilePhoto:
            user.companionProfile?.profilePhoto || profilePhoto,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("COMPANION APPLICATION ERROR:", error);
  
    return NextResponse.json(
      {
        message:
          error?.message ||
          "Something went wrong while submitting your application.",
      },
      { status: 500 }
    );
  }
}