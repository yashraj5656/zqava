"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./Profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    city: "",
    bio: "",
  });

  const [photoUploading, setPhotoUploading] =
  useState(false);

const [photoError, setPhotoError] =
  useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/profile", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = "/login";
            return;
          }

          throw new Error(data.message || "Failed to load profile.");
        }

        setUser(data.user);

        setForm({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          city: data.user.city || "",
          bio: data.user.bio || "",
        });
      } catch (err) {
        console.error("Profile loading error:", err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSave(e) {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
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
      console.error("Profile update error:", err);
      alert(err.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleProfilePhotoChange(event) {
    const file = event.target.files?.[0];
  
    // Allow selecting the same image again later
    event.target.value = "";
  
    if (!file) {
      return;
    }
  
    setPhotoError("");
  
    /*
    |--------------------------------------------------------------------------
    | FILE TYPE
    |--------------------------------------------------------------------------
    */
  
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
  
    /*
    |--------------------------------------------------------------------------
    | FILE SIZE
    |--------------------------------------------------------------------------
    */
  
    const maxSize = 5 * 1024 * 1024;
  
    if (file.size > maxSize) {
      setPhotoError(
        "Profile photo must be smaller than 5 MB."
      );
  
      return;
    }
  
    /*
    |--------------------------------------------------------------------------
    | UPLOAD
    |--------------------------------------------------------------------------
    */
  
    try {
      setPhotoUploading(true);
  
      const formData = new FormData();
  
      formData.append("file", file);
  
      const response = await fetch(
        "/api/profile/photo",
        {
          method: "POST",
          body: formData,
        }
      );
  
      const data =
        await response.json();
  
      /*
      |--------------------------------------------------------------------------
      | AUTH ERROR
      |--------------------------------------------------------------------------
      */
  
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
  
      /*
      |--------------------------------------------------------------------------
      | OTHER ERROR
      |--------------------------------------------------------------------------
      */
  
      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to upload profile photo."
        );
      }
  
      /*
      |--------------------------------------------------------------------------
      | UPDATE USER STATE
      |--------------------------------------------------------------------------
      */
  
      setUser((currentUser) => ({
        ...currentUser,
  
        profilePhoto:
          data.profilePhoto,
      }));
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
  }

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

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">
          <div className="profile-spinner" />
          <p>Loading your profile...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="profile-page">
        <div className="profile-error">
          <h2>Something went wrong</h2>
          <p>{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const firstName = user.firstName || "";
  const lastName = user.lastName || "";

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const displayName =
    `${firstName} ${lastName}`.trim() || "ZQAVA User";

  const companionProfile = user.companionProfile;

  const isCompanion = user.role === "companion";

  const profileCompletion = companionProfile?.profileCompleted || 0;

  return (
    <main className="profile-page">
      {/* Background */}
      <div className="profile-bg-orb profile-bg-orb-one" />
      <div className="profile-bg-orb profile-bg-orb-two" />

      <div className="profile-wrapper">

        {/* TOP BAR */}
        <div className="profile-topbar">
          <div>
            <span className="profile-eyebrow">
              YOUR ZQAVA PROFILE
            </span>

            <h1>My profile.</h1>

            <p>
              Manage your account, personal information and
              companionship profile.
            </p>
          </div>

          <Link
            href="/bookings"
            className="profile-explore-btn"
          >
            My companions
            <ArrowIcon />
          </Link>
        </div>

        {/* PROFILE HERO */}
        <section className="profile-hero">

        <div
  className={`profile-avatar ${
    user.profilePhoto
      ? "profile-avatar-has-image"
      : ""
  }`}
  onClick={() =>
    !photoUploading &&
    document
      .getElementById("profile-photo-input")
      ?.click()
  }
>
  {user.profilePhoto ? (
    <img
      src={user.profilePhoto}
      alt={displayName}
      className="profile-avatar-image"
    />
  ) : (
    <span>{initials}</span>
  )}

  <button
    type="button"
    className="profile-avatar-edit"
    onClick={(event) => {
      event.stopPropagation();

      if (!photoUploading) {
        document
          .getElementById("profile-photo-input")
          ?.click();
      }
    }}
    disabled={photoUploading}
    aria-label="Change profile photo"
  >
    {photoUploading ? "..." : <EditIcon />}
  </button>
</div>

<input
  id="profile-photo-input"
  type="file"
  accept="image/jpeg,image/png,image/webp"
  style={{ display: "none" }}
  onChange={handleProfilePhotoChange}
/>

{photoError && (
  <div className="profile-photo-error">
    {photoError}
  </div>
)}

          <div className="profile-identity">

            <div className="profile-name-row">
              <h2>{displayName}</h2>

              {user.emailVerified && (
                <span className="profile-verified">
                  <CheckIcon />
                  Verified
                </span>
              )}
            </div>

            <p className="profile-email">
              {user.email}
            </p>

            {user.city && (
              <div className="profile-location">
                <LocationIcon />
                {user.city}
              </div>
            )}
          </div>

          <button
            type="button"
            className="profile-edit-btn"
            onClick={() => setEditing(!editing)}
          >
            <EditIcon />
            {editing ? "Cancel" : "Edit profile"}
          </button>
        </section>

        {/* STATS */}
        <div className="profile-stats">

          <div className="profile-stat-card">
            <div className="profile-stat-icon purple">
              <UserIcon />
            </div>

            <div>
              <span>ACCOUNT TYPE</span>
              <strong>
                {isCompanion ? "Companion" : "Member"}
              </strong>
            </div>
          </div>

          <div className="profile-stat-card">
            <div className="profile-stat-icon pink">
              <CalendarIcon />
            </div>

            <div>
              <span>MEMBER SINCE</span>
              <strong>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        year: "numeric",
                      }
                    )
                  : "Recently"}
              </strong>
            </div>
          </div>

          <div className="profile-stat-card">
            <div className="profile-stat-icon dark">
              <ShieldIcon />
            </div>

            <div>
              <span>EMAIL STATUS</span>
              <strong>
                {user.emailVerified ? "Verified" : "Unverified"}
              </strong>
            </div>
          </div>

        </div>

        {/* CONTENT */}
        <div className="profile-content-grid">

          {/* MAIN */}
          <div className="profile-main">

            <section className="profile-section">

              <div className="profile-section-heading">
                <div>
                  <span className="profile-section-label">
                    PERSONAL DETAILS
                  </span>

                  <h3>
                    About you
                  </h3>
                </div>

                {!editing && (
                  <button
                    type="button"
                    className="profile-small-edit"
                    onClick={() => setEditing(true)}
                  >
                    Edit
                  </button>
                )}
              </div>

              {editing ? (
                <form
                  className="profile-form"
                  onSubmit={handleSave}
                >
                  <div className="profile-form-row">

                    <label>
                      First name

                      <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        required
                      />
                    </label>

                    <label>
                      Last name

                      <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        required
                      />
                    </label>

                  </div>

                  <div className="profile-form-row">

                    <label>
                      City

                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Your city"
                      />
                    </label>

                    <label>
                      Email

                      <input
                        type="email"
                        value={user.email}
                        disabled
                      />
                    </label>

                  </div>

                  <label>
                    About you

                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Tell us a little about yourself..."
                    />
                  </label>

                  <div className="profile-form-actions">

                    <button
                      type="button"
                      className="profile-cancel-btn"
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
                      className="profile-save-btn"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save changes"}
                    </button>

                  </div>
                </form>
              ) : (
                <>
                  <div className="profile-info-grid">

                    <div>
                      <span>FIRST NAME</span>
                      <strong>
                        {user.firstName || "Not added"}
                      </strong>
                    </div>

                    <div>
                      <span>LAST NAME</span>
                      <strong>
                        {user.lastName || "Not added"}
                      </strong>
                    </div>

                    <div>
                      <span>EMAIL</span>
                      <strong>
                        {user.email}
                      </strong>
                    </div>

                    <div>
                      <span>CITY</span>
                      <strong>
                        {user.city || "Not added"}
                      </strong>
                    </div>

                  </div>

                  <div className="profile-bio">
                    <span>ABOUT</span>

                    <p>
                      {user.bio ||
                        "You haven't added a bio yet."}
                    </p>
                  </div>
                </>
              )}

            </section>

            {/* QUICK LINKS */}
            <section className="profile-section">

              <div className="profile-section-heading">
                <div>
                  <span className="profile-section-label">
                    QUICK ACCESS
                  </span>

                  <h3>
                    Manage your ZQAVA
                  </h3>
                </div>
              </div>

              <div className="profile-links">

                <Link
                  href="/explore"
                  className="profile-link-card"
                >
                  <div className="profile-link-icon">
                    <SearchIcon />
                  </div>

                  <div>
                    <strong>Explore companions</strong>
                    <span>
                      Discover people and experiences.
                    </span>
                  </div>

                  <ArrowIcon />
                </Link>

                <Link
                  href="/bookings"
                  className="profile-link-card"
                >
                  <div className="profile-link-icon">
                    <CalendarIcon />
                  </div>

                  <div>
                    <strong>My bookings</strong>
                    <span>
                      View upcoming and past bookings.
                    </span>
                  </div>

                  <ArrowIcon />
                </Link>

                <Link
                  href="/safety"
                  className="profile-link-card"
                >
                  <div className="profile-link-icon">
                    <ShieldIcon />
                  </div>

                  <div>
                    <strong>Safety center</strong>
                    <span>
                      Learn how ZQAVA keeps bookings safer.
                    </span>
                  </div>

                  <ArrowIcon />
                </Link>

              </div>

            </section>

          </div>

          {/* SIDEBAR */}
          <aside className="profile-sidebar">

            {/* COMPLETION */}
            <div className="profile-completion-card">

              <div className="profile-completion-top">

                <div>
                  <span>PROFILE COMPLETION</span>

                  <strong>
                    {isCompanion
                      ? `${profileCompletion}%`
                      : "Basic"}
                  </strong>
                </div>

                <div className="profile-progress-circle">

                  <svg
                    viewBox="0 0 36 36"
                    aria-hidden="true"
                  >
                    <circle
                      className="progress-background"
                      cx="18"
                      cy="18"
                      r="15.5"
                    />

                    <circle
                      className="progress-value"
                      cx="18"
                      cy="18"
                      r="15.5"
                      pathLength="100"
                      style={{
                        strokeDasharray: `${profileCompletion} 100`,
                      }}
                    />
                  </svg>

                  <span>
                    {isCompanion
                      ? `${profileCompletion}%`
                      : "—"}
                  </span>

                </div>

              </div>

              <p>
                {isCompanion
                  ? "Complete your companion profile to give people more information about you."
                  : "Complete your basic profile information to personalize your ZQAVA experience."}
              </p>

              <div className="profile-checklist">

                <div
                  className={`profile-check ${
                    user.firstName && user.lastName
                      ? "done"
                      : ""
                  }`}
                >
                  <span>
                    {user.firstName && user.lastName
                      ? "✓"
                      : ""}
                  </span>

                  Personal information
                </div>

                <div
                  className={`profile-check ${
                    user.city ? "done" : ""
                  }`}
                >
                  <span>
                    {user.city ? "✓" : ""}
                  </span>

                  Add your city
                </div>

                <div
                  className={`profile-check ${
                    user.bio ? "done" : ""
                  }`}
                >
                  <span>
                    {user.bio ? "✓" : ""}
                  </span>

                  Add a short bio
                </div>

                {isCompanion && (
                  <div
                    className={`profile-check ${
                      profileCompletion >= 100
                        ? "done"
                        : ""
                    }`}
                  >
                    <span>
                      {profileCompletion >= 100
                        ? "✓"
                        : ""}
                    </span>

                    Complete companion profile
                  </div>
                )}

              </div>

            </div>

            {/* SAFETY */}
            <div className="profile-safety-card">

              <div className="profile-safety-icon">
                <ShieldIcon />
              </div>

              <div>
                <span>SAFETY FIRST</span>

                <h3>
                  Keep every experience comfortable.
                </h3>

                <p>
                  Learn about boundaries, reporting,
                  communication and safer meetups.
                </p>

                <Link href="/safety">
                  Safety center
                  <ArrowIcon />
                </Link>
              </div>

            </div>

            {/* COMPANION CTA */}
            {!isCompanion && (
              <div className="profile-companion-card">

                <span>WANT TO EARN?</span>

                <h3>
                  Become a ZQAVA companion.
                </h3>

                <p>
                  Create a companion profile, choose your
                  availability and start accepting bookings.
                </p>

                <Link href="/become-a-companion">
                  Become a companion
                  <ArrowIcon />
                </Link>

              </div>
            )}

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
    </main>
  );
}

/* =========================================================
   ICONS
   ========================================================= */

function ArrowIcon() {
  return (
    <svg
      className="profile-icon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12H19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M13.5 6.5L19 12L13.5 17.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="profile-icon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12.5L9.2 16.5L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      className="profile-icon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 20H8L19 9C20.1 7.9 20.1 6.1 19 5C17.9 3.9 16.1 3.9 15 5L4 16V20Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 6.5L17.5 10.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      className="profile-icon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="3.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M5 20C5.8 16.7 8.1 15 12 15C15.9 15 18.2 16.7 19 20"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      className="profile-icon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="5"
        width="17"
        height="16"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M7 3.5V7M17 3.5V7M3.5 9.5H20.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      className="profile-icon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3L19 6V11.5C19 16.2 16.1 19.3 12 21C7.9 19.3 5 16.2 5 11.5V6L12 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M8.8 12L11 14.2L15.5 9.7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="profile-icon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="10.8"
        cy="10.8"
        r="6.3"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M15.5 15.5L20 20"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      className="profile-icon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 21C12 21 19 14.7 19 9.5C19 5.91 15.87 3 12 3C8.13 3 5 5.91 5 9.5C5 14.7 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <circle
        cx="12"
        cy="9.5"
        r="2.3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
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