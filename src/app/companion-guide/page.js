"use client";

import React from "react";
import Link from "next/link";
import "./companion-guide.css";

export default function CompanionGuide() {
  return (
    <main className="companion-guide-page">

      {/* HERO */}
      <section className="cg-hero">
        <div className="cg-hero-bg cg-hero-orb-1"></div>
        <div className="cg-hero-bg cg-hero-orb-2"></div>

        <div className="cg-container cg-hero-grid">

          <div className="cg-hero-content">
            <div className="cg-eyebrow">
              <span></span>
              ZQAVA COMPANION GUIDE
            </div>

            <h1>
              Be a great
              <br />
              <em>companion.</em>
            </h1>

            <p>
              Everything you need to know about creating a great
              experience on ZQAVA — from building your profile to
              communicating clearly and staying safe.
            </p>

            <div className="cg-hero-actions">
              <Link href="/become-a-companion" className="cg-btn cg-btn-primary">
                Become a Companion
                <span>↗</span>
              </Link>

              <a href="#getting-started" className="cg-btn cg-btn-secondary">
                Read the Guide
                <span>↓</span>
              </a>
            </div>
          </div>

          <div className="cg-hero-card-wrap">
            <div className="cg-floating-card cg-card-top">
              <span className="cg-mini-icon">✦</span>
              <div>
                <strong>Be genuine</strong>
                <small>Authentic profiles build trust</small>
              </div>
            </div>

            <div className="cg-profile-card">
              <div className="cg-profile-image">
                <div className="cg-profile-placeholder">Z</div>
                <span className="cg-online-dot"></span>
              </div>

              <div className="cg-profile-info">
                <span className="cg-verified">✓ VERIFIED COMPANION</span>
                <h3>Your profile starts here.</h3>
                <p>
                  Show people who you are, what you enjoy,
                  and what kind of company you offer.
                </p>
              </div>

              <div className="cg-profile-stats">
                <div>
                  <strong>4.9</strong>
                  <span>Rating</span>
                </div>

                <div>
                  <strong>128</strong>
                  <span>Bookings</span>
                </div>

                <div>
                  <strong>98%</strong>
                  <span>Response</span>
                </div>
              </div>
            </div>

            <div className="cg-floating-card cg-card-bottom">
              <span className="cg-mini-icon">♥</span>
              <div>
                <strong>Respect first</strong>
                <small>Every interaction matters</small>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* QUICK NAV */}
      <section className="cg-quick-nav">
        <div className="cg-container">
          <div className="cg-quick-nav-inner">
            <span>IN THIS GUIDE</span>

            <a href="#getting-started">Getting Started</a>
            <a href="#profile">Your Profile</a>
            <a href="#bookings">Bookings</a>
            <a href="#communication">Communication</a>
            <a href="#safety">Safety</a>
            <a href="#earnings">Earnings</a>
          </div>
        </div>
      </section>


      {/* INTRO */}
      <section className="cg-section cg-intro" id="getting-started">
        <div className="cg-container cg-two-column">

          <div className="cg-section-label">
            <span>01</span>
            GETTING STARTED
          </div>

          <div className="cg-section-content">
            <h2>
              Great companionship
              <br />
              starts with <em>clarity.</em>
            </h2>

            <p className="cg-lead">
              ZQAVA is built around real people spending meaningful
              time together. Your job isn't to pretend to be someone
              else. It's to create a comfortable, respectful and
              enjoyable experience.
            </p>

            <div className="cg-feature-grid">

              <div className="cg-feature">
                <span className="cg-feature-number">01</span>
                <h3>Know your boundaries</h3>
                <p>
                  Decide what you are and aren't comfortable with
                  before accepting a booking.
                </p>
              </div>

              <div className="cg-feature">
                <span className="cg-feature-number">02</span>
                <h3>Be transparent</h3>
                <p>
                  Keep your profile, availability and expectations
                  accurate and up to date.
                </p>
              </div>

              <div className="cg-feature">
                <span className="cg-feature-number">03</span>
                <h3>Set expectations</h3>
                <p>
                  Make sure both sides understand the activity,
                  duration and meeting details.
                </p>
              </div>

              <div className="cg-feature">
                <span className="cg-feature-number">04</span>
                <h3>Keep it professional</h3>
                <p>
                  Treat every booking as a professional service
                  interaction built on mutual respect.
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>


      {/* PROFILE */}
      <section className="cg-section cg-section-alt" id="profile">
        <div className="cg-container cg-two-column">

          <div className="cg-section-label">
            <span>02</span>
            YOUR PROFILE
          </div>

          <div className="cg-section-content">
            <h2>
              Your profile is your
              <br />
              <em>first impression.</em>
            </h2>

            <p className="cg-lead">
              A strong profile helps the right people understand
              what you offer before they ever send a request.
            </p>

            <div className="cg-profile-checklist">

              <div className="cg-check-item">
                <div className="cg-check-icon">✓</div>
                <div>
                  <h3>Use genuine photos</h3>
                  <p>
                    Choose recent, clear photos that accurately
                    represent you.
                  </p>
                </div>
              </div>

              <div className="cg-check-item">
                <div className="cg-check-icon">✓</div>
                <div>
                  <h3>Write a useful bio</h3>
                  <p>
                    Mention your interests, personality and the
                    types of activities you enjoy.
                  </p>
                </div>
              </div>

              <div className="cg-check-item">
                <div className="cg-check-icon">✓</div>
                <div>
                  <h3>Show your personality</h3>
                  <p>
                    A profile doesn't need to sound corporate.
                    Let people get a sense of the real you.
                  </p>
                </div>
              </div>

              <div className="cg-check-item">
                <div className="cg-check-icon">✓</div>
                <div>
                  <h3>Keep information current</h3>
                  <p>
                    Update your availability, location and
                    preferences when they change.
                  </p>
                </div>
              </div>

            </div>

            <div className="cg-tip">
              <span>PRO TIP</span>
              <p>
                Profiles that clearly explain what kind of
                companionship they offer tend to create better
                expectations before a booking begins.
              </p>
            </div>
          </div>

        </div>
      </section>


      {/* BOOKINGS */}
      <section className="cg-section" id="bookings">
        <div className="cg-container">

          <div className="cg-centered-heading">
            <div className="cg-section-label cg-label-center">
              <span>03</span>
              BOOKINGS
            </div>

            <h2>
              From request to
              <br />
              <em>great experience.</em>
            </h2>

            <p>
              Keep the booking process simple, clear and predictable.
            </p>
          </div>

          <div className="cg-process">

            <div className="cg-process-line"></div>

            <div className="cg-process-step">
              <span>01</span>
              <div className="cg-process-icon">◉</div>
              <h3>Receive a request</h3>
              <p>
                Review the person's profile and understand what
                they are looking for.
              </p>
            </div>

            <div className="cg-process-step">
              <span>02</span>
              <div className="cg-process-icon">↔</div>
              <h3>Discuss details</h3>
              <p>
                Confirm the activity, timing, meeting point and
                expectations.
              </p>
            </div>

            <div className="cg-process-step">
              <span>03</span>
              <div className="cg-process-icon">✓</div>
              <h3>Accept the booking</h3>
              <p>
                Only accept when you are comfortable with the
                agreed details.
              </p>
            </div>

            <div className="cg-process-step">
              <span>04</span>
              <div className="cg-process-icon">♥</div>
              <h3>Enjoy the experience</h3>
              <p>
                Be present, respectful and communicate if
                something changes.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* COMMUNICATION */}
      <section className="cg-section cg-section-dark" id="communication">
        <div className="cg-container cg-two-column cg-dark-grid">

          <div className="cg-section-label">
            <span>04</span>
            COMMUNICATION
          </div>

          <div className="cg-section-content">
            <h2>
              Clear communication
              <br />
              makes everything <em>easier.</em>
            </h2>

            <p className="cg-dark-lead">
              Most misunderstandings can be avoided by asking
              questions early and communicating openly.
            </p>

            <div className="cg-do-grid">

              <div className="cg-do-card">
                <span>DO</span>
                <h3>Ask questions</h3>
                <p>
                  Make sure you understand what the other person
                  expects from the booking.
                </p>
              </div>

              <div className="cg-do-card">
                <span>DO</span>
                <h3>Communicate changes</h3>
                <p>
                  If plans change, tell the other person as soon
                  as possible.
                </p>
              </div>

              <div className="cg-do-card">
                <span>DO</span>
                <h3>Respect boundaries</h3>
                <p>
                  A boundary is valid even if it changes during
                  an interaction.
                </p>
              </div>

              <div className="cg-dont-card">
                <span>DON'T</span>
                <h3>Make assumptions</h3>
                <p>
                  Don't assume something is okay just because
                  it wasn't explicitly discussed.
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>


      {/* SAFETY */}
      <section className="cg-section" id="safety">
        <div className="cg-container cg-two-column">

          <div className="cg-section-label">
            <span>05</span>
            SAFETY
          </div>

          <div className="cg-section-content">
            <h2>
              Your safety is
              <br />
              <em>non-negotiable.</em>
            </h2>

            <p className="cg-lead">
              Trust your instincts and use the platform's safety
              features whenever you need them.
            </p>

            <div className="cg-safety-grid">

              <div className="cg-safety-card">
                <div className="cg-safety-icon">◎</div>
                <h3>Meet thoughtfully</h3>
                <p>
                  For initial meetings, consider public and
                  familiar locations.
                </p>
              </div>

              <div className="cg-safety-card">
                <div className="cg-safety-icon">♢</div>
                <h3>Protect personal information</h3>
                <p>
                  Avoid sharing sensitive information before
                  you are comfortable doing so.
                </p>
              </div>

              <div className="cg-safety-card">
                <div className="cg-safety-icon">!</div>
                <h3>Trust your instincts</h3>
                <p>
                  If something feels wrong, you can end the
                  interaction or decline the booking.
                </p>
              </div>

              <div className="cg-safety-card">
                <div className="cg-safety-icon">⚑</div>
                <h3>Report concerns</h3>
                <p>
                  Report harassment, threats, scams or other
                  policy violations to ZQAVA.
                </p>
              </div>

            </div>

            <div className="cg-safety-banner">
              <div className="cg-safety-banner-icon">!</div>

              <div>
                <strong>Something doesn't feel right?</strong>
                <p>
                  You never have to continue an interaction that
                  makes you uncomfortable. Prioritize your safety
                  and contact ZQAVA support when appropriate.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* EARNINGS */}
      <section className="cg-section cg-section-alt" id="earnings">
        <div className="cg-container cg-two-column">

          <div className="cg-section-label">
            <span>06</span>
            EARNINGS
          </div>

          <div className="cg-section-content">
            <h2>
              Build your reputation,
              <br />
              <em>one booking at a time.</em>
            </h2>

            <p className="cg-lead">
              Your earnings and reputation grow through consistent
              service, clear communication and positive experiences.
            </p>

            <div className="cg-stats-row">

              <div className="cg-stat">
                <strong>01</strong>
                <span>Respond promptly</span>
                <p>
                  Keep communication timely and professional.
                </p>
              </div>

              <div className="cg-stat">
                <strong>02</strong>
                <span>Show up prepared</span>
                <p>
                  Respect the agreed time and location.
                </p>
              </div>

              <div className="cg-stat">
                <strong>03</strong>
                <span>Build trust</span>
                <p>
                  Consistency helps create repeat bookings.
                </p>
              </div>

            </div>

            <div className="cg-note">
              <strong>Important</strong>
              <p>
                ZQAVA's actual fees, payouts, cancellation rules
                and payment policies are governed by the current
                platform terms and may change over time.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* FINAL CTA */}
      <section className="cg-final-cta">
        <div className="cg-final-glow"></div>

        <div className="cg-container cg-final-content">

          <span className="cg-final-eyebrow">
            READY WHEN YOU ARE
          </span>

          <h2>
            Your next great
            <br />
            experience starts <em>here.</em>
          </h2>

          <p>
            Create your companion profile and start meeting
            people who are looking for the kind of company you offer.
          </p>

          <Link
            href="/become-a-companion"
            className="cg-btn cg-btn-light"
          >
            Become a Companion
            <span>↗</span>
          </Link>

        </div>
      </section>



    </main>
  );
}