"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import "./companion-bookings.css";

export default function CompanionBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/bookings?type=companion"
      );

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load bookings."
        );
      }

      setBookings(data.bookings || []);
    } catch (error) {
      console.error(error);
      setError(
        error.message || "Unable to load booking requests."
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateBooking(bookingId, status) {
    try {
      setActionLoading(`${bookingId}-${status}`);
      setError("");

      const response = await fetch(
        `/api/bookings/${bookingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update booking."
        );
      }

      setBookings((current) =>
        current.map((booking) =>
          booking._id === bookingId
            ? {
                ...booking,
                status: data.booking.status,
              }
            : booking
        )
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message || "Unable to update booking."
      );
    } finally {
      setActionLoading(null);
    }
  }

  const filteredBookings = useMemo(() => {
    if (filter === "all") {
      return bookings;
    }

    return bookings.filter(
      (booking) => booking.status === filter
    );
  }, [bookings, filter]);

  const pendingCount = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const confirmedCount = bookings.filter(
    (booking) => booking.status === "confirmed"
  ).length;

  const completedCount = bookings.filter(
    (booking) => booking.status === "completed"
  ).length;

  function formatDate(date) {
    if (!date) return "—";

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function customerName(customer) {
    if (!customer) return "Guest";

    const name =
      `${customer.firstName || ""} ${
        customer.lastName || ""
      }`.trim();

    return name || "Guest";
  }

  return (
    <main className="companion-bookings-page">
      <div className="companion-bookings-container">

        <div className="companion-bookings-page-top">
          <div>
            <Link
              href="/companion-profile"
              className="back-to-profile"
            >
              ← Back to profile
            </Link>

            <span className="page-eyebrow">
              COMPANION DASHBOARD
            </span>

            <h1>Booking Requests</h1>

            <p>
              Review people who have booked you and manage
              your upcoming sessions.
            </p>
          </div>

          <button
            type="button"
            className="refresh-bookings"
            onClick={loadBookings}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        <div className="booking-stats">
          <div className="booking-stat">
            <span>Total</span>
            <strong>{bookings.length}</strong>
          </div>

          <div className="booking-stat pending-stat">
            <span>Pending</span>
            <strong>{pendingCount}</strong>
          </div>

          <div className="booking-stat confirmed-stat">
            <span>Confirmed</span>
            <strong>{confirmedCount}</strong>
          </div>

          <div className="booking-stat completed-stat">
            <span>Completed</span>
            <strong>{completedCount}</strong>
          </div>
        </div>

        <div className="booking-filters">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>

          <button
            className={
              filter === "pending" ? "active" : ""
            }
            onClick={() => setFilter("pending")}
          >
            Pending
            {pendingCount > 0 && (
              <span>{pendingCount}</span>
            )}
          </button>

          <button
            className={
              filter === "confirmed" ? "active" : ""
            }
            onClick={() => setFilter("confirmed")}
          >
            Confirmed
          </button>

          <button
            className={
              filter === "completed" ? "active" : ""
            }
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>

          <button
            className={
              filter === "rejected" ? "active" : ""
            }
            onClick={() => setFilter("rejected")}
          >
            Declined
          </button>

          <button
            className={
              filter === "cancelled" ? "active" : ""
            }
            onClick={() => setFilter("cancelled")}
          >
            Cancelled
          </button>
        </div>

        {error && (
          <div className="companion-bookings-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="companion-bookings-loading">
            <div className="booking-page-spinner" />
            <p>Loading booking requests...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon">
              📅
            </div>

            <h2>
              {filter === "all"
                ? "No booking requests yet"
                : `No ${filter} bookings`}
            </h2>

            <p>
              {filter === "all"
                ? "When someone books you, their request will appear here."
                : "There are no bookings in this category."}
            </p>
          </div>
        ) : (
          <div className="companion-booking-list">
            {filteredBookings.map((booking) => {
              const customer = booking.customer;
              const name = customerName(customer);

              const image =
                customer?.profilePhoto || "";

              const isPending =
                booking.status === "pending";

              const isConfirmed =
                booking.status === "confirmed";

              return (
                <article
                  className="companion-request-card"
                  key={booking._id}
                >
                  <div className="request-card-header">

                    <div className="request-customer">
                      <div className="request-avatar">
                        {image ? (
                          <img
                            src={image}
                            alt={name}
                          />
                        ) : (
                          name
                            .charAt(0)
                            .toUpperCase()
                        )}
                      </div>

                      <div>
                        <h2>{name}</h2>

                        {customer?.city && (
                          <span>
                            {customer.city}
                          </span>
                        )}

                        {customer?.email && (
                          <small>
                            {customer.email}
                          </small>
                        )}
                      </div>
                    </div>

                    <span
                      className={`request-status ${booking.status}`}
                    >
                      {booking.status === "pending" &&
                        "Pending"}

                      {booking.status === "confirmed" &&
                        "Confirmed"}

                      {booking.status === "completed" &&
                        "Completed"}

                      {booking.status === "rejected" &&
                        "Declined"}

                      {booking.status === "cancelled" &&
                        "Cancelled"}
                    </span>
                  </div>

                  <div className="request-details">

                    <div>
                      <span>DATE</span>
                      <strong>
                        {formatDate(booking.date)}
                      </strong>
                    </div>

                    <div>
                      <span>TIME</span>
                      <strong>
                        {booking.time}
                      </strong>
                    </div>

                    <div>
                      <span>DURATION</span>
                      <strong>
                        {booking.duration}{" "}
                        {booking.duration === 1
                          ? "hour"
                          : "hours"}
                      </strong>
                    </div>

                    <div>
                      <span>EARNINGS</span>
                      <strong className="earning">
                        ₹
                        {Number(
                          booking.subtotal ||
                            booking.total ||
                            0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>

                  </div>

                  {booking.message && (
                    <div className="customer-message">
                      <span>
                        Message from customer
                      </span>

                      <p>
                        “{booking.message}”
                      </p>
                    </div>
                  )}

<div className="request-footer">

  <span className="request-id">
    Booking #
    {booking._id
      .slice(-8)
      .toUpperCase()}
  </span>

  <div className="request-actions">

    {/* MESSAGE CUSTOMER */}
    {booking.paymentStatus === "paid" &&
      booking.status !== "cancelled" &&
      booking.status !== "rejected" && (
        <Link
          href={`/companion/messages/${booking._id}`}
          className="companion-message-button"
        >
           Open Chat
        </Link>
      )}

    {/* PENDING ACTIONS */}
    {isPending && (
      <>
        <button
          type="button"
          className="reject-button"
          disabled={
            actionLoading ===
            `${booking._id}-rejected`
          }
          onClick={() =>
            updateBooking(
              booking._id,
              "rejected"
            )
          }
        >
          {actionLoading ===
          `${booking._id}-rejected`
            ? "Rejecting..."
            : "Reject"}
        </button>

        <button
          type="button"
          className="accept-button"
          disabled={
            actionLoading ===
            `${booking._id}-confirmed`
          }
          onClick={() =>
            updateBooking(
              booking._id,
              "confirmed"
            )
          }
        >
          {actionLoading ===
          `${booking._id}-confirmed`
            ? "Accepting..."
            : "Accept booking"}
        </button>
      </>
    )}

    {/* CONFIRMED ACTION */}
    {isConfirmed && (
      <button
        type="button"
        className="complete-button"
        disabled={
          actionLoading ===
          `${booking._id}-completed`
        }
        onClick={() =>
          updateBooking(
            booking._id,
            "completed"
          )
        }
      >
        {actionLoading ===
        `${booking._id}-completed`
          ? "Updating..."
          : "Mark as completed"}
      </button>
    )}

  </div>

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