"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import "./companion-profile.css";

/* =========================================================
   CONSTANTS
========================================================= */




const INTERESTS = [
  "Coffee",
  "Travel",
  "Movies",
  "Music",
  "Food",
  "Photography",
];

const STYLES = [
  "Coffee & Conversation",
  "Dinner Companion",
  "City Explorer",
  "Movie Companion",
  "Event Companion",
  "Casual Hangout",
];

const DAYS = [
  { key: "monday", label: "Monday", short: "MON" },
  { key: "tuesday", label: "Tuesday", short: "TUE" },
  { key: "wednesday", label: "Wednesday", short: "WED" },
  { key: "thursday", label: "Thursday", short: "THU" },
  { key: "friday", label: "Friday", short: "FRI" },
  { key: "saturday", label: "Saturday", short: "SAT" },
  { key: "sunday", label: "Sunday", short: "SUN" },
];

const TIMEZONES = [
  {
    value: "Asia/Kolkata",
    label: "India — IST",
  },
  {
    value: "Asia/Dubai",
    label: "Dubai — GST",
  },
  {
    value: "Asia/Singapore",
    label: "Singapore — SGT",
  },
  {
    value: "Europe/London",
    label: "London",
  },
  {
    value: "America/New_York",
    label: "New York",
  },
  {
    value: "America/Los_Angeles",
    label: "Los Angeles",
  },
];

/* =========================================================
   DEFAULTS
========================================================= */

function createDefaultSchedule() {
  return DAYS.map((day) => ({
    day: day.key,
    enabled: false,
    slots: [],
  }));
}

function createDefaultProfile() {
  return {
    displayName: "",
    city: "",
    age: "",
    bio: "",
    hourlyRate: "",
    available: false,
    interests: [],
    companionshipStyles: [],
    profilePhoto: "",
  };
}

/* =========================================================
   NORMALIZATION
========================================================= */

function normalizeSlot(slot) {
  if (!slot || typeof slot !== "object") {
    return null;
  }

  const start = String(slot.start || "");
  const end = String(slot.end || "");

  if (!start || !end) {
    return null;
  }

  return {
    start,
    end,
  };
}

function normalizeDay(day) {
  if (!day || typeof day !== "object") {
    return null;
  }

  const dayKey = String(day.day || "").toLowerCase();

  if (!DAYS.some((item) => item.key === dayKey)) {
    return null;
  }

  const slots = Array.isArray(day.slots)
    ? day.slots
        .map(normalizeSlot)
        .filter(Boolean)
    : [];

  return {
    day: dayKey,
    enabled: Boolean(day.enabled) && slots.length > 0,
    slots,
  };
}

function normalizeSchedule(serverSchedule) {
  const schedule = Array.isArray(serverSchedule)
    ? serverSchedule
        .map(normalizeDay)
        .filter(Boolean)
    : [];

  return DAYS.map((day) => {
    const found = schedule.find(
      (item) => item.day === day.key
    );

    return (
      found || {
        day: day.key,
        enabled: false,
        slots: [],
      }
    );
  });
}

/* =========================================================
   TIME HELPERS
========================================================= */

function timeToMinutes(value) {
  if (!value || !value.includes(":")) {
    return NaN;
  }

  const [hours, minutes] = value
    .split(":")
    .map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return NaN;
  }

  return hours * 60 + minutes;
}

function formatTime(value) {
  if (!value) {
    return "";
  }

  const [hourString, minute] = value.split(":");

  let hour = Number(hourString);

  if (Number.isNaN(hour)) {
    return value;
  }

  const suffix = hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;

  return `${hour}:${minute} ${suffix}`;
}

