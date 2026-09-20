import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| TIME SLOT
|--------------------------------------------------------------------------
*/

const TimeSlotSchema = new mongoose.Schema(
  {
    start: {
      type: String,
      required: true,
    },

    end: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| WEEKLY DAY
|--------------------------------------------------------------------------
*/

const WeeklyDaySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      required: true,
    },

    enabled: {
      type: Boolean,
      default: false,
    },

    slots: {
      type: [TimeSlotSchema],
      default: [],
    },
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| COMPANION AVAILABILITY
|--------------------------------------------------------------------------
*/

const CompanionAvailabilitySchema =
  new mongoose.Schema(
    {
      timezone: {
        type: String,
        default: "Asia/Kolkata",
      },

      weeklySchedule: {
        type: [WeeklyDaySchema],
        default: [],
      },
    },
    {
      _id: false,
    }
  );

/*
|--------------------------------------------------------------------------
| COMPANION PROFILE
|--------------------------------------------------------------------------
*/

const CompanionProfileSchema =
  new mongoose.Schema(
    {
      displayName: {
        type: String,
        default: "",
      },

      city: {
        type: String,
        default: "",
      },

      age: {
        type: Number,
        default: null,
      },

      bio: {
        type: String,
        default: "",
      },

      hourlyRate: {
        type: Number,
        default: 0,
      },

      available: {
        type: Boolean,
        default: true,
      },

      interests: {
        type: [String],
        default: [],
      },

      companionshipStyles: {
        type: [String],
        default: [],
      },

      /*
       * --------------------------------------------------------
       * AVAILABILITY
       * --------------------------------------------------------
       *
       * IMPORTANT:
       *
       * This is an OBJECT, NOT an array.
       *
       * availability: {
       *   timezone: "...",
       *   weeklySchedule: [...]
       * }
       *
       */

      availability: {
        type: CompanionAvailabilitySchema,

        default: () => ({
          timezone: "Asia/Kolkata",
          weeklySchedule: [],
        }),
      },

      profilePhoto: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        default: "",
      },

      verified: {
        type: Boolean,
        default: false,
      },

      profileCompleted: {
        type: Boolean,
        default: false,
      },

      applicationStatus: {
        type: String,
        enum: [
          "pending",
          "approved",
          "rejected",
        ],
        default: "pending",
      },
    },
    {
      _id: false,
    }
  );

/*
|--------------------------------------------------------------------------
| USER
|--------------------------------------------------------------------------
*/

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      default: "",
    },

    lastName: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      select: false,
    },

    role: {
      type: String,
      enum: [
        "user",
        "companion",
        "admin",
      ],
      default: "user",
    },

    city: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    profilePhoto: {
      type: String,
      default: "",
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    companionProfile: {
      type: CompanionProfileSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

const User =
  mongoose.models.User ||
  mongoose.model(
    "User",
    UserSchema
  );

export default User;