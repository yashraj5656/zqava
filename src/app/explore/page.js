"use client";

import { useRouter } from "next/navigation";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import "./explore.css";

export default function ExplorePage() {
  const [companions, setCompanions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [activity, setActivity] = useState("");
  const [maxPrice, setMaxPrice] = useState(40000);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sort, setSort] = useState("default");


  const router = useRouter();
const [checkingAuth, setCheckingAuth] = useState(true);

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
          throw new Error(
            data.message || "Failed to load companions."
          );
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

  /*
   * Build unique cities from MongoDB data
   */
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

  /*
   * Build unique activities/interests
   */
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

      return [
        ...interests,
        ...styles,
        ...legacyActivities,
      ];
    });

    return [...new Set(allActivities.filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [companions]);

  /*
   * Filter + sort
   */
  const filteredCompanions = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    const filtered = companions.filter((companion) => {
      const name = String(companion.name || "").toLowerCase();
      const companionCity = String(
        companion.city || ""
      ).toLowerCase();

      const bio = String(
        companion.bio || ""
      ).toLowerCase();

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

      /*
       * Search
       */
      if (searchValue) {
        const matchesSearch =
          name.includes(searchValue) ||
          companionCity.includes(searchValue) ||
          bio.includes(searchValue) ||
          allActivities.some((item) =>
            item.includes(searchValue)
          );

        if (!matchesSearch) {
          return false;
        }
      }

      /*
       * City
       */
      if (
        city &&
        String(companion.city || "").toLowerCase() !==
          city.toLowerCase()
      ) {
        return false;
      }

      /*
       * Activity
       */
      if (activity) {
        const selectedActivity = activity.toLowerCase();

        const hasActivity = allActivities.some(
          (item) => item === selectedActivity
        );

        if (!hasActivity) {
          return false;
        }
      }

      /*
       * Maximum price
       */
      const price = Number(
        companion.hourlyRate ?? companion.price ?? 0
      );

      if (price > Number(maxPrice)) {
        return false;
      }

      /*
       * Available only
       */
      if (onlyAvailable && companion.available !== true) {
        return false;
      }

      /*
       * Verified only
       */
      if (onlyVerified && companion.verified !== true) {
        return false;
      }

      return true;
    });

    /*
     * Sorting
     */
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
        String(a.name || "").localeCompare(
          String(b.name || "")
        )
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

  /*
   * Clear filters
   */
  function clearFilters() {
    setSearch("");
    setCity("");
    setActivity("");
    setMaxPrice(100000);
    setOnlyAvailable(false);
    setOnlyVerified(false);
    setSort("default");
  }

  const hasFilters =
    search ||
    city ||
    activity ||
    Number(maxPrice) < 100000 ||
    onlyAvailable ||
    onlyVerified ||
    sort !== "default";


    if (checkingAuth) {
      return (
        <main className="explore-page">
          <div className="explore-loading">
            Checking login...
          </div>
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
              FIND YOUR COMPANION
            </span>

            <h1>Explore Companions</h1>

            <p>
              Discover people who match your interests,
              personality, and plans.
            </p>
          </div>
        </section>

        {/* FILTERS */}
        
{/* FILTERS */}
<section className="explore-filters">

  {/* FILTER HEADER */}
  <div className="filters-top">
    <div>
      <h2>Find your match</h2>
      {/*<p>Use the filters to narrow down your options.</p>*/}
    </div>

    {hasFilters && (
      <button
        type="button"
        className="clear-filters"
        onClick={clearFilters}
      >
        Clear filters
      </button>
    )}
  </div>

  {/* SEARCH - ALWAYS VISIBLE */}
  <div className="filter-group filter-search">
    {/*<label htmlFor="search">Search</label>*/}

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

  {/* MOBILE FILTER TOGGLE */}
  <button
    type="button"
    className="mobile-filter-toggle"
    onClick={() =>
      setShowMobileFilters((prev) => !prev)
    }
    aria-expanded={showMobileFilters}
    aria-controls="advanced-filters"
  >
    <span>
      <span className="filter-toggle-icon">☷</span>
      Filters & Sort
    </span>

    <span className="filter-toggle-right">
      {showMobileFilters ? "Hide" : "Show"}
      <span className={showMobileFilters ? "toggle-arrow open" : "toggle-arrow"}>
        ▼
      </span>
    </span>
  </button>

  {/* ADVANCED FILTERS */}
  <div
    id="advanced-filters"
    className={`advanced-filters ${
      showMobileFilters ? "mobile-filters-open" : ""
    }`}
  >
    <br></br><div className="filters-grid">

      {/* CITY */}
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

      {/* ACTIVITY */}
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

      {/* SORT */}
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

    {/* PRICE */}
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
        onChange={(e) =>
          setMaxPrice(Number(e.target.value))
        }
      />

      <div className="price-range-labels">
        <span>₹0</span>
        <span>₹1,00,000+</span>
      </div>
    </div>

    {/* TOGGLES */}
    <div className="filter-options">

      <label className="filter-checkbox">
        <input
          type="checkbox"
          checked={onlyAvailable}
          onChange={(e) =>
            setOnlyAvailable(e.target.checked)
          }
        />

        <span className="custom-checkbox"></span>
        <span>Available now</span>
      </label>

      <label className="filter-checkbox">
        <input
          type="checkbox"
          checked={onlyVerified}
          onChange={(e) =>
            setOnlyVerified(e.target.checked)
          }
        />

        <span className="custom-checkbox"></span>
        <span>Verified companions</span>
      </label>

    </div>
  </div>

</section>


        {/* RESULTS */}
        <section className="explore-results">

          <div className="explore-results-header">
            <div>
              <h2>
                Companions
              </h2>

              <p>
                {loading
                  ? "Finding companions..."
                  : `${filteredCompanions.length} ${
                      filteredCompanions.length === 1
                        ? "companion"
                        : "companions"
                    } found`}
              </p>
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="explore-loading">
              <div className="explore-spinner"></div>
              <p>Loading companions...</p>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="explore-error">
              <div className="explore-error-icon">
                ⚠️
              </div>

              <h3>
                Something went wrong
              </h3>

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

          {/* EMPTY */}
          {!loading &&
            !error &&
            filteredCompanions.length === 0 && (
              <div className="explore-empty">
                <div className="explore-empty-icon">
                  🔍
                </div>

                <h3>
                  No companions found
                </h3>

                <p>
                  Try changing your filters or search
                  criteria.
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    className="clear-filters-button"
                    onClick={clearFilters}
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

          {/* GRID */}
          {!loading &&
            !error &&
            filteredCompanions.length > 0 && (
              <div className="companions-grid">

                {filteredCompanions.map(
                  (companion) => {
                    const price = Number(
                      companion.hourlyRate ??
                        companion.price ??
                        0
                    );

                    const photo =
                      companion.profilePhoto ||
                      companion.image ||
                      "";

                    const tags = [
                      ...(Array.isArray(
                        companion.interests
                      )
                        ? companion.interests
                        : []),

                      ...(Array.isArray(
                        companion.companionshipStyles
                      )
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
                              alt={
                                companion.name ||
                                "Companion"
                              }
                            />
                          ) : (
                            <div className="companion-card-placeholder">
                              <span>
                                {(companion.name ||
                                  "C"
                                )
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
                            <h3>
                              {companion.name ||
                                "Companion"}
                            </h3>

                            {companion.age && (
                              <span>
                                {companion.age}
                              </span>
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
                              {tags
                                .slice(0, 4)
                                .map(
                                  (tag, index) => (
                                    <span
                                      key={`${tag}-${index}`}
                                    >
                                      {tag}
                                    </span>
                                  )
                                )}

                              {tags.length > 4 && (
                                <span>
                                  +{tags.length - 4}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="companion-card-bottom">

                            <div className="companion-card-price">
                              <strong>
                                ₹
                                {price.toLocaleString(
                                  "en-IN"
                                )}
                              </strong>

                              <span>
                                / hour
                              </span>
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
                  }
                )}

              </div>
            )}

        </section>



      </div>
    </main>
  );
}