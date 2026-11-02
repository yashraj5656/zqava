import mongoose from "mongoose";

/* =========================================================
   TIME SLOT
========================================================= */

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

/* =========================================================
   WEEKLY DAY
========================================================= */

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
      default: true,          // ← changed from false
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

/* =========================================================
   DEFAULT WEEKLY SCHEDULE
========================================================= */

const defaultWeeklySchedule = () => [
  { day: "monday",    enabled: true, slots: [{ start: "10:00", end: "18:00" }] },
  { day: "tuesday",   enabled: true, slots: [{ start: "10:00", end: "18:00" }] },
  { day: "wednesday", enabled: true, slots: [{ start: "10:00", end: "18:00" }] },
  { day: "thursday",  enabled: true, slots: [{ start: "10:00", end: "18:00" }] },
  { day: "friday",    enabled: true, slots: [{ start: "10:00", end: "18:00" }] },
  { day: "saturday",  enabled: true, slots: [{ start: "10:00", end: "18:00" }] },
  { day: "sunday",    enabled: true, slots: [{ start: "10:00", end: "18:00" }] },
];

/* =========================================================
   COMPANION AVAILABILITY
========================================================= */

const CompanionAvailabilitySchema = new mongoose.Schema(
  {
    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },

    weeklySchedule: {
      type: [WeeklyDaySchema],
      default: defaultWeeklySchedule,   // ← changed from []
    },
  },
  {
    _id: false,
  }
);

/* =========================================================
   COMPANION PROFILE
========================================================= */

const CompanionProfileSchema = new mongoose.Schema(
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

    /* ----------------------------------------------------
       AVAILABILITY (object, not array)
       ---------------------------------------------------- */

    availability: {
      type: CompanionAvailabilitySchema,

      default: () => ({
        timezone: "Asia/Kolkata",
        weeklySchedule: defaultWeeklySchedule(),   // ← real defaults
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
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    _id: false,
  }
);

/* =========================================================
   USER
========================================================= */

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
      enum: ["user", "companion", "admin"],
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

/* =========================================================
   MODEL
========================================================= */

const User =
  mongoose.models.User || mongoose.model("User", UserSchema);

export default User;