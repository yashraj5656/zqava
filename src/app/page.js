import Head from "next/head";
import Link from "next/link";

const companions = [
  {
    name: "Riya",
    age: 24,
    city: "Jaipur",
    price: "₹599",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
    tags: ["Coffee", "Shopping", "Movies"],
    rating: "4.9",
    reviews: 28,
  },
  {
    name: "Arjun",
    age: 26,
    city: "Jaipur",
    price: "₹499",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    tags: ["Gaming", "Food", "Travel"],
    rating: "4.8",
    reviews: 19,
  },
  {
    name: "Ananya",
    age: 23,
    city: "Udaipur",
    price: "₹699",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    tags: ["Photography", "Cafe", "Travel"],
    rating: "5.0",
    reviews: 16,
  },
];

const categories = [
  {
    icon: "☕",
    title: "Coffee & Chat",
    text: "Grab a coffee and have some good company.",
  },
  {
    icon: "🎬",
    title: "Movies",
    text: "Don't go to the movies alone.",
  },
  {
    icon: "🏙️",
    title: "Explore",
    text: "Discover your city with someone.",
  },
  {
    icon: "🎉",
    title: "Events",
    text: "Find someone to join you at your next event.",
  },
  {
    icon: "🎮",
    title: "Gaming",
    text: "Find someone who enjoys the same games.",
  },
  {
    icon: "📸",
    title: "Photography",
    text: "Explore, shoot and create memories.",
  },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>ZQAVA — Find someone to go with</title>
        <meta
          name="description"
          content="Find and book a verified companion for coffee, events, movies, exploring and more."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main>

        {/* ================= HERO ================= */}

        <section className="hero">
          <div className="hero-glow glow-one"></div>
          <div className="hero-glow glow-two"></div>

          <div className="container hero-container">
            <div className="hero-content">
              <div className="eyebrow">
                <span className="live-dot"></span>
                Real people. Real company.
              </div>

              <h1>
                Find someone
                <br />
                <span>to go with.</span>
              </h1>

              <p className="hero-description">
                Coffee, movies, events, exploring or simply hanging out.
                Discover people who are available to spend time with you.
              </p>

              <div className="hero-buttons">
                <Link href="/explore" className="primary-btn">
                  Find a companion
                  <span>→</span>
                </Link>

                <Link href="/become-a-companion" className="secondary-btn">
                  Become a companion
                </Link>
              </div>

              <div className="hero-trust">
                <div className="avatar-stack">
                  <img
                    src="https://i.pravatar.cc/80?img=12"
                    alt=""
                  />
                  <img
                    src="https://i.pravatar.cc/80?img=32"
                    alt=""
                  />
                  <img
                    src="https://i.pravatar.cc/80?img=47"
                    alt=""
                  />
                  <div className="avatar-more">+</div>
                </div>

                <div>
                  <strong>Growing community</strong>
                  <span>of people looking for company</span>
                </div>
              </div>
            </div>

            {/* Hero visual */}

            <div className="hero-visual">
              <div className="floating-card card-top">
                <div className="mini-icon">✓</div>
                <div>
                  <strong>Verified profiles</strong>
                  <span>Identity checked</span>
                </div>
              </div>

              <div className="hero-card">
                <div className="hero-image-wrapper">
                  <img
                    src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85"
                    alt="Companion"
                  />

                  <div className="available-badge">
                    <span></span> Available today
                  </div>
                </div>

                <div className="hero-profile">
                  <div>
                    <h3>Meet someone new</h3>
                    <p>Based on your interests</p>
                  </div>

                  <div className="match-score">
                    <strong>96%</strong>
                    <span>match</span>
                  </div>
                </div>

                <div className="interest-row">
                  <span>☕ Coffee</span>
                  <span>🎬 Movies</span>
                  <span>🏙️ Explore</span>
                </div>
              </div>

              <div className="floating-card card-bottom">
                <div className="rating-icon">★</div>
                <div>
                  <strong>4.9 / 5</strong>
                  <span>Community rating</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SEARCH ================= */}

        <section className="search-section"><a href="/explore">
          <div className="container">
            <div className="search-box">
              <div className="search-field">
                <span className="field-icon">📍</span>
                <div>
                  <label>Where</label>
                  <strong>Choose a city</strong>
                </div>
              </div>

              <div className="search-field">
                <span className="field-icon">✨</span>
                <div>
                  <label>Looking for</label>
                  <strong>Any activity</strong>
                </div>
              </div>

              <div className="search-field">
                <span className="field-icon">📅</span>
                <div>
                  <label>When</label>
                  <strong>Any time</strong>
                </div>
              </div>
              <button className="search-button">
                Search <span>→</span>
              </button>
            </div>
          </div></a>
        </section>

        {/* ================= CATEGORIES ================= */}

        <section className="section" id="explore">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="section-label">DISCOVER</span>
                <h2>What do you want to do?</h2>
              </div>

              <p>
                Find someone who is into the same things you are.
              </p>
            </div>

            <a href="/explore"><div className="category-grid">
              {categories.map((category) => (
                <div className="category-card" key={category.title}>
                  <div className="category-icon">{category.icon}</div>
                  <h3>{category.title}</h3>
                  <p>{category.text}</p>
                  <span className="category-arrow">↗</span>
                </div>
              ))}
            </div></a>
          </div>
        </section>

        {/* ================= FEATURED ================= */}

        <section className="section featured-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="section-label">POPULAR NEAR YOU</span>
                <h2>Meet your kind of people.</h2>
              </div>

              <Link href="/explore" className="view-all">
                View all companions →
              </Link>
            </div>
            <a href="/explore">
            <div className="companion-grid">
              {companions.map((person) => (
                <div className="companion-card" key={person.name}>
                  <div className="companion-image">
                    <img src={person.image} alt={person.name} />

                    <div className="online-badge">
                      <span></span> Available
                    </div>

                    <button className="heart-button">♡</button>
                  </div>

                  <div className="companion-info">
                    <div className="name-row">
                      <div>
                        <h3>
                          {person.name}, {person.age}
                          <span className="verified">✓</span>
                        </h3>

                        <p>📍 {person.city}</p>
                      </div>

                      <div className="price">
                        <strong>{person.price}</strong>
                        <span>/hr</span>
                      </div>
                    </div>

                    <div className="tags">
                      {person.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>

                    <div className="rating-row">
                      <span>★ {person.rating}</span>
                      <span>{person.reviews} reviews</span>
                    </div>
                  </div>
                </div>
              ))}
            </div></a>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}

        <section className="how-section" id="how-it-works">
          <div className="container">
            <div className="how-header">
              <span className="section-label">HOW IT WORKS</span>
              <h2>Make plans. Find company.</h2>
              <p>
                ZQAVA makes it easy to find someone and spend time
                doing something you enjoy.
              </p>
            </div>

            <div className="steps">
              <div className="step">
                <div className="step-number">01</div>
                <div className="step-icon">🔎</div>
                <h3>Find someone</h3>
                <p>
                  Browse verified companions based on location,
                  interests, availability and reviews.
                </p>
              </div>

              <div className="step-line"></div>

              <div className="step">
                <div className="step-number">02</div>
                <div className="step-icon">📆</div>
                <h3>Make a booking</h3>
                <p>
                  Choose an activity, date and duration that works
                  for both of you.
                </p>
              </div>

              <div className="step-line"></div>

              <div className="step">
                <div className="step-number">03</div>
                <div className="step-icon">🤝</div>
                <h3>Meet & enjoy</h3>
                <p>
                  Meet at a public location and enjoy your time
                  together.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SAFETY ================= */}

        <section className="safety-section" id="safety">
          <div className="container safety-container">
            <div className="safety-content">
              <span className="section-label">YOUR SAFETY MATTERS</span>

              <h2>
                Built around
                <br />
                <span>trust.</span>
              </h2>

              <p>
                Meeting someone new should feel exciting, not
                uncomfortable. That's why safety is built into
                every part of ZQAVA.
              </p>

              <div className="safety-list">
                <div>
                  <span>✓</span>
                  <p>
                    <strong>Identity verification</strong>
                    <small>Verified profiles and identity checks.</small>
                  </p>
                </div>

                <div>
                  <span>✓</span>
                  <p>
                    <strong>Secure payments</strong>
                    <small>Your payment stays protected.</small>
                  </p>
                </div>

                <div>
                  <span>✓</span>
                  <p>
                    <strong>Community reviews</strong>
                    <small>See what other people experienced.</small>
                  </p>
                </div>

                <div>
                  <span>✓</span>
                  <p>
                    <strong>Report & support</strong>
                    <small>Help is available when you need it.</small>
                  </p>
                </div>
              </div>
            </div>

            <div className="safety-card">
              <div className="shield">🛡️</div>

              <h3>Meet confidently.</h3>

              <p>
                Every booking is recorded and our community
                guidelines help create a respectful experience
                for everyone.
              </p>

              <div className="safety-stat">
                <strong>100%</strong>
                <span>Community-first</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}

        <section className="cta-section">
          <div className="container cta-container">
            <div className="cta-decoration decoration-one"></div>
            <div className="cta-decoration decoration-two"></div>

            <span className="section-label">YOUR NEXT PLAN</span>

            <h2>
              Got plans?
              <br />
              <span>Get company.</span>
            </h2>

            <p>
              Find someone who wants to do the same thing you do.
            </p>

            <Link href="/explore" className="cta-button">
              Find a companion <span>→</span>
            </Link>
          </div>
        </section>
        
        
 {/* =========================
          FINAL CTA
      ========================== */}

      <section className="final-cta">

<div>

  <span className="section-label">
    ZQAVA
  </span>

  <h2>
    Your personality is
    <br />
    worth experiencing.
  </h2>

  <p>
    Create your profile. Choose your experiences.
    Meet new people.
  </p>

  <a href="/become-a-companion" className="final-cta-button">
    Become a companion
    <span>→</span>
  </a>

</div>

</section>

      </main>
    </>
  );
}