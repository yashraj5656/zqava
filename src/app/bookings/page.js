"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import "./bookings.css";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");


  



  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/bookings?type=customer",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (response.status === 401) {
          window.location.href = "/signup";
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load bookings."
          );
        }

        setBookings(data.bookings || []);
      } catch (error) {
        console.error("BOOKINGS ERROR:", error);

        setError(
          error.message ||
            "Unable to load your bookings."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);


  /* =========================================
     FILTER BOOKINGS
  ========================================= */

  const filteredBookings = useMemo(() => {
    if (activeFilter === "all") {
      return bookings;
    }

    return bookings.filter(
      (booking) => booking.status === activeFilter
    );
  }, [bookings, activeFilter]);


  /* =========================================
     COUNTS
  ========================================= */

  const counts = useMemo(() => {
    return {
      all: bookings.length,

      pending: bookings.filter(
        (booking) =>
          booking.status === "pending"
      ).length,

      confirmed: bookings.filter(
        (booking) =>
          booking.status === "confirmed"
      ).length,

      completed: bookings.filter(
        (booking) =>
          booking.status === "completed"
      ).length,

      cancelled:
        bookings.filter(
          (booking) =>
            booking.status === "cancelled" ||
            booking.status === "rejected"
        ).length,
    };
  }, [bookings]);


  /* =========================================
     FORMAT DATE
  ========================================= */

  function formatDate(date) {
    if (!date) {
      return "Date not available";
    }

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }


  /* =========================================
     FORMAT STATUS
  ========================================= */

  function getStatusLabel(status) {
    const labels = {
      pending: "Pending",
      confirmed: "Confirmed",
      completed: "Completed",
      cancelled: "Cancelled",
      rejected: "Rejected",
    };

    return labels[status] || status;
  }


  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <main className="my-bookings-page">

        <section className="bookings-loading-page">

          <div className="bookings-spinner" />

          <p>
            Loading your bookings...
          </p>

        </section>

      </main>
    );
  }


  /* =========================================
     PAGE
  ========================================= */

  return (
    <main className="my-bookings-page">

      {/* =====================================
          HERO
      ===================================== */}

      <section className="bookings-hero">

        <div className="bookings-container">

          <div className="bookings-hero-content">

            <span className="bookings-eyebrow">
              YOUR ZQAVA
            </span>

            <h1>
              My bookings
            </h1>

            <p>
              Keep track of your companion experiences,
              upcoming plans, and booking history.
            </p>

          </div>

          <Link
            href="/explore"
            className="find-companion-button"
          >
            Find a companion
            <span>→</span>
          </Link>

        </div>

      </section>


      {/* =====================================
          CONTENT
      ===================================== */}

      <section className="bookings-content">

        <div className="bookings-container">


          {/* Error */}

          {error && (
            <div className="bookings-error">
              {error}
            </div>
          )}


          {/* =================================
              FILTERS
          ================================= */}

          <div className="booking-filters">

            <button
              className={
                activeFilter === "all"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveFilter("all")
              }
            >
              All
              <span>{counts.all}</span>
            </button>


            <button
              className={
                activeFilter === "pending"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveFilter("pending")
              }
            >
              Pending
              <span>{counts.pending}</span>
            </button>


            <button
              className={
                activeFilter === "confirmed"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveFilter("confirmed")
              }
            >
              Upcoming
              <span>{counts.confirmed}</span>
            </button>


            <button
              className={
                activeFilter === "completed"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveFilter("completed")
              }
            >
              Completed
              <span>{counts.completed}</span>
            </button>


            <button
              className={
                activeFilter === "cancelled"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveFilter("cancelled")
              }
            >
              Cancelled
              <span>{counts.cancelled}</span>
            </button>

          </div>


          {/* =================================
              BOOKINGS
          ================================= */}

          {filteredBookings.length === 0 ? (

            <div className="no-bookings">

              <div className="no-bookings-icon">
                ♡
              </div>

              <h2>
                {bookings.length === 0
                  ? "No bookings yet"
                  : "No bookings found"}
              </h2>

              <p>
                {bookings.length === 0
                  ? "Your bookings will appear here once you book a companion."
                  : "There are no bookings in this category."}
              </p>

              {bookings.length === 0 && (
                <Link
                  href="/explore"
                  className="empty-explore-button"
                >
                  Explore companions
                  <span>→</span>
                </Link>
              )}

            </div>

          ) : (

            <div className="bookings-list">

              {filteredBookings.map(
                (booking) => {

                  const companion =
                    booking.companion;

                  const companionProfile =
                    companion?.companionProfile;

                  const companionName =
                    companionProfile?.displayName ||
                    `${companion?.firstName || ""} ${
                      companion?.lastName || ""
                    }`.trim() ||
                    "Companion";

                  const companionImage =
                    companionProfile?.profilePhoto ||
                    "";

                  return (
                    <article
                      className="customer-booking-card"
                      key={booking._id}
                    >

                      {/* Companion */}

                      <div className="customer-booking-top">

                        <div className="customer-companion">

                          {companionImage ? (
                            <img
                              src={companionImage}
                              alt={companionName}
                            />
                          ) : (
                            <div className="customer-companion-avatar">
                              {companionName
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}

                          <div>

                            <span>
                              COMPANION
                            </span>

                            <h2>
                              {companionName}
                            </h2>

                          </div>

                        </div>


                        <span
                          className={`customer-booking-status ${booking.status}`}
                        >
                          {getStatusLabel(
                            booking.status
                          )}
                        </span>

                      </div>


                      {/* Details */}

                      <div className="customer-booking-details">

                        <div>
                          <span>
                            DATE
                          </span>

                          <strong>
                            {formatDate(
                              booking.date
                            )}
                          </strong>
                        </div>


                        <div>
                          <span>
                            TIME
                          </span>

                          <strong>
                            {booking.time}
                          </strong>
                        </div>


                        <div>
                          <span>
                            DURATION
                          </span>

                          <strong>
                            {booking.duration}{" "}
                            {booking.duration === 1
                              ? "hour"
                              : "hours"}
                          </strong>
                        </div>


                        <div>
                          <span>
                            TOTAL
                          </span>

                          <strong>
                            ₹{booking.total}
                          </strong>
                        </div>

                      </div>


                      {/* Footer */}

                      <div className="customer-booking-footer">

                        <div>

                          <span className="booking-reference">
                            Booking ID
                          </span>

                          <strong>
                            #
                            {String(
                              booking._id
                            ).slice(-8)}
                          </strong>

                        </div>


                        <div className="customer-booking-actions">

                        {booking.paymentStatus === "paid" &&
  booking.status !== "cancelled" &&
  booking.status !== "rejected" && (
    <Link
      href={`/messages/${booking._id}`}
      className="booking-message-button"
    >
      Message Companion
    </Link>
  )}

                        </div>

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          )}

        </div>

      </section>

    </main>
  );
}