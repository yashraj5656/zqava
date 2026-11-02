import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET;

/* =========================================================
   DEFAULT AVAILABILITY
========================================================= */

const defaultWeeklySchedule = [
  { day: "monday",    enabled: true, slots: [{ start: "10:00", end: "18:00" }] },
  { day: "tuesday",   enabled: true, slots: [{ start: "10:00", end: "18:00" }] },
  { day: "wednesday", enabled: true, slots: [{ start: "10:00", end: "18:00" }] },
  { day: "thursday",  enabled: true, slots: [{ start: "10:00", end: "18:00" }] },
  { day: "friday",    enabled: true, slots: [{ start: "10:00", end: "18:00" }] },
  { day: "saturday",  enabled: true, slots: [{ start: "10:00", end: "18:00" }] },
  { day: "sunday",    enabled: true, slots: [{ start: "10:00", end: "18:00" }] },
];

const defaultAvailability = {
  timezone: "Asia/Kolkata",
  weeklySchedule: defaultWeeklySchedule,
};

/* =========================================================
   AUTH
========================================================= */

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("zqava_session")?.value;

  if (!token) return null;

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
   GET /api/companion-profile
========================================================= */

export async function GET() {
  try {
    await connectDB();

    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const companionProfile = user.companionProfile || {};

    return NextResponse.json({
      success: true,
      profile: {
        id: user._id.toString(),
        displayName: companionProfile.displayName || "",
        city: companionProfile.city || user.city || "",
        age: companionProfile.age ?? "",
        bio: companionProfile.bio || user.bio || "",
        hourlyRate: companionProfile.hourlyRate ?? "",
        available: Boolean(companionProfile.available),
        interests: Array.isArray(companionProfile.interests)
          ? companionProfile.interests
          : [],
        companionshipStyles: Array.isArray(
          companionProfile.companionshipStyles
        )
          ? companionProfile.companionshipStyles
          : [],
        profilePhoto: companionProfile.profilePhoto || "",
        verified: Boolean(companionProfile.verified),
        profileCompleted: Boolean(companionProfile.profileCompleted),
        applicationStatus: companionProfile.applicationStatus || "pending",
      },
    });
  } catch (error) {
    console.error("GET /api/companion-profile error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load companion profile." },
      { status: 500 }
    );
  }
}

/* =========================================================
   PATCH /api/companion-profile
========================================================= */

export async function PATCH(request) {
  try {
    await connectDB();

    /* ---------- AUTH ---------- */
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    /* ---------- BODY ---------- */
    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    const {
      displayName,
      city,
      age,
      bio,
      hourlyRate,
      available,
      interests,
      companionshipStyles,
      profilePhoto,
    } = body;

    /* ---------- VALIDATION ---------- */
    if (typeof displayName !== "string" || !displayName.trim()) {
      return NextResponse.json(
        { success: false, message: "Display name is required." },
        { status: 400 }
      );
    }

    if (typeof city !== "string" || !city.trim()) {
      return NextResponse.json(
        { success: false, message: "City is required." },
        { status: 400 }
      );
    }

    /* ---------- AGE ---------- */
    let normalizedAge = null;

    if (age !== "" && age !== null && age !== undefined) {
      normalizedAge = Number(age);

      if (!Number.isFinite(normalizedAge)) {
        return NextResponse.json(
          { success: false, message: "Age must be a valid number." },
          { status: 400 }
        );
      }

      if (normalizedAge < 18) {
        return NextResponse.json(
          {
            success: false,
            message: "Companions must be at least 18 years old.",
          },
          { status: 400 }
        );
      }
    }

    /* ---------- HOURLY RATE ---------- */
    let normalizedHourlyRate = 0;

    if (
      hourlyRate !== "" &&
      hourlyRate !== null &&
      hourlyRate !== undefined
    ) {
      normalizedHourlyRate = Number(hourlyRate);

      if (!Number.isFinite(normalizedHourlyRate)) {
        return NextResponse.json(
          {
            success: false,
            message: "Hourly rate must be a valid number.",
          },
          { status: 400 }
        );
      }

      if (normalizedHourlyRate < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Hourly rate cannot be negative.",
          },
          { status: 400 }
        );
      }
    }

    /* ---------- ARRAYS ---------- */
    const normalizedInterests = Array.isArray(interests)
      ? interests
          .filter((item) => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    const normalizedStyles = Array.isArray(companionshipStyles)
      ? companionshipStyles
          .filter((item) => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    /* ---------- LOAD USER ---------- */
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    /* ---------- INITIALIZE COMPANION PROFILE (first save only) ---------- */
    if (!user.companionProfile) {
      user.set("companionProfile", {
        availability: defaultAvailability,
      });
    }

    /* ---------- USER-LEVEL FIELDS ---------- */
    user.set("city", city.trim());
    user.set("bio", typeof bio === "string" ? bio.trim() : "");

    /* ---------- COMPANION PROFILE FIELDS ---------- */
    user.set("companionProfile.displayName", displayName.trim());
    user.set("companionProfile.city", city.trim());
    user.set("companionProfile.age", normalizedAge);
    user.set(
      "companionProfile.bio",
      typeof bio === "string" ? bio.trim() : ""
    );

    /* Only update these if the client actually sent them */
    if ("hourlyRate" in body) {
      user.set("companionProfile.hourlyRate", normalizedHourlyRate);
    }

    if ("available" in body) {
      user.set("companionProfile.available", Boolean(available));
    }

    if ("interests" in body) {
      user.set("companionProfile.interests", normalizedInterests);
    }

    if ("companionshipStyles" in body) {
      user.set(
        "companionProfile.companionshipStyles",
        normalizedStyles
      );
    }

    if ("profilePhoto" in body) {
      user.set(
        "companionProfile.profilePhoto",
        typeof profilePhoto === "string" ? profilePhoto.trim() : ""
      );
    }

    user.set("companionProfile.profileCompleted", true);

    /* ---------- ROLE ---------- */
    if (user.role !== "companion") {
      user.set("role", "companion");
    }

    /* ---------- SAVE ---------- */
    await user.save();

    /* ---------- RESPONSE ---------- */
    return NextResponse.json({
      success: true,
      message: "Companion profile updated successfully.",
      profile: {
        id: user._id.toString(),
        displayName: user.companionProfile?.displayName || "",
        city: user.companionProfile?.city || "",
        age: user.companionProfile?.age ?? "",
        bio: user.companionProfile?.bio || "",
        hourlyRate: user.companionProfile?.hourlyRate ?? 0,
        available: Boolean(user.companionProfile?.available),
        interests: user.companionProfile?.interests || [],
        companionshipStyles:
          user.companionProfile?.companionshipStyles || [],
        profilePhoto: user.companionProfile?.profilePhoto || "",
        verified: Boolean(user.companionProfile?.verified),
        profileCompleted: Boolean(
          user.companionProfile?.profileCompleted
        ),
        applicationStatus:
          user.companionProfile?.applicationStatus || "pending",
      },
    });
  } catch (error) {
    console.error("PATCH /api/companion-profile error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message || "Unable to update companion profile.",
      },
      { status: 500 }
    );
  }
}