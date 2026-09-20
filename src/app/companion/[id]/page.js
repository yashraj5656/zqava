import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import CompanionProfile from "@/components/CompanionProfile";

export default async function CompanionPage({ params }) {
  const { id } = await params;

  await connectDB();

  const user = await User.findOne({
    _id: id,
    role: "companion",
  }).lean();

  if (!user || !user.companionProfile) {
    notFound();
  }

  const profile = user.companionProfile;

  const companion = {
    /* =====================================================
       BASIC INFO
    ===================================================== */

    id: user._id.toString(),

    name:
      profile.displayName ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      "Companion",

    age: profile.age || null,

    city:
      profile.city ||
      user.city ||
      "",

    bio: profile.bio || "",

    /* =====================================================
       PRICING
    ===================================================== */

    hourlyRate: Number(
      profile.hourlyRate || 0
    ),

    /* =====================================================
       PHOTO
    ===================================================== */

    profilePhoto:
      profile.profilePhoto || "",

    /* =====================================================
       REVIEWS
       Replace these when your review system is ready.
    ===================================================== */

    rating: Number(
      profile.rating || 0
    ),

    reviews: Number(
      profile.reviewsCount || 0
    ),

    reviewsList: Array.isArray(
      profile.reviewsList
    )
      ? profile.reviewsList
      : [],

    /* =====================================================
       VERIFICATION
    ===================================================== */

    verified: Boolean(
      profile.verified
    ),

    /* =====================================================
       AVAILABILITY
       This should eventually be calculated from
       weekly availability + selected date.
    ===================================================== */

    available: Boolean(
      profile.available
    ),

    /* =====================================================
       INTERESTS
    ===================================================== */

    interests: Array.isArray(
      profile.interests
    )
      ? profile.interests
      : [],

    /* =====================================================
       COMPANIONSHIP STYLES
    ===================================================== */

    companionshipStyles:
      Array.isArray(
        profile.companionshipStyles
      )
        ? profile.companionshipStyles
        : [],

    /* =====================================================
       LANGUAGES
    ===================================================== */

    languages:
      Array.isArray(profile.languages)
        ? profile.languages
        : [],
  };

  return (
    <CompanionProfile
      companion={companion}
    />
  );
}