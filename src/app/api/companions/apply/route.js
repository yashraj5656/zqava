import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import crypto from "crypto";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET;

/* =========================================================
   AUTH — read userId from session cookie
========================================================= */

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("zqava_session")?.value;

  if (!token || !JWT_SECRET) return null;

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
   POST — submit companion application
========================================================= */

export async function POST(request) {
  try {
    await connectDB();

    /* ---------- AUTH ---------- */
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          message: "Please log in to become a companion.",
        },
        { status: 401 }
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found. Please log in again.",
        },
        { status: 404 }
      );
    }

    /* ---------- FORM DATA ---------- */
    const formData = await request.formData();

    const fullName = formData.get("fullName")?.toString().trim();
    const displayName = formData.get("displayName")?.toString().trim();
    const phone = formData.get("phone")?.toString().trim();
    const city = formData.get("city")?.toString().trim();
    const bio = formData.get("bio")?.toString().trim();

    const companionshipRaw =
      formData.get("companionship")?.toString() || "";

    const interestsRaw =
      formData.get("interests")?.toString() || "";

    const rate = Number(formData.get("rate") || 0);

    const photo = formData.get("photo");

    /* ---------- VALIDATION (email removed) ---------- */
    if (!fullName || !displayName || !phone || !city) {
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

    /* ---------- PARSE ARRAYS ---------- */
    const companionshipStyles = companionshipRaw
      ? JSON.parse(companionshipRaw)
      : [];

    const interests = interestsRaw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    /* ---------- DEFAULT AVAILABILITY ---------- */
    const availability = {
      timezone: "Asia/Kolkata",
      weeklySchedule: [
        { day: "monday",    enabled: true, slots: [{ start: "10:00", end: "18:00" }] },
        { day: "tuesday",   enabled: true, slots: [{ start: "10:00", end: "18:00" }] },
        { day: "wednesday", enabled: true, slots: [{ start: "10:00", end: "18:00" }] },
        { day: "thursday",  enabled: true, slots: [{ start: "10:00", end: "18:00" }] },
        { day: "friday",    enabled: true, slots: [{ start: "10:00", end: "18:00" }] },
        { day: "saturday",  enabled: true, slots: [{ start: "10:00", end: "18:00" }] },
        { day: "sunday",    enabled: true, slots: [{ start: "10:00", end: "18:00" }] },
      ],
    };

    /* ---------- PHOTO UPLOAD ---------- */
    let profilePhoto = "";

    if (photo && typeof photo !== "string" && photo.size > 0) {
      if (!photo.type.startsWith("image/")) {
        return NextResponse.json(
          { message: "Profile photo must be an image." },
          { status: 400 }
        );
      }

      if (photo.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { message: "Profile photo must be smaller than 5MB." },
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
            transformation: [
              {
                width: 800,
                height: 800,
                crop: "fill",
                gravity: "face",
                quality: "auto",
                fetch_format: "auto",
              },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(buffer);
      });

      profilePhoto = uploadedImage.secure_url;
    }

    /* ---------- SPLIT NAME ---------- */
    const nameParts = fullName.split(/\s+/);
    const firstName = nameParts.shift() || "";
    const lastName = nameParts.join(" ");

    /* ---------- UPDATE THE LOGGED-IN USER ---------- */
    user.firstName = firstName;
    user.lastName = lastName;
    user.city = city;
    user.role = "companion";

    const existingProfile =
      user.companionProfile?.toObject?.() || user.companionProfile || {};

    user.companionProfile = {
      ...existingProfile,
      displayName,
      city,
      bio,
      phone,
      hourlyRate: rate,
      interests,
      companionshipStyles,
      availability:
        existingProfile.availability?.weeklySchedule?.length > 0
          ? existingProfile.availability
          : availability,
      profilePhoto: profilePhoto || existingProfile.profilePhoto || "",
      available: true,
      profileCompleted: true,
      applicationStatus: "approved",
      verified: existingProfile.verified || false,
    };

    await user.save();

    /* ---------- RESPONSE ---------- */
    return NextResponse.json(
      {
        success: true,
        message: "Companion application submitted successfully.",
        companion: {
          id: user._id.toString(),
          name: displayName,
          city,
          profilePhoto: user.companionProfile?.profilePhoto || profilePhoto,
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