function capitalize(value) {
  if (!value) {
    return "";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

function getTimezoneLabel(timezone) {
  return (
    TIMEZONES.find(
      (item) => item.value === timezone
    )?.label || timezone
  );
}

function sortSlots(slots) {
  return [...slots].sort(
    (a, b) =>
      timeToMinutes(a.start) -
      timeToMinutes(b.start)
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function CompanionProfilePage() {
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [profileSaving, setProfileSaving] =
    useState(false);

  const [selectedInterests, setSelectedInterests] =
    useState([]);

  const [selectedStyles, setSelectedStyles] =
    useState([]);

  const [schedule, setSchedule] = useState(
    createDefaultSchedule()
  );

  const [timezone, setTimezone] = useState(
    "Asia/Kolkata"
  );

  const [availabilityLoading, setAvailabilityLoading] =
    useState(true);

  const [availabilitySaving, setAvailabilitySaving] =
    useState(false);

  const [availabilitySaved, setAvailabilitySaved] =
    useState(false);

  const [availabilityError, setAvailabilityError] =
    useState("");

    const [photoUploading, setPhotoUploading] = useState(false);
const [photoError, setPhotoError] = useState("");


async function handleLogout() {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    window.location.href = "/login";
  } catch (error) {
    console.error("Logout error:", error);
  }
}

  /* =========================================================
     LOAD PROFILE + AVAILABILITY
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setAvailabilityLoading(true);

        const [
          profileResponse,
          availabilityResponse,
        ] = await Promise.all([
          fetch("/api/companion-profile", {
            cache: "no-store",
          }),
          fetch("/api/companion-availability", {
            cache: "no-store",
          }),
        ]);

        const profileData =
          await profileResponse.json();

        const availabilityData =
          await availabilityResponse.json();

        if (cancelled) {
          return;
        }

        if (!profileResponse.ok) {
          window.location.href = "/login";
          return;
        }

        /* -------------------------------
           PROFILE
        -------------------------------- */

        const loadedProfile = {
          ...createDefaultProfile(),
          ...(profileData.profile || {}),
        };

        setProfile(loadedProfile);

        setSelectedInterests(
          Array.isArray(loadedProfile.interests)
            ? loadedProfile.interests
            : []
        );

        setSelectedStyles(
          Array.isArray(
            loadedProfile.companionshipStyles
          )
            ? loadedProfile.companionshipStyles
            : []
        );

        /* -------------------------------
           AVAILABILITY
        -------------------------------- */

        if (
          availabilityResponse.ok &&
          availabilityData?.availability
        ) {
          const availability =
            availabilityData.availability;

          setTimezone(
            availability.timezone ||
              "Asia/Kolkata"
          );

          setSchedule(
            normalizeSchedule(
              availability.weeklySchedule
            )
          );
        } else {
          setTimezone("Asia/Kolkata");
          setSchedule(createDefaultSchedule());
        }
      } catch (error) {
        console.error(
          "Unable to load companion profile:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
          setAvailabilityLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     PROFILE HELPERS
  ========================================================= */

  const updateProfile = (field, value) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
  };

  const toggleInterest = (interest) => {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter(
            (item) => item !== interest
          )
        : [...current, interest]
    );

    setSaved(false);
  };

  const toggleStyle = (style) => {
    setSelectedStyles((current) =>
      current.includes(style)
        ? current.filter(
            (item) => item !== style
          )
        : [...current, style]
    );

    setSaved(false);
  };

  /* =========================================================
     AVAILABILITY HELPERS
  ========================================================= */

  const toggleDay = (dayKey) => {
    setSchedule((current) =>
      current.map((day) => {
        if (day.day !== dayKey) {
          return day;
        }

        const enabling = !day.enabled;

        return {
          ...day,

          enabled: enabling,

          slots:
            enabling && day.slots.length === 0
              ? [
                  {
                    start: "10:00",
                    end: "18:00",
                  },
                ]
              : day.slots,
        };
      })
    );

    setAvailabilitySaved(false);
    setAvailabilityError("");
  };

  const addTimeSlot = (dayKey) => {
    setSchedule((current) =>
      current.map((day) => {
        if (day.day !== dayKey) {
          return day;
        }

        const existingSlots = day.slots || [];

        let newStart = "10:00";
        let newEnd = "18:00";

        if (existingSlots.length > 0) {
          const lastSlot =
            existingSlots[
              existingSlots.length - 1
            ];

          const lastEnd = timeToMinutes(
            lastSlot.end
          );

          if (!Number.isNaN(lastEnd)) {
            const start =
              lastEnd + 60;

            const end =
              Math.min(start + 60, 24 * 60);

            if (start < 24 * 60) {
              newStart =
                minutesToTime(start);

              newEnd =
                minutesToTime(end);
            }
          }
        }

        return {
          ...day,
          enabled: true,
          slots: [
            ...existingSlots,
            {
              start: newStart,
              end: newEnd,
            },
          ],
        };
      })
    );

    setAvailabilitySaved(false);
    setAvailabilityError("");
  };

  const removeTimeSlot = (
    dayKey,
    slotIndex
  ) => {
    setSchedule((current) =>
      current.map((day) => {
        if (day.day !== dayKey) {
          return day;
        }

        const slots = day.slots.filter(
          (_, index) => index !== slotIndex
        );

        return {
          ...day,
          slots,
          enabled:
            slots.length > 0
              ? day.enabled
              : false,
        };
      })
    );

    setAvailabilitySaved(false);
    setAvailabilityError("");
  };

  const updateTimeSlot = (
    dayKey,
    slotIndex,
    field,
    value
  ) => {
    setSchedule((current) =>
      current.map((day) => {
        if (day.day !== dayKey) {
          return day;
        }

        return {
          ...day,

          slots: day.slots.map(
            (slot, index) =>
              index === slotIndex
                ? {
                    ...slot,
                    [field]: value,
                  }
                : slot
          ),
        };
      })
    );

    setAvailabilitySaved(false);
    setAvailabilityError("");
  };

  const copyMondayToWeekdays = () => {
    const monday = schedule.find(
      (day) => day.day === "monday"
    );

    if (!monday?.enabled || !monday.slots.length) {
      setAvailabilityError(
        "Set your Monday availability first."
      );

      return;
    }

    setSchedule((current) =>
      current.map((day) => {
        if (day.day === "monday") {
          return day;
        }

        return {
          ...day,

          enabled: true,

          slots: monday.slots.map(
            (slot) => ({
              start: slot.start,
              end: slot.end,
            })
          ),
        };
      })
    );

    setAvailabilitySaved(false);
    setAvailabilityError("");
  };

  /* =========================================================
     VALIDATE AVAILABILITY
  ========================================================= */

  const validateSchedule = () => {
    for (const day of schedule) {
      if (!day.enabled) {
        continue;
      }

      if (!Array.isArray(day.slots)) {
        return `${capitalize(
          day.day
        )} has an invalid time schedule.`;
      }

      if (day.slots.length === 0) {
        return `${capitalize(
          day.day
        )} is enabled but has no time slots.`;
      }

      const sortedSlots = sortSlots(day.slots);

      for (const slot of sortedSlots) {
        if (!slot.start || !slot.end) {
          return `Please select both start and end times for ${capitalize(
            day.day
          )}.`;
        }

        const start = timeToMinutes(
          slot.start
        );

        const end = timeToMinutes(
          slot.end
        );

        if (
          Number.isNaN(start) ||
          Number.isNaN(end)
        ) {
          return `Invalid time selected on ${capitalize(
            day.day
          )}.`;
        }

        if (start >= end) {
          return `End time must be after start time on ${capitalize(
            day.day
          )}.`;
        }
      }

      /* Check overlapping windows */

      for (
        let index = 1;
        index < sortedSlots.length;
        index++
      ) {
        const previous =
          sortedSlots[index - 1];

        const current =
          sortedSlots[index];

        if (
          timeToMinutes(current.start) <
          timeToMinutes(previous.end)
        ) {
          return `${capitalize(
            day.day
          )} has overlapping time windows.`;
        }
      }
    }

    return "";
  };

/* =========================================================
   PROFILE PHOTO
========================================================= */

const handleProfilePhotoChange = async (event) => {
  const file = event.target.files?.[0];

  // Allow selecting the same image again later
  event.target.value = "";

  if (!file) {
    return;
  }

  setPhotoError("");

  /* -----------------------------------------------
     VALIDATE FILE TYPE
  ------------------------------------------------ */

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    setPhotoError(
      "Please upload a JPG, PNG, or WebP image."
    );

    return;
  }

  /* -----------------------------------------------
     VALIDATE FILE SIZE
  ------------------------------------------------ */

  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    setPhotoError(
      "Profile photo must be smaller than 5 MB."
    );

    return;
  }

  try {
    setPhotoUploading(true);

    /* ---------------------------------------------
       UPLOAD
    --------------------------------------------- */

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
      "/api/companion-profile/photo",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
          "Unable to upload profile photo."
      );
    }

    /* ---------------------------------------------
       UPDATE PROFILE WITH NEW URL
    --------------------------------------------- */

    setProfile((current) => ({
      ...current,
      profilePhoto: data.profilePhoto,
    }));

    setSaved(false);
  } catch (error) {
    console.error(
      "Profile photo upload error:",
      error
    );

    setPhotoError(
      error.message ||
        "Unable to upload profile photo."
    );
  } finally {
    setPhotoUploading(false);
  }
};

  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  const handleSave = async (event) => {
    event.preventDefault();

    if (!profile) {
      return;
    }

    setProfileSaving(true);
    setSaved(false);

    try {
      const response = await fetch(
        "/api/companion-profile",
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            displayName: profile.displayName,
            city: profile.city,
            age: profile.age,
            bio: profile.bio,
            hourlyRate: profile.hourlyRate,
            available: profile.available,
            interests: selectedInterests,
            companionshipStyles:
              selectedStyles,
            profilePhoto:
              profile.profilePhoto || "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to save companion profile."
        );

        return;
      }

      const savedProfile = {
        ...createDefaultProfile(),
        ...(data.profile || {}),
      };

      setProfile(savedProfile);

      setSelectedInterests(
        Array.isArray(savedProfile.interests)
          ? savedProfile.interests
          : []
      );

      setSelectedStyles(
        Array.isArray(
          savedProfile.companionshipStyles
        )
          ? savedProfile.companionshipStyles
          : []
      );

      setSaved(true);
    } catch (error) {
      console.error(
        "Profile save error:",
        error
      );

      alert(
        "Something went wrong while saving your profile."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  /* =========================================================
     SAVE AVAILABILITY
  ========================================================= */

  const handleSaveAvailability = async () => {
    setAvailabilitySaving(true);
    setAvailabilitySaved(false);
    setAvailabilityError("");

    try {
      const validationError =
        validateSchedule();

      if (validationError) {
        setAvailabilityError(
          validationError
        );

        return;
      }

      /*
       * IMPORTANT:
       *
       * Send availability as:
       *
       * {
       *   timezone,
       *   weeklySchedule: [...]
       * }
       *
       * NOT:
       *
       * availability: [...]
       */

      const payload = {
        timezone,
        weeklySchedule: schedule.map(
          (day) => ({
            day: day.day,
            enabled: Boolean(day.enabled),
            slots: Array.isArray(day.slots)
              ? day.slots.map((slot) => ({
                  start: slot.start,
                  end: slot.end,
                }))
              : [],
          })
        ),
      };

      const response = await fetch(
        "/api/companion-availability",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setAvailabilityError(
          data.message ||
            "Unable to save availability."
        );

        return;
      }

      const savedAvailability =
        data?.availability;

      if (savedAvailability) {
        setTimezone(
          savedAvailability.timezone ||
            timezone
        );

        setSchedule(
          normalizeSchedule(
            savedAvailability.weeklySchedule
          )
        );
      }

      setAvailabilitySaved(true);
    } catch (error) {
      console.error(
        "Availability save error:",
        error
      );

      setAvailabilityError(
        "Something went wrong while saving availability."
      );
    } finally {
      setAvailabilitySaving(false);
    }
  };

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const activeDays = useMemo(
    () =>
      schedule.filter(
        (day) =>
          day.enabled &&
          day.slots.length > 0
      ),
    [schedule]
  );

  const totalWeeklySlots = useMemo(
    () =>
      schedule.reduce(
        (total, day) =>
          total +
          (day.enabled
            ? day.slots.length
            : 0),
        0
      ),
    [schedule]
  );

  const completion = useMemo(() => {
    if (!profile) {
      return 0;
    }

    const checks = [
      Boolean(profile.profilePhoto),
      Boolean(profile.displayName),
      Boolean(profile.city),
      Number(profile.age) >= 18,
      Boolean(profile.bio),
      selectedInterests.length > 0,
      selectedStyles.length > 0,
      Number(profile.hourlyRate) > 0,
      activeDays.length > 0,
    ];

    return Math.round(
      (checks.filter(Boolean).length /
        checks.length) *
        100
    );
  }, [
    profile,
    selectedInterests,
    selectedStyles,
    activeDays,
  ]);

  const initials = useMemo(() => {
    if (!profile?.displayName) {
      return "ZQ";
    }

    return profile.displayName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  }, [profile?.displayName]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="companion-profile-page">
        <div className="companion-profile-container">
          <div className="profile-loading">
            Loading your companion profile...
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="companion-profile-page">

      <div className="companion-profile-orb companion-profile-orb-one" />

      <div className="companion-profile-orb companion-profile-orb-two" />

      <div className="companion-profile-container">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="companion-profile-header">

          <div>
            <span className="companion-profile-eyebrow">
              COMPANION DASHBOARD
            </span>

            <h1>My profile</h1>

            <p>
              Manage how people discover you
              on ZQAVA.
            </p>
          </div>

          <div className="companion-profile-header-actions">

            <Link
              href="/companion-bookings"
              className="companion-profile-secondary-btn"
            >
              My Bookings
            </Link>

            <Link
              href="/companion-earnings"
              className="companion-profile-primary-btn"
            >
              My Earnings
            </Link>

          </div>

        </header>


        <input
  id="profile-photo-input"
  type="file"
  accept="image/jpeg,image/png,image/webp"
  style={{ display: "none" }}
  onChange={handleProfilePhotoChange}
/>


        {/* =====================================================
            STATUS
        ===================================================== */}

        <section className="companion-profile-status">

          <div className="companion-profile-status-left">

          <div
  className="companion-profile-avatar"
  onClick={() =>
    !photoUploading &&
    document
      .getElementById("profile-photo-input")
      ?.click()
  }
>

{profile.profilePhoto ? (
  <img
    src={profile.profilePhoto}
    alt={
      profile.displayName ||
      "Companion profile"
    }
    className="companion-profile-avatar-image"
  />
) : (
  <span>{initials}</span>
)}

<button
  type="button"
  className="companion-profile-avatar-edit"
  aria-label="Change profile photo"
  onClick={() =>
    document
      .getElementById("profile-photo-input")
      ?.click()
  }
  disabled={photoUploading}
>
  {photoUploading ? "..." : "✎"}
</button>

</div>

{photoError && (
  <div className="profile-photo-error">
    {photoError}
  </div>
)}

            <div className="companion-profile-status-info">

              <div className="companion-profile-name-row">

                <h2>
                  {profile.displayName ||
                    "Your name"}
                </h2>

                <span className="companion-profile-verified">
                  ✓ Verified
                </span>

              </div>

              <p>
                {profile.city ||
                  "Your city"}{" "}
                ·{" "}
                {profile.age || "—"} years old
              </p>

              <div className="companion-profile-status-pill">

                <span
                  className={
                    profile.available
                      ? "status-dot active"
                      : "status-dot"
                  }
                />

                {profile.available
                  ? "Currently accepting bookings"
                  : "Currently unavailable"}

              </div>

            </div>

          </div>

          <div className="companion-profile-status-right">

            <div className="companion-profile-completion">

              <div className="completion-top">

                <span>
                  PROFILE COMPLETION
                </span>

                <strong>
                  {completion}%
                </strong>

              </div>

              <div className="completion-bar">

                <span
                  style={{
                    width: `${completion}%`,
                  }}
                />

              </div>

              <small>
                {completion >= 90
                  ? "Your profile is looking great."
                  : "Complete your profile to help people discover you."}
              </small>

            </div>

            <label className="availability-toggle">

              <span>

                <strong>
                  Available for bookings
                </strong>

                <small>
                  Let people know you're
                  currently available.
                </small>

              </span>

              <input
                type="checkbox"
                checked={Boolean(
                  profile.available
                )}
                onChange={(event) =>
                  updateProfile(
                    "available",
                    event.target.checked
                  )
                }
              />

              <span className="toggle-track">
                <span className="toggle-thumb" />
              </span>

            </label>

          </div>

        </section>

        <form onSubmit={handleSave}>

          <div className="companion-profile-layout">

            {/* =================================================
                MAIN
            ================================================= */}

            <div className="companion-profile-main">

              {/* =================================================
                  BASIC INFORMATION
              ================================================= */}

              <section className="companion-profile-card">

                <div className="companion-profile-card-heading">

                  <div>
                    <span>
                      01 · BASIC INFORMATION
                    </span>

                    <h3>
                      Tell people about you
                    </h3>
                  </div>

                  <div className="card-number">
                    01
                  </div>

                </div>

                <div className="companion-profile-fields">

                  <label>

                    <span>
                      Display name
                    </span>

                    <input
                      type="text"
                      value={
                        profile.displayName
                      }
                      onChange={(event) =>
                        updateProfile(
                          "displayName",
                          event.target.value
                        )
                      }
                      placeholder="Your public name"
                    />

                    <small>
                      This is the name people
                      will see on your profile.
                    </small>

                  </label>

                  <label>

                    <span>City</span>

                    <input
                      type="text"
                      value={profile.city}
                      onChange={(event) =>
                        updateProfile(
                          "city",
                          event.target.value
                        )
                      }
                      placeholder="Your city"
                    />

                  </label>

                  <label>

                    <span>Age</span>

                    <input
                      type="number"
                      min="18"
                      value={profile.age}
                      onChange={(event) =>
                        updateProfile(
                          "age",
                          event.target.value
                        )
                      }
                    />

                    <small>
                      Companions must be
                      18 or older.
                    </small>

                  </label>

                  <label className="field-full">

                    <span>About you</span>

                    <textarea
                      value={
                        profile.bio
                      }
                      onChange={(event) =>
                        updateProfile(
                          "bio",
                          event.target.value
                        )
                      }
                      rows="6"
                      maxLength={500}
                      placeholder="Tell people what makes spending time with you special..."
                    />

                    <small>
                      {(profile.bio || "")
                        .length}
                      /500 characters
                    </small>

                  </label>

                </div>

              </section>

              {/* =================================================
                  COMPANIONSHIP STYLE
              ================================================= */}

              <section className="companion-profile-card">

                <div className="companion-profile-card-heading">

                  <div>

                    <span>
                      02 · COMPANIONSHIP
                    </span>

                    <h3>
                      What kind of company
                      do you offer?
                    </h3>

                  </div>

                  <div className="card-number">
                    02
                  </div>

                </div>

                <p className="companion-profile-description">
                  Choose the experiences
                  that best describe the
                  kind of companionship
                  you enjoy providing.
                </p>

                <div className="companion-profile-options">

                  {STYLES.map((style) => {

                    const selected =
                      selectedStyles.includes(
                        style
                      );

                    return (
                      <button
                        type="button"
                        key={style}
                        className={
                          selected
                            ? "profile-option selected"
                            : "profile-option"
                        }
                        onClick={() =>
                          toggleStyle(style)
                        }
                      >
                        <span>
                          {selected
                            ? "✓"
                            : "+"}
                        </span>

                        {style}

                      </button>
                    );
                  })}

                </div>

              </section>

              {/* =================================================
                  INTERESTS
              ================================================= */}

              <section className="companion-profile-card">

                <div className="companion-profile-card-heading">

                  <div>

                    <span>
                      03 · INTERESTS
                    </span>

                    <h3>
                      Things you enjoy
                    </h3>

                  </div>

                  <div className="card-number">
                    03
                  </div>

                </div>

                <p className="companion-profile-description">
                  Interests help people
                  find companions they
                  naturally connect with.
                </p>

                <div className="companion-profile-options interests">

                  {INTERESTS.map(
                    (interest) => {

                      const selected =
                        selectedInterests.includes(
                          interest
                        );

                      return (
                        <button
                          type="button"
                          key={interest}
                          className={
                            selected
                              ? "profile-interest selected"
                              : "profile-interest"
                          }
                          onClick={() =>
                            toggleInterest(
                              interest
                            )
                          }
                        >
                          {interest}

                          {selected && (
                            <span>
                              ✓
                            </span>
                          )}

                        </button>
                      );
                    }
                  )}

                </div>

              </section>

              {/* =================================================
                  PRICING
              ================================================= */}

              <section className="companion-profile-card">

                <div className="companion-profile-card-heading">

                  <div>

                    <span>
                      04 · PRICING
                    </span>

                    <h3>
                      Your rate
                    </h3>

                  </div>

                  <div className="card-number">
                    04
                  </div>

                </div>

                <div className="pricing-box">

                  <div className="pricing-input">

                    <span>₹</span>

                    <input
                      type="number"
                      min="1"
                      value={
                        profile.hourlyRate
                      }
                      onChange={(event) =>
                        updateProfile(
                          "hourlyRate",
                          event.target.value
                        )
                      }
                    />

                    <span>
                      / hour
                    </span>

                  </div>

                  <p>
                    Set a rate that reflects
                    your time and the
                    experiences you offer.
                  </p>

                </div>

                <div className="pricing-note">

                  <span>i</span>

                  <p>
                    Your actual earnings may
                    vary after platform fees,
                    refunds, adjustments,
                    taxes, and other applicable
                    charges.
                  </p>

                </div>

              </section>

              {/* =================================================
                  WEEKLY AVAILABILITY
              ================================================= */}

              <section
                id="weekly-availability"
                className="companion-profile-card availability-card"
              >

                <div className="companion-profile-card-heading">

                  <div>

                    <span>
                      05 · AVAILABILITY
                    </span>

                    <h3>
                      When are you available?
                    </h3>

                  </div>

                  <div className="card-number">
                    05
                  </div>

                </div>

                <p className="companion-profile-description">
                  Set your recurring weekly
                  schedule. Customers will
                  only be able to request
                  times that fall inside
                  these hours.
                </p>

                {/* SUMMARY */}

                <div className="availability-summary">

                  <div>

                    <strong>
                      {activeDays.length}
                    </strong>

                    <span>
                      active days
                    </span>

                  </div>

                  <div>

                    <strong>
                      {totalWeeklySlots}
                    </strong>

                    <span>
                      time windows
                    </span>

                  </div>

                  <div>

                    <strong>
                      {getTimezoneLabel(
                        timezone
                      ).split(" — ")[0]}
                    </strong>

                    <span>
                      timezone
                    </span>

                  </div>

                </div>

                {/* TOOLBAR */}

                <div className="availability-toolbar">

                  <label>

                    <span>
                      Timezone
                    </span>

                    <select
                      value={timezone}
                      onChange={(event) => {
                        setTimezone(
                          event.target.value
                        );

                        setAvailabilitySaved(
                          false
                        );

                        setAvailabilityError(
                          ""
                        );
                      }}
                    >

                      {TIMEZONES.map(
                        (item) => (
                          <option
                            key={
                              item.value
                            }
                            value={
                              item.value
                            }
                          >
                            {item.label}
                          </option>
                        )
                      )}

                    </select>

                  </label>

                  <button
                    type="button"
                    className="availability-copy-btn"
                    onClick={
                      copyMondayToWeekdays
                    }
                  >
                    Copy Monday to all days
                  </button>

                </div>

                {/* SCHEDULE */}

                {availabilityLoading ? (
                  <div className="availability-loading">
                    Loading your weekly
                    availability...
                  </div>
                ) : (
                  <div className="weekly-schedule">

                    {DAYS.map((day) => {

                      const currentDay =
                        schedule.find(
                          (item) =>
                            item.day ===
                            day.key
                        ) || {
                          day: day.key,
                          enabled: false,
                          slots: [],
                        };

                      return (
                        <div
                          className={
                            currentDay.enabled
                              ? "availability-day active"
                              : "availability-day"
                          }
                          key={day.key}
                        >

                          <div className="availability-day-header">

                            <div className="availability-day-name">

                              <span>
                                {day.short}
                              </span>

                              <strong>
                                {day.label}
                              </strong>

                            </div>

                            <label className="day-switch">

                              <input
                                type="checkbox"
                                checked={Boolean(
                                  currentDay.enabled
                                )}
                                onChange={() =>
                                  toggleDay(
                                    day.key
                                  )
                                }
                              />

                              <span className="day-switch-track">
                                <span />
                              </span>

                            </label>

                          </div>

                          {currentDay.enabled ? (
                            <div className="day-slots">

                              {currentDay.slots.map(
                                (
                                  slot,
                                  slotIndex
                                ) => (
                                  <div
                                    className="availability-slot"
                                    key={`${day.key}-${slotIndex}`}
                                  >

                                    <div className="availability-time-input">

                                      <input
                                        type="time"
                                        value={
                                          slot.start
                                        }
                                        onChange={(
                                          event
                                        ) =>
                                          updateTimeSlot(
                                            day.key,
                                            slotIndex,
                                            "start",
                                            event
                                              .target
                                              .value
                                          )
                                        }
                                      />

                                      <span>
                                        to
                                      </span>

                                      <input
                                        type="time"
                                        value={
                                          slot.end
                                        }
                                        onChange={(
                                          event
                                        ) =>
                                          updateTimeSlot(
                                            day.key,
                                            slotIndex,
                                            "end",
                                            event
                                              .target
                                              .value
                                          )
                                        }
                                      />

                                    </div>

                                    <button
                                      type="button"
                                      className="remove-slot-btn"
                                      onClick={() =>
                                        removeTimeSlot(
                                          day.key,
                                          slotIndex
                                        )
                                      }
                                      aria-label="Remove time slot"
                                    >
                                      ×
                                    </button>

                                  </div>
                                )
                              )}

                              <button
                                type="button"
                                className="add-slot-btn"
                                onClick={() =>
                                  addTimeSlot(
                                    day.key
                                  )
                                }
                              >
                                + Add another time
                              </button>

                            </div>
                          ) : (
                            <div className="day-unavailable">
                              Not available
                            </div>
                          )}

                        </div>
                      );
                    })}

                  </div>
                )}

                {/* HELP */}

                <div className="availability-help">

                  <span>i</span>

                  <p>
                    You can add multiple windows
                    in one day. For example,
                    10 AM–2 PM and again from
                    6 PM–9 PM.
                  </p>

                </div>

                {/* ERROR */}

                {availabilityError && (
                  <div className="availability-error">

                    <span>!</span>

                    {availabilityError}

                  </div>
                )}

                {/* SAVE */}

                <div className="availability-save-row">

                  {availabilitySaved && (
                    <div className="availability-success">

                      <span>✓</span>

                      Weekly availability saved

                    </div>
                  )}

                  <button
                    type="button"
                    className="save-availability-btn"
                    onClick={
                      handleSaveAvailability
                    }
                    disabled={
                      availabilitySaving ||
                      availabilityLoading
                    }
                  >
                    {availabilitySaving
                      ? "Saving..."
                      : "Save availability"}
                  </button>

                </div>

              </section>

              {/* =================================================
                  SAVE PROFILE
              ================================================= */}

              <div className="companion-profile-save-row">

                {saved && (
                  <div className="save-success">

                    <span>✓</span>

                    Changes saved

                  </div>
                )}

                <button
                  type="submit"
                  className="save-profile-btn"
                  disabled={profileSaving}
                >
                  {profileSaving
                    ? "Saving..."
                    : "Save profile"}
                </button>

              </div>

            </div>

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="companion-profile-sidebar">

              {/* PUBLIC PREVIEW */}

              <section className="companion-preview-card">

                <div className="preview-label">
                  PUBLIC PROFILE
                </div>

                <div className="preview-image">

{profile.profilePhoto ? (
  <img
    src={profile.profilePhoto}
    alt={
      profile.displayName ||
      "Companion profile"
    }
    className="preview-profile-image"
  />
) : (
  <div className="preview-avatar">
    {initials}
  </div>
)}

<span className="preview-online">
  ●{" "}
  {profile.available
    ? "Available"
    : "Unavailable"}
</span>

</div>

                <div className="preview-body">

                  <div className="preview-name">

                    <h3>
                      {profile.displayName ||
                        "Your name"}
                    </h3>

                    <span>✓</span>

                  </div>

                  <p className="preview-location">

                    {profile.city ||
                      "Your city"}{" "}
                    ·{" "}
                    {profile.age || "—"}

                  </p>

                  <div className="preview-rating">

                    <span>★</span>

                    <strong>4.9</strong>

                    <small>
                      {" "}
                      · 24 reviews
                    </small>

                  </div>

                  <p className="preview-bio">

                    {profile.bio ||
                      "Your profile bio will appear here."}

                  </p>

                  <div className="preview-tags">

                    {selectedInterests
                      .slice(0, 3)
                      .map((interest) => (
                        <span
                          key={interest}
                        >
                          {interest}
                        </span>
                      ))}

                  </div>

                  <div className="preview-price">

                    <div>

                      <strong>
                        ₹
                        {Number(
                          profile.hourlyRate ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                      <span>
                        / hour
                      </span>

                    </div>

                    <span>
                      from
                    </span>

                  </div>

                  <Link
                    href={"/explore"}
                    className="preview-button"
                  >
                    View public profile

                    <span>→</span>

                  </Link>

                </div>

              </section>

              {/* =================================================
                  AVAILABILITY SIDEBAR
              ================================================= */}

              <section className="companion-availability-sidebar-card">

                <div className="sidebar-card-label">
                  YOUR AVAILABILITY
                </div>

                <h3>
                  {activeDays.length === 0
                    ? "No days selected"
                    : `${activeDays.length} days available`}
                </h3>

                <div className="sidebar-day-list">

                  {DAYS.map((day) => {

                    const currentDay =
                      schedule.find(
                        (item) =>
                          item.day ===
                          day.key
                      );

                    return (
                      <div
                        key={day.key}
                        className={
                          currentDay?.enabled
                            ? "sidebar-day active"
                            : "sidebar-day"
                        }
                      >

                        <span>
                          {day.short}
                        </span>

                        <strong>
                          {currentDay?.enabled &&
                          currentDay.slots.length
                            ? currentDay.slots
                                .map(
                                  (slot) =>
                                    `${formatTime(
                                      slot.start
                                    )}–${formatTime(
                                      slot.end
                                    )}`
                                )
                                .join(", ")
                            : "Off"}
                        </strong>

                      </div>
                    );
                  })}

                </div>

                <Link
                  href="#weekly-availability"
                  className="sidebar-availability-link"
                  onClick={(event) => {
                    event.preventDefault();

                    document
                      .getElementById(
                        "weekly-availability"
                      )
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                  }}
                >
                  Edit weekly schedule →
                </Link>

              </section>

              {/* =================================================
                  PROFILE CHECKLIST
              ================================================= */}

              <section className="companion-checklist-card">

                <div className="checklist-heading">

                  <span>
                    PROFILE TIPS
                  </span>

                  <strong>
                    {completion}%
                  </strong>

                </div>

                <div className="checklist-progress">

                  <span
                    style={{
                      width: `${completion}%`,
                    }}
                  />

                </div>

                <ChecklistItem
                  completed={Boolean(
                    profile.profilePhoto
                  )}
                  label="Add a profile photo"
                />

                <ChecklistItem
                  completed={Boolean(
                    profile.bio
                  )}
                  label="Write your bio"
                />

                <ChecklistItem
                  completed={
                    selectedInterests.length > 0
                  }
                  label="Choose your interests"
                />

                <ChecklistItem
                  completed={
                    Number(
                      profile.hourlyRate
                    ) > 0
                  }
                  label="Set your rate"
                />

                <ChecklistItem
                  completed={
                    activeDays.length > 0
                  }
                  label="Add availability"
                />

              </section>

              {/* =================================================
                  QUICK LINKS
              ================================================= */}

              <section className="companion-quick-card">

                <span>
                  QUICK LINKS
                </span>

                <Link href="/companion-earnings">
                  Earnings
                  <span>→</span>
                </Link>

                <Link href="/companion-guide">
                  Companion Guide
                  <span>→</span>
                </Link>

                <Link href="/safety">
                  Safety Center
                  <span>→</span>
                </Link>

                <Link href="/companion/bank-details">
                  Bank Details
                  <span>→</span>
                </Link>

              </section>

            </aside>

            
            {/* LOGOUT */}
            <button
              type="button"
              className="profile-logout-btn"
              onClick={handleLogout}
            >
              <LogoutIcon />
              Log out
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}

/* =========================================================
   CHECKLIST ITEM
========================================================= */

function ChecklistItem({
  completed,
  label,
}) {
  return (
    <div
      className={
        completed
          ? "checklist-item completed"
          : "checklist-item"
      }
    >
      <span>
        {completed ? "✓" : "+"}
      </span>

      {label}
    </div>
  );
}

/* =========================================================
   MINUTES → HH:MM
========================================================= */

function minutesToTime(minutes) {
  const safeMinutes = Math.max(
    0,
    Math.min(minutes, 23 * 60 + 59)
  );

  const hours = Math.floor(
    safeMinutes / 60
  );

  const mins = safeMinutes % 60;

  return `${String(hours).padStart(
    2,
    "0"
  )}:${String(mins).padStart(2, "0")}`;
}

function LogoutIcon() {
  return (
    <svg
      className="profile-icon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 5H6C4.9 5 4 5.9 4 7V17C4 18.1 4.9 19 6 19H10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M14 8L18 12L14 16M18 12H9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}