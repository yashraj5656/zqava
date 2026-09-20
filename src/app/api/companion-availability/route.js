import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

/*
|--------------------------------------------------------------------------
| DAYS
|--------------------------------------------------------------------------
*/

const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

/*
|--------------------------------------------------------------------------
| DEFAULT TIMEZONE
|--------------------------------------------------------------------------
*/

const DEFAULT_TIMEZONE = "Asia/Kolkata";

/*
|--------------------------------------------------------------------------
| EMPTY WEEKLY SCHEDULE
|--------------------------------------------------------------------------
*/

function emptyWeeklySchedule() {
  return DAY_KEYS.map((day) => ({
    day,
    enabled: false,
    slots: [],
  }));
}

/*
|--------------------------------------------------------------------------
| VALID TIME
|--------------------------------------------------------------------------
*/

function isValidTime(value) {
  if (
    typeof value !== "string" ||
    !/^\d{2}:\d{2}$/.test(value)
  ) {
    return false;
  }

  const [hours, minutes] = value
    .split(":")
    .map(Number);

  return (
    hours >= 0 &&
    hours <= 23 &&
    minutes >= 0 &&
    minutes <= 59
  );
}

/*
|--------------------------------------------------------------------------
| TIME → MINUTES
|--------------------------------------------------------------------------
*/

function timeToMinutes(time) {
  if (!isValidTime(time)) {
    return null;
  }

  const [hours, minutes] = time
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}

/*
|--------------------------------------------------------------------------
| SANITIZE SLOTS
|--------------------------------------------------------------------------
*/

