"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import "./apply.css";

const steps = [
  {
    number: 1,
    label: "About you",
  },
  {
    number: 2,
    label: "Your profile",
  },
  {
    number: 3,
    label: "Availability",
  },
  {
    number: 4,
    label: "Review",
  },
];

const initialForm = {
  fullName: "",
  displayName: "",
  email: "",
  phone: "",
  city: "",
  ageConfirmed: false,

  bio: "",
  companionship: [],
  interests: "",
  photo: null,

  availability: [],
  rate: "",

  guidelines: false,
  safety: false,
  accurate: false,
};

const companionshipOptions = [
  "Conversation",
  "Coffee & Dining",
  "City Activities",
  "Events",
  "Travel Companion",
  "Movies & Entertainment",
];

const availabilityOptions = [
  "Weekday mornings",
  "Weekday afternoons",
  "Weekday evenings",
  "Weekend mornings",
  "Weekend afternoons",
  "Weekend evenings",
];

export default function Apply() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [photoPreview, setPhotoPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fileInputRef = useRef(null);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const toggleArrayValue = (field, value) => {
    setForm((prev) => {
      const exists = prev[field].includes(value);

      return {
        ...prev,
        [field]: exists
          ? prev[field].filter((item) => item !== value)
          : [...prev[field], value],
      };
    });

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        photo: "Please choose an image file.",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        photo: "Please choose an image smaller than 5MB.",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      photo: file,
    }));

    setPhotoPreview(URL.createObjectURL(file));

    setErrors((prev) => ({
      ...prev,
      photo: "",
    }));
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!form.fullName.trim()) {
        newErrors.fullName = "Please enter your full name.";
      }

      if (!form.displayName.trim()) {
        newErrors.displayName = "Please choose a display name.";
      }

      if (!form.email.trim()) {
        newErrors.email = "Please enter your email address.";
      } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
        newErrors.email = "Please enter a valid email address.";
      }

      if (!form.phone.trim()) {
        newErrors.phone = "Please enter your phone number.";
      }

      if (!form.city.trim()) {
        newErrors.city = "Please enter your city.";
      }

      if (!form.ageConfirmed) {
        newErrors.ageConfirmed = "You must be 18 or older to apply.";
      }
    }

    if (step === 2) {
      if (!form.bio.trim()) {
        newErrors.bio = "Tell us a little about yourself.";
      } else if (form.bio.trim().length < 80) {
        newErrors.bio = "Please write at least 80 characters.";
      }

      if (form.companionship.length === 0) {
        newErrors.companionship =
          "Choose at least one type of companionship.";
      }

      if (!form.interests.trim()) {
        newErrors.interests = "Add a few interests or activities.";
      }

      if (!form.photo) {
        newErrors.photo = "Please upload a profile photo.";
      }
    }

    if (step === 3) {
      if (form.availability.length === 0) {
        newErrors.availability = "Choose at least one availability option.";
      }

      if (!form.rate) {
        newErrors.rate = "Please enter your starting hourly rate.";
      } else if (Number(form.rate) < 100) {
        newErrors.rate = "Please enter a rate of at least ₹100.";
      }
    }

    if (step === 4) {
      if (!form.guidelines) {
        newErrors.guidelines =
          "Please agree to the ZQAVA Community Guidelines.";
      }

      if (!form.safety) {
        newErrors.safety =
          "Please confirm that you understand ZQAVA's safety standards.";
      }

      if (!form.accurate) {
        newErrors.accurate =
          "Please confirm that the information provided is accurate.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep()) return;

    setStep((prev) => Math.min(prev + 1, 4));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const previousStep = () => {
    setErrors({});
    setStep((prev) => Math.max(prev - 1, 1));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!validateStep()) return;
  
    setSubmitting(true);
    setSubmitError("");
  
    try {
      const formData = new FormData();
  
      formData.append("fullName", form.fullName);
      formData.append("displayName", form.displayName);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("city", form.city);
  
      formData.append("bio", form.bio);
  
      formData.append(
        "companionship",
        JSON.stringify(form.companionship)
      );
  
      formData.append(
        "availability",
        JSON.stringify(form.availability)
      );
  
      formData.append("interests", form.interests);
      formData.append("rate", form.rate);
  
      if (form.photo) {
        formData.append("photo", form.photo);
      }
  
      const response = await fetch("/api/companions/apply", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(
          data.message || "Failed to submit application."
        );
      }
  
      setSubmitted(true);
  
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Application submission error:", error);
  
      setSubmitError(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="apply-page">
        <section className="apply-success">
          <div className="success-glow success-glow-one" />
          <div className="success-glow success-glow-two" />

          <div className="success-icon">
            <svg
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
          </div>

          <span className="apply-eyebrow">APPLICATION RECEIVED</span>

          <h1>
            You&apos;re one step
            <span> closer.</span>
          </h1>

          <p>
            Thanks for applying to become a ZQAVA companion. Our team will
            review your application and contact you using the details you
            provided.
          </p>

          <div className="success-card">
            <div>
              <span>APPLICANT</span>
              <strong>{form.displayName || form.fullName}</strong>
            </div>

            <div>
              <span>LOCATION</span>
              <strong>{form.city}</strong>
            </div>

            <div>
              <span>STATUS</span>
              <strong className="status-pending">Under review</strong>
            </div>
          </div>

          <div className="success-actions">
            <Link href="/explore" className="apply-btn apply-btn-primary">
              Back to ZQAVA
            </Link>

            <Link href="/companion-profile" className="apply-btn apply-btn-secondary">
              Profile
            </Link>
          </div>

          <p className="success-note">
            Verification and payment setup, if required, will happen through
            secure onboarding after your application is reviewed.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="apply-page">
      <div className="apply-shell">


        <section className="apply-hero">
          <div className="apply-hero-copy">
            <span className="apply-eyebrow">BECOME A COMPANION</span>

            <h1>
              Your time.
              <br />
              <span>Your terms.</span>
            </h1>

            <p>
              Create a profile, choose how you want to spend your time, and
              connect with people looking for genuine companionship.
            </p>
          </div>

          <div className="apply-hero-card">
            <div className="mini-avatar">
              <span>+</span>
            </div>

            <div>
              <span className="mini-label">YOUR ZQAVA PROFILE</span>
              <strong>Start with your story.</strong>
            </div>

            <div className="mini-progress">
              <span />
            </div>
          </div>
        </section>

        <section className="application-area">
          <div className="stepper" aria-label="Application progress">
            {steps.map((item, index) => {
              const active = step === item.number;
              const completed = step > item.number;

              return (
                <div className="step-wrapper" key={item.number}>
                  <div
                    className={`step ${
                      active ? "is-active" : ""
                    } ${completed ? "is-complete" : ""}`}
                  >
                    <div className="step-number">
                      {completed ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M5 12.5L9.2 16.5L19 7"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        item.number
                      )}
                    </div>

                    <span>{item.label}</span>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`step-line ${
                        step > item.number ? "is-complete" : ""
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <form className="application-form" onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="form-step">
                <div className="form-heading">
                  <span>01 / ABOUT YOU</span>
                  <h2>Let&apos;s start with you.</h2>
                  <p>
                    These details help us understand who you are and how
                    people can connect with you.
                  </p>
                </div>

                <div className="form-grid">
                  <Field
                    label="Full name"
                    required
                    value={form.fullName}
                    onChange={(e) =>
                      updateField("fullName", e.target.value)
                    }
                    error={errors.fullName}
                    placeholder="Your legal name"
                  />

                  <Field
                    label="Display name"
                    required
                    value={form.displayName}
                    onChange={(e) =>
                      updateField("displayName", e.target.value)
                    }
                    error={errors.displayName}
                    placeholder="What should people call you?"
                  />

                  <Field
                    label="Email address"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      updateField("email", e.target.value)
                    }
                    error={errors.email}
                    placeholder="you@example.com"
                  />

                  <Field
                    label="Phone number"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) =>
                      updateField("phone", e.target.value)
                    }
                    error={errors.phone}
                    placeholder="+91 98765 43210"
                  />

                  <Field
                    label="City"
                    required
                    value={form.city}
                    onChange={(e) =>
                      updateField("city", e.target.value)
                    }
                    error={errors.city}
                    placeholder="Where are you based?"
                  />
                </div>

                <label
                  className={`check-row ${
                    errors.ageConfirmed ? "has-error" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.ageConfirmed}
                    onChange={(e) =>
                      updateField("ageConfirmed", e.target.checked)
                    }
                  />

                  <span className="custom-check">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M5 12.5L9.2 16.5L19 7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>

                  <span>
                    I confirm that I am <strong>18 years or older.</strong>
                  </span>
                </label>

                {errors.ageConfirmed && (
                  <ErrorMessage message={errors.ageConfirmed} />
                )}
              </div>
            )}

            {step === 2 && (
              <div className="form-step">
                <div className="form-heading">
                  <span>02 / YOUR PROFILE</span>
                  <h2>Show people who you are.</h2>
                  <p>
                    Your profile is your introduction. Keep it authentic,
                    friendly, and specific.
                  </p>
                </div>

                <div className="photo-section">
                  <div
                    className={`photo-upload ${
                      errors.photo ? "has-error" : ""
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Selected profile preview"
                      />
                    ) : (
                      <>
                        <div className="upload-icon">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M12 16V4M12 4L7.5 8.5M12 4L16.5 8.5"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M5 14.5V18.5C5 19.3284 5.67157 20 6.5 20H17.5C18.3284 20 19 19.3284 19 18.5V14.5"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>

                        <strong>Upload profile photo</strong>
                        <span>JPG, PNG or WEBP · Max 5MB</span>
                      </>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handlePhoto}
                    hidden
                  />

                  <div className="photo-copy">
                    <span>PROFILE PHOTO</span>
                    <h3>Make a great first impression.</h3>
                    <p>
                      Choose a clear, recent photo where your face is
                      visible. Avoid group photos, logos, or heavily edited
                      images.
                    </p>

                    {photoPreview && (
                      <button
                        type="button"
                        className="remove-photo"
                        onClick={() => {
                          setPhotoPreview("");
                          updateField("photo", null);

                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>

                {errors.photo && <ErrorMessage message={errors.photo} />}

                <div className="textarea-field">
                  <label htmlFor="bio">
                    Short bio <span>*</span>
                  </label>

                  <textarea
                    id="bio"
                    value={form.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    placeholder="Tell people about your personality, what you enjoy, and what makes spending time with you special..."
                    rows={6}
                    maxLength={600}
                    className={errors.bio ? "has-error" : ""}
                  />

                  <div className="textarea-meta">
                    <span>Keep it genuine and conversational.</span>
                    <span>{form.bio.length}/600</span>
                  </div>

                  {errors.bio && (
                    <ErrorMessage message={errors.bio} />
                  )}
                </div>

                <div className="option-section">
                  <div className="option-heading">
                    <label>
                      What kind of companionship do you enjoy?{" "}
                      <span>*</span>
                    </label>
                    <small>Select all that apply.</small>
                  </div>

                  <div className="option-grid">
                    {companionshipOptions.map((option) => (
                      <button
                        type="button"
                        key={option}
                        className={`option-chip ${
                          form.companionship.includes(option)
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          toggleArrayValue("companionship", option)
                        }
                      >
                        <span>
                          {form.companionship.includes(option) ? "✓" : "+"}
                        </span>
                        {option}
                      </button>
                    ))}
                  </div>

                  {errors.companionship && (
                    <ErrorMessage message={errors.companionship} />
                  )}
                </div>

                <Field
                  label="Interests & activities"
                  required
                  value={form.interests}
                  onChange={(e) =>
                    updateField("interests", e.target.value)
                  }
                  error={errors.interests}
                  placeholder="Coffee, photography, fitness, books, live music..."
                  fullWidth
                />
              </div>
            )}

            {step === 3 && (
              <div className="form-step">
                <div className="form-heading">
                  <span>03 / AVAILABILITY</span>
                  <h2>Set your boundaries.</h2>
                  <p>
                    Choose when you&apos;re generally available and the
                    starting rate you&apos;d like to offer.
                  </p>
                </div>

                <div className="option-section availability-section">
                  <div className="option-heading">
                    <label>
                      When are you usually available? <span>*</span>
                    </label>
                    <small>Select all that apply.</small>
                  </div>

                  <div className="availability-list">
                    {availabilityOptions.map((option) => (
                      <button
                        type="button"
                        key={option}
                        className={`availability-option ${
                          form.availability.includes(option)
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          toggleArrayValue("availability", option)
                        }
                      >
                        <span className="availability-check">
                          {form.availability.includes(option) ? "✓" : ""}
                        </span>

                        <span>{option}</span>

                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M9 18L15 12L9 6"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    ))}
                  </div>

                  {errors.availability && (
                    <ErrorMessage message={errors.availability} />
                  )}
                </div>

                <div className="rate-card">
                  <div className="rate-card-copy">
                    <span>STARTING HOURLY RATE</span>
                    <h3>What would you like to charge?</h3>
                    <p>
                      You can adjust your pricing and availability later
                      from your companion dashboard.
                    </p>
                  </div>

                  <div
                    className={`rate-input ${
                      errors.rate ? "has-error" : ""
                    }`}
                  >
                    <span>₹</span>

                    <input
                      type="number"
                      min="100"
                      step="50"
                      value={form.rate}
                      onChange={(e) =>
                        updateField("rate", e.target.value)
                      }
                      placeholder="1,000"
                      aria-label="Starting hourly rate"
                    />

                    <small>/ hour</small>
                  </div>
                </div>

                {errors.rate && <ErrorMessage message={errors.rate} />}

                <div className="info-notice">
                  <div className="notice-icon">i</div>

                  <div>
                    <strong>Your rate is your starting point.</strong>
                    <p>
                      Actual earnings can vary based on bookings, duration,
                      availability, platform fees, refunds, and other
                      adjustments. ZQAVA does not guarantee income.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="form-step">
                <div className="form-heading">
                  <span>04 / REVIEW</span>
                  <h2>Almost there.</h2>
                  <p>
                    Review your information and confirm the standards you
                    agree to follow as a ZQAVA companion.
                  </p>
                </div>

                <div className="review-grid">
                  <ReviewCard
                    title="About you"
                    number="01"
                    onEdit={() => setStep(1)}
                  >
                    <ReviewItem
                      label="Name"
                      value={form.fullName}
                    />
                    <ReviewItem
                      label="Display name"
                      value={form.displayName}
                    />
                    <ReviewItem
                      label="Email"
                      value={form.email}
                    />
                    <ReviewItem
                      label="City"
                      value={form.city}
                    />
                  </ReviewCard>

                  <ReviewCard
                    title="Profile"
                    number="02"
                    onEdit={() => setStep(2)}
                  >
                    <ReviewItem
                      label="Companionship"
                      value={form.companionship.join(", ")}
                    />
                    <ReviewItem
                      label="Interests"
                      value={form.interests}
                    />
                  </ReviewCard>

                  <ReviewCard
                    title="Availability"
                    number="03"
                    onEdit={() => setStep(3)}
                  >
                    <ReviewItem
                      label="Availability"
                      value={form.availability.join(", ")}
                    />
                    <ReviewItem
                      label="Starting rate"
                      value={`₹${Number(form.rate).toLocaleString(
                        "en-IN"
                      )} / hour`}
                    />
                  </ReviewCard>
                </div>

                <div className="agreement-box">
                  <div className="agreement-heading">
                    <span>BEFORE YOU SUBMIT</span>
                    <h3>A few important confirmations.</h3>
                  </div>

                  <label
                    className={`check-row ${
                      errors.guidelines ? "has-error" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.guidelines}
                      onChange={(e) =>
                        updateField("guidelines", e.target.checked)
                      }
                    />

                    <span className="custom-check">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M5 12.5L9.2 16.5L19 7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>

                    <span>
                      I agree to follow the{" "}
                      <Link href="/guidelines">
                        ZQAVA Community Guidelines
                      </Link>
                      .
                    </span>
                  </label>

                  {errors.guidelines && (
                    <ErrorMessage message={errors.guidelines} />
                  )}

                  <label
                    className={`check-row ${
                      errors.safety ? "has-error" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.safety}
                      onChange={(e) =>
                        updateField("safety", e.target.checked)
                      }
                    />

                    <span className="custom-check">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M5 12.5L9.2 16.5L19 7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>

                    <span>
                      I understand and agree to follow ZQAVA&apos;s{" "}
                      <Link href="/safety">safety standards</Link>.
                    </span>
                  </label>

                  {errors.safety && (
                    <ErrorMessage message={errors.safety} />
                  )}

                  <label
                    className={`check-row ${
                      errors.accurate ? "has-error" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.accurate}
                      onChange={(e) =>
                        updateField("accurate", e.target.checked)
                      }
                    />

                    <span className="custom-check">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M5 12.5L9.2 16.5L19 7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>

                    <span>
                      I confirm that the information in my application is
                      accurate and belongs to me.
                    </span>
                  </label>

                  {errors.accurate && (
                    <ErrorMessage message={errors.accurate} />
                  )}
                </div>

                <div className="privacy-note">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 3L19 6V11.5C19 16.1 16.1 19.1 12 21C7.9 19.1 5 16.1 5 11.5V6L12 3Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.5 12L11.2 13.7L15 9.8"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <p>
                    We only ask for the information needed to review your
                    application. Additional verification, if required, will
                    be handled separately through secure onboarding.
                  </p>
                </div>
              </div>
            )}

            <div className="form-actions">
              {step > 1 ? (
                <button
                  type="button"
                  className="apply-btn apply-btn-back"
                  onClick={previousStep}
                >
                  <span>←</span>
                  Back
                </button>
              ) : (
                <Link
                  href="/become-a-companion"
                  className="apply-btn apply-btn-back"
                >
                  <span>←</span>
                  Exit
                </Link>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  className="apply-btn apply-btn-primary"
                  onClick={nextStep}
                >
                  Continue
                  <span>→</span>
                </button>
              ) : (
<button
  type="submit"
  className="apply-btn apply-btn-primary submit-btn"
  disabled={submitting}
>
  {submitting ? "Submitting..." : "Submit application"}

  {!submitting && <span>→</span>}
</button>
              )}
            </div>
          </form>
        </section>

 
      </div>
    </main>
  );
}

function Field({
  label,
  required,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  fullWidth = false,
}) {
  return (
    <div className={`field ${fullWidth ? "field-full" : ""}`}>
      <label>
        {label} {required && <span>*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={error ? "has-error" : ""}
      />

      {error && <ErrorMessage message={error} />}
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <span className="field-error" role="alert">
      {message}
    </span>
  );
}

function ReviewCard({ title, number, onEdit, children }) {
  return (
    <div className="review-card">
      <div className="review-card-header">
        <div>
          <span>{number}</span>
          <h3>{title}</h3>
        </div>

        <button type="button" onClick={onEdit}>
          Edit
        </button>
      </div>

      <div className="review-content">{children}</div>
    </div>
  );
}

function ReviewItem({ label, value }) {
  return (
    <div className="review-item">
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}