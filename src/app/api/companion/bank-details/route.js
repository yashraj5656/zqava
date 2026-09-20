import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import BankDetails from "@/models/BankDetails";

const JWT_SECRET = process.env.JWT_SECRET;

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();

  const token = cookieStore.get("zqava_session")?.value;

  if (!token || !JWT_SECRET) {
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
   GET BANK DETAILS
========================================================= */

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(userId).select("role");

    if (!user || user.role !== "companion") {
      return NextResponse.json(
        {
          success: false,
          message: "Only companions can access bank details.",
        },
        { status: 403 }
      );
    }

    const bankDetails = await BankDetails.findOne({
      companion: userId,
    }).lean();

    if (!bankDetails) {
      return NextResponse.json({
        success: true,
        bankDetails: null,
      });
    }

    return NextResponse.json({
      success: true,

      bankDetails: {
        id: String(bankDetails._id),

        accountHolderName:
          bankDetails.accountHolderName,

        accountNumber:
          bankDetails.accountNumber,

        ifscCode:
          bankDetails.ifscCode,

        bankName:
          bankDetails.bankName,

        branchName:
          bankDetails.branchName,

        upiId:
          bankDetails.upiId,

        accountType:
          bankDetails.accountType,

        verified:
          bankDetails.verified,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/companion/bank-details ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load bank details.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   SAVE / UPDATE BANK DETAILS
========================================================= */

export async function POST(request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(userId).select("role");

    if (!user || user.role !== "companion") {
      return NextResponse.json(
        {
          success: false,
          message: "Only companions can add bank details.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      accountHolderName,
      accountNumber,
      confirmAccountNumber,
      ifscCode,
      bankName,
      branchName,
      upiId,
      accountType,
    } = body;

    /* -------------------------------------------------------
       VALIDATION
    ------------------------------------------------------- */

    if (
      !accountHolderName ||
      !accountNumber ||
      !confirmAccountNumber ||
      !ifscCode ||
      !bankName
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill all required fields.",
        },
        { status: 400 }
      );
    }

    if (accountNumber !== confirmAccountNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Account numbers do not match.",
        },
        { status: 400 }
      );
    }

    const cleanAccountNumber =
      String(accountNumber).replace(/\s/g, "");

    if (!/^\d{9,18}$/.test(cleanAccountNumber)) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid bank account number.",
        },
        { status: 400 }
      );
    }

    const cleanIFSC =
      String(ifscCode)
        .trim()
        .toUpperCase();

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIFSC)) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid IFSC code.",
        },
        { status: 400 }
      );
    }

    /* -------------------------------------------------------
       SAVE
    ------------------------------------------------------- */

    const bankDetails =
      await BankDetails.findOneAndUpdate(
        {
          companion: userId,
        },
        {
          companion: userId,

          accountHolderName:
            String(accountHolderName).trim(),

          accountNumber:
            cleanAccountNumber,

          ifscCode:
            cleanIFSC,

          bankName:
            String(bankName).trim(),

          branchName:
            String(branchName || "").trim(),

          upiId:
            String(upiId || "").trim(),

          accountType:
            accountType === "current"
              ? "current"
              : "savings",

          // Changing bank details should require
          // verification again.
          verified: false,
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      );

    return NextResponse.json({
      success: true,
      message: "Bank details saved successfully.",

      bankDetails: {
        id: String(bankDetails._id),
        accountHolderName:
          bankDetails.accountHolderName,
        accountNumber:
          bankDetails.accountNumber,
        ifscCode:
          bankDetails.ifscCode,
        bankName:
          bankDetails.bankName,
        branchName:
          bankDetails.branchName,
        upiId:
          bankDetails.upiId,
        accountType:
          bankDetails.accountType,
        verified:
          bankDetails.verified,
      },
    });
  } catch (error) {
    console.error(
      "POST /api/companion/bank-details ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save bank details.",
      },
      { status: 500 }
    );
  }
}