"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function PartiesClient() {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("soonest");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/parties", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load parties.");
        }

        setParties(Array.isArray(data.parties) ? data.parties : []);
      } catch (e) {
        console.error(e);
        setError(e.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cities = useMemo(() => {
    return [...new Set(parties.map((p) => p.city).filter(Boolean))].sort();
  }, [parties]);

  const categories = useMemo(() => {
    return [...new Set(parties.map((p) => p.category).filter(Boolean))].sort();
  }, [parties]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    const list = parties.filter((p) => {
      if (city && p.city !== city) return false;
      if (category && p.category !== category) return false;

      if (q) {
        const haystack = [
          p.title,
          p.description,
          p.venue,
          p.city,
          ...(p.tags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    if (sort === "price-low")
      list.sort((a, b) => a.ticketPrice - b.ticketPrice);
    if (sort === "price-high")
      list.sort((a, b) => b.ticketPrice - a.ticketPrice);
    if (sort === "newest")
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "soonest")
      list.sort((a, b) => new Date(a.date) - new Date(b.date));

    return list;
  }, [parties, search, city, category, sort]);

  return (
    <div className="parties-container">
      {/* HERO */}
      <section className="parties-hero">
        <div className="parties-hero-content">
          <span className="parties-eyebrow">
            <span className="live-dot" />
            Host it. Join it. Live it.
          </span>

          <h1>
            Parties worth
            <br />
            <span>showing up for.</span>
          </h1>

          <p>
            Discover house parties, rooftop nights, bonfires and more.
            Or host your own and sell tickets in minutes.
          </p>

          <div className="parties-hero-actions">
            <Link href="/host" className="parties-primary-btn">
              Host a party <span>→</span>
            </Link>
            <a href="/my-tickets" className="parties-secondary-btn">
              My Tickets
            </a>
          </div>
        </div>

        <div className="parties-hero-glow glow-one" />
        <div className="parties-hero-glow glow-two" />
      </section>

      {/* FILTERS */}
      <section className="parties-filters">
        <div className="parties-filters-top">
          <div>
            <span className="section-label">DISCOVER</span>
            <h2>Find your next night out</h2>
          </div>

          <Link href="/parties/create" className="parties-ghost-btn">
            + Host a party
          </Link>
        </div>

        <div className="parties-search-row">
          <input
            type="text"
            placeholder="Search parties, venues, cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="parties-search"
          />
        </div>

        <div className="parties-filter-grid">
          <div className="parties-filter-field">
            <label>City</label>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">All cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="parties-filter-field">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="parties-filter-field">
            <label>Sort by</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="soonest">Soonest</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to high</option>
              <option value="price-high">Price: High to low</option>
            </select>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section id="parties-grid" className="parties-results">
        <div className="parties-results-head">
          <h2>Upcoming parties</h2>
          <p>
            {loading
              ? "Finding parties..."
              : `${filtered.length} ${filtered.length === 1 ? "party" : "parties"} found`}
          </p>
        </div>

        {loading && (
          <div className="parties-loading">
            <div className="parties-spinner" />
            <p>Loading parties...</p>
          </div>
        )}

        {!loading && error && (
          <div className="parties-error">
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Try again</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="parties-empty">
            <h3>No parties found</h3>
            <p>Try adjusting your filters, or host the first one.</p>
            <Link href="/parties/create" className="parties-primary-btn">
              Host a party
            </Link>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="parties-grid">
            {filtered.map((party) => {
              const left = Math.max(0, party.totalTickets - party.ticketsSold);
              const soldOut = left === 0;
              const dateObj = new Date(party.date);

              return (
                <article key={party._id} className="party-card">
                  <Link
                    href={`/parties/${party._id}`}
                    className="party-card-cover"
                  >
                    {party.coverImage ? (
                      <img src={party.coverImage} alt={party.title} />
                    ) : (
                      <div className="party-card-cover-fallback">
                        <span>{party.category}</span>
                      </div>
                    )}

                    <span className="party-card-category">
                      {party.category}
                    </span>

                    {soldOut ? (
                      <span className="party-card-badge sold">Sold out</span>
                    ) : (
                      <span className="party-card-badge">
                        {left} left
                      </span>
                    )}
                  </Link>

                  <div className="party-card-body">
                    <div className="party-card-date">
                      <strong>
                        {dateObj.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </strong>
                      <span>
                        {dateObj.toLocaleDateString("en-IN", {
                          weekday: "short",
                        })}{" "}
                        • {party.startTime}
                      </span>
                    </div>

                    <h3 className="party-card-title">{party.title}</h3>

                    <p className="party-card-venue">
                      📍 {party.venue}, {party.city}
                    </p>

                    <div className="party-card-bottom">
                      <div className="party-card-price">
                        <strong>
                          {party.ticketPrice === 0
                            ? "Free"
                            : `₹${party.ticketPrice}`}
                        </strong>
                        {party.ticketPrice > 0 && <span>/ ticket</span>}
                      </div>

                      <Link
                        href={`/parties/${party._id}`}
                        className="party-card-btn"
                      >
                        {soldOut ? "View" : "Get tickets"}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div>
          <span className="section-label">ZQAVA</span>
          <h2>
            Got a place?
            <br />
            Throw a party.
          </h2>
          <p>
            List your party, set ticket prices, and get paid when people show up.
          </p>
          <Link href="/parties/create" className="final-cta-button">
            Host a party <span>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}