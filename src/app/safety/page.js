"use client";

import Link from "next/link";
import "./safety.css";

export default function Safety() {
  return (
    <main className="safety-page">

      {/* ================= HERO ================= */}
      <section className="safety-hero">
        <div className="safety-hero-inner">

          <div className="safety-hero-copy">
            <span className="safety-eyebrow">ZQAVA SAFETY</span>

            <h1>
              Your safety
              <span> comes first.</span>
            </h1>

            <p>
              ZQAVA is built around respectful, transparent and
              responsible companionship. We provide tools and
              guidelines to help companions and members feel safer
              before, during and after every booking.
            </p>

            <div className="safety-hero-actions">
              <Link href="/guidelines" className="safety-btn safety-btn-primary">
                Community Guidelines
              </Link>

              <Link href="/contact" className="safety-btn safety-btn-secondary">
                Report an Issue
              </Link>
            </div>
          </div>

          <div className="safety-shield-card">
            <div className="safety-shield-glow"></div>

            <div className="safety-shield-icon">
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

            <span>SAFETY</span>
            <strong>Built into every step.</strong>
            <p>
              From profiles and messaging to bookings and reporting,
              safety should never be an afterthought.
            </p>
          </div>

        </div>
      </section>


      {/* ================= SAFETY PRINCIPLES ================= */}
      <section className="safety-principles">
        <div className="safety-container">

          <div className="safety-section-heading">
            <span>OUR APPROACH</span>
            <h2>Safety isn't one feature.</h2>
            <p>
              It is a combination of good decisions, clear boundaries,
              responsible communication and knowing what to do when
              something doesn't feel right.
            </p>
          </div>

          <div className="safety-principles-grid">

            <article className="safety-principle-card">
              <div className="safety-number">01</div>
              <div className="safety-card-icon">✓</div>
              <h3>Know who you're meeting</h3>
              <p>
                Review profiles carefully before accepting or requesting
                a booking. Look at profile information, photos,
                preferences and relevant details.
              </p>
            </article>

            <article className="safety-principle-card">
              <div className="safety-number">02</div>
              <div className="safety-card-icon">◎</div>
              <h3>Keep communication clear</h3>
              <p>
                Discuss expectations, timing, location and boundaries
                before meeting. Clear communication can prevent
                misunderstandings.
              </p>
            </article>

            <article className="safety-principle-card">
              <div className="safety-number">03</div>
              <div className="safety-card-icon">⌁</div>
              <h3>Trust your instincts</h3>
              <p>
                If something feels uncomfortable, you can pause,
                cancel or leave a situation. You never have to continue
                a booking that feels unsafe.
              </p>
            </article>

          </div>
        </div>
      </section>


      {/* ================= BEFORE MEETING ================= */}
      <section className="safety-checklist-section">
        <div className="safety-container">

          <div className="safety-checklist-layout">

            <div className="safety-checklist-intro">
              <span className="safety-label">BEFORE YOU MEET</span>
              <h2>A few minutes of preparation can make a difference.</h2>
              <p>
                Whether you're a member or a companion, take some time
                to prepare before meeting someone for the first time.
              </p>
            </div>

            <div className="safety-checklist">

              <div className="safety-check-item">
                <span className="safety-check">✓</span>
                <div>
                  <h3>Review the profile</h3>
                  <p>
                    Make sure the person and booking details match
                    what you agreed to.
                  </p>
                </div>
              </div>

              <div className="safety-check-item">
                <span className="safety-check">✓</span>
                <div>
                  <h3>Confirm the meeting details</h3>
                  <p>
                    Confirm the time, duration and public meeting
                    location in advance.
                  </p>
                </div>
              </div>

              <div className="safety-check-item">
                <span className="safety-check">✓</span>
                <div>
                  <h3>Tell someone you trust</h3>
                  <p>
                    Consider sharing your plans and expected return
                    time with a trusted friend or family member.
                  </p>
                </div>
              </div>

              <div className="safety-check-item">
                <span className="safety-check">✓</span>
                <div>
                  <h3>Keep your phone accessible</h3>
                  <p>
                    Make sure your phone is charged and that you can
                    contact someone if you need help.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>


      {/* ================= DURING BOOKING ================= */}
      <section className="safety-during">
        <div className="safety-container">

          <div className="safety-section-heading centered">
            <span>DURING A BOOKING</span>
            <h2>Boundaries matter.</h2>
            <p>
              Every person has the right to set boundaries and change
              their mind. Respect them.
            </p>
          </div>

          <div className="safety-boundary-grid">

            <div className="safety-boundary-card">
              <span>01</span>
              <h3>Respect personal boundaries</h3>
              <p>
                A booking does not create an obligation to do anything
                beyond what was agreed.
              </p>
            </div>

            <div className="safety-boundary-card">
              <span>02</span>
              <h3>No means no</h3>
              <p>
                A refusal should be respected immediately. Pressure,
                intimidation or harassment are not acceptable.
              </p>
            </div>

            <div className="safety-boundary-card">
              <span>03</span>
              <h3>You can leave</h3>
              <p>
                If you become uncomfortable or feel unsafe, you can
                end the meeting and leave.
              </p>
            </div>

            <div className="safety-boundary-card">
              <span>04</span>
              <h3>Keep expectations realistic</h3>
              <p>
                Companionship is based on the agreed booking.
                Don't assume additional services or commitments.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* ================= SCAMS ================= */}
      <section className="safety-scams">
        <div className="safety-container">

          <div className="safety-scam-header">
            <span className="safety-label">WATCH OUT FOR SCAMS</span>
            <h2>Protect your account and your money.</h2>
            <p>
              Be cautious when someone asks you to move a conversation
              away from ZQAVA, send money unexpectedly or share
              sensitive information.
            </p>
          </div>

          <div className="safety-scam-grid">

            <div className="safety-scam-card">
              <div className="safety-warning-icon">!</div>
              <h3>Never share passwords</h3>
              <p>
                ZQAVA will never need your account password, OTP or
                authentication code.
              </p>
            </div>

            <div className="safety-scam-card">
              <div className="safety-warning-icon">!</div>
              <h3>Be careful with payment requests</h3>
              <p>
                Be cautious if someone asks for unexpected payments,
                gift cards, transfers or financial assistance.
              </p>
            </div>

            <div className="safety-scam-card">
              <div className="safety-warning-icon">!</div>
              <h3>Don't share sensitive information</h3>
              <p>
                Avoid sharing financial information, account
                credentials or other sensitive personal details.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* ================= REPORTING ================= */}
      <section className="safety-report">
        <div className="safety-container">

          <div className="safety-report-box">

            <div className="safety-report-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 3L20 6.5V11.5C20 16.2 16.8 20.5 12 22C7.2 20.5 4 16.2 4 11.5V6.5L12 3Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 8V13"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <circle
                  cx="12"
                  cy="16"
                  r="0.8"
                  fill="currentColor"
                />
              </svg>
            </div>

            <div className="safety-report-content">
              <span>SEE SOMETHING WRONG?</span>
              <h2>Report it.</h2>
              <p>
                If someone violates the community guidelines,
                behaves inappropriately or makes you feel unsafe,
                report the situation so it can be reviewed.
              </p>

              <Link
                href="/contact"
                className="safety-btn safety-btn-dark"
              >
                Report a Problem
              </Link>
            </div>

          </div>

        </div>
      </section>


      {/* ================= EMERGENCY ================= */}
      <section className="safety-emergency">
        <div className="safety-container">

          <div className="safety-emergency-content">
            <span>IN AN EMERGENCY</span>

            <h2>
              Contact local emergency
              <br />
              services first.
            </h2>

            <p>
              ZQAVA is not an emergency response service. If you are
              in immediate danger or believe someone may be in danger,
              contact your local emergency services or a trusted person
              who can help.
            </p>
          </div>

        </div>
      </section>


      {/* ================= GUIDELINES ================= */}
      <section className="safety-guidelines">
        <div className="safety-container">

          <div className="safety-guidelines-inner">
            <div>
              <span>ONE COMMUNITY</span>
              <h2>Safety works both ways.</h2>
              <p>
                Treat people with respect, communicate clearly and
                follow the rules that help keep ZQAVA welcoming.
              </p>
            </div>

            <Link
              href="/guidelines"
              className="safety-btn safety-btn-primary"
            >
              Read Community Guidelines
            </Link>
          </div>

        </div>
      </section>


      {/* ================= FINAL CTA ================= */}
      <section className="safety-final-cta">
        <div className="safety-container">

          <span>ZQAVA</span>

          <h2>
            Meet with confidence.
            <br />
            Connect with respect.
          </h2>

          <p>
            Good experiences start with clear expectations and
            responsible choices.
          </p>

          <div className="safety-final-actions">
            <Link
              href="/explore"
              className="safety-btn safety-btn-primary"
            >
              Explore Companions
            </Link>

            <Link
              href="/become-a-companion"
              className="safety-btn safety-btn-outline"
            >
              Become a Companion
            </Link>
          </div>

        </div>
      </section>

    </main>
  );
}