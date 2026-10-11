
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import Creator from "@/models/Creator";

export async function POST() {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { message: "Please log in first." },
        { status: 401 }
      );
    }

    await connectDB();

    const existing = await Creator.findOne({
      userId: session.userId,
    });

    if (existing) {
      return NextResponse.json(
        {
          message: "You have already applied to the creator program.",
          status: existing.status,
        },
        { status: 409 }
      );
    }

    let referralCode;
    let codeExists = true;

    while (codeExists) {
      referralCode = randomBytes(4).toString("hex").toUpperCase();
      codeExists = Boolean(
        await Creator.exists({ referralCode })
      );
    }

    const creator = await Creator.create({
      userId: session.userId,
      referralCode,
      status: "pending",
      commissionRate: 25,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your creator application has been submitted.",
        status: creator.status,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Creator registration error:", error);

    return NextResponse.json(
      { message: "Unable to submit your creator application." },
      { status: 500 }
    );
  }
}
