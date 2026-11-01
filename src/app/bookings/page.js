"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import "./bookings.css";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/bookings?type=customer", {
          cache: "no-store",
        });

        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load bookings.");
        }

        setBookings(data.bookings || []);
      } catch (e) {
        setError(e.message || "Unable to load bookings.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  if (loading) {
    return (
      <main className="my-bookings-page">
        <div className="my-bookings-loading">
          <div className="booking-page-spinner" />
          <p>Loading your bookings...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="my-bookings-page">
      <div className="my-bookings-container">
        <div className="my-bookings-head">


          <span className="my-bookings-eyebrow">YOUR BOOKINGS</span>
          <h1>My bookings</h1>
          <p>
            Show the ticket code to your companion when you meet.
          </p>
        </div>

        {error && <div className="my-bookings-error">{error}</div>}

        <div className="my-bookings-filters">
          {[
            ["all", "All"],
            ["pending", "Pending"],
            ["confirmed", "Confirmed"],
            ["checked_in", "Checked in"],
            ["completed", "Completed"],
            ["cancelled", "Cancelled"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`my-bookings-filter ${
                filter === key ? "active" : ""
              }`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="my-bookings-empty">
            <div className="my-bookings-empty-icon">📅</div>
            <h2>No bookings in this view</h2>
            <p>
              Book a companion and your tickets will show up here.
            </p>
            <Link href="/explore" className="my-bookings-primary-btn">
              Explore companions
            </Link>
          </div>
        ) : (
          <div className="my-bookings-list">
            {filtered.map((booking) => {
              const companion = booking.companion || {};
              const name =
                `${companion.firstName || ""} ${
                  companion.lastName || ""
                }`.trim() || "Companion";

              const hasCode = booking.checkinCode && booking.status !== "cancelled";
              const dateObj = new Date(`${booking.date}T00:00:00`);

              return (
                <article key={booking._id} className="my-booking-card">
                  <div className="my-booking-header">
                    <div className="my-booking-person">
                      <div className="my-booking-avatar">
                        {companion.profilePhoto ? (
                          <img
                            src={companion.profilePhoto}
                            alt={name}
                          />
                        ) : (
                          name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div>
                        <h2>{name}</h2>
                        {companion.city && (
                          <span>{companion.city}</span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`my-booking-status ${booking.status}`}
                    >
                      {booking.status === "pending" && "Pending"}
                      {booking.status === "confirmed" && "Confirmed"}
                      {booking.status === "checked_in" && "Checked in"}
                      {booking.status === "completed" && "Completed"}
                      {booking.status === "rejected" && "Declined"}
                      {booking.status === "cancelled" && "Cancelled"}
                    </span>
                  </div>

                  <div className="my-booking-details">
                    <div>
                      <span>DATE</span>
                      <strong>
                        {dateObj.toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </strong>
                    </div>
                    <div>
                      <span>TIME</span>
                      <strong>{booking.time}</strong>
                    </div>
                    <div>
                      <span>DURATION</span>
                      <strong>
                        {booking.duration}{" "}
                        {booking.duration === 1 ? "hour" : "hours"}
                      </strong>
                    </div>
                    <div>
                      <span>TOTAL</span>
                      <strong>
                        ₹{Number(booking.total || 0).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  </div>

                  {hasCode && (
                    <div className="my-booking-ticket">
                      <div className="my-booking-ticket-label">
                        SHOW AT THE DOOR
                      </div>
                      <div className="my-booking-ticket-code">
                        {booking.checkinCode}
                      </div>
                      <p className="my-booking-ticket-hint">
                        Show this code to {name} when you meet. They&apos;ll
                        check you in.
                      </p>
                    </div>
                  )}

                  <div className="my-booking-footer">
                    <span className="my-booking-id">
                      Booking #{booking._id.slice(-8).toUpperCase()}
                    </span>

                    {booking.paymentStatus === "paid" &&
                      booking.status !== "cancelled" &&
                      booking.status !== "rejected" && (
                        <Link
                          href={`/messages/${booking._id}`}
                          className="my-booking-chat-btn"
                        >
                          Open chat
                        </Link>
                      )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}