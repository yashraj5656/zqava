"use client";

import Link from "next/link";
import { useState } from "react";
import "./Company.css";

export default function Company() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: "What is ZQAVA?",
      answer:
        "ZQAVA is a platform designed to help people discover and book companions for social experiences, activities, conversations, events, and time spent together.",
    },
    {
      question: "Who can become a companion?",
      answer:
        "Adults who meet ZQAVA's eligibility requirements can apply to become companions. Applicants may need to complete identity and profile verification before accepting bookings.",
    },
    {
      question: "How does safety work?",
      answer:
        "ZQAVA is designed around profile verification, clear community guidelines, transparent bookings, reporting tools, and controls that help users make informed decisions.",
    },
    {
      question: "Can I report someone?",
      answer:
        "Yes. Users can report profiles, messages, or interactions that violate ZQAVA's guidelines. Reports can be reviewed by the ZQAVA team.",
    },
    {
      question: "How can I contact ZQAVA?",
      answer:
        "You can contact the ZQAVA team using the contact information provided below. For account or booking issues, include relevant details so the team can assist you more efficiently.",
    },
  ];

  return (
    <main className="company-page">

      {/* =========================================
          HERO
      ========================================== */}

      <section className="company-hero">

        <div className="company-hero-content">

          <span className="company-eyebrow">
            ABOUT ZQAVA
          </span>

          <h1>
            Making it easier to
            <span> connect.</span>
          </h1>

          <p>
            ZQAVA is building a modern platform for people
            who want to meet others, share experiences, and
            spend meaningful time together.
          </p>

          <div className="company-hero-actions">

            <a
              href="#about"
              className="company-primary-button"
            >
              About ZQAVA
              <span>↓</span>
            </a>

            <a
              href="#contact"
              className="company-secondary-button"
            >
              Contact us
            </a>

          </div>

        </div>


        <div className="company-hero-visual">

          <div className="hero-orb orb-one"></div>
          <div className="hero-orb orb-two"></div>

          <div className="connection-card">

            <div className="connection-top">
              <span>THE ZQAVA IDEA</span>

              <div className="connection-status">
                <i></i>
                Connecting
              </div>
            </div>

            <div className="connection-people">

              <div className="person person-one">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80"
                  alt=""
                />
              </div>

              <div className="connection-line">
                <span>✦</span>
              </div>

              <div className="person person-two">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80"
                  alt=""
                />
              </div>

            </div>

            <h3>
              Two people.
              <br />
              One experience.
            </h3>

            <p>
              Discover people who share your interests
              and create experiences together.
            </p>

          </div>

        </div>

      </section>


      {/* =========================================
          ABOUT
      ========================================== */}

      <section
        className="about-section"
        id="about"
      >

        <div className="company-section-label">
          <span>01</span>
          ABOUT
        </div>

        <div className="about-grid">

          <div className="about-heading">

            <h2>
              People are at the
              <span> center.</span>
            </h2>

          </div>

          <div className="about-copy">

            <p className="large-copy">
              We believe that some of the best moments in
              life happen when people simply spend time
              together.
            </p>

            <p>
              ZQAVA was created to make those connections
              easier to discover. Whether someone wants a
              coffee companion, someone to explore a city
              with, a person to attend an event with, or
              simply someone to talk to, ZQAVA provides a
              structured way to find and book those
              experiences.
            </p>

            <p>
              Our goal is to create a platform where people
              can present themselves authentically, discover
              compatible companions, agree on activities,
              and enjoy experiences with clear expectations.
            </p>

          </div>

        </div>


        {/* Mission cards */}

        <div className="mission-grid">

          <div className="mission-card mission-main">

            <span className="mission-number">
              01
            </span>

            <div>
              <h3>
                Connection
              </h3>

              <p>
                Help people discover others they might
                genuinely enjoy spending time with.
              </p>
            </div>

          </div>


          <div className="mission-card">

            <span className="mission-icon">
              ✦
            </span>

            <h3>
              Experiences
            </h3>

            <p>
              Turn ordinary time into memorable
              activities, conversations, and adventures.
            </p>

          </div>


          <div className="mission-card">

            <span className="mission-icon">
              ◇
            </span>

            <h3>
              Transparency
            </h3>

            <p>
              Make profiles, pricing, availability, and
              expectations clear before a booking.
            </p>

          </div>


          <div className="mission-card">

            <span className="mission-icon">
              ♡
            </span>

            <h3>
              Respect
            </h3>

            <p>
              Build a community where boundaries and
              personal choices are respected.
            </p>

          </div>

        </div>

      </section>


      {/* =========================================
          WHAT ZQAVA IS
      ========================================== */}

      <section className="definition-section">

        <div className="definition-inner">

          <div className="definition-left">

            <span className="company-eyebrow">
              THE PLATFORM
            </span>

            <h2>
              More than a profile.
              <br />
              <span>An experience.</span>
            </h2>

          </div>

          <div className="definition-right">

            <div className="definition-item">

              <span>01</span>

              <div>
                <h3>
                  Discover
                </h3>

                <p>
                  Browse companion profiles based on
                  location, interests, activities, availability,
                  and other preferences.
                </p>
              </div>

            </div>


            <div className="definition-item">

              <span>02</span>

              <div>
                <h3>
                  Connect
                </h3>

                <p>
                  Learn about a companion before deciding
                  whether their personality and interests fit
                  the experience you're looking for.
                </p>
              </div>

            </div>


            <div className="definition-item">

              <span>03</span>

              <div>
                <h3>
                  Experience
                </h3>

                <p>
                  Choose an activity, agree on the details,
                  and spend time together within the
                  platform's guidelines.
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          SAFETY
      ========================================== */}

      <section
        className="safety-section"
        id="safety"
      >

        <div className="safety-heading">

          <div className="company-section-label light">
            <span>02</span>
            SAFETY
          </div>

          <h2>
            Trust should be
            <span> built in.</span>
          </h2>

          <p>
            Safety isn't a feature added at the end.
            It is part of how we think about the platform
            from the beginning.
          </p>

        </div>


        <div className="safety-grid">

          <div className="safety-card large">

            <div className="safety-card-icon">
              ✓
            </div>

            <h3>
              Profile verification
            </h3>

            <p>
              Verification helps users understand which
              profiles have completed the relevant ZQAVA
              verification process.
            </p>

            <div className="safety-card-number">
              01
            </div>

          </div>


          <div className="safety-card">

            <div className="safety-card-icon">
              ◉
            </div>

            <h3>
              Clear expectations
            </h3>

            <p>
              Profiles, activities, pricing, duration,
              availability, and booking information are
              designed to be visible before confirming.
            </p>

            <div className="safety-card-number">
              02
            </div>

          </div>


          <div className="safety-card">

            <div className="safety-card-icon">
              ⚑
            </div>

            <h3>
              Report & block
            </h3>

            <p>
              Users should have simple tools for reporting
              inappropriate behavior or blocking another
              user.
            </p>

            <div className="safety-card-number">
              03
            </div>

          </div>


          <div className="safety-card">

            <div className="safety-card-icon">
              ♢
            </div>

            <h3>
              Community guidelines
            </h3>

            <p>
              Everyone using ZQAVA is expected to follow
              community standards and respect other people's
              boundaries.
            </p>

            <div className="safety-card-number">
              04
            </div>

          </div>


          <div className="safety-card">

            <div className="safety-card-icon">
              $
            </div>

            <h3>
              Transparent bookings
            </h3>

            <p>
              Booking details and applicable charges should
              be clearly presented before users confirm an
              experience.
            </p>

            <div className="safety-card-number">
              05
            </div>

          </div>


          <div className="safety-card">

            <div className="safety-card-icon">
              ↗
            </div>

            <h3>
              Support
            </h3>

            <p>
              Users can contact ZQAVA regarding account,
              booking, safety, or community concerns.
            </p>

            <div className="safety-card-number">
              06
            </div>

          </div>

        </div>


        <div className="safety-bottom">

          <div>
            <strong>
              Have a safety concern?
            </strong>

            <p>
              If something doesn't feel right, contact
              the ZQAVA team and provide as much relevant
              information as possible.
            </p>
          </div>

          <a href="#contact">
            Contact ZQAVA
            <span>→</span>
          </a>

        </div>

      </section>


      {/* =========================================
          FAQ
      ========================================== */}

      <section className="faq-section">

        <div className="faq-heading">

          <span className="company-eyebrow">
            FAQ
          </span>

          <h2>
            Questions,
            <br />
            answered.
          </h2>

        </div>

        <div className="faq-list">

          {faqs.map((faq, index) => {

            const isOpen = openFaq === index;

            return (
              <div
                className={
                  isOpen
                    ? "faq-item open"
                    : "faq-item"
                }
                key={faq.question}
              >

                <button
                  type="button"
                  onClick={() =>
                    setOpenFaq(
                      isOpen ? null : index
                    )
                  }
                >

                  <span>
                    {faq.question}
                  </span>

                  <b>
                    {isOpen ? "−" : "+"}
                  </b>

                </button>

                {isOpen && (
                  <div className="faq-answer">
                    <p>
                      {faq.answer}
                    </p>
                  </div>
                )}

              </div>
            );
          })}

        </div>

      </section>


      {/* =========================================
          CONTACT
      ========================================== */}

      <section
        className="contact-section"
        id="contact"
      >

        <div className="contact-container">

          <div className="contact-info">

            <div className="company-section-label">
              <span>03</span>
              CONTACT
            </div>

            <h2>
              Let's talk.
            </h2>

            <p>
              Have a question, partnership idea, feedback,
              or need help with something? We'd love to hear
              from you.
            </p>


            <div className="contact-method">

              <div className="contact-method-icon">
                @
              </div>

              <div>
                <span>Email</span>

                <a href="mailto:zyqentra@gmail.com">
                  hello@zqava.com
                </a>
              </div>

            </div>


            <div className="contact-method">

              <div className="contact-method-icon">
                ?
              </div>

              <div>
                <span>Support</span>

                <a href="mailto:zyqentra@gmail.com">
                  support@zqava.com
                </a>
              </div>

            </div>


            <div className="contact-method">

              <div className="contact-method-icon">
                ◎
              </div>

              <div>
                <span>Partnerships</span>

                <a href="mailto:zyqentra@gmail.com">
                  partners@zqava.com
                </a>
              </div>

            </div>

          </div>


          {/* Contact form */}

          <div className="contact-form-card">

            <form
              onSubmit={(e) => {
                e.preventDefault();

                alert(
                  "Thanks! Your message has been submitted."
                );
              }}
            >

              <div className="contact-form-header">
                <h3>
                  Send us a message
                </h3>

                <p>
                  We'll get back to you as soon as possible.
                </p>
              </div>


              <div className="contact-form-row">

                <div className="contact-field">

                  <label htmlFor="contact-name">
                    Name
                  </label>

                  <input
                    id="contact-name"
                    type="text"
                    placeholder="Your name"
                    required
                  />

                </div>


                <div className="contact-field">

                  <label htmlFor="contact-email">
                    Email
                  </label>

                  <input
                    id="contact-email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />

                </div>

              </div>


              <div className="contact-field">

                <label htmlFor="contact-topic">
                  Topic
                </label>

                <select
                  id="contact-topic"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Select a topic
                  </option>

                  <option value="general">
                    General question
                  </option>

                  <option value="booking">
                    Booking help
                  </option>

                  <option value="safety">
                    Safety concern
                  </option>

                  <option value="companion">
                    Become a companion
                  </option>

                  <option value="partnership">
                    Partnership
                  </option>

                  <option value="feedback">
                    Feedback
                  </option>
                </select>

              </div>


              <div className="contact-field">

                <label htmlFor="contact-message">
                  Message
                </label>

                <textarea
                  id="contact-message"
                  placeholder="How can we help?"
                  rows="6"
                  required
                />

              </div>


              <button
                type="submit"
                className="contact-submit"
              >
                Send message
                <span>→</span>
              </button>

            </form>

          </div>

        </div>

      </section>


      {/* =========================================
          CTA
      ========================================== */}

      <section className="company-cta">

        <span>
          ZQAVA
        </span>

        <h2>
          Good experiences
          <br />
          start with good connections.
        </h2>

        <div className="company-cta-buttons">

          <Link
            href="/explore"
            className="company-cta-primary"
          >
            Explore companions
            <span>→</span>
          </Link>

          <Link
            href="/become-a-companion"
            className="company-cta-secondary"
          >
            Become a companion
          </Link>

        </div>

      </section>

    </main>
  );
}