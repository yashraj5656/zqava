"use client";

import Link from "next/link";
import "./earn.css";

export default function Earn() {
  return (
    <main className="earn-page">

      {/* ================= HERO ================= */}
      <section className="earn-hero">
        <div className="earn-container earn-hero-inner">

          <div className="earn-hero-content">
            <span className="earn-eyebrow">EARN WITH ZQAVA</span>

            <h1>
              Your time.
              <br />
              <span>Your terms.</span>
            </h1>

            <p>
              Turn your availability, personality and time into
              meaningful companionship experiences. Create your profile,
              choose when you're available and earn from completed
              bookings.
            </p>

            <div className="earn-hero-actions">
              <Link
                href="/become-a-companion"
                className="earn-btn earn-btn-primary"
              >
                Become a Companion
              </Link>

              <a
                href="#how-it-works"
                className="earn-btn earn-btn-secondary"
              >
                How It Works
              </a>
            </div>

            <div className="earn-hero-note">
              <span className="earn-dot"></span>
              Set your own availability
            </div>
          </div>


          {/* Earnings preview */}
          <div className="earn-preview">

            <div className="earn-preview-top">
              <span>COMPANION DASHBOARD</span>

              <div className="earn-preview-status">
                <i></i>
                Active
              </div>
            </div>

            <div className="earn-preview-title">
              <span>Available balance</span>
              <strong>₹12,480</strong>
            </div>

            <div className="earn-chart">
              <div className="earn-chart-grid"></div>

              <svg
                viewBox="0 0 500 190"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M0 155 C45 145 55 135 90 140 C125 145 135 110 175 120 C210 130 220 92 255 102 C290 112 305 65 340 76 C375 87 390 52 420 62 C450 72 470 30 500 38"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                <circle cx="500" cy="38" r="6" fill="currentColor" />
              </svg>
            </div>

            <div className="earn-preview-bottom">
              <div>
                <span>This month</span>
                <strong>+18.4%</strong>
              </div>

              <div>
                <span>Bookings</span>
                <strong>24</strong>
              </div>

              <div>
                <span>Hours</span>
                <strong>38</strong>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ================= INTRO ================= */}
      <section className="earn-intro">
        <div className="earn-container">

          <div className="earn-intro-grid">

            <div>
              <span className="earn-section-label">A FLEXIBLE MODEL</span>

              <h2>
                Earn from the
                <br />
                time you choose.
              </h2>
            </div>

            <div>
              <p>
                ZQAVA is designed around flexible companionship.
                You decide when you want to be available and what
                bookings fit your schedule.
              </p>

              <p>
                Your earnings can vary depending on your rates,
                availability, bookings, duration and demand.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* ================= HOW IT WORKS ================= */}
      <section
        className="earn-how"
        id="how-it-works"
      >
        <div className="earn-container">

          <div className="earn-section-heading">
            <span className="earn-section-label">HOW IT WORKS</span>

            <h2>
              From profile
              <br />
              to payout.
            </h2>

            <p>
              Getting started is straightforward. Build your profile,
              receive bookings and get paid for completed experiences.
            </p>
          </div>


          <div className="earn-steps">

            <article className="earn-step">
              <div className="earn-step-number">01</div>

              <div className="earn-step-icon">
                <span>+</span>
              </div>

              <h3>Create your profile</h3>

              <p>
                Introduce yourself, add quality photos and tell
                members what kind of companionship you offer.
              </p>
            </article>


            <article className="earn-step">
              <div className="earn-step-number">02</div>

              <div className="earn-step-icon">
                <span>◷</span>
              </div>

              <h3>Set your availability</h3>

              <p>
                Choose the days and times that work for you and
                keep your calendar updated.
              </p>
            </article>


            <article className="earn-step">
              <div className="earn-step-number">03</div>

              <div className="earn-step-icon">
                <span>♡</span>
              </div>

              <h3>Accept bookings</h3>

              <p>
                Review booking requests and accept the experiences
                that fit your schedule and preferences.
              </p>
            </article>


            <article className="earn-step">
              <div className="earn-step-number">04</div>

              <div className="earn-step-icon">
                <span>₹</span>
              </div>

              <h3>Complete & get paid</h3>

              <p>
                Complete the booking according to the agreed
                details and receive your eligible payout.
              </p>
            </article>

          </div>

        </div>
      </section>


      {/* ================= EARNING FACTORS ================= */}
      <section className="earn-factors">
        <div className="earn-container">

          <div className="earn-factors-header">
            <span className="earn-section-label">YOUR EARNINGS</span>

            <h2>
              What can affect
              <br />
              how much you earn?
            </h2>

            <p>
              There isn't a fixed income for every companion.
              Several factors can influence the amount and frequency
              of your bookings.
            </p>
          </div>


          <div className="earn-factor-grid">

            <article className="earn-factor-card">
              <span className="earn-factor-number">01</span>

              <h3>Your rate</h3>

              <p>
                Your listed booking rate directly affects the amount
                you can earn from eligible completed bookings.
              </p>
            </article>


            <article className="earn-factor-card">
              <span className="earn-factor-number">02</span>

              <h3>Availability</h3>

              <p>
                Keeping your availability accurate makes it easier
                for members to find times that work for both of you.
              </p>
            </article>


            <article className="earn-factor-card">
              <span className="earn-factor-number">03</span>

              <h3>Profile quality</h3>

              <p>
                Clear photos, useful information and an authentic
                profile can help members understand what to expect.
              </p>
            </article>


            <article className="earn-factor-card">
              <span className="earn-factor-number">04</span>

              <h3>Bookings</h3>

              <p>
                Earnings depend on the bookings you receive and
                successfully complete.
              </p>
            </article>

          </div>

        </div>
      </section>


      {/* ================= RATE CARD ================= */}
      <section className="earn-rate-section">
        <div className="earn-container">

          <div className="earn-rate-box">

            <div className="earn-rate-copy">
              <span className="earn-section-label">SET YOUR RATE</span>

              <h2>
                Your profile.
                <br />
                Your pricing.
              </h2>

              <p>
                Choose a rate that reflects your time and the type
                of companionship you provide. Keep your pricing
                clear and consistent.
              </p>

              <Link
                href="/become-a-companion"
                className="earn-btn earn-btn-primary"
              >
                Start Your Profile
              </Link>
            </div>


            <div className="earn-rate-card">

              <div className="earn-rate-card-top">
                <span>YOUR RATE</span>
                <span className="earn-edit">EDIT</span>
              </div>

              <div className="earn-rate-price">
                <strong>₹1,500</strong>
                <span>/ hour</span>
              </div>

              <div className="earn-rate-divider"></div>

              <div className="earn-rate-row">
                <span>Estimated booking</span>
                <strong>2 hours</strong>
              </div>

              <div className="earn-rate-row">
                <span>Booking value</span>
                <strong>₹3,000</strong>
              </div>

              <div className="earn-rate-divider"></div>

              <div className="earn-rate-row earn-rate-total">
                <span>Eligible payout</span>
                <strong>₹3,000*</strong>
              </div>

              <small>
                *Actual payout may be affected by applicable platform
                fees, taxes, refunds, adjustments or other terms.
              </small>

            </div>

          </div>

        </div>
      </section>


      {/* ================= GROW PROFILE ================= */}
      <section className="earn-grow">
        <div className="earn-container">

          <div className="earn-section-heading centered">
            <span className="earn-section-label">BUILD TRUST</span>

            <h2>
              Better experiences
              <br />
              start with a better profile.
            </h2>

            <p>
              Your profile is often the first impression members
              have of you. Keep it honest, complete and up to date.
            </p>
          </div>


          <div className="earn-grow-grid">

            <div className="earn-grow-card">
              <div className="earn-grow-icon">01</div>

              <h3>Use clear photos</h3>

              <p>
                Choose recent photos that clearly represent you.
              </p>
            </div>


            <div className="earn-grow-card">
              <div className="earn-grow-icon">02</div>

              <h3>Write naturally</h3>

              <p>
                Let your personality come through without making
                unrealistic promises.
              </p>
            </div>


            <div className="earn-grow-card">
              <div className="earn-grow-icon">03</div>

              <h3>Keep your calendar updated</h3>

              <p>
                Accurate availability helps reduce cancellations
                and scheduling problems.
              </p>
            </div>


            <div className="earn-grow-card">
              <div className="earn-grow-icon">04</div>

              <h3>Communicate clearly</h3>

              <p>
                Discuss expectations, timing and boundaries before
                accepting a booking.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* ================= SAFETY ================= */}
      <section className="earn-safety">
        <div className="earn-container">

          <div className="earn-safety-box">

            <div className="earn-safety-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 3L19 6V11.5C19 16.3 16.05 20.35 12 22C7.95 20.35 5 16.3 5 11.5V6L12 3Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.7 12.2L10.8 14.3L15.5 9.7"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
              <span className="earn-section-label">
                SAFETY FIRST
              </span>

              <h2>
                Earning should never
                <br />
                mean ignoring your boundaries.
              </h2>

              <p>
                You can decline bookings that don't feel right.
                Keep communication respectful, meet in appropriate
                settings and follow ZQAVA's safety and community rules.
              </p>

              <Link
                href="/safety"
                className="earn-text-link"
              >
                Read Safety Guidelines
                <span>→</span>
              </Link>
            </div>

          </div>

        </div>
      </section>


      {/* ================= FAQ ================= */}
      <section className="earn-faq">
        <div className="earn-container">

          <div className="earn-faq-layout">

            <div className="earn-faq-title">
              <span className="earn-section-label">FAQ</span>

              <h2>
                Questions,
                <br />
                answered.
              </h2>
            </div>


            <div className="earn-faq-list">

              <details open>
                <summary>
                  How much can I earn?
                  <span>+</span>
                </summary>

                <p>
                  There is no guaranteed income amount. Earnings depend
                  on factors such as your rates, availability, number
                  of bookings, booking duration and applicable platform
                  fees or adjustments.
                </p>
              </details>


              <details>
                <summary>
                  Do I choose my own availability?
                  <span>+</span>
                </summary>

                <p>
                  Companions can indicate when they are available.
                  Keeping your calendar accurate helps avoid scheduling
                  conflicts.
                </p>
              </details>


              <details>
                <summary>
                  Can I decline a booking?
                  <span>+</span>
                </summary>

                <p>
                  Booking requests should be reviewed before acceptance.
                  You should only accept bookings that fit your schedule,
                  boundaries and preferences.
                </p>
              </details>


              <details>
                <summary>
                  When do I get paid?
                  <span>+</span>
                </summary>

                <p>
                  Eligible payouts are processed according to ZQAVA's
                  payout schedule and applicable payment terms.
                </p>
              </details>


              <details>
                <summary>
                  Are there platform fees?
                  <span>+</span>
                </summary>

                <p>
                  Applicable platform fees, payment processing charges,
                  taxes, refunds or other adjustments may affect the
                  final amount received. Check the current companion
                  terms before accepting bookings.
                </p>
              </details>

            </div>

          </div>

        </div>
      </section>


      {/* ================= FINAL CTA ================= */}
      <section className="earn-final">
        <div className="earn-container">

          <span className="earn-final-label">READY WHEN YOU ARE</span>

          <h2>
            Make your time
            <br />
            work for you.
          </h2>

          <p>
            Create your ZQAVA companion profile and start building
            your availability around the life you already have.
          </p>

          <div className="earn-final-actions">

            <Link
              href="/become-a-companion"
              className="earn-btn earn-btn-primary"
            >
              Become a Companion
            </Link>

            <Link
              href="/companion-guide"
              className="earn-btn earn-btn-outline"
            >
              Read Companion Guide
            </Link>

          </div>

        </div>
      </section>

    </main>
  );
}