import Link from "next/link";
import "../Legal.css";

export const metadata = {
  title: "Community Guidelines | ZQAVA",
  description:
    "Learn the standards that help keep the ZQAVA community respectful, safe, and welcoming.",
};

export default function GuidelinesPage() {
  return (
    <main className="legal-page">


      <section className="legal-hero">
        <div className="legal-hero-inner">
          <span className="legal-eyebrow">
            ZQAVA COMMUNITY
          </span>

          <h1>
            Meet with
            <br />
            <span>respect.</span>
          </h1>

          <p>
            ZQAVA works best when everyone treats each other with
            honesty, respect, and consideration. These guidelines
            explain the standards we expect from every member.
          </p>

          <div className="guidelines-pills">
            <span>Respect</span>
            <span>Honesty</span>
            <span>Safety</span>
            <span>Boundaries</span>
          </div>
        </div>
      </section>

      <section className="legal-content">
        <aside className="legal-sidebar">
          <span>ON THIS PAGE</span>

          <a href="#respect">Respect everyone</a>
          <a href="#honesty">Be honest</a>
          <a href="#boundaries">Respect boundaries</a>
          <a href="#safety">Stay safe</a>
          <a href="#harassment">Harassment</a>
          <a href="#fraud">Fraud & deception</a>
          <a href="#content">Content standards</a>
          <a href="#offplatform">Off-platform behavior</a>
          <a href="#reporting">Reporting</a>
          <a href="#enforcement">Enforcement</a>
        </aside>

        <article className="legal-article">
          <p className="legal-intro">
            ZQAVA is a community built around meeting people,
            conversations, activities, events, and shared experiences.
            Every member contributes to the kind of community we
            create together.
          </p>

          <div className="guideline-principles">
            <div>
              <span>01</span>
              <strong>Respect</strong>
              <p>Treat people like people.</p>
            </div>

            <div>
              <span>02</span>
              <strong>Honesty</strong>
              <p>Represent yourself accurately.</p>
            </div>

            <div>
              <span>03</span>
              <strong>Boundaries</strong>
              <p>Respect a person's choices.</p>
            </div>

            <div>
              <span>04</span>
              <strong>Safety</strong>
              <p>Take reasonable precautions.</p>
            </div>
          </div>

          <section id="respect" className="legal-section">
            <span className="legal-number">01</span>

            <h2>Respect everyone</h2>

            <p>
              ZQAVA brings together people with different personalities,
              backgrounds, interests, and expectations. Treat other
              members with basic courtesy and respect.
            </p>

            <p>
              Differences in opinions, preferences, appearance, lifestyle,
              or personality are not reasons to harass or demean another
              person.
            </p>

            <div className="do-dont-grid">
              <div className="do-box">
                <span>✓</span>
                <h3>Do</h3>
                <ul>
                  <li>Communicate politely</li>
                  <li>Listen to the other person</li>
                  <li>Respect differences</li>
                  <li>Keep disagreements civil</li>
                </ul>
              </div>

              <div className="dont-box">
                <span>×</span>
                <h3>Don't</h3>
                <ul>
                  <li>Insult or threaten people</li>
                  <li>Intimidate other members</li>
                  <li>Target someone personally</li>
                  <li>Encourage harassment</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="honesty" className="legal-section">
            <span className="legal-number">02</span>

            <h2>Be honest</h2>

            <p>
              Trust starts with accurate information. Profiles,
              photographs, descriptions, availability, pricing, and
              other information should represent you honestly.
            </p>

            <ul>
              <li>Use your real identity where required</li>
              <li>Use photographs that accurately represent you</li>
              <li>Don't impersonate another person</li>
              <li>Don't create fake reviews or bookings</li>
              <li>Don't intentionally misrepresent an experience</li>
            </ul>
          </section>

          <section id="boundaries" className="legal-section">
            <span className="legal-number">03</span>

            <h2>Respect boundaries</h2>

            <p>
              Every person has the right to decide what they are
              comfortable with during an interaction.
            </p>

            <p>
              A booking or conversation does not create permission for
              anything beyond what was agreed. If someone says no,
              changes their mind, or asks you to stop, respect that
              decision.
            </p>

            <div className="highlight-box">
              <strong>A simple rule:</strong>
              <p>
                If you're unsure whether something is welcome, ask.
                If the answer is no, respect it.
              </p>
            </div>
          </section>

          <section id="safety" className="legal-section">
            <span className="legal-number">04</span>

            <h2>Prioritize safety</h2>

            <p>
              When meeting someone for the first time, consider
              reasonable precautions.
            </p>

            <ul>
              <li>Consider meeting in a public location</li>
              <li>Tell someone you trust about your plans</li>
              <li>Keep your phone accessible</li>
              <li>Use your own transportation when appropriate</li>
              <li>Leave an interaction if you feel unsafe</li>
              <li>Report serious concerns to ZQAVA</li>
            </ul>

            <p>
              If you are in immediate danger, contact the appropriate
              emergency services in your location.
            </p>
          </section>

          <section id="harassment" className="legal-section">
            <span className="legal-number">05</span>

            <h2>Harassment and abuse</h2>

            <p>
              ZQAVA does not permit behavior that intimidates,
              threatens, humiliates, or repeatedly targets another
              person.
            </p>

            <p>Examples include:</p>

            <ul>
              <li>Threats of physical harm</li>
              <li>Persistent unwanted contact</li>
              <li>Stalking or monitoring another user</li>
              <li>Blackmail or coercion</li>
              <li>Hate-based harassment</li>
              <li>Sexual harassment or unwanted advances</li>
              <li>Sharing private information without permission</li>
            </ul>
          </section>

          <section id="fraud" className="legal-section">
            <span className="legal-number">06</span>

            <h2>Fraud and deception</h2>

            <p>
              ZQAVA must not be used to deceive other users or exploit
              the platform's payment and booking systems.
            </p>

            <ul>
              <li>Do not use fake identities</li>
              <li>Do not create fraudulent profiles</li>
              <li>Do not manipulate ratings or reviews</li>
              <li>Do not misuse refunds or chargebacks</li>
              <li>Do not request money through deceptive claims</li>
              <li>Do not attempt to access another user's account</li>
            </ul>
          </section>

          <section id="content" className="legal-section">
            <span className="legal-number">07</span>

            <h2>Content standards</h2>

            <p>
              Content shared on ZQAVA should be lawful, relevant,
              respectful, and appropriate for the platform.
            </p>

            <p>Do not upload or share:</p>

            <ul>
              <li>Illegal content</li>
              <li>Threats or instructions for violence</li>
              <li>Content that exploits minors</li>
              <li>Private information belonging to others</li>
              <li>Fraudulent or deceptive material</li>
              <li>Spam or malicious links</li>
              <li>Content intended to harass another person</li>
            </ul>
          </section>

          <section id="offplatform" className="legal-section">
            <span className="legal-number">08</span>

            <h2>Off-platform behavior</h2>

            <p>
              Our expectations for respectful behavior apply to
              interactions that originate through ZQAVA, including
              experiences arranged through the platform.
            </p>

            <p>
              Moving a conversation or experience outside ZQAVA does
              not remove your responsibility to respect another person's
              safety, boundaries, privacy, and applicable laws.
            </p>
          </section>

          <section id="reporting" className="legal-section">
            <span className="legal-number">09</span>

            <h2>Reporting a problem</h2>

            <p>
              If you encounter behavior that violates these guidelines,
              report it through the available ZQAVA reporting tools or
              contact our support team.
            </p>

            <div className="report-card">
              <div className="report-icon">!</div>

              <div>
                <h3>Something doesn't feel right?</h3>
                <p>
                  You don't need to wait for a situation to become
                  serious before asking for help.
                </p>

                <a href="mailto:support@zqava.com">
                  Contact support →
                </a>
              </div>
            </div>
          </section>

          <section id="enforcement" className="legal-section">
            <span className="legal-number">10</span>

            <h2>How we enforce the guidelines</h2>

            <p>
              When we receive a report, ZQAVA may review relevant
              information and take action where appropriate.
            </p>

            <p>Possible actions may include:</p>

            <ul>
              <li>Requesting additional information</li>
              <li>Removing content</li>
              <li>Restricting account functionality</li>
              <li>Canceling bookings where appropriate</li>
              <li>Suspending an account</li>
              <li>Terminating an account</li>
              <li>Reporting matters to authorities where required</li>
            </ul>

            <p>
              The response to a report may depend on the seriousness
              and circumstances of the situation.
            </p>
          </section>

          <div className="guidelines-final">
            <span>THE ZQAVA STANDARD</span>

            <h2>
              Be someone you'd
              <br />
              want to meet.
            </h2>

            <p>
              Be honest. Be respectful. Communicate clearly.
              Respect boundaries. Look out for yourself and others.
            </p>
          </div>

          <div className="legal-bottom-nav">
            <Link href="/privacy">
              Privacy Policy <span>→</span>
            </Link>

            <Link href="/terms">
              Terms of Service <span>→</span>
            </Link>
          </div>
        </article>
      </section>

  
    </main>
  );
}