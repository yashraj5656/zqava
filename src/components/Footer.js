import Link from "next/link";

export default function Footer() {
  return (
       <footer className="footer">
          <div className="container">
            <div className="footer-top">
              <div className="footer-brand">
                <Link href="/" className="footer-logo">
                  ZQ<span>Q</span>AVA
                </Link>

                <p>
                  Find someone to go with.
                  <br />
                  Good company, when you want it.
                </p>
              </div>

              <div className="footer-links">
                <div>
                  <h4>Explore</h4>
                  <Link href="/explore">Find companions</Link>
                  <Link href="/explore">Activities</Link>
                  <Link href="/explore">Cities</Link>
                </div>

                <div>
                  <h4>For companions</h4>
                  <Link href="/become-a-companion">
                    Become a companion
                  </Link>
                  <Link href="/companion-guide">Companion guide</Link>
                  <Link href="/earn">How you earn</Link>
                </div>

                <div>
                  <h4>Company</h4>
                  <Link href="/Company">About</Link>
                  <Link href="/safety">Safety</Link>
                  <Link href="/Company">Contact</Link>
                </div>
              </div>
            </div>

            <div className="footer-bottom">
              <span>© 2026 ZQAVA. All rights reserved.</span>

              <div>
                <Link href="/privacy">Privacy</Link>
                <Link href="/terms">Terms</Link>
                <Link href="/guidelines">Community Guidelines</Link>
              </div>
            </div>
          </div>
        </footer>
  );
}