function sanitizeSlots(slots) {
  if (!Array.isArray(slots)) {
    return [];
  }

  const cleaned = [];

  for (const slot of slots) {
    if (
      !slot ||
      typeof slot !== "object" ||
      Array.isArray(slot)
    ) {
      continue;
    }

    const start =
      typeof slot.start === "string"
        ? slot.start.trim()
        : "";

    const end =
      typeof slot.end === "string"
        ? slot.end.trim()
        : "";

    if (
      !isValidTime(start) ||
      !isValidTime(end)
    ) {
      continue;
    }

    const startMinutes =
      timeToMinutes(start);

    const endMinutes =
      timeToMinutes(end);

    if (
      startMinutes === null ||
      endMinutes === null ||
      startMinutes >= endMinutes
    ) {
      continue;
    }

    cleaned.push({
      start,
      end,
    });
  }

  /*
   * Remove duplicate slots.
   */

  const unique = [];
  const seen = new Set();

  for (const slot of cleaned) {
    const key = `${slot.start}-${slot.end}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(slot);
  }

  /*
   * Sort by starting time.
   */

  unique.sort((a, b) => {
    return (
      timeToMinutes(a.start) -
      timeToMinutes(b.start)
    );
  });

  return unique;
}

/*
|--------------------------------------------------------------------------
| SANITIZE WEEKLY SCHEDULE
|--------------------------------------------------------------------------
*/

function sanitizeWeeklySchedule(
  weeklySchedule
) {
  const result =
    emptyWeeklySchedule();

  if (!Array.isArray(weeklySchedule)) {
    return result;
  }

  for (const dayData of weeklySchedule) {
    if (
      !dayData ||
      typeof dayData !== "object" ||
      Array.isArray(dayData)
    ) {
      continue;
    }

    const day =
      typeof dayData.day === "string"
        ? dayData.day
            .trim()
            .toLowerCase()
        : "";

    if (!DAY_KEYS.includes(day)) {
      continue;
    }

    const slots = sanitizeSlots(
      dayData.slots
    );

    const enabled =
      Boolean(dayData.enabled) &&
      slots.length > 0;

    const index =
      result.findIndex(
        (item) => item.day === day
      );

    if (index === -1) {
      continue;
    }

    result[index] = {
      day,
      enabled,
      slots,
    };
  }

  return result;
}

/*
|--------------------------------------------------------------------------
| AUTHENTICATED USER
|--------------------------------------------------------------------------
*/

async function getAuthenticatedUser(
  request
) {
  try {
    const cookie =
      request.headers.get("cookie") || "";

    if (!cookie) {
      return null;
    }

    const authUrl = new URL(
      "/api/auth/me",
      request.url
    );

    const response = await fetch(
      authUrl,
      {
        method: "GET",
        headers: {
          cookie,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data =
      await response.json();

    return (
      data?.user ||
      data ||
      null
    );
  } catch (error) {
    console.error(
      "getAuthenticatedUser error:",
      error
    );

    return null;
  }
}

/*
|--------------------------------------------------------------------------
| NORMALIZE AVAILABILITY RESPONSE
|--------------------------------------------------------------------------
*/

function normalizeAvailability(
  availability
) {
  if (
    !availability ||
    typeof availability !== "object" ||
    Array.isArray(availability)
  ) {
    return {
      timezone: DEFAULT_TIMEZONE,
      weeklySchedule:
        emptyWeeklySchedule(),
    };
  }

  return {
    timezone:
      typeof availability.timezone ===
        "string" &&
      availability.timezone.trim()
        ? availability.timezone.trim()
        : DEFAULT_TIMEZONE,

    weeklySchedule:
      Array.isArray(
        availability.weeklySchedule
      )
        ? availability.weeklySchedule
        : emptyWeeklySchedule(),
  };
}

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
|
| Public:
|
| /api/companion-availability?companionId=XXX
|
| Dashboard:
|
| /api/companion-availability
|
|--------------------------------------------------------------------------
*/

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } =
      new URL(request.url);

    const companionId =
      searchParams.get(
        "companionId"
      );

    /*
     * =========================================================
     * PUBLIC COMPANION
     * =========================================================
     */

    if (companionId) {
      const user =
        await User.findById(
          companionId
        )
          .select(
            "role companionProfile"
          )
          .lean();

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Companion not found.",
          },
          {
            status: 404,
          }
        );
      }

      if (
        String(user.role).toLowerCase() !==
        "companion"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This user is not a companion.",
          },
          {
            status: 404,
          }
        );
      }

      const availability =
        normalizeAvailability(
          user
            ?.companionProfile
            ?.availability
        );

      return NextResponse.json({
        success: true,
        availability,
      });
    }

    /*
     * =========================================================
     * DASHBOARD
     * =========================================================
     */

    const authUser =
      await getAuthenticatedUser(
        request
      );

    if (
      !authUser?._id &&
      !authUser?.id
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You must be logged in.",
        },
        {
          status: 401,
        }
      );
    }

    const userId =
      authUser._id ||
      authUser.id;

    const user =
      await User.findById(
        userId
      )
        .select(
          "role companionProfile"
        )
        .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      String(user.role).toLowerCase() !==
      "companion"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only companions have availability settings.",
        },
        {
          status: 403,
        }
      );
    }

    const availability =
      normalizeAvailability(
        user
          ?.companionProfile
          ?.availability
      );

    return NextResponse.json({
      success: true,
      availability,
    });
  } catch (error) {
    console.error(
      "GET /api/companion-availability error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to load availability.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PUT
|--------------------------------------------------------------------------
|
| Saves:
|
| {
|   timezone: "Asia/Kolkata",
|   weeklySchedule: [...]
| }
|
|--------------------------------------------------------------------------
*/

export async function PUT(request) {
  try {
    await connectDB();

    /*
     * =========================================================
     * AUTH
     * =========================================================
     */

    const authUser =
      await getAuthenticatedUser(
        request
      );

    if (
      !authUser?._id &&
      !authUser?.id
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You must be logged in.",
        },
        {
          status: 401,
        }
      );
    }

    const userId =
      authUser._id ||
      authUser.id;

    /*
     * =========================================================
     * BODY
     * =========================================================
     */

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid JSON request body.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =========================================================
     * TIMEZONE
     * =========================================================
     */

    const timezone =
      typeof body?.timezone ===
        "string" &&
      body.timezone.trim()
        ? body.timezone.trim()
        : DEFAULT_TIMEZONE;

    /*
     * =========================================================
     * WEEKLY SCHEDULE
     * =========================================================
     */

    const weeklySchedule =
      sanitizeWeeklySchedule(
        body?.weeklySchedule
      );

    /*
     * =========================================================
     * LOAD USER
     * =========================================================
     */

    const user =
      await User.findById(
        userId
      );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * =========================================================
     * ROLE CHECK
     * =========================================================
     */

    if (
      String(user.role).toLowerCase() !==
      "companion"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only companions can update availability.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * =========================================================
     * INITIALIZE PROFILE
     * =========================================================
     */

    if (!user.companionProfile) {
      user.set(
        "companionProfile",
        {}
      );
    }

    /*
     * =========================================================
     * IMPORTANT
     * =========================================================
     *
     * Use Mongoose set() for the nested field.
     *
     * This prevents accidental array-style
     * assignment and makes the intended
     * schema structure explicit.
     */

    const availability = {
      timezone,
      weeklySchedule,
    };

    user.set(
      "companionProfile.availability",
      availability
    );

    /*
     * =========================================================
     * DEBUG CHECK
     * =========================================================
     *
     * If your old schema is still loaded,
     * this will expose it immediately.
     */

    const availabilityPath =
      User.schema.path(
        "companionProfile.availability"
      );

    console.log(
      "Availability schema instance:",
      availabilityPath?.instance
    );

    console.log(
      "Availability value:",
      JSON.stringify(
        user.companionProfile
          ?.availability,
        null,
        2
      )
    );

    console.log(
      "Availability is array:",
      Array.isArray(
        user.companionProfile
          ?.availability
      )
    );

    /*
     * =========================================================
     * SAVE
     * =========================================================
     */

    await user.save();

    /*
     * =========================================================
     * RESPONSE
     * =========================================================
     */

    return NextResponse.json({
      success: true,

      message:
        "Availability saved successfully.",

      availability: {
        timezone,
        weeklySchedule,
      },
    });
  } catch (error) {
    console.error(
      "PUT /api/companion-availability error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Failed to save availability.",
      },
      {
        status: 500,
      }
    );
  }
}