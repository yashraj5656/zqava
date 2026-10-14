
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import Creator from "@/models/Creator";
import Referral from "@/models/Referral";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { message: "Please log in first." },
        { status: 401 }
      );
    }

    await connectDB();

    const creator = await Creator.findOne({
      userId: session.userId,
    }).lean();

    if (!creator) {
      return NextResponse.json(
        { message: "You have not applied to the creator program." },
        { status: 404 }
      );
    }

    const [registrations, totals] = await Promise.all([
      Referral.countDocuments({ creatorId: creator._id }),

      Referral.aggregate([
        { $match: { creatorId: creator._id } },
        {
          $group: {
            _id: null,
            totalEligibleProfit: { $sum: "$totalEligibleProfit" },
            totalCommission: { $sum: "$totalCommission" },
            unpaidCommission: {
              $sum: {
                $cond: [
                  { $ne: ["$payoutStatus", "paid"] },
                  "$totalCommission",
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const summary = totals[0] || {
      totalEligibleProfit: 0,
      totalCommission: 0,
      unpaidCommission: 0,
    };

    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://zqava.com"
    ).replace(/\/+$/, "");

    return NextResponse.json({
      success: true,
      creator: {
        status: creator.status,
        referralCode: creator.referralCode,
        referralLink:
          `${appUrl}/r/${creator.referralCode}`,
        commissionRate: creator.commissionRate,
      },
      stats: {
        registrations,
        totalEligibleProfit: summary.totalEligibleProfit,
        totalCommission: summary.totalCommission,
        unpaidCommission: summary.unpaidCommission,
      },
    });
  } catch (error) {
    console.error("Creator dashboard error:", error);

    return NextResponse.json(
      { message: "Unable to load your creator dashboard." },
      { status: 500 }
    );
  }
}
