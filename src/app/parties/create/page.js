"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./create-party.css";

const CATEGORIES = [
  "House Party",
  "Rooftop",
  "Club",
  "Bonfire",
  "Pool Party",
  "Dinner",
  "Games Night",
  "Other",
];

const MAX_COVER_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function CreatePartyPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "House Party",
    city: "",
    venue: "",
    coverImage: "",
    date: "",
    startTime: "",
    endTime: "",
    ticketPrice: 0,
    totalTickets: 20,
    maxGuestsPerBooking: 4,
    ageLimit: 18,
    tags: "",
  });

  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverError, setCoverError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  /* =====================================================
     COVER UPLOAD
  ===================================================== */
  async function handleCoverSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setCoverError("Only JPG, PNG, and WebP images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_COVER_BYTES) {
      setCoverError("Cover image must be smaller than 5 MB.");
      e.target.value = "";
      return;
    }

    setUploadingCover(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/parties/upload-cover", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (res.status === 401) {
        const redirectTo = encodeURIComponent("/parties/create");
        window.location.href = `/signup?redirect=${redirectTo}`;
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not upload image.");
      }

      update("coverImage", data.coverImage);
    } catch (err) {
      setCoverError(err.message || "Cover upload failed.");
    } finally {
      setUploadingCover(false);
      // allow re-selecting the same file
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeCover() {
    update("coverImage", "");
    setCoverError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  /* =====================================================
     SUBMIT
  ===================================================== */
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (uploadingCover) {
      setError("Please wait for the cover image to finish uploading.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...form,
        ticketPrice: Number(form.ticketPrice),
        totalTickets: Number(form.totalTickets),
        maxGuestsPerBooking: Number(form.maxGuestsPerBooking),
        ageLimit: Number(form.ageLimit),
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const res = await fetch("/api/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not create party.");
      }

      router.push(`/parties/${data.party._id}`);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="create-party-page">
      <div className="create-party-container">
        <div className="create-party-head">
          <Link href="/parties" className="create-party-back">
            ← Back to parties
          </Link>

          <h1>Host a party</h1>
          <p>
            Fill in the details, set your ticket price, and go live in minutes.
          </p>
        </div>

        <form className="create-party-form" onSubmit={handleSubmit}>
          {/* BASICS */}
          <section className="create-party-section">
            <h2>The basics</h2>

            <div className="field">
              <label>Party title</label>
              <input
                required
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Rooftop sunset session"
                maxLength={120}
              />
            </div>

            <div className="field">
              <label>Description</label>
              <textarea
                required
                rows={5}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="What's the vibe? Music, drinks, who's coming?"
                maxLength={2000}
              />
            </div>

            <div className="field">
              <label>Category</label>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* COVER IMAGE */}
            <div className="field">
              <label>Cover image</label>

              {!form.coverImage ? (
                <div className="cover-upload">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_TYPES.join(",")}
                    onChange={handleCoverSelect}
                    disabled={uploadingCover}
                    style={{ display: "none" }}
                    id="cover-image-input"
                  />

                  <label
                    htmlFor="cover-image-input"
                    className={`cover-upload-dropzone ${
                      uploadingCover ? "uploading" : ""
                    }`}
                  >
                    {uploadingCover ? (
                      <>
                        <div className="cover-upload-spinner" />
                        <strong>Uploading image...</strong>
                        <span>Please wait a moment</span>
                      </>
                    ) : (
                      <>
                        <div className="cover-upload-icon">🖼️</div>
                        <strong>Click to upload a cover image</strong>
                        <span>JPG, PNG or WebP · Max 5 MB</span>
                      </>
                    )}
                  </label>
                </div>
              ) : (
                <div className="cover-preview">
                  <img src={form.coverImage} alt="Cover preview" />

                  <div className="cover-preview-actions">
                    <button
                      type="button"
                      className="cover-preview-btn"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingCover}
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      className="cover-preview-btn danger"
                      onClick={removeCover}
                      disabled={uploadingCover}
                    >
                      Remove
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_TYPES.join(",")}
                    onChange={handleCoverSelect}
                    style={{ display: "none" }}
                  />
                </div>
              )}

              {coverError && (
                <div className="cover-upload-error">{coverError}</div>
              )}
            </div>
          </section>

          {/* LOCATION & TIME */}
          <section className="create-party-section">
            <h2>Where & when</h2>

            <div className="field-row">
              <div className="field">
                <label>City</label>
                <input
                  required
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="Jaipur"
                />
              </div>

              <div className="field">
                <label>Venue</label>
                <input
                  required
                  value={form.venue}
                  onChange={(e) => update("venue", e.target.value)}
                  placeholder="The Terrace, C-Scheme"
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Date</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => update("date", e.target.value)}
                />
              </div>

              <div className="field">
                <label>Start time</label>
                <input
                  type="time"
                  required
                  value={form.startTime}
                  onChange={(e) => update("startTime", e.target.value)}
                />
              </div>

              <div className="field">
                <label>End time</label>
                <input
                  type="time"
                  required
                  value={form.endTime}
                  onChange={(e) => update("endTime", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* TICKETS */}
          <section className="create-party-section">
            <h2>Tickets</h2>

            <div className="field-row">
              <div className="field">
                <label>Price per ticket (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={form.ticketPrice}
                  onChange={(e) => update("ticketPrice", e.target.value)}
                />
                <small>Set 0 for a free party.</small>
              </div>

              <div className="field">
                <label>Total tickets</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.totalTickets}
                  onChange={(e) => update("totalTickets", e.target.value)}
                />
              </div>

              <div className="field">
                <label>Max tickets per booking</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={form.maxGuestsPerBooking}
                  onChange={(e) =>
                    update("maxGuestsPerBooking", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Age limit</label>
                <input
                  type="number"
                  min="0"
                  value={form.ageLimit}
                  onChange={(e) => update("ageLimit", e.target.value)}
                />
              </div>

              <div className="field">
                <label>Tags (comma separated)</label>
                <input
                  value={form.tags}
                  onChange={(e) => update("tags", e.target.value)}
                  placeholder="Music, Drinks, Rooftop"
                />
              </div>
            </div>
          </section>

          {error && <div className="create-party-error">{error}</div>}

          <button
            type="submit"
            className="create-party-submit"
            disabled={submitting || uploadingCover}
          >
            {uploadingCover
              ? "Uploading cover..."
              : submitting
              ? "Publishing..."
              : "Publish party"}
          </button>
        </form>
      </div>
    </main>
  );
}