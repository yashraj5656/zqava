import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const users = await User.find({
      role: "companion",
    })
      .lean();

    console.log(
      "COMPANION USERS FOUND:",
      users.length
    );

    const companions = users
      .filter(
        (user) =>
          user.companionProfile
      )
      .map((user) => {

        const profile =
          user.companionProfile;

        const interests =
          Array.isArray(
            profile.interests
          )
            ? profile.interests
            : [];

        const companionshipStyles =
          Array.isArray(
            profile.companionshipStyles
          )
            ? profile.companionshipStyles
            : [];

        const activities = [
          ...new Set([
            ...interests,
            ...companionshipStyles,
          ]),
        ];

        const name =
          profile.displayName ||
          `${user.firstName || ""} ${
            user.lastName || ""
          }`.trim() ||
          "Companion";

        const hourlyRate = Number(
          profile.hourlyRate || 0
        );

        const profilePhoto =
          profile.profilePhoto || "";

        return {
          id: String(user._id),

          name,

          age:
            profile.age || null,

          city:
            profile.city ||
            user.city ||
            "",

          bio:
            profile.bio || "",

          hourlyRate,

          price: hourlyRate,

          profilePhoto,

          image: profilePhoto,

          interests,

          companionshipStyles,

          activities,

          verified:
            Boolean(
              profile.verified
            ),

          available:
            profile.available !== false,

          rating: 0,

          reviews: 0,
        };
      });

    console.log(
      "COMPANIONS RETURNED:",
      companions.length
    );

    return NextResponse.json({
      success: true,
      companions,
    });

  } catch (error) {

    console.error(
      "GET /api/companions ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load companions.",
        companions: [],
      },
      {
        status: 500,
      }
    );
  }
}