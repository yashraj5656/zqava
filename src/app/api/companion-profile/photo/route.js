import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { v2 as cloudinary } from "cloudinary";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

/*
|--------------------------------------------------------------------------
| CLOUDINARY
|--------------------------------------------------------------------------
*/

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("zqava_session")?.value;

  if (!token) {
    return null;
  }

  if (!JWT_SECRET) {
    console.error(
      "JWT_SECRET is not configured."
    );

    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );

    return (
      payload.userId ||
      payload.id ||
      null
    );
  } catch (error) {
    console.error(
      "JWT verification error:",
      error
    );

    return null;
  }
}

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
*/

export async function POST(request) {
  try {
    /*
    |--------------------------------------------------------------------------
    | DATABASE
    |--------------------------------------------------------------------------
    */

    await connectDB();

    /*
    |--------------------------------------------------------------------------
    | AUTH
    |--------------------------------------------------------------------------
    */

    const userId =
      await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in first.",
        },
        {
          status: 401,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | FIND USER
    |--------------------------------------------------------------------------
    */

    const user =
      await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | COMPANION CHECK
    |--------------------------------------------------------------------------
    */

    if (user.role !== "companion") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only companions can upload a profile photo.",
        },
        {
          status: 403,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | FORM DATA
    |--------------------------------------------------------------------------
    */

    const formData =
      await request.formData();

    const file =
      formData.get("file");

    if (
      !file ||
      typeof file === "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select an image.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | FILE TYPE
    |--------------------------------------------------------------------------
    */

    if (
      !ALLOWED_TYPES.includes(
        file.type
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only JPG, PNG, and WebP images are allowed.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | FILE SIZE
    |--------------------------------------------------------------------------
    */

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Profile photo must be smaller than 5 MB.",
        },
        {
          status: 400,
        }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The selected image is empty.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CONVERT FILE TO BUFFER
    |--------------------------------------------------------------------------
    */

    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    /*
    |--------------------------------------------------------------------------
    | UPLOAD TO CLOUDINARY
    |--------------------------------------------------------------------------
    */

    const uploadResult =
      await new Promise(
        (resolve, reject) => {
          const uploadStream =
            cloudinary.uploader.upload_stream(
              {
                folder:
                  "zqava/companions/profile-photos",

                resource_type:
                  "image",

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
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );

          uploadStream.end(buffer);
        }
      );

    /*
    |--------------------------------------------------------------------------
    | CLOUDINARY URL
    |--------------------------------------------------------------------------
    */

    const profilePhoto =
      uploadResult.secure_url;

    /*
    |--------------------------------------------------------------------------
    | SAVE CLOUDINARY URL TO MONGODB
    |--------------------------------------------------------------------------
    */

    if (!user.companionProfile) {
      user.set(
        "companionProfile",
        {}
      );
    }

    user.set(
      "companionProfile.profilePhoto",
      profilePhoto
    );

    /*
    |--------------------------------------------------------------------------
    | SAVE
    |--------------------------------------------------------------------------
    */

    await user.save();

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return NextResponse.json({
      success: true,

      message:
        "Profile photo updated successfully.",

      profilePhoto,
    });
  } catch (error) {
    console.error(
      "POST /api/companion-profile/photo error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to upload profile photo.",
      },
      {
        status: 500,
      }
    );
  }
}