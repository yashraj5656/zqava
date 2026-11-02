"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { safeJson } from "@/lib/apiClient";

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
  { value: "Asia/Kolkata", label: "India — IST" },
  { value: "Asia/Dubai", label: "Dubai — GST" },
  { value: "Asia/Singapore", label: "Singapore — SGT" },
  { value: "Europe/London", label: "London" },
  { value: "America/New_York", label: "New York" },
  { value: "America/Los_Angeles", label: "Los Angeles" },
];

/* =========================================================
   DEFAULTS + NORMALIZATION
========================================================= */

function createDefaultSchedule() {
  return DAYS.map((day) => ({
    day: day.key,
    enabled: true,
    slots: [{ start: "10:00", end: "18:00" }],
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

function normalizeSlot(slot) {
  if (!slot || typeof slot !== "object") return null;
  const start = String(slot.start || "");
  const end = String(slot.end || "");
  if (!start || !end) return null;
  return { start, end };
}

function normalizeDay(day) {
  if (!day || typeof day !== "object") return null;
  const dayKey = String(day.day || "").toLowerCase();
  if (!DAYS.some((item) => item.key === dayKey)) return null;
  const slots = Array.isArray(day.slots)
    ? day.slots.map(normalizeSlot).filter(Boolean)
    : [];
  return {
    day: dayKey,
    enabled: Boolean(day.enabled) && slots.length > 0,
    slots,
  };
}

function normalizeSchedule(serverSchedule) {
  const schedule = Array.isArray(serverSchedule)
    ? serverSchedule.map(normalizeDay).filter(Boolean)
    : [];
  return DAYS.map((day) => {
    const found = schedule.find((item) => item.day === day.key);
    return found || { day: day.key, enabled: false, slots: [] };
  });
}

/* =========================================================
   TIME HELPERS
========================================================= */

function timeToMinutes(value) {
  if (!value || !value.includes(":")) return NaN;
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return NaN;
  return hours * 60 + minutes;
}

function formatTime(value) {
  if (!value) return "";
  const [hourString, minute] = value.split(":");
  let hour = Number(hourString);
  if (Number.isNaN(hour)) return value;
  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${suffix}`;
}

function capitalize(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getTimezoneLabel(timezone) {
  return (
    TIMEZONES.find((item) => item.value === timezone)?.label || timezone
  );
}

function sortSlots(slots) {
  return [...slots].sort(
    (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start)
  );
}

function minutesToTime(minutes) {
  const safe = Math.max(0, Math.min(minutes, 23 * 60 + 59));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function ProfileClient() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* Base profile edit */
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    city: "",
    bio: "",
  });

  /* Companion profile state */
  const [profile, setProfile] = useState(null);
  const [saved, setSaved] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState([]);

  const [schedule, setSchedule] = useState(createDefaultSchedule());
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [availabilitySaved, setAvailabilitySaved] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");

  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  /* ---------------------------------------------------------
     LOGOUT
  --------------------------------------------------------- */
  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  /* ---------------------------------------------------------
     LOAD EVERYTHING
  --------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [profileRes, companionRes, availabilityRes] =
          await Promise.all([
            fetch("/api/profile", { cache: "no-store" }),
            fetch("/api/companion-profile", { cache: "no-store" }),
            fetch("/api/companion-availability", { cache: "no-store" }),
          ]);

        const profileData = await safeJson(profileRes);
        const companionData = await safeJson(companionRes);
        const availabilityData = await safeJson(availabilityRes);

        if (cancelled) return;

        if (!profileRes.ok) {
          if (profileRes.status === 401) {
            window.location.href = "/login";
            return;
          }
          throw new Error(profileData.message || "Failed to load profile.");
        }

        setUser(profileData.user);

        setForm({
          firstName: profileData.user.firstName || "",
          lastName: profileData.user.lastName || "",
          city: profileData.user.city || "",
          bio: profileData.user.bio || "",
        });

        /* ---------- Companion-specific data ---------- */
        if (profileData.user.role === "companion") {
          const loadedProfile = {
            ...createDefaultProfile(),
            ...(companionData.profile || {}),
          };

          setProfile(loadedProfile);

          setSelectedInterests(
            Array.isArray(loadedProfile.interests)
              ? loadedProfile.interests
              : []
          );

          setSelectedStyles(
            Array.isArray(loadedProfile.companionshipStyles)
              ? loadedProfile.companionshipStyles
              : []
          );

          const savedSchedule =
            availabilityRes.ok &&
            availabilityData?.availability &&
            Array.isArray(availabilityData.availability.weeklySchedule)
              ? availabilityData.availability.weeklySchedule
              : [];

          if (savedSchedule.length > 0) {
            setTimezone(
              availabilityData.availability.timezone || "Asia/Kolkata"
            );
            setSchedule(normalizeSchedule(savedSchedule));
          } else {
            setTimezone("Asia/Kolkata");
            setSchedule(createDefaultSchedule());
          }
        }
      } catch (err) {
        console.error("Load error:", err);
        if (!cancelled) {
          setError(err.message || "Something went wrong.");
        }
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

  /* ---------------------------------------------------------
     UNSAVED CHANGES WARNING
  --------------------------------------------------------- */
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  /* ---------------------------------------------------------
     BASE PROFILE
  --------------------------------------------------------- */
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSaveBase(e) {
    e.preventDefault();
    try {
      setSaving(true);

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile.");
      }

      setUser(data.user);
      setForm({
        firstName: data.user.firstName || "",
        lastName: data.user.lastName || "",
        city: data.user.city || "",
        bio: data.user.bio || "",
      });
      setEditing(false);
    } catch (err) {
      console.error("Save error:", err);
      alert(err.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  /* ---------------------------------------------------------
     PHOTO UPLOAD (unified)
  --------------------------------------------------------- */
  async function handleProfilePhotoChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setPhotoError("");

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setPhotoError("Please upload a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Profile photo must be smaller than 5 MB.");
      return;
    }

    try {
      setPhotoUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      /* Use companion endpoint for companions, base endpoint for users */
      const endpoint =
        user?.role === "companion"
          ? "/api/companion-profile/photo"
          : "/api/profile/photo";

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await safeJson(res);

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Unable to upload profile photo.");
      }

      const newPhoto = data.profilePhoto;

      setUser((u) => ({ ...u, profilePhoto: newPhoto }));
      if (user?.role === "companion") {
        setProfile((p) => ({ ...p, profilePhoto: newPhoto }));
      }
    } catch (err) {
      console.error("Photo upload error:", err);
      setPhotoError(err.message || "Unable to upload profile photo.");
    } finally {
      setPhotoUploading(false);
    }
  }

  /* ---------------------------------------------------------
     COMPANION HELPERS
  --------------------------------------------------------- */
  const updateProfile = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setSaved(false);
    setProfileError("");
    setHasUnsavedChanges(true);
  };

  const toggleInterest = (interest) => {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    );
    setSaved(false);
    setHasUnsavedChanges(true);
  };

  const toggleStyle = (style) => {
    setSelectedStyles((current) =>
      current.includes(style)
        ? current.filter((item) => item !== style)
        : [...current, style]
    );
    setSaved(false);
    setHasUnsavedChanges(true);
  };

  const toggleDay = (dayKey) => {
    setSchedule((current) =>
      current.map((day) => {
        if (day.day !== dayKey) return day;
        const enabling = !day.enabled;
        return {
          ...day,
          enabled: enabling,
          slots:
            enabling && day.slots.length === 0
              ? [{ start: "10:00", end: "18:00" }]
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
        if (day.day !== dayKey) return day;

        const existingSlots = day.slots || [];
        let newStart = "10:00";
        let newEnd = "18:00";

        if (existingSlots.length > 0) {
          const lastSlot = existingSlots[existingSlots.length - 1];
          const lastEnd = timeToMinutes(lastSlot.end);
          if (!Number.isNaN(lastEnd)) {
            const start = lastEnd + 60;
            const end = Math.min(start + 60, 24 * 60);
            if (start < 24 * 60) {
              newStart = minutesToTime(start);
              newEnd = minutesToTime(end);
            }
          }
        }

        return {
          ...day,
          enabled: true,
          slots: [...existingSlots, { start: newStart, end: newEnd }],
        };
      })
    );
    setAvailabilitySaved(false);
    setAvailabilityError("");
  };

  const removeTimeSlot = (dayKey, slotIndex) => {
    setSchedule((current) =>
      current.map((day) => {
        if (day.day !== dayKey) return day;
        const slots = day.slots.filter((_, i) => i !== slotIndex);
        return {
          ...day,
          slots,
          enabled: slots.length > 0 ? day.enabled : false,
        };
      })
    );
    setAvailabilitySaved(false);
    setAvailabilityError("");
  };

  const updateTimeSlot = (dayKey, slotIndex, field, value) => {
    setSchedule((current) =>
      current.map((day) => {
        if (day.day !== dayKey) return day;
        return {
          ...day,
          slots: day.slots.map((slot, i) =>
            i === slotIndex ? { ...slot, [field]: value } : slot
          ),
        };
      })
    );
    setAvailabilitySaved(false);
    setAvailabilityError("");
  };

  const copyMondayToAllDays = () => {
    const monday = schedule.find((d) => d.day === "monday");
    if (!monday?.enabled || !monday.slots.length) {
      setAvailabilityError("Set your Monday availability first.");
      return;
    }
    setSchedule((current) =>
      current.map((day) => {
        if (day.day === "monday") return day;
        return {
          ...day,
          enabled: true,
          slots: monday.slots.map((s) => ({ start: s.start, end: s.end })),
        };
      })
    );
    setAvailabilitySaved(false);
    setAvailabilityError("");
  };

  const resetAvailabilityToDefaults = () => {
    setSchedule(createDefaultSchedule());
    setTimezone("Asia/Kolkata");
    setAvailabilitySaved(false);
    setAvailabilityError("");
  };

  const validateSchedule = () => {
    for (const day of schedule) {
      if (!day.enabled) continue;

      if (!Array.isArray(day.slots)) {
        return `${capitalize(day.day)} has an invalid time schedule.`;
      }

      if (day.slots.length === 0) {
        return `${capitalize(day.day)} is enabled but has no time slots.`;
      }

      const sorted = sortSlots(day.slots);

      for (const slot of sorted) {
        if (!slot.start || !slot.end) {
          return `Please select both start and end times for ${capitalize(
            day.day
          )}.`;
        }
        const start = timeToMinutes(slot.start);
        const end = timeToMinutes(slot.end);
        if (Number.isNaN(start) || Number.isNaN(end)) {
          return `Invalid time selected on ${capitalize(day.day)}.`;
        }
        if (start >= end) {
          return `End time must be after start time on ${capitalize(
            day.day
          )}.`;
        }
      }

      for (let i = 1; i < sorted.length; i++) {
        if (timeToMinutes(sorted[i].start) < timeToMinutes(sorted[i - 1].end)) {
          return `${capitalize(day.day)} has overlapping time windows.`;
        }
      }
    }
    return "";
  };

  /* ---------------------------------------------------------
     SAVE COMPANION PROFILE
  --------------------------------------------------------- */
  const handleSaveCompanion = async (event) => {
    event.preventDefault();
    if (!profile) return;

    setProfileSaving(true);
    setSaved(false);
    setProfileError("");

    try {
      const res = await fetch("/api/companion-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: profile.displayName,
          city: profile.city,
          age: profile.age,
          bio: profile.bio,
          hourlyRate: profile.hourlyRate,
          available: profile.available,
          interests: selectedInterests,
          companionshipStyles: selectedStyles,
          profilePhoto: profile.profilePhoto || "",
        }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data.message || "Unable to save companion profile.");
      }

      const savedProfile = {
        ...createDefaultProfile(),
        ...(data.profile || {}),
      };

      setProfile(savedProfile);
      setSelectedInterests(
        Array.isArray(savedProfile.interests) ? savedProfile.interests : []
      );
      setSelectedStyles(
        Array.isArray(savedProfile.companionshipStyles)
          ? savedProfile.companionshipStyles
          : []
      );
      setSaved(true);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Save error:", err);
      setProfileError(err.message || "Something went wrong.");
    } finally {
      setProfileSaving(false);
    }
  };

  /* ---------------------------------------------------------
     SAVE AVAILABILITY
  --------------------------------------------------------- */
  const handleSaveAvailability = async () => {
    setAvailabilitySaving(true);
    setAvailabilitySaved(false);
    setAvailabilityError("");

    try {
      const validationError = validateSchedule();
      if (validationError) {
        setAvailabilityError(validationError);
        return;
      }

      const payload = {
        timezone,
        weeklySchedule: schedule.map((d) => ({
          day: d.day,
          enabled: Boolean(d.enabled),
          slots: Array.isArray(d.slots)
            ? d.slots.map((s) => ({ start: s.start, end: s.end }))
            : [],
        })),
      };

      const res = await fetch("/api/companion-availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        setAvailabilityError(data.message || "Unable to save availability.");
        return;
      }

      const savedAvailability = data?.availability;
      if (savedAvailability) {
        setTimezone(savedAvailability.timezone || timezone);
        setSchedule(normalizeSchedule(savedAvailability.weeklySchedule));
      }
      setAvailabilitySaved(true);
    } catch (err) {
      console.error("Availability save error:", err);
      setAvailabilityError("Something went wrong while saving availability.");
    } finally {
      setAvailabilitySaving(false);
    }
  };

  /* ---------------------------------------------------------
     DERIVED DATA
  --------------------------------------------------------- */
  const activeDays = useMemo(
    () => schedule.filter((d) => d.enabled && d.slots.length > 0),
    [schedule]
  );

  const totalWeeklySlots = useMemo(
    () =>
      schedule.reduce((t, d) => t + (d.enabled ? d.slots.length : 0), 0),
    [schedule]
  );

  const completion = useMemo(() => {
    if (!profile) return 0;
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
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [profile, selectedInterests, selectedStyles, activeDays]);

  const initials = useMemo(() => {
    if (user?.firstName || user?.lastName) {
      return `${(user.firstName || "").charAt(0)}${(user.lastName || "").charAt(
        0
      )}`.toUpperCase();
    }
    return "ZQ";
  }, [user?.firstName, user?.lastName]);

  const displayName = useMemo(() => {
    return (
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
      "ZQAVA User"
    );
  }, [user?.firstName, user?.lastName]);

  const isCompanion = user?.role === "companion";

  /* ---------------------------------------------------------
     LOADING / ERROR
  --------------------------------------------------------- */
  if (loading) {
    return (
      <div className="companion-profile-container">
        <div className="profile-loading">Loading your profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="companion-profile-container">
        <div className="profile-loading">
          <h2 style={{ marginBottom: 12 }}>Something went wrong</h2>
          <p style={{ marginBottom: 16 }}>{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              background: "#7444ff",
              color: "white",
              border: "none",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  /* =========================================================
     RENDER — REGULAR USER
  ========================================================= */
  if (!isCompanion) {
    return <RegularUserProfile
      user={user}
      form={form}
      editing={editing}
      saving={saving}
      photoUploading={photoUploading}
      photoError={photoError}
      displayName={displayName}
      initials={initials}
      setEditing={setEditing}
      handleChange={handleChange}
      handleSaveBase={handleSaveBase}
      handleProfilePhotoChange={handleProfilePhotoChange}
      handleLogout={handleLogout}
      setForm={setForm}
    />;
  }

  /* =========================================================
     RENDER — COMPANION
  ========================================================= */
  return (
    <div className="companion-profile-container">
      <div className="companion-profile-orb companion-profile-orb-one" />
      <div className="companion-profile-orb companion-profile-orb-two" />

      {/* HEADER */}
      <header className="companion-profile-header">
        <div>
          <span className="companion-profile-eyebrow">
            COMPANION PROFILE
          </span>
          <h1>My profile</h1>
          <p>Manage how people discover you on ZQAVA.</p>
        </div>

        <div className="companion-profile-header-actions">
          <Link
            href="/companion/dashboard"
            className="companion-profile-primary-btn"
          >
            My Dashboard
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

      {/* STATUS */}
      <section className="companion-profile-status">
        <div className="companion-profile-status-left">
          <div
            className="companion-profile-avatar"
            onClick={() =>
              !photoUploading &&
              document.getElementById("profile-photo-input")?.click()
            }
          >
            {profile?.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                alt={profile.displayName || "Companion"}
                className="companion-profile-avatar-image"
              />
            ) : (
              <span>{initials}</span>
            )}

            <button
              type="button"
              className="companion-profile-avatar-edit"
              aria-label="Change profile photo"
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById("profile-photo-input")?.click();
              }}
              disabled={photoUploading}
            >
              {photoUploading ? "..." : "✎"}
            </button>
          </div>

          {photoError && (
            <div className="profile-photo-error">{photoError}</div>
          )}

          <div className="companion-profile-status-info">
            <div className="companion-profile-name-row">
              <h2>{profile?.displayName || "Your name"}</h2>
              <span className="companion-profile-verified">✓ Verified</span>
            </div>

            <p>
              {profile?.city || "Your city"} ·{" "}
              {profile?.age || "—"} years old
            </p>

            <div className="companion-profile-status-pill">
              <span
                className={
                  profile?.available ? "status-dot active" : "status-dot"
                }
              />
              {profile?.available
                ? "Currently accepting bookings"
                : "Currently unavailable"}
            </div>
          </div>
        </div>

        <div className="companion-profile-status-right">
          <div className="companion-profile-completion">
            <div className="completion-top">
              <span>PROFILE COMPLETION</span>
              <strong>{completion}%</strong>
            </div>

            <div className="completion-bar">
              <span style={{ width: `${completion}%` }} />
            </div>

            <small>
              {completion >= 90
                ? "Your profile is looking great."
                : "Complete your profile to help people discover you."}
            </small>
          </div>

          <label className="availability-toggle">
            <span>
              <strong>Available for bookings</strong>
              <small>Let people know you're currently available.</small>
            </span>

            <input
              type="checkbox"
              checked={Boolean(profile?.available)}
              onChange={(e) =>
                updateProfile("available", e.target.checked)
              }
            />

            <span className="toggle-track">
              <span className="toggle-thumb" />
            </span>
          </label>
        </div>
      </section>

      <form onSubmit={handleSaveCompanion}>
        <div className="companion-profile-layout">
          {/* MAIN */}
          <div className="companion-profile-main">
            {/* BASIC INFORMATION */}
            <section className="companion-profile-card">
              <div className="companion-profile-card-heading">
                <div>
                  <span>01 · BASIC INFORMATION</span>
                  <h3>Tell people about you</h3>
                </div>
                <div className="card-number">01</div>
              </div>

              <div className="companion-profile-fields">
                <label>
                  <span>Display name</span>
                  <input
                    type="text"
                    value={profile?.displayName || ""}
                    onChange={(e) =>
                      updateProfile("displayName", e.target.value)
                    }
                    placeholder="Your public name"
                  />
                  <small>
                    This is the name people will see on your profile.
                  </small>
                </label>

                <label>
                  <span>City</span>
                  <input
                    type="text"
                    value={profile?.city || ""}
                    onChange={(e) => updateProfile("city", e.target.value)}
                    placeholder="Your city"
                  />
                </label>

                <label>
                  <span>Age</span>
                  <input
                    type="number"
                    min="18"
                    value={profile?.age || ""}
                    onChange={(e) => updateProfile("age", e.target.value)}
                  />
                  <small>Companions must be 18 or older.</small>
                </label>

                <label className="field-full">
                  <span>About you</span>
                  <textarea
                    value={profile?.bio || ""}
                    onChange={(e) => updateProfile("bio", e.target.value)}
                    rows="6"
                    maxLength={500}
                    placeholder="Tell people what makes spending time with you special..."
                  />
                  <small>{(profile?.bio || "").length}/500 characters</small>
                </label>
              </div>
            </section>

            {/* COMPANIONSHIP STYLE */}
            <section className="companion-profile-card">
              <div className="companion-profile-card-heading">
                <div>
                  <span>02 · COMPANIONSHIP</span>
                  <h3>What kind of company do you offer?</h3>
                </div>
                <div className="card-number">02</div>
              </div>

              <p className="companion-profile-description">
                Choose the experiences that best describe the kind of
                companionship you enjoy providing.
              </p>

              <div className="companion-profile-options">
                {STYLES.map((style) => {
                  const selected = selectedStyles.includes(style);
                  return (
                    <button
                      type="button"
                      key={style}
                      className={
                        selected
                          ? "profile-option selected"
                          : "profile-option"
                      }
                      onClick={() => toggleStyle(style)}
                    >
                      <span>{selected ? "✓" : "+"}</span>
                      {style}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* INTERESTS */}
            <section className="companion-profile-card">
              <div className="companion-profile-card-heading">
                <div>
                  <span>03 · INTERESTS</span>
                  <h3>Things you enjoy</h3>
                </div>
                <div className="card-number">03</div>
              </div>

              <p className="companion-profile-description">
                Interests help people find companions they naturally
                connect with.
              </p>

              <div className="companion-profile-options interests">
                {INTERESTS.map((interest) => {
                  const selected = selectedInterests.includes(interest);
                  return (
                    <button
                      type="button"
                      key={interest}
                      className={
                        selected
                          ? "profile-interest selected"
                          : "profile-interest"
                      }
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                      {selected && <span>✓</span>}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* PRICING */}
            <section className="companion-profile-card">
              <div className="companion-profile-card-heading">
                <div>
                  <span>04 · PRICING</span>
                  <h3>Your rate</h3>
                </div>
                <div className="card-number">04</div>
              </div>

              <div className="pricing-box">
                <div className="pricing-input">
                  <span>₹</span>
                  <input
                    type="number"
                    min="1"
                    value={profile?.hourlyRate || ""}
                    onChange={(e) =>
                      updateProfile("hourlyRate", e.target.value)
                    }
                  />
                  <span>/ hour</span>
                </div>

                <p>
                  Set a rate that reflects your time and the experiences
                  you offer.
                </p>
              </div>

              <div className="pricing-note">
                <span>i</span>
                <p>
                  Your actual earnings may vary after platform fees,
                  refunds, adjustments, taxes, and other applicable
                  charges.
                </p>
              </div>
            </section>

            {/* WEEKLY AVAILABILITY */}
            <section
              id="weekly-availability"
              className="companion-profile-card availability-card"
            >
              <div className="companion-profile-card-heading">
                <div>
                  <span>05 · AVAILABILITY</span>
                  <h3>When are you available?</h3>
                </div>
                <div className="card-number">05</div>
              </div>

              <p className="companion-profile-description">
                Set your recurring weekly schedule. Customers will only be
                able to request times that fall inside these hours.
              </p>

              <div className="availability-summary">
                <div>
                  <strong>{activeDays.length}</strong>
                  <span>active days</span>
                </div>
                <div>
                  <strong>{totalWeeklySlots}</strong>
                  <span>time windows</span>
                </div>
                <div>
                  <strong>
                    {getTimezoneLabel(timezone).split(" — ")[0]}
                  </strong>
                  <span>timezone</span>
                </div>
              </div>

              <div className="availability-toolbar">
                <label>
                  <span>Timezone</span>
                  <select
                    value={timezone}
                    onChange={(e) => {
                      setTimezone(e.target.value);
                      setAvailabilitySaved(false);                    }}
                      >
                        {TIMEZONES.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>
    
                    <button
                      type="button"
                      className="availability-copy-btn"
                      onClick={copyMondayToAllDays}
                    >
                      Copy Monday to all days
                    </button>
                  </div>
    
                  {availabilityLoading ? (
                    <div className="availability-loading">
                      Loading your weekly availability...
                    </div>
                  ) : (
                    <div className="weekly-schedule">
                      {DAYS.map((day) => {
                        const currentDay =
                          schedule.find((item) => item.day === day.key) || {
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
                                <span>{day.short}</span>
                                <strong>{day.label}</strong>
                              </div>
    
                              <label className="day-switch">
                                <input
                                  type="checkbox"
                                  checked={Boolean(currentDay.enabled)}
                                  onChange={() => toggleDay(day.key)}
                                />
                                <span className="day-switch-track">
                                  <span />
                                </span>
                              </label>
                            </div>
    
                            {currentDay.enabled ? (
                              <div className="day-slots">
                                {currentDay.slots.map((slot, slotIndex) => (
                                  <div
                                    className="availability-slot"
                                    key={`${day.key}-${slotIndex}`}
                                  >
                                    <div className="availability-time-input">
                                      <input
                                        type="time"
                                        value={slot.start}
                                        onChange={(e) =>
                                          updateTimeSlot(
                                            day.key,
                                            slotIndex,
                                            "start",
                                            e.target.value
                                          )
                                        }
                                      />
                                      <span>to</span>
                                      <input
                                        type="time"
                                        value={slot.end}
                                        onChange={(e) =>
                                          updateTimeSlot(
                                            day.key,
                                            slotIndex,
                                            "end",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
    
                                    <button
                                      type="button"
                                      className="remove-slot-btn"
                                      onClick={() =>
                                        removeTimeSlot(day.key, slotIndex)
                                      }
                                      aria-label="Remove time slot"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
    
                                <button
                                  type="button"
                                  className="add-slot-btn"
                                  onClick={() => addTimeSlot(day.key)}
                                >
                                  + Add another time
                                </button>
                              </div>
                            ) : (
                              <div className="day-unavailable">Not available</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
    
                  <div className="availability-help">
                    <span>i</span>
                    <p>
                      You can add multiple windows in one day. For example, 10
                      AM–2 PM and again from 6 PM–9 PM.
                    </p>
                  </div>
    
                  {availabilityError && (
                    <div className="availability-error">
                      <span>!</span>
                      {availabilityError}
                    </div>
                  )}
    
                  <div className="availability-save-row">
                    {availabilitySaved && (
                      <div className="availability-success">
                        <span>✓</span>
                        Weekly availability saved
                      </div>
                    )}
    
                    <button
                      type="button"
                      className="availability-reset-btn"
                      onClick={resetAvailabilityToDefaults}
                      disabled={availabilitySaving || availabilityLoading}
                    >
                      Reset to default
                    </button>
    
                    <button
                      type="button"
                      className="save-availability-btn"
                      onClick={handleSaveAvailability}
                      disabled={availabilitySaving || availabilityLoading}
                    >
                      {availabilitySaving ? "Saving..." : "Save availability"}
                    </button>
                  </div>
                </section>
    
                {/* SAVE PROFILE */}
                <div className="companion-profile-save-row">
                  {profileError && (
                    <div className="profile-save-error">{profileError}</div>
                  )}
    
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
                    {profileSaving ? "Saving..." : "Save profile"}
                  </button>
                </div>
              </div>
    
              {/* SIDEBAR */}
              <aside className="companion-profile-sidebar">
                {/* PUBLIC PREVIEW */}
                <section className="companion-preview-card">
                  <div className="preview-label">PUBLIC PROFILE</div>
    
                  <div className="preview-image">
                    {profile?.profilePhoto ? (
                      <img
                        src={profile.profilePhoto}
                        alt={profile.displayName || "Companion"}
                        className="preview-profile-image"
                      />
                    ) : (
                      <div className="preview-avatar">{initials}</div>
                    )}
    
                    <span className="preview-online">
                      ● {profile?.available ? "Available" : "Unavailable"}
                    </span>
                  </div>
    
                  <div className="preview-body">
                    <div className="preview-name">
                      <h3>{profile?.displayName || "Your name"}</h3>
                      <span>✓</span>
                    </div>
    
                    <p className="preview-location">
                      {profile?.city || "Your city"} · {profile?.age || "—"}
                    </p>
    
                    <div className="preview-rating">
                      <span>★</span>
                      <strong>4.9</strong>
                      <small> · 24 reviews</small>
                    </div>
    
                    <p className="preview-bio">
                      {profile?.bio || "Your profile bio will appear here."}
                    </p>
    
                    <div className="preview-tags">
                      {selectedInterests.slice(0, 3).map((interest) => (
                        <span key={interest}>{interest}</span>
                      ))}
                    </div>
    
                    <div className="preview-price">
                      <div>
                        <strong>
                          ₹
                          {Number(profile?.hourlyRate || 0).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                        <span>/ hour</span>
                      </div>
                      <span>from</span>
                    </div>
    
                    <Link href="/explore" className="preview-button">
                      View public profile
                      <span>→</span>
                    </Link>
                  </div>
                </section>
    
                {/* AVAILABILITY SIDEBAR */}
                <section className="companion-availability-sidebar-card">
                  <div className="sidebar-card-label">YOUR AVAILABILITY</div>
    
                  <h3>
                    {activeDays.length === 0
                      ? "No days selected"
                      : `${activeDays.length} days available`}
                  </h3>
    
                  <div className="sidebar-day-list">
                    {DAYS.map((day) => {
                      const currentDay = schedule.find(
                        (item) => item.day === day.key
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
                          <span>{day.short}</span>
    
                          <strong>
                            {currentDay?.enabled && currentDay.slots.length
                              ? currentDay.slots
                                  .map(
                                    (slot) =>
                                      `${formatTime(
                                        slot.start
                                      )}–${formatTime(slot.end)}`
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
                        .getElementById("weekly-availability")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    Edit weekly schedule →
                  </Link>
                </section>
    
                {/* CHECKLIST */}
                <section className="companion-checklist-card">
                  <div className="checklist-heading">
                    <span>PROFILE TIPS</span>
                    <strong>{completion}%</strong>
                  </div>
    
                  <div className="checklist-progress">
                    <span style={{ width: `${completion}%` }} />
                  </div>
    
                  <ChecklistItem
                    completed={Boolean(profile?.profilePhoto)}
                    label="Add a profile photo"
                  />
                  <ChecklistItem
                    completed={Boolean(profile?.bio)}
                    label="Write your bio"
                  />
                  <ChecklistItem
                    completed={selectedInterests.length > 0}
                    label="Choose your interests"
                  />
                  <ChecklistItem
                    completed={Number(profile?.hourlyRate) > 0}
                    label="Set your rate"
                  />
                  <ChecklistItem
                    completed={activeDays.length > 0}
                    label="Add availability"
                  />
                </section>
    
                {/* QUICK LINKS */}
                <section className="companion-quick-card">
                  <span>QUICK LINKS</span>
    
                  <Link href="/companion/dashboard">
                    Dashboard
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
    
                {/* LOGOUT */}
                <button
                  type="button"
                  className="profile-logout-btn"
                  onClick={handleLogout}
                >
                  <LogoutIcon />
                  Log out
                </button>
              </aside>
            </div>
          </form>
        </div>
      );
    }
    
    /* =========================================================
       REGULAR USER PROFILE
    ========================================================= */
    
    function RegularUserProfile({
      user,
      form,
      editing,
      saving,
      photoUploading,
      photoError,
      displayName,
      initials,
      setEditing,
      handleChange,
      handleSaveBase,
      handleProfilePhotoChange,
      handleLogout,
      setForm,
    }) {
      const isCompanion = user?.role === "companion";
    
      return (
        <div className="companion-profile-container">
          <div className="companion-profile-orb companion-profile-orb-one" />
          <div className="companion-profile-orb companion-profile-orb-two" />
    
          {/* HEADER */}
          <header className="companion-profile-header">
            <div>
              <span className="companion-profile-eyebrow">
                YOUR ZQAVA ACCOUNT
              </span>
              <h1>My profile</h1>
              <p>Manage your account and personal information.</p>
            </div>
    
            <div className="companion-profile-header-actions">
              <Link href="/bookings" className="companion-profile-secondary-btn">
                My bookings
              </Link>
            </div>
          </header>
    
          {/* PHOTO INPUT */}
          <input
            id="profile-photo-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={handleProfilePhotoChange}
          />
    
          {/* PROFILE HERO */}
          <section className="companion-profile-status">
            <div className="companion-profile-status-left">
              <div
                className="companion-profile-avatar"
                onClick={() =>
                  !photoUploading &&
                  document.getElementById("profile-photo-input")?.click()
                }
              >
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={displayName}
                    className="companion-profile-avatar-image"
                  />
                ) : (
                  <span>{initials}</span>
                )}
    
                <button
                  type="button"
                  className="companion-profile-avatar-edit"
                  aria-label="Change profile photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById("profile-photo-input")?.click();
                  }}
                  disabled={photoUploading}
                >
                  {photoUploading ? "..." : "✎"}
                </button>
              </div>
    
              {photoError && (
                <div className="profile-photo-error">{photoError}</div>
              )}
    
              <div className="companion-profile-status-info">
                <div className="companion-profile-name-row">
                  <h2>{displayName}</h2>
                  {user.emailVerified && (
                    <span className="companion-profile-verified">✓ Verified</span>
                  )}
                </div>
    
                <p>{user.email}</p>
    
                {user.city && (
                  <div className="companion-profile-status-pill">
                    <span className="status-dot active" />
                    {user.city}
                  </div>
                )}
              </div>
            </div>
    
            <div className="companion-profile-status-right">
              <button
                type="button"
                className="companion-profile-secondary-btn"
                onClick={() => setEditing(!editing)}
              >
                {editing ? "Cancel" : "Edit profile"}
              </button>
            </div>
          </section>
    
          {/* MAIN GRID */}
          <div className="companion-profile-layout">
            {/* LEFT — Personal details */}
            <div className="companion-profile-main">
              <section className="companion-profile-card">
                <div className="companion-profile-card-heading">
                  <div>
                    <span>01 · PERSONAL DETAILS</span>
                    <h3>About you</h3>
                  </div>
                  <div className="card-number">01</div>
                </div>
    
                {editing ? (
                  <form onSubmit={handleSaveBase}>
                    <div className="companion-profile-fields">
                      <label>
                        <span>First name</span>
                        <input
                          type="text"
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                          required
                        />
                      </label>
    
                      <label>
                        <span>Last name</span>
                        <input
                          type="text"
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange}
                          required
                        />
                      </label>
    
                      <label>
                        <span>City</span>
                        <input
                          type="text"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          placeholder="Your city"
                        />
                      </label>
    
                      <label>
                        <span>Email</span>
                        <input type="email" value={user.email} disabled />
                        <small>Email cannot be changed here.</small>
                      </label>
    
                      <label className="field-full">
                        <span>About you</span>
                        <textarea
                          name="bio"
                          value={form.bio}
                          onChange={handleChange}
                          rows={5}
                          maxLength={500}
                          placeholder="Tell us a little about yourself..."
                        />
                        <small>{form.bio.length}/500 characters</small>
                      </label>
                    </div>
    
                    <div className="companion-profile-save-row">
                      <button
                        type="button"
                        className="availability-reset-btn"
                        onClick={() => {
                          setEditing(false);
                          setForm({
                            firstName: user.firstName || "",
                            lastName: user.lastName || "",
                            city: user.city || "",
                            bio: user.bio || "",
                          });
                        }}
                      >
                        Cancel
                      </button>
    
                      <button
                        type="submit"
                        className="save-profile-btn"
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save changes"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="companion-profile-fields">
                    <label>
                      <span>First name</span>
                      <input type="text" value={user.firstName || "Not added"} disabled />
                    </label>
    
                    <label>
                      <span>Last name</span>
                      <input type="text" value={user.lastName || "Not added"} disabled />
                    </label>
    
                    <label>
                      <span>Email</span>
                      <input type="email" value={user.email} disabled />
                    </label>
    
                    <label>
                      <span>City</span>
                      <input type="text" value={user.city || "Not added"} disabled />
                    </label>
    
                    <label className="field-full">
                      <span>About you</span>
                      <textarea
                        value={user.bio || "You haven't added a bio yet."}
                        disabled
                        rows={4}
                      />
                    </label>
                  </div>
                )}
              </section>
    
              {/* QUICK LINKS */}
              <section className="companion-profile-card">
                <div className="companion-profile-card-heading">
                  <div>
                    <span>02 · QUICK ACCESS</span>
                    <h3>Manage your ZQAVA</h3>
                  </div>
                  <div className="card-number">02</div>
                </div>
    
                <div className="companion-quick-card" style={{ background: "#ffffff" }}>
                  <Link href="/explore" style={{ color: "#17171d", borderTop: "none" }}>
                    Explore companions
                    <span style={{ color: "#7444ff" }}>→</span>
                  </Link>
                  <Link href="/bookings" style={{ color: "#17171d", borderTop: "1px solid #eeeef2" }}>
                    My bookings
                    <span style={{ color: "#7444ff" }}>→</span>
                  </Link>
                  <Link href="/my-tickets" style={{ color: "#17171d", borderTop: "1px solid #eeeef2" }}>
                    My tickets
                    <span style={{ color: "#7444ff" }}>→</span>
                  </Link>
                  <Link href="/safety" style={{ color: "#17171d", borderTop: "1px solid #eeeef2" }}>
                    Safety center
                    <span style={{ color: "#7444ff" }}>→</span>
                  </Link>
                </div>
              </section>
            </div>
    
            {/* RIGHT — CTA + Logout */}
            <aside className="companion-profile-sidebar">
              {/* BECOME COMPANION CTA */}
              {!isCompanion && (
                <div
                  className="companion-preview-card"
                  style={{
                    background: "linear-gradient(135deg, #7444ff 0%, #6031e8 100%)",
                    border: "none",
                    padding: "28px 24px",
                    color: "white",
                  }}
                >
                  <div
                    style={{
                      fontSize: 32,
                      lineHeight: 1,
                      marginBottom: 14,
                    }}
                  >
                    ✨
                  </div>
    
                  <h3
                    style={{
                      fontFamily: "Manrope, sans-serif",
                      fontSize: 22,
                      fontWeight: 800,
                      letterSpacing: "-0.5px",
                      margin: "0 0 10px",
                      color: "white",
                    }}
                  >
                    Become a companion
                  </h3>
    
                  <p
                    style={{
                      fontSize: 13,
                      lineHeight: 1.6,
                      margin: "0 0 20px",
                      color: "rgba(255, 255, 255, 0.85)",
                    }}
                  >
                    Turn your time into meaningful experiences. Set your own
                    rates, choose your availability, and meet new people on
                    ZQAVA.
                  </p>
    
                  <Link
                    href="/become-a-companion"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      width: "100%",
                      minHeight: 46,
                      borderRadius: 12,
                      background: "white",
                      color: "#7444ff",
                      fontSize: 13,
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    Start application
                    <span>→</span>
                  </Link>
                </div>
              )}
    
              {/* SAFETY CARD */}
              <div className="companion-availability-sidebar-card">
                <div className="sidebar-card-label">SAFETY FIRST</div>
    
                <h3>Keep every experience comfortable.</h3>
    
                <p
                  style={{
                    margin: "10px 0 16px",
                    color: "#68636f",
                    fontSize: 12,
                    lineHeight: 1.6,
                  }}
                >
                  Learn about boundaries, reporting, communication and safer
                  meetups.
                </p>
    
                <Link
                  href="/safety"
                  className="sidebar-availability-link"
                  style={{ marginTop: 0, paddingTop: 0, borderTop: "none" }}
                >
                  Safety center →
                </Link>
              </div>
    
              {/* LOGOUT */}
              <button
                type="button"
                className="profile-logout-btn"
                onClick={handleLogout}
              >
                <LogoutIcon />
                Log out
              </button>
            </aside>
          </div>
        </div>
      );
    }
    
    /* =========================================================
       CHECKLIST ITEM
    ========================================================= */
    
    function ChecklistItem({ completed, label }) {
      return (
        <div
          className={
            completed ? "checklist-item completed" : "checklist-item"
          }
        >
          <span>{completed ? "✓" : ""}</span>
          {label}
        </div>
      );
    }
    
    /* =========================================================
       LOGOUT ICON
    ========================================================= */
    
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