import Link from "next/link";
import "../Legal.css";

export const metadata = {
  title: "Privacy Policy | ZQAVA",
  description:
    "Learn how ZQAVA collects, uses, stores, and protects information when you use our platform.",
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">

      <section className="legal-hero">
        <div className="legal-hero-inner">
          <span className="legal-eyebrow">ZQAVA LEGAL</span>

          <h1>
            Privacy
            <br />
            <span>Policy.</span>
          </h1>

          <p>
            Your privacy matters to us. This policy explains what
            information ZQAVA collects, how we use it, and the choices
            you have when using our platform.
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

          <a href="#information">Information we collect</a>
          <a href="#use">How we use information</a>
          <a href="#sharing">Information sharing</a>
          <a href="#payments">Payments</a>
          <a href="#security">Security</a>
          <a href="#retention">Data retention</a>
          <a href="#rights">Your choices</a>
          <a href="#children">Children</a>
          <a href="#changes">Changes</a>
          <a href="#contact">Contact</a>
        </aside>

        <article className="legal-article">
          <p className="legal-intro">
            This Privacy Policy explains how ZQAVA ("ZQAVA", "we",
            "us", or "our") collects, uses, discloses, and protects
            information when you access or use our website, application,
            marketplace, and related services.
          </p>

          <div className="legal-warning">
            <strong>Important:</strong>
            <p>
              ZQAVA is intended for adults. You must meet the minimum
              age requirements applicable to your location to create an
              account or use our services.
            </p>
          </div>

          <section id="information" className="legal-section">
            <span className="legal-number">01</span>
            <h2>Information we collect</h2>

            <h3>Information you provide</h3>
            <p>
              When you create an account, build a profile, make a
              booking, become a companion, contact us, or otherwise
              interact with ZQAVA, you may provide information such as:
            </p>

            <ul>
              <li>Name and profile information</li>
              <li>Email address and phone number</li>
              <li>Profile photographs</li>
              <li>Location or city</li>
              <li>Interests and activity preferences</li>
              <li>Availability and booking information</li>
              <li>Messages and communications</li>
              <li>Information submitted during verification</li>
              <li>Customer support requests</li>
            </ul>

            <h3>Information collected automatically</h3>
            <p>
              We may automatically receive certain technical and usage
              information when you use the platform, including device
              information, browser type, IP address, pages viewed,
              approximate location, and interaction data.
            </p>
          </section>

          <section id="use" className="legal-section">
            <span className="legal-number">02</span>
            <h2>How we use information</h2>

            <p>We may use information to:</p>

            <ul>
              <li>Create and manage your account</li>
              <li>Display and personalize profiles</li>
              <li>Facilitate bookings and experiences</li>
              <li>Process payments and related transactions</li>
              <li>Communicate with you about your account</li>
              <li>Provide customer and safety support</li>
              <li>Detect fraud, abuse, and policy violations</li>
              <li>Improve the platform and user experience</li>
              <li>Maintain platform security</li>
              <li>Comply with applicable legal obligations</li>
            </ul>
          </section>

          <section id="sharing" className="legal-section">
            <span className="legal-number">03</span>
            <h2>Information sharing</h2>

            <p>
              We do not treat your personal information as something to
              freely sell to third parties. We may share information
              when necessary to operate ZQAVA and provide our services.
            </p>

            <h3>Other users</h3>
            <p>
              Certain profile information may be visible to other users.
              You should avoid publishing sensitive personal information
              that you do not want other users to see.
            </p>

            <h3>Service providers</h3>
            <p>
              We may use third-party providers for services such as
              hosting, analytics, payments, communications, identity
              verification, customer support, and security.
            </p>

            <h3>Legal requirements</h3>
            <p>
              We may disclose information where reasonably necessary to
              comply with applicable law, legal processes, court orders,
              or legitimate requests from authorities.
            </p>
          </section>

          <section id="payments" className="legal-section">
            <span className="legal-number">04</span>
            <h2>Payments</h2>

            <p>
              Payments may be processed through third-party payment
              providers. Depending on the payment method used, payment
              information may be collected and processed directly by
              the applicable provider.
            </p>

            <p>
              ZQAVA may receive transaction-related information necessary
              to confirm bookings, process refunds, prevent fraud, and
              maintain transaction records.
            </p>
          </section>

          <section id="security" className="legal-section">
            <span className="legal-number">05</span>
            <h2>Security</h2>

            <p>
              We use reasonable technical and organizational measures
              intended to protect information against unauthorized
              access, loss, misuse, alteration, or disclosure.
            </p>

            <p>
              However, no internet-based service can guarantee absolute
              security. You are responsible for keeping your account
              credentials confidential and notifying us if you believe
              your account has been compromised.
            </p>
          </section>

          <section id="retention" className="legal-section">
            <span className="legal-number">06</span>
            <h2>Data retention</h2>

            <p>
              We retain information for as long as reasonably necessary
              to provide our services, maintain business and transaction
              records, resolve disputes, enforce agreements, prevent
              abuse, and comply with legal obligations.
            </p>
          </section>

          <section id="rights" className="legal-section">
            <span className="legal-number">07</span>
            <h2>Your choices</h2>

            <p>
              Depending on applicable law, you may have rights relating
              to your personal information, including rights to access,
              correct, update, or request deletion of certain information.
            </p>

            <p>
              You may also be able to update profile information through
              your account settings or contact us regarding privacy
              requests.
            </p>
          </section>

          <section id="children" className="legal-section">
            <span className="legal-number">08</span>
            <h2>Children</h2>

            <p>
              ZQAVA is not intended for children. We do not knowingly
              allow individuals who do not meet the applicable minimum
              age requirement to use the platform.
            </p>

            <p>
              If you believe a child has created an account or provided
              personal information to us, please contact us.
            </p>
          </section>

          <section id="changes" className="legal-section">
            <span className="legal-number">09</span>
            <h2>Changes to this policy</h2>

            <p>
              We may update this Privacy Policy from time to time.
              When changes are made, we will update the "Last updated"
              date shown at the top of this page.
            </p>

            <p>
              Continued use of ZQAVA after an updated policy becomes
              effective may constitute acceptance of the revised policy
              where permitted by applicable law.
            </p>
          </section>

          <section id="contact" className="legal-section">
            <span className="legal-number">10</span>
            <h2>Contact us</h2>

            <p>
              If you have questions about this Privacy Policy or how
              your information is handled, contact:
            </p>

            <div className="legal-contact">
              <strong>ZQAVA Privacy Team</strong>
              <a href="mailto:privacy@zqava.com">
                privacy@zqava.com
              </a>
            </div>
          </section>

          <div className="legal-bottom-nav">
            <Link href="/terms">
              Terms of Service <span>→</span>
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