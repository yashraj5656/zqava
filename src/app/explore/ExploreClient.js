"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import "./explore.css";

const MODES = ["companions", "parties"];

export default function ExploreClient()  {
    const router = useRouter();
    const searchParams = useSearchParams();
  
    const initialMode = MODES.includes(searchParams.get("mode"))
      ? searchParams.get("mode")
      : "companions";
  
    const [mode, setMode] = useState(initialMode);
    const [checkingAuth, setCheckingAuth] = useState(true);
  
    /* ---------- companions state ---------- */
    const [companions, setCompanions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
  
    const [showMobileFilters, setShowMobileFilters] = useState(false);
  
    // companion filters
    const [search, setSearch] = useState("");
    const [city, setCity] = useState("");
    const [activity, setActivity] = useState("");
    const [maxPrice, setMaxPrice] = useState(40000);
    const [onlyAvailable, setOnlyAvailable] = useState(false);
    const [onlyVerified, setOnlyVerified] = useState(false);
    const [sort, setSort] = useState("default");
  
    /* ---------- parties state ---------- */
    const [parties, setParties] = useState([]);
    const [partiesLoading, setPartiesLoading] = useState(true);
    const [partiesError, setPartiesError] = useState("");
  
    const [partySearch, setPartySearch] = useState("");
    const [partyCity, setPartyCity] = useState("");
    const [partyCategory, setPartyCategory] = useState("");
    const [partyMaxPrice, setPartyMaxPrice] = useState(100000);
    const [partySort, setPartySort] = useState("soonest");
  
    /* ---------- auth ---------- */
    useEffect(() => {
      async function checkAuth() {
        try {
          const response = await fetch("/api/auth/me");
          if (!response.ok) {
            router.replace(
              `/signup?redirect=${encodeURIComponent(
                window.location.pathname + window.location.search
              )}`
            );
            return;
          }
          setCheckingAuth(false);
        } catch {
          router.replace("/signup");
        }
      }
      checkAuth();
    }, [router]);
  
    /* ---------- keep URL in sync when mode changes ---------- */
    useEffect(() => {
      if (checkingAuth) return;
      const current = searchParams.get("mode") || "companions";
      if (current === mode) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("mode", mode);
      router.replace(`/explore?${params.toString()}`, { scroll: false });
    }, [mode, router, searchParams, checkingAuth]);
  
    /* ---------- load companions ---------- */
    useEffect(() => {
      async function loadCompanions() {
        try {
          setLoading(true);
          setError("");
  
          const response = await fetch("/api/companions", {
            cache: "no-store",
          });
          const data = await response.json();
  
          if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to load companions.");
          }
  
          setCompanions(
            Array.isArray(data.companions) ? data.companions : []
          );
        } catch (error) {
          console.error("Explore page error:", error);
          setError(error.message || "Failed to load companions.");
        } finally {
          setLoading(false);
        }
      }
      loadCompanions();
    }, []);
  
    /* ---------- load parties ---------- */
    useEffect(() => {
      async function loadParties() {
        try {
          setPartiesLoading(true);
          setPartiesError("");
  
          const response = await fetch("/api/parties", {
            cache: "no-store",
          });
          const data = await response.json();
  
          if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to load parties.");
          }
  
          setParties(Array.isArray(data.parties) ? data.parties : []);
        } catch (error) {
          console.error("Explore parties error:", error);
          setPartiesError(error.message || "Failed to load parties.");
        } finally {
          setPartiesLoading(false);
        }
      }
      loadParties();
    }, []);
  
    /* =========================================================
       COMPANION DERIVED DATA
    ========================================================= */
    const cities = useMemo(() => {
      return [
        ...new Set(
          companions
            .map((companion) => companion.city)
            .filter(Boolean)
            .map((city) => city.trim())
        ),
      ].sort((a, b) => a.localeCompare(b));
    }, [companions]);
  
    const activities = useMemo(() => {
      const allActivities = companions.flatMap((companion) => {
        const interests = Array.isArray(companion.interests)
          ? companion.interests
          : [];
        const styles = Array.isArray(companion.companionshipStyles)
          ? companion.companionshipStyles
          : [];
        const legacyActivities = Array.isArray(companion.activities)
          ? companion.activities
          : [];
        return [...interests, ...styles, ...legacyActivities];
      });
      return [...new Set(allActivities.filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
      );
    }, [companions]);
  
    const filteredCompanions = useMemo(() => {
      const searchValue = search.trim().toLowerCase();
  
      const filtered = companions.filter((companion) => {
        const name = String(companion.name || "").toLowerCase();
        const companionCity = String(companion.city || "").toLowerCase();
        const bio = String(companion.bio || "").toLowerCase();
  
        const interests = Array.isArray(companion.interests)
          ? companion.interests
          : [];
        const styles = Array.isArray(companion.companionshipStyles)
          ? companion.companionshipStyles
          : [];
        const activitiesList = Array.isArray(companion.activities)
          ? companion.activities
          : [];
  
        const allActivities = [
          ...interests,
          ...styles,
          ...activitiesList,
        ].map((item) => String(item).toLowerCase());
  
        if (searchValue) {
          const matchesSearch =
            name.includes(searchValue) ||
            companionCity.includes(searchValue) ||
            bio.includes(searchValue) ||
            allActivities.some((item) => item.includes(searchValue));
          if (!matchesSearch) return false;
        }
  
        if (
          city &&
          String(companion.city || "").toLowerCase() !== city.toLowerCase()
        ) {
          return false;
        }
  
        if (activity) {
          const selectedActivity = activity.toLowerCase();
          const hasActivity = allActivities.some(
            (item) => item === selectedActivity
          );
          if (!hasActivity) return false;
        }
  
        const price = Number(
          companion.hourlyRate ?? companion.price ?? 0
        );
        if (price > Number(maxPrice)) return false;
  
        if (onlyAvailable && companion.available !== true) return false;
        if (onlyVerified && companion.verified !== true) return false;
  
        return true;
      });
  
      if (sort === "price-low") {
        filtered.sort(
          (a, b) =>
            Number(a.hourlyRate ?? a.price ?? 0) -
            Number(b.hourlyRate ?? b.price ?? 0)
        );
      }
      if (sort === "price-high") {
        filtered.sort(
          (a, b) =>
            Number(b.hourlyRate ?? b.price ?? 0) -
            Number(a.hourlyRate ?? a.price ?? 0)
        );
      }
      if (sort === "name") {
        filtered.sort((a, b) =>
          String(a.name || "").localeCompare(String(b.name || ""))
        );
      }
  
      return filtered;
    }, [
      companions,
      search,
      city,
      activity,
      maxPrice,
      onlyAvailable,
      onlyVerified,
      sort,
    ]);
  
    function clearCompanionFilters() {
      setSearch("");
      setCity("");
      setActivity("");
      setMaxPrice(100000);
      setOnlyAvailable(false);
      setOnlyVerified(false);
      setSort("default");
    }
  
    const hasCompanionFilters =
      search ||
      city ||
      activity ||
      Number(maxPrice) < 100000 ||
      onlyAvailable ||
      onlyVerified ||
      sort !== "default";
  
    /* =========================================================
       PARTY DERIVED DATA
    ========================================================= */
    const partyCities = useMemo(() => {
      return [
        ...new Set(parties.map((p) => p.city).filter(Boolean)),
      ].sort((a, b) => a.localeCompare(b));
    }, [parties]);
  
    const partyCategories = useMemo(() => {
      return [
        ...new Set(parties.map((p) => p.category).filter(Boolean)),
      ].sort((a, b) => a.localeCompare(b));
    }, [parties]);
  
    const filteredParties = useMemo(() => {
      const q = partySearch.trim().toLowerCase();
  
      const list = parties.filter((p) => {
        if (partyCity && p.city !== partyCity) return false;
        if (partyCategory && p.category !== partyCategory) return false;
  
        if (q) {
          const haystack = [
            p.title,
            p.description,
            p.venue,
            p.city,
            ...(Array.isArray(p.tags) ? p.tags : []),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
  
        const price = Number(p.ticketPrice || 0);
        if (price > Number(partyMaxPrice)) return false;
  
        return true;
      });
  
      if (partySort === "price-low")
        list.sort((a, b) => a.ticketPrice - b.ticketPrice);
      if (partySort === "price-high")
        list.sort((a, b) => b.ticketPrice - a.ticketPrice);
      if (partySort === "newest")
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (partySort === "soonest")
        list.sort((a, b) => new Date(a.date) - new Date(b.date));
  
      return list;
    }, [parties, partySearch, partyCity, partyCategory, partyMaxPrice, partySort]);
  
    function clearPartyFilters() {
      setPartySearch("");
      setPartyCity("");
      setPartyCategory("");
      setPartyMaxPrice(100000);
      setPartySort("soonest");
    }
  
    const hasPartyFilters =
      partySearch ||
      partyCity ||
      partyCategory ||
      Number(partyMaxPrice) < 100000 ||
      partySort !== "soonest";
  
    /* =========================================================
       RENDER
    ========================================================= */
    if (checkingAuth) {
      return (
        <main className="explore-page">
          <div className="explore-loading">Checking login...</div>
        </main>
      );
    }
  
    return (
      <main className="explore-page">
        <div className="explore-container">
          {/* HERO */}
          <section className="explore-hero">
            <div className="explore-hero-content">
              <span className="explore-eyebrow">
                {mode === "companions" ? "FIND YOUR COMPANION" : "FIND YOUR PARTY"}
              </span>
  
              <h1>
                {mode === "companions" ? "Explore Companions" : "Explore Parties"}
              </h1>
  
              <p>
                {mode === "companions"
                  ? "Discover people who match your interests, personality, and plans."
                  : "Discover house parties, rooftops, bonfires and games nights near you."}
              </p>
            </div>
          </section>
  
          {/* FILTERS */}
          <section className="explore-filters">
            {/* MODE TOGGLE */}
            <div className="explore-mode-toggle">
              <button
                type="button"
                className={`explore-mode-btn ${
                  mode === "companions" ? "active" : ""
                }`}
                onClick={() => setMode("companions")}
              >
                👥 Companions
              </button>
              <button
                type="button"
                className={`explore-mode-btn ${
                  mode === "parties" ? "active" : ""
                }`}
                onClick={() => setMode("parties")}
              >
                🎉 Parties
              </button>
            </div>
  
            {/* ------------------ COMPANION FILTERS ------------------ */}
            {mode === "companions" && (
              <>
                <div className="filters-top">
                  <div>
                    <h2>Find your match</h2>
                  </div>
                  {hasCompanionFilters && (
                    <button
                      type="button"
                      className="clear-filters"
                      onClick={clearCompanionFilters}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
  
                <div className="filter-group filter-search">
                  <div className="search-input-wrapper">
                    <span className="search-icon">🔎</span>
                    <input
                      id="search"
                      type="text"
                      placeholder="Name, city, interest..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
  
                <button
                  type="button"
                  className="mobile-filter-toggle"
                  onClick={() => setShowMobileFilters((prev) => !prev)}
                  aria-expanded={showMobileFilters}
                  aria-controls="advanced-filters"
                >
                  <span>
                    <span className="filter-toggle-icon">☷</span>
                    Filters & Sort
                  </span>
                  <span className="filter-toggle-right">
                    {showMobileFilters ? "Hide" : "Show"}
                    <span
                      className={
                        showMobileFilters
                          ? "toggle-arrow open"
                          : "toggle-arrow"
                      }
                    >
                      ▼
                    </span>
                  </span>
                </button>
  
                <div
                  id="advanced-filters"
                  className={`advanced-filters ${
                    showMobileFilters ? "mobile-filters-open" : ""
                  }`}
                >
                  <br />
                  <div className="filters-grid">
                    <div className="filter-group">
                      <label htmlFor="city">City</label>
                      <select
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      >
                        <option value="">All cities</option>
                        {cities.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
  
                    <div className="filter-group">
                      <label htmlFor="activity">Interest / Style</label>
                      <select
                        id="activity"
                        value={activity}
                        onChange={(e) => setActivity(e.target.value)}
                      >
                        <option value="">All interests</option>
                        {activities.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
  
                    <div className="filter-group">
                      <label htmlFor="sort">Sort by</label>
                      <select
                        id="sort"
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                      >
                        <option value="default">Recommended</option>
                        <option value="price-low">Price: Low to high</option>
                        <option value="price-high">Price: High to low</option>
                        <option value="name">Name: A-Z</option>
                      </select>
                    </div>
                  </div>
  
                  <div className="price-filter">
                    <div className="price-filter-header">
                      <label htmlFor="price">Maximum hourly price</label>
                      <strong>
                        ₹{Number(maxPrice).toLocaleString("en-IN")}
                      </strong>
                    </div>
                    <input
                      id="price"
                      type="range"
                      min="0"
                      max="100000"
                      step="100"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                    />
                    <div className="price-range-labels">
                      <span>₹0</span>
                      <span>₹1,00,000+</span>
                    </div>
                  </div>
  
                  <div className="filter-options">
                    <label className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={onlyAvailable}
                        onChange={(e) => setOnlyAvailable(e.target.checked)}
                      />
                      <span className="custom-checkbox"></span>
                      <span>Available now</span>
                    </label>
  
                    <label className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={onlyVerified}
                        onChange={(e) => setOnlyVerified(e.target.checked)}
                      />
                      <span className="custom-checkbox"></span>
                      <span>Verified companions</span>
                    </label>
                  </div>
                </div>
              </>
            )}
  
            {/* ------------------ PARTY FILTERS ------------------ */}
            {mode === "parties" && (
              <>
                <div className="filters-top">
                  <div>
                    <h2>Find your next night out</h2>
                  </div>
                  {hasPartyFilters && (
                    <button
                      type="button"
                      className="clear-filters"
                      onClick={clearPartyFilters}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
  
                <div className="filter-group filter-search">
                  <div className="search-input-wrapper">
                    <span className="search-icon">🔎</span>
                    <input
                      type="text"
                      placeholder="Party, venue, city..."
                      value={partySearch}
                      onChange={(e) => setPartySearch(e.target.value)}
                    />
                  </div>
                </div>
  
                <div className="filters-grid">
                  <div className="filter-group">
                    <label htmlFor="partyCity">City</label>
                    <select
                      id="partyCity"
                      value={partyCity}
                      onChange={(e) => setPartyCity(e.target.value)}
                    >
                      <option value="">All cities</option>
                      {partyCities.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
  
                  <div className="filter-group">
                    <label htmlFor="partyCategory">Category</label>
                    <select
                      id="partyCategory"
                      value={partyCategory}
                      onChange={(e) => setPartyCategory(e.target.value)}
                    >
                      <option value="">All categories</option>
                      {partyCategories.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
  
                  <div className="filter-group">
                    <label htmlFor="partySort">Sort by</label>
                    <select
                      id="partySort"
                      value={partySort}
                      onChange={(e) => setPartySort(e.target.value)}
                    >
                      <option value="soonest">Soonest</option>
                      <option value="newest">Newest</option>
                      <option value="price-low">Price: Low to high</option>
                      <option value="price-high">Price: High to low</option>
                    </select>
                  </div>
                </div>
  
                <div className="price-filter">
                  <div className="price-filter-header">
                    <label htmlFor="partyPrice">Maximum ticket price</label>
                    <strong>
                      ₹{Number(partyMaxPrice).toLocaleString("en-IN")}
                    </strong>
                  </div>
                  <input
                    id="partyPrice"
                    type="range"
                    min="0"
                    max="100000"
                    step="100"
                    value={partyMaxPrice}
                    onChange={(e) => setPartyMaxPrice(Number(e.target.value))}
                  />
                  <div className="price-range-labels">
                    <span>₹0</span>
                    <span>₹1,00,000+</span>
                  </div>
                </div>
              </>
            )}
          </section>
  
          {/* ================= RESULTS ================= */}
          <section className="explore-results">
            <div className="explore-results-header">
              <div>
                <h2>{mode === "companions" ? "Companions" : "Parties"}</h2>
                <p>
                  {mode === "companions"
                    ? loading
                      ? "Finding companions..."
                      : `${filteredCompanions.length} ${
                          filteredCompanions.length === 1
                            ? "companion"
                            : "companions"
                        } found`
                    : partiesLoading
                    ? "Finding parties..."
                    : `${filteredParties.length} ${
                        filteredParties.length === 1 ? "party" : "parties"
                      } found`}
                </p>
              </div>
  
              {mode === "parties" && (
                <Link
                  href="/parties/create"
                  className="explore-host-cta"
                >
                  + Host a party
                </Link>
              )}
            </div>
  
            {/* ---------- COMPANION STATES ---------- */}
            {mode === "companions" && (
              <>
                {loading && (
                  <div className="explore-loading">
                    <div className="explore-spinner"></div>
                    <p>Loading companions...</p>
                  </div>
                )}
  
                {!loading && error && (
                  <div className="explore-error">
                    <div className="explore-error-icon">⚠️</div>
                    <h3>Something went wrong</h3>
                    <p>{error}</p>
                    <button
                      type="button"
                      className="explore-retry-button"
                      onClick={() => window.location.reload()}
                    >
                      Try again
                    </button>
                  </div>
                )}
  
                {!loading && !error && filteredCompanions.length === 0 && (
                  <div className="explore-empty">
                    <div className="explore-empty-icon">🔍</div>
                    <h3>No companions found</h3>
                    <p>Try changing your filters or search criteria.</p>
                    {hasCompanionFilters && (
                      <button
                        type="button"
                        className="clear-filters-button"
                        onClick={clearCompanionFilters}
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                )}
  
                {!loading && !error && filteredCompanions.length > 0 && (
                  <div className="companions-grid">
                    {filteredCompanions.map((companion) => {
                      const price = Number(
                        companion.hourlyRate ?? companion.price ?? 0
                      );
                      const photo =
                        companion.profilePhoto || companion.image || "";
                      const tags = [
                        ...(Array.isArray(companion.interests)
                          ? companion.interests
                          : []),
                        ...(Array.isArray(companion.companionshipStyles)
                          ? companion.companionshipStyles
                          : []),
                      ];
  
                      return (
                        <article
                          className="companion-card"
                          key={companion.id}
                        >
                          <Link
                            href={`/companion/${companion.id}`}
                            className="companion-card-image"
                          >
                            {photo ? (
                              <img
                                src={photo}
                                alt={companion.name || "Companion"}
                              />
                            ) : (
                              <div className="companion-card-placeholder">
                                <span>
                                  {(companion.name || "C")
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              </div>
                            )}
  
                            {companion.verified && (
                              <span className="companion-card-verified">
                                ✓ Verified
                              </span>
                            )}
  
                            {companion.available && (
                              <span className="companion-card-available">
                                Available
                              </span>
                            )}
                          </Link>
  
                          <div className="companion-card-content">
                            <div className="companion-card-name-row">
                              <h3>{companion.name || "Companion"}</h3>
                              {companion.age && (
                                <span>{companion.age}</span>
                              )}
                            </div>
  
                            {companion.city && (
                              <div className="companion-card-city">
                                📍 {companion.city}
                              </div>
                            )}
  
                            {companion.bio && (
                              <p className="companion-card-bio">
                                {companion.bio}
                              </p>
                            )}
  
                            {tags.length > 0 && (
                              <div className="companion-card-tags">
                                {tags.slice(0, 4).map((tag, index) => (
                                  <span key={`${tag}-${index}`}>{tag}</span>
                                ))}
                                {tags.length > 4 && (
                                  <span>+{tags.length - 4}</span>
                                )}
                              </div>
                            )}
  
                            <div className="companion-card-bottom">
                              <div className="companion-card-price">
                                <strong>
                                  ₹{price.toLocaleString("en-IN")}
                                </strong>
                                <span>/ hour</span>
                              </div>
  
                              <Link
                                href={`/companion/${companion.id}`}
                                className="companion-card-button"
                              >
                                View Profile
                              </Link>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </>
            )}
  
            {/* ---------- PARTY STATES ---------- */}
            {mode === "parties" && (
              <>
                {partiesLoading && (
                  <div className="explore-loading">
                    <div className="explore-spinner"></div>
                    <p>Loading parties...</p>
                  </div>
                )}
  
                {!partiesLoading && partiesError && (
                  <div className="explore-error">
                    <div className="explore-error-icon">⚠️</div>
                    <h3>Something went wrong</h3>
                    <p>{partiesError}</p>
                    <button
                      type="button"
                      className="explore-retry-button"
                      onClick={() => window.location.reload()}
                    >
                      Try again
                    </button>
                  </div>
                )}
  
                {!partiesLoading &&
                  !partiesError &&
                  filteredParties.length === 0 && (
                    <div className="explore-empty">
                      <div className="explore-empty-icon">🎉</div>
                      <h3>No parties found</h3>
                      <p>
                        Try changing your filters, or host the first one.
                      </p>
                      <Link
                        href="/parties/create"
                        className="explore-retry-button"
                      >
                        Host a party
                      </Link>
                    </div>
                  )}
  
                {!partiesLoading &&
                  !partiesError &&
                  filteredParties.length > 0 && (
                    <div className="parties-grid">
                      {filteredParties.map((party) => {
                        const left = Math.max(
                          0,
                          party.totalTickets - party.ticketsSold
                        );
                        const soldOut = left === 0;
                        const isFree = party.ticketPrice === 0;
                        const dateObj = new Date(party.date);
  
                        return (
                          <article
                            key={party._id}
                            className="party-card"
                          >
                            <Link
                              href={`/parties/${party._id}`}
                              className="party-card-cover"
                            >
                              {party.coverImage ? (
                                <img
                                  src={party.coverImage}
                                  alt={party.title}
                                />
                              ) : (
                                <div className="party-card-cover-fallback">
                                  <span>{party.category}</span>
                                </div>
                              )}
  
                              <span className="party-card-category">
                                {party.category}
                              </span>
  
                              {soldOut ? (
                                <span className="party-card-badge sold">
                                  Sold out
                                </span>
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
  
                              <h3 className="party-card-title">
                                {party.title}
                              </h3>
  
                              <p className="party-card-venue">
                                📍 {party.venue}, {party.city}
                              </p>
  
                              <div className="party-card-bottom">
                                <div className="party-card-price">
                                  <strong>
                                    {isFree
                                      ? "Free"
                                      : `₹${party.ticketPrice}`}
                                  </strong>
                                  {!isFree && <span>/ ticket</span>}
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
              </>
            )}
          </section>
  
          {/* FINAL CTA */}
          <section className="final-cta">
            <div>
              <span className="section-label">ZQAVA</span>
              <h2>
                {mode === "companions" ? (
                  <>
                    Your personality is
                    <br />
                    worth experiencing.
                  </>
                ) : (
                  <>
                    Got a place?
                    <br />
                    Throw a party.
                  </>
                )}
              </h2>
              <p>
                {mode === "companions"
                  ? "Create your profile. Choose your experiences. Meet new people."
                  : "List your party, set ticket prices, and get paid when people show up."}
              </p>
              <Link
                href={
                  mode === "companions"
                    ? "/become-a-companion"
                    : "/parties/create"
                }
                className="final-cta-button"
              >
                {mode === "companions"
                  ? "Become a companion"
                  : "Host a party"}{" "}
                <span>→</span>
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }