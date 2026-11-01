import Head from "next/head";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

const companions = [
  {
    name: "Priya",
    age: 24,
    city: "Jaipur",
    price: "₹599",
    image: "vgelubust4p12dkhb2d2.jpg",
    tags: ["Coffee", "Shopping", "Movies"],
    rating: "4.9",
    reviews: 28,
  },
  {
    name: "Aarav",
    age: 26,
    city: "Jaipur",
    price: "₹499",
    image: "gayyvctkfxzgq8tcmrny.jpg",
    tags: ["Gaming", "Food", "Travel"],
    rating: "4.8",
    reviews: 19,
  },
  {
    name: "Ananya",
    age: 23,
    city: "Jaipur",
    price: "₹699",
    image: "wectu8q58f4tlvfyaik5.jpg",
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

/* ================= PARTIES DATA (preview) ================= */

const parties = [
  {
    id: "sample-1",
    title: "Rooftop Sunset Session",
    category: "Rooftop",
    city: "Jaipur",
    venue: "The Terrace, C-Scheme",
    date: "Fri, 22 Nov",
    time: "7:00 PM",
    price: 500,
    ticketsLeft: 12,
    cover:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "sample-2",
    title: "Bonfire & Chill",
    category: "Bonfire",
    city: "Jaipur",
    venue: "Amer Road",
    date: "Sat, 23 Nov",
    time: "8:30 PM",
    price: 800,
    ticketsLeft: 8,
    cover:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "sample-3",
    title: "Games Night at Mine",
    category: "Games Night",
    city: "Jaipur",
    venue: "Vaishali Nagar",
    date: "Sun, 24 Nov",
    time: "6:00 PM",
    price: 0,
    ticketsLeft: 20,
    cover:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
  },
];

const partyCategories = [
  { icon: "🏠", title: "House Parties", text: "Intimate, cosy nights in." },
  { icon: "🌇", title: "Rooftops", text: "Skyline views, good music." },
  { icon: "🔥", title: "Bonfires", text: "Warm drinks, cold nights." },
  { icon: "🎮", title: "Games Nights", text: "Board games, consoles, cards." },
];

export default async function Home() {
  const session = await getSession();

  if (session?.userId) {
    redirect("/explore");
  }

  return (
    <>
      <Head>
        <title>ZQAVA — Find someone to go with</title>
        <meta
          name="description"
          content="Find and book a verified companion for coffee, events, movies, exploring and more. Or host a party and sell tickets on ZQAVA."
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
                Real people. Real company. Real plans.
              </div>

              <h1>
                Find someone
                <br />
                <span>to go with.</span>
              </h1>

              <p className="hero-description">
                Coffee, movies, events, exploring or a party this weekend.
                Discover people to spend time with — or host a party and sell
                tickets on ZQAVA.
              </p>

              <div className="hero-buttons">
                <Link href="/explore" className="primary-btn">
                  Find a companion
                  <span>→</span>
                </Link>

                <Link href="/parties" className="secondary-btn">
                  Explore parties
                </Link>
              </div>

              <div className="hero-trust">
                <div className="avatar-stack">
                  <img src="https://i.pravatar.cc/80?img=12" alt="" />
                  <img src="https://i.pravatar.cc/80?img=32" alt="" />
                  <img src="https://i.pravatar.cc/80?img=47" alt="" />
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
        <section className="search-section">
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
                  <strong>Companion or party</strong>
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

            {/* Mode switch under search */}
            <div className="search-mode-switch">
              <Link href="/explore" className="search-mode">
                👥 Companions
              </Link>
              <Link href="/parties" className="search-mode active">
                🎉 Parties
              </Link>
            </div>
          </div>
        </section>

        {/* ================= CATEGORIES ================= */}
        <section className="section" id="explore">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="section-label">DISCOVER</span>
                <h2>What do you want to do?</h2>
              </div>

              <p>Find someone who is into the same things you are.</p>
            </div>

            <Link href="/explore">
              <div className="category-grid">
                {categories.map((category) => (
                  <div className="category-card" key={category.title}>
                    <div className="category-icon">{category.icon}</div>
                    <h3>{category.title}</h3>
                    <p>{category.text}</p>
                    <span className="category-arrow">↗</span>
                  </div>
                ))}
              </div>
            </Link>
          </div>
        </section>

        {/* ================= FEATURED COMPANIONS ================= */}
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

            <Link href="/explore">
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
              </div>
            </Link>
          </div>
        </section>

        {/* ================= ✨ NEW: PARTIES ================= */}
        <section className="home-parties-section">
          <div className="container">
            <div className="section-heading home-parties-heading">
              <div>
                <span className="section-label">NEW • ZQAVA PARTIES</span>
                <h2>
                  Parties worth
                  <br />
                  showing up for.
                </h2>
              </div>

              <p>
                Discover rooftops, bonfires, house parties and games nights
                near you. Or host your own and sell tickets in minutes.
              </p>
            </div>

            {/* Party cards preview */}
            <div className="home-parties-grid">
              {parties.map((party) => (
                <Link
                  key={party.id}
                  href="/parties"
                  className="home-party-card"
                >
                  <div className="home-party-cover">
                    <img src={party.cover} alt={party.title} />
                    <span className="home-party-cat">{party.category}</span>
                    <span className="home-party-left">
                      {party.ticketsLeft} left
                    </span>
                  </div>

                  <div className="home-party-body">
                    <div className="home-party-date">
                      <strong>{party.date}</strong>
                      <span>• {party.time}</span>
                    </div>

                    <h3>{party.title}</h3>
                    <p>
                      📍 {party.venue}, {party.city}
                    </p>

                    <div className="home-party-bottom">
                      <div className="home-party-price">
                        <strong>
                          {party.price === 0 ? "Free" : `₹${party.price}`}
                        </strong>
                        {party.price > 0 && <span>/ ticket</span>}
                      </div>

                      <span className="home-party-btn">
                        {party.price === 0 ? "Claim" : "Get tickets"} →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Party categories strip */}
            <div className="home-party-cats">
              {partyCategories.map((c) => (
                <Link href="/parties" key={c.title} className="home-party-cat-card">
                  <span className="home-party-cat-icon">{c.icon}</span>
                  <div>
                    <strong>{c.title}</strong>
                    <small>{c.text}</small>
                  </div>
                </Link>
              ))}
            </div>

            {/* View all + host CTA */}
            <div className="home-parties-actions">
              <Link href="/parties" className="home-parties-browse">
                Browse all parties →
              </Link>
              <Link href="/parties/create" className="home-parties-host">
                + Host a party
              </Link>
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className="how-section" id="how-it-works">
          <div className="container">
            <div className="how-header">
              <span className="section-label">HOW IT WORKS</span>
              <h2>Make plans. Find company.</h2>
              <p>
                ZQAVA makes it easy to find someone and spend time doing
                something you enjoy — or to host a party and get paid.
              </p>
            </div>

            <div className="steps">
              <div className="step">
                <div className="step-number">01</div>
                <div className="step-icon">🔎</div>
                <h3>Find someone</h3>
                <p>
                  Browse verified companions or discover parties near you,
                  based on location, interests and reviews.
                </p>
              </div>

              <div className="step-line"></div>

              <div className="step">
                <div className="step-number">02</div>
                <div className="step-icon">📆</div>
                <h3>Book or buy tickets</h3>
                <p>
                  Choose a date and duration with a companion, or grab tickets
                  to a party — all with secure Razorpay checkout.
                </p>
              </div>

              <div className="step-line"></div>

              <div className="step">
                <div className="step-number">03</div>
                <div className="step-icon">🤝</div>
                <h3>Meet & enjoy</h3>
                <p>
                  Meet at a public location, show your ticket at the door, and
                  enjoy your time together.
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
                Meeting someone new should feel exciting, not uncomfortable.
                That's why safety is built into every part of ZQAVA — for
                companions and parties alike.
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
                    <small>Razorpay-protected checkout for every booking.</small>
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
                Every booking and every ticket is recorded, and our community
                guidelines help create a respectful experience for everyone.
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

            <p>Find someone who wants to do the same thing you do.</p>

            <Link href="/explore" className="cta-button">
              Find a companion <span>→</span>
            </Link>
          </div>
        </section>

        {/* ================= ✨ NEW: HOST A PARTY CTA ================= */}
        <section className="home-host-cta">
          <div className="container home-host-cta-inner">
            <div className="home-host-cta-text">
              <span className="section-label">HOST WITH ZQAVA</span>

              <h2>
                Got a place?
                <br />
                <span>Throw a party.</span>
              </h2>

              <p>
                List your party, set ticket prices, and get paid when people
                show up. Manage guests and check them in — all in one place.
              </p>

              <div className="home-host-cta-actions">
                <Link href="/host" className="final-cta-button">
                  Host a party <span>→</span>
                </Link>
                <Link href="/host" className="home-host-cta-ghost">
                  Go to host dashboard
                </Link>
              </div>
            </div>

            <div className="home-host-cta-visual">
              <div className="host-cta-chip">
                <span className="host-cta-chip-icon">🎟️</span>
                <div>
                  <strong>50 tickets sold</strong>
                  <small>Last weekend</small>
                </div>
              </div>

              <div className="host-cta-card">
                <div className="host-cta-card-cover">
                  <img
                    src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80"
                    alt="Party"
                  />
                  <span className="host-cta-live">
                    <span></span> Live
                  </span>
                </div>

                <div className="host-cta-card-body">
                  <h3>Your next party</h3>
                  <p>Filled in minutes · 3 spots left</p>

                  <div className="host-cta-progress">
                    <div className="host-cta-progress-bar">
                      <div style={{ width: "94%" }} />
                    </div>
                    <small>47/50 tickets sold</small>
                  </div>
                </div>
              </div>

              <div className="host-cta-chip chip-bottom">
                <span className="host-cta-chip-icon green">💰</span>
                <div>
                  <strong>₹42,300 earned</strong>
                  <small>Your payout</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className="final-cta">
          <div>
            <span className="section-label">ZQAVA</span>

            <h2>
              Your personality is
              <br />
              worth experiencing.
            </h2>

            <p>
              Create your profile. Choose your experiences. Meet new people.
            </p>

            <a href="/become-a-companion" className="final-cta-button">
              Become a companion <span>→</span>
            </a>
          </div>
        </section>
      </main>
    </>
  );
}