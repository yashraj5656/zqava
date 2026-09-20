"use client";

import { useRouter } from "next/navigation";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./become-a-companion.css";

const benefits = [
  {
    icon: "💰",
    title: "Set your own rates",
    text: "Choose what you charge and how long people can book you.",
  },
  {
    icon: "🗓️",
    title: "Choose your availability",
    text: "Decide when you're available and manage your schedule.",
  },
  {
    icon: "🛡️",
    title: "Verified profile",
    text: "Build trust with a verified profile and transparent reviews.",
  },
  {
    icon: "✨",
    title: "Meet new people",
    text: "Connect with people looking for genuine experiences and good company.",
  },
];

const experiences = [
  "Coffee & conversation",
  "City exploration",
  "Movies",
  "Food experiences",
  "Gaming",
  "Photography",
  "Events",
  "Shopping",
  "Travel experiences",
  "Sports & activities",
];

const steps = [
  {
    number: "01",
    title: "Create your profile",
    text: "Tell people who you are, what you enjoy, and what kind of experiences you offer.",
  },
  {
    number: "02",
    title: "Get verified",
    text: "Complete our verification process so people can book with greater confidence.",
  },
  {
    number: "03",
    title: "Set your availability",
    text: "Choose your rates, available dates, locations, and the experiences you offer.",
  },
  {
    number: "04",
    title: "Start accepting bookings",
    text: "Receive booking requests and meet people for experiences you both agree to.",
  },
];

