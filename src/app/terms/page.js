import Link from "next/link";
import "../Legal.css";

export const metadata = {
  title: "Terms of Service | ZQAVA",
  description:
    "Read the terms and conditions governing your use of the ZQAVA platform.",
};

export default function TermsPage() {
  return (
    <main className="legal-page">
 

      <section className="legal-hero">
        <div className="legal-hero-inner">
          <span className="legal-eyebrow">ZQAVA LEGAL</span>

          <h1>
            Terms of
            <br />
            <span>Service.</span>
          </h1>

          <p>
            These terms explain the rules for using ZQAVA, creating
            an account, booking experiences, becoming a companion,
            and interacting with other members.
          </p>

          <div className="legal-meta">
            <span>Last updated: September 2026</span>
            <span>Version 1.0</span>
          </div>
        </div>
      </section>

      <section className="legal-content">
        <aside className="legal-sidebar">
          <span>ON THIS PAGE</span>

          <a href="#acceptance">Acceptance</a>
          <a href="#eligibility">Eligibility</a>
          <a href="#accounts">Accounts</a>
          <a href="#bookings">Bookings</a>
          <a href="#companions">Companions</a>
          <a href="#conduct">User conduct</a>
          <a href="#payments">Payments</a>
          <a href="#cancellations">Cancellations</a>
          <a href="#content">User content</a>
          <a href="#termination">Termination</a>
          <a href="#disclaimer">Disclaimers</a>
          <a href="#contact">Contact</a>
        </aside>

        <article className="legal-article">
          <p className="legal-intro">
            These Terms of Service ("Terms") govern your access to and
            use of ZQAVA's website, applications, marketplace, and
            related services.
          </p>

          <div className="legal-warning">
            <strong>Please read these Terms carefully.</strong>
            <p>
              By creating an account or using ZQAVA, you agree to comply
              with these Terms, our Privacy Policy, and our Community
              Guidelines.
            </p>
          </div>

          <section id="acceptance" className="legal-section">
            <span className="legal-number">01</span>
            <h2>Acceptance of these Terms</h2>

            <p>
              By accessing or using ZQAVA, you confirm that you have
              read, understood, and agree to be bound by these Terms.
            </p>

            <p>
              If you do not agree with these Terms, you should not use
              the platform.
            </p>
          </section>

          <section id="eligibility" className="legal-section">
            <span className="legal-number">02</span>
            <h2>Eligibility</h2>

            <p>
              ZQAVA is intended for adults. You must meet the minimum
              legal age requirement applicable to you in order to use
              the platform.
            </p>

            <p>
              You may not use ZQAVA if you are prohibited from doing so
              under applicable law or if your account has previously
              been suspended or terminated for serious violations.
            </p>
          </section>

          <section id="accounts" className="legal-section">
            <span className="legal-number">03</span>
            <h2>Accounts</h2>

            <p>
              You are responsible for providing accurate information
              when creating your account and for keeping your account
              information up to date.
            </p>

            <p>
              You are responsible for maintaining the confidentiality
              of your login credentials and for activities conducted
              through your account.
            </p>

            <p>
              You must not impersonate another person, create deceptive
              profiles, or create accounts for fraudulent purposes.
            </p>
          </section>

          <section id="bookings" className="legal-section">
            <span className="legal-number">04</span>
            <h2>Bookings and experiences</h2>

            <p>
              ZQAVA provides tools that allow users to discover
              companions and arrange social experiences or activities.
            </p>

            <p>
              A booking may include details such as the participants,
              date, time, duration, location, activity, and applicable
              price.
            </p>

            <p>
              Users are responsible for reviewing booking information
              before confirming an experience.
            </p>

            <h3>Meeting in person</h3>

            <p>
              Users should use reasonable judgment when arranging
              in-person experiences. Consider meeting in public places,
              informing someone you trust about your plans, and using
              available ZQAVA safety tools.
            </p>
          </section>

          <section id="companions" className="legal-section">
            <span className="legal-number">05</span>
            <h2>Companion accounts</h2>

            <p>
              Users who offer companionship services or activities
              through ZQAVA must provide truthful information and comply
              with applicable verification requirements.
            </p>

            <p>
              Companions must accurately describe their availability,
              activities, pricing, and other material information.
            </p>

            <p>
              Companion status does not create an employment relationship
              with ZQAVA unless a separate written agreement expressly
              states otherwise.
            </p>
          </section>

          <section id="conduct" className="legal-section">
            <span className="legal-number">06</span>
            <h2>User conduct</h2>

            <p>You agree not to:</p>

            <ul>
              <li>Harass, threaten, stalk, or intimidate another user</li>
              <li>Impersonate another person</li>
              <li>Provide intentionally misleading information</li>
              <li>Use ZQAVA for unlawful activities</li>
              <li>Attempt to bypass platform security</li>
              <li>Scrape or collect user information without permission</li>
              <li>Abuse payment or refund systems</li>
              <li>Send spam or unsolicited promotional messages</li>
              <li>Attempt to access another user's account</li>
              <li>Engage in conduct prohibited by our Guidelines</li>
            </ul>

            <p>
              ZQAVA may restrict or remove accounts that violate these
              requirements.
            </p>
          </section>

          <section id="payments" className="legal-section">
            <span className="legal-number">07</span>
            <h2>Payments and fees</h2>

            <p>
              Certain experiences available through ZQAVA may involve
              payment. Prices and applicable fees should be displayed
              before a booking is confirmed.
            </p>

            <p>
              Payments may be processed by third-party payment
              providers. Additional terms from those providers may
              apply to transactions.
            </p>

            <p>
              You agree not to intentionally misuse payment methods,
              chargebacks, refunds, promotional credits, or other
              transaction systems.
            </p>
          </section>

          <section id="cancellations" className="legal-section">
            <span className="legal-number">08</span>
            <h2>Cancellations and refunds</h2>

            <p>
              Cancellation and refund terms may depend on the specific
              booking, the applicable cancellation policy, and the
              circumstances of the cancellation.
            </p>

            <p>
              Where applicable, the cancellation terms presented during
              booking will govern the transaction.
            </p>

            <p>
              ZQAVA may review exceptional circumstances, safety
              incidents, fraudulent activity, or disputes on a
              case-by-case basis.
            </p>
          </section>

          <section id="content" className="legal-section">
            <span className="legal-number">09</span>
            <h2>User content</h2>

            <p>
              Users may submit photographs, descriptions, reviews,
              messages, feedback, and other content to ZQAVA.
            </p>

            <p>
              You remain responsible for the content you submit and
              must have the necessary rights to use it.
            </p>

            <p>
              You must not upload content that is unlawful, deceptive,
              threatening, abusive, discriminatory, invasive of another
              person's privacy, or otherwise prohibited by our
              Community Guidelines.
            </p>
          </section>

          <section id="termination" className="legal-section">
            <span className="legal-number">10</span>
            <h2>Suspension and termination</h2>

            <p>
              We may suspend, restrict, or terminate access to an
              account where we reasonably believe that a user has
              violated these Terms, our Guidelines, applicable law,
              or created a safety or security risk.
            </p>

            <p>
              Users may stop using ZQAVA at any time and may request
              account closure subject to applicable legal and
              operational requirements.
            </p>
          </section>

          <section id="disclaimer" className="legal-section">
            <span className="legal-number">11</span>
            <h2>Platform disclaimers</h2>

            <p>
              ZQAVA provides a platform that helps users discover,
              communicate with, and arrange experiences with other
              users.
            </p>

            <p>
              Unless expressly stated otherwise, ZQAVA does not
              guarantee the identity, behavior, availability, quality,
              suitability, or conduct of another user.
            </p>

            <p>
              Users are responsible for making their own decisions
              about interactions and experiences and should take
              reasonable safety precautions.
            </p>
          </section>

          <section className="legal-section">
            <span className="legal-number">12</span>
            <h2>Limitation of liability</h2>

            <p>
              To the maximum extent permitted by applicable law, ZQAVA
              will not be responsible for indirect, incidental,
              special, consequential, or punitive losses arising from
              use of the platform.
            </p>

            <p>
              Nothing in these Terms is intended to exclude or limit
              liability that cannot legally be excluded or limited.
            </p>
          </section>

          <section className="legal-section">
            <span className="legal-number">13</span>
            <h2>Changes to the service</h2>

            <p>
              We may modify, suspend, or discontinue parts of ZQAVA
              from time to time, including features, functionality,
              availability, or pricing structures.
            </p>
          </section>

          <section className="legal-section">
            <span className="legal-number">14</span>
            <h2>Changes to these Terms</h2>

            <p>
              We may update these Terms periodically. Updated Terms
              will be published on this page with a revised effective
              date.
            </p>
          </section>

          <section id="contact" className="legal-section">
            <span className="legal-number">15</span>
            <h2>Contact</h2>

            <p>
              Questions regarding these Terms can be sent to:
            </p>

            <div className="legal-contact">
              <strong>ZQAVA</strong>
              <a href="mailto:legal@zqava.com">
                legal@zqava.com
              </a>
            </div>
          </section>

          <div className="legal-bottom-nav">
            <Link href="/privacy">
              Privacy Policy <span>→</span>
            </Link>

            <Link href="/guidelines">
              Community Guidelines <span>→</span>
            </Link>
          </div>
        </article>
      </section>

  
    </main>
  );
}