export default function BecomeACompanion() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    city: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.city) {
      return;
    }

    setSubmitted(true);
  };


  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me");
  
        if (!response.ok) {
          router.replace(
            `/signup?redirect=${encodeURIComponent(
              window.location.pathname + window.location.search
            )}`
          );
          return;
        }
  
        setCheckingAuth(false);
      } catch {
        router.replace("/signup");
      }
    }
  
    checkAuth();
  }, [router]);


  if (checkingAuth) {
    return (
      <main className="explore-page">
        <div className="explore-loading">
          Checking login...
        </div>
      </main>
    );
  }






  return (
    <main className="become-page">



      {/* =========================
          HERO
      ========================== */}

      <section className="become-hero">

        <div className="become-hero-content">

          <div className="hero-eyebrow">
            <span className="eyebrow-dot"></span>
            Become a ZQAVA Companion
          </div>

          <h1>
            Turn your time into
            <span> meaningful experiences.</span>
          </h1>

          <p>
            Meet interesting people, share experiences, and earn
            by offering your time, company, skills, and personality
            on your own terms.
          </p>

          <div className="hero-buttons">
            <a href="#apply" className="primary-cta">
              Apply to become a companion
              <span>→</span>
            </a>

            <a href="#how-it-works" className="secondary-cta">
              See how it works
            </a>
          </div>

          <div className="hero-trust">

            <div className="trust-item">
              <span>✓</span>
              Verified profiles
            </div>

            <div className="trust-item">
              <span>✓</span>
              Flexible schedule
            </div>

            <div className="trust-item">
              <span>✓</span>
              You set your rates
            </div>

          </div>

        </div>


        {/* Hero visual */}

        <div className="become-hero-visual">

          <div className="hero-image-card">
            <img
              src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=85"
              alt="ZQAVA companion"
            />

            <div className="floating-profile">

              <div className="floating-avatar">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
                  alt=""
                />
              </div>

              <div>
                <strong>Riya, 24</strong>

                <span>
                  <span className="green-dot"></span>
                  Available
                </span>
              </div>

              <div className="floating-rating">
                ★ 4.9
              </div>

            </div>

          </div>

          <div className="earnings-card">

            <div className="earnings-icon">
              ₹
            </div>

            <div>
              <span>Example earnings</span>
              <strong>₹2,400</strong>
              <small>4 hours of bookings</small>
            </div>

          </div>

        </div>

      </section>


      {/* =========================
          BENEFITS
      ========================== */}

      <section className="become-benefits">

        <div className="section-heading centered">

          <span className="section-label">
            WHY ZQAVA
          </span>

          <h2>
            Your time. Your rules.
          </h2>

          <p>
            ZQAVA gives companions the tools to build their
            own experience-based profile and manage bookings.
          </p>

        </div>

        <div className="benefits-grid">

          {benefits.map((benefit) => (
            <div className="benefit-card" key={benefit.title}>

              <div className="benefit-icon">
                {benefit.icon}
              </div>

              <h3>{benefit.title}</h3>

              <p>{benefit.text}</p>

            </div>
          ))}

        </div>

      </section>


      {/* =========================
          EXPERIENCE TYPES
      ========================== */}

      <section className="experience-section">

        <div className="experience-container">

          <div className="experience-content">

            <span className="section-label">
              WHAT CAN YOU OFFER?
            </span>

            <h2>
              Share what you
              <span> genuinely enjoy.</span>
            </h2>

            <p>
              Being a companion isn't about pretending to be
              someone you're not. Build your profile around
              activities and experiences you actually enjoy.
            </p>

            <Link
              href="/how-it-works"
              className="text-link"
            >
              Learn more about companionship
              <span>→</span>
            </Link>

          </div>

          <div className="experience-list">

            {experiences.map((experience, index) => (
              <div
                className="experience-pill"
                key={experience}
              >
                <span>
                  {String(index + 1).padStart(2, "0")}
                </span>

                {experience}

                <b>+</b>
              </div>
            ))}

          </div>

        </div>

      </section>


      {/* =========================
          HOW IT WORKS
      ========================== */}

      <section
        className="steps-section"
        id="how-it-works"
      >

        <div className="section-heading centered">

          <span className="section-label">
            SIMPLE PROCESS
          </span>

          <h2>
            Start in four steps.
          </h2>

          <p>
            We've designed the onboarding process to be
            straightforward while keeping safety and trust
            at the center.
          </p>

        </div>

        <div className="steps-grid">

          {steps.map((step) => (
            <div className="step-card" key={step.number}>

              <span className="step-number">
                {step.number}
              </span>

              <div className="step-line"></div>

              <h3>{step.title}</h3>

              <p>{step.text}</p>

            </div>
          ))}

        </div>

      </section>


      {/* =========================
          SAFETY
      ========================== */}

      <section className="companion-safety">

        <div className="safety-content">

          <div className="safety-badge">
            🛡️
          </div>

          <div>

            <span className="section-label">
              SAFETY FIRST
            </span>

            <h2>
              Your safety matters.
            </h2>

            <p>
              ZQAVA is designed around clear boundaries,
              verified profiles, transparent bookings, and
              tools that help companions stay in control.
            </p>

            <div className="safety-points">

              <div>
                <span>✓</span>
                Profile verification
              </div>

              <div>
                <span>✓</span>
                Secure booking system
              </div>

              <div>
                <span>✓</span>
                Report & block tools
              </div>

              <div>
                <span>✓</span>
                Community guidelines
              </div>

            </div>

          </div>

        </div>

        <Link href="/safety" className="safety-link">
          Explore our safety standards →
        </Link>

      </section>


      {/* =========================
          APPLICATION
      ========================== */}

      <section
        className="application-section"
        id="apply"
      >

        <div className="application-container">

          <div className="application-info">

            <span className="section-label">
              READY TO START?
            </span>

            <h2>
              Let's get your
              <span> profile started.</span>
            </h2>

            <p>
              Tell us a little about yourself. You can
              complete the full companion application after
              this first step.
            </p>

            <div className="application-note">
              <span>🔒</span>
              <div>
                <strong>Your information is private.</strong>
                <p>
                  We only use your details for the application
                  and verification process.
                </p>
              </div>
            </div>

          </div>


          <div className="application-form-card">

            {!submitted ? (
              <form onSubmit={handleSubmit}>

                <div className="form-header">
                  <h3>Become a companion</h3>
                  <p>
                    Takes less than 2 minutes.
                  </p>
                </div>

                <div className="form-group">

                  <label htmlFor="name">
                    Your name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="email">
                    Email address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="city">
                    City
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="Where are you based?"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />

                </div>

                <button
                  type="submit"
                  className="application-button"
                >
                  Continue application
                  <span>→</span>
                </button>

                <p className="form-disclaimer">
                  By continuing, you agree to ZQAVA's{" "}
                  <Link href="/terms">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy">
                    Privacy Policy
                  </Link>.
                </p>

              </form>
            ) : (

              <div className="application-success">

                <div className="success-icon">
                  ✓
                </div>

                <h3>
                  You're on your way!
                </h3>

                <p>
                  Thanks, {formData.name}. Your application
                  has been started.
                </p>

                <Link
                  href="/become-a-companion/apply"
                  className="application-button"
                >
                  Complete your profile
                  <span>→</span>
                </Link>

              </div>

            )}

          </div>

        </div>

      </section>

    </main>
  );
}