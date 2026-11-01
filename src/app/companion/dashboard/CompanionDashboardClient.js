"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

/* =========================================================
   HELPERS
========================================================= */

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function shortDate(date) {
  if (!date) return "—";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function customerName(customer) {
  if (!customer) return "Guest";

  const name = `${customer.firstName || ""} ${
    customer.lastName || ""
  }`.trim();

  return name || "Guest";
}

function hasBookingEnded(booking) {
  if (!booking?.date || !booking?.time) return false;

  const start = new Date(`${booking.date}T${booking.time}`);
  if (Number.isNaN(start.getTime())) return false;

  const durationHours = Number(booking.duration) || 1;
  const end = new Date(
    start.getTime() + durationHours * 60 * 60 * 1000
  );

  return Date.now() >= end.getTime();
}

/* =========================================================
   COMPONENT
========================================================= */

export default function CompanionDashboardClient() {
  const [tab, setTab] = useState("bookings"); // 'bookings' | 'earnings'

  /* ---------- Bookings state ---------- */
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [bookingFilter, setBookingFilter] = useState("all");

  /* ---------- Earnings state ---------- */
  const [earnings, setEarnings] = useState([]);
  const [summary, setSummary] = useState({
    totalEarnings: 0,
    paidToBank: 0,
    pendingPayout: 0,
    monthlyEarnings: 0,
    totalBookings: 0,
  });
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [earningsError, setEarningsError] = useState("");
  const [earningsFilter, setEarningsFilter] = useState("all");

  /* =========================================================
     LOADERS
  ========================================================= */
  async function loadBookings() {
    try {
      setBookingsLoading(true);
      setBookingsError("");

      const response = await fetch("/api/bookings?type=companion");

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load bookings.");
      }

      setBookings(data.bookings || []);
    } catch (error) {
      console.error(error);
      setBookingsError(
        error.message || "Unable to load booking requests."
      );
    } finally {
      setBookingsLoading(false);
    }
  }

  async function loadEarnings() {
    try {
      setEarningsLoading(true);
      setEarningsError("");

      const response = await fetch("/api/companion-earnings");

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load earnings.");
      }

      setSummary(data.summary || {});
      setEarnings(data.earnings || []);
    } catch (error) {
      console.error(error);
      setEarningsError(
        error.message || "Unable to load earnings."
      );
    } finally {
      setEarningsLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
    loadEarnings();
  }, []);

  async function refreshAll() {
    await Promise.all([loadBookings(), loadEarnings()]);
  }

  /* =========================================================
     BOOKING ACTIONS
  ========================================================= */
  async function updateBooking(bookingId, status) {
    try {
      setActionLoading(`${bookingId}-${status}`);
      setBookingsError("");
  
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
  
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
  
      const data = await safeJson(response);
  
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update booking.");
      }
  
      setBookings((current) =>
        current.map((b) =>
          b._id === bookingId ? { ...b, status: data.booking.status } : b
        )
      );
  
      if (status === "completed" || status === "checked_in") {
        loadEarnings();
      }
    } catch (error) {
      console.error(error);
      setBookingsError(error.message || "Unable to update booking.");
    } finally {
      setActionLoading(null);
    }
  }

  /* =========================================================
     DERIVED
  ========================================================= */
  const filteredBookings = useMemo(() => {
    if (bookingFilter === "all") return bookings;
    return bookings.filter((b) => b.status === bookingFilter);
  }, [bookings, bookingFilter]);

  const pendingCount = bookings.filter(
    (b) => b.status === "pending"
  ).length;
  const confirmedCount = bookings.filter(
    (b) => b.status === "confirmed"
  ).length;
  const checkedInCount = bookings.filter(
    (b) => b.status === "checked_in"
  ).length;
  const completedCount = bookings.filter(
    (b) => b.status === "completed"
  ).length;

  const filteredEarnings = useMemo(() => {
    if (earningsFilter === "all") return earnings;
    if (earningsFilter === "paid")
      return earnings.filter((e) => e.payoutPaid === true);
    return earnings.filter((e) => e.payoutPaid !== true);
  }, [earnings, earningsFilter]);

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="companion-dashboard-container">
      {/* HEADER */}
      <header className="companion-dashboard-head">
        <div>


          <span className="dashboard-eyebrow">COMPANION DASHBOARD</span>

          <h1>Your dashboard</h1>

          <p>
            Manage booking requests, track earnings and stay on top of
            your sessions — all in one place.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-refresh"
          onClick={refreshAll}
          disabled={bookingsLoading || earningsLoading}
        >
          ↻ Refresh
        </button>
      </header>

      {/* TOP STATS — unified from both pages */}
      <div className="dashboard-stats-grid">
        <div className="dashboard-stat-card">
          <span className="dashboard-stat-icon">🎟️</span>
          <div>
            <strong>{bookings.length}</strong>
            <small>Total bookings</small>
          </div>
        </div>

        <div className="dashboard-stat-card pending">
          <span className="dashboard-stat-icon">⏳</span>
          <div>
            <strong>{pendingCount}</strong>
            <small>Pending requests</small>
          </div>
        </div>

        <div className="dashboard-stat-card confirmed">
          <span className="dashboard-stat-icon">✅</span>
          <div>
            <strong>{confirmedCount}</strong>
            <small>Confirmed</small>
          </div>
        </div>

        <div className="dashboard-stat-card earnings">
          <span className="dashboard-stat-icon">💰</span>
          <div>
            <strong>{money(summary.totalEarnings)}</strong>
            <small>Total earnings</small>
          </div>
        </div>
      </div>

      {/* PAYOUT BAR */}
      <div className="dashboard-payout-bar">
        <div className="dashboard-payout-left">
          <span className="dashboard-payout-icon">🏦</span>
          <div>
            <strong>{money(summary.pendingPayout)}</strong>
            <small>Pending payout</small>
          </div>
        </div>

        <div className="dashboard-payout-right">
          <span className="dashboard-payout-paid">
            {money(summary.paidToBank)} paid to bank
          </span>

          <Link
            href="/companion/bank-details"
            className="dashboard-payout-link"
          >
            Manage payouts →
          </Link>
        </div>
      </div>

      {/* MAIN TABS */}
      <div className="dashboard-tabs">
        <button
          type="button"
          className={`dashboard-tab ${
            tab === "bookings" ? "active" : ""
          }`}
          onClick={() => setTab("bookings")}
        >
          Bookings
          {pendingCount > 0 && (
            <span className="dashboard-tab-badge">{pendingCount}</span>
          )}
        </button>

        <button
          type="button"
          className={`dashboard-tab ${
            tab === "earnings" ? "active" : ""
          }`}
          onClick={() => setTab("earnings")}
        >
          Earnings
        </button>
      </div>

      {/* =========================================================
          BOOKINGS TAB
      ========================================================= */}
      {tab === "bookings" && (
        <section className="dashboard-tab-panel">
          {bookingsError && (
            <div className="dashboard-error">{bookingsError}</div>
          )}

          {/* FILTER CHIPS */}
          <div className="dashboard-filters">
            {[
              ["all", "All"],
              ["pending", "Pending"],
              ["confirmed", "Confirmed"],
              ["checked_in", "Checked in"],
              ["completed", "Completed"],
              ["rejected", "Declined"],
              ["cancelled", "Cancelled"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`dashboard-filter ${
                  bookingFilter === key ? "active" : ""
                }`}
                onClick={() => setBookingFilter(key)}
              >
                {label}
                {key === "pending" && pendingCount > 0 && (
                  <span>{pendingCount}</span>
                )}
              </button>
            ))}
          </div>

          {bookingsLoading ? (
            <div className="dashboard-loading">
              <div className="dashboard-spinner" />
              <p>Loading booking requests...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="dashboard-empty">
              <div className="dashboard-empty-icon">📅</div>
              <h2>
                {bookingFilter === "all"
                  ? "No booking requests yet"
                  : `No ${bookingFilter} bookings`}
              </h2>
              <p>
                {bookingFilter === "all"
                  ? "When someone books you, their request will appear here."
                  : "There are no bookings in this category."}
              </p>
            </div>
          ) : (
            <div className="dashboard-booking-list">
              {filteredBookings.map((booking) => {
                const customer = booking.customer;
                const name = customerName(customer);
                const image = customer?.profilePhoto || "";

                const isPending = booking.status === "pending";
                const isConfirmed = booking.status === "confirmed";
                const bookingEnded =
                  isConfirmed && hasBookingEnded(booking);

                return (
                  <article
                    key={booking._id}
                    className="dashboard-booking-card"
                  >
                    <div className="booking-card-top">
                      <div className="booking-customer">
                        <div className="booking-avatar">
                          {image ? (
                            <img src={image} alt={name} />
                          ) : (
                            name.charAt(0).toUpperCase()
                          )}
                        </div>

                        <div>
                          <h2>{name}</h2>
                          {customer?.city && (
                            <span>{customer.city}</span>
                          )}
                          {customer?.email && (
                            <small>{customer.email}</small>
                          )}
                        </div>
                      </div>

                      <span className={`booking-status ${booking.status}`}>
  {booking.status === "pending" && "Pending"}
  {booking.status === "confirmed" && "Confirmed"}
  {booking.status === "checked_in" && "Checked in"}
  {booking.status === "completed" && "Completed"}
  {booking.status === "rejected" && "Declined"}
  {booking.status === "cancelled" && "Cancelled"}
</span>
                    </div>

                    <div className="booking-details-grid">
                      <div>
                        <span>DATE</span>
                        <strong>{formatDate(booking.date)}</strong>
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
                        <span>EARNINGS</span>
                        <strong className="booking-earnings">
                          {money(
                            booking.subtotal || booking.total || 0
                          )}
                        </strong>
                      </div>
                    </div>

                    {booking.message && (
                      <div className="booking-message">
                        <span>Message from customer</span>
                        <p>&ldquo;{booking.message}&rdquo;</p>
                      </div>
                    )}

                    <div className="booking-card-footer">
                      <span className="booking-id">
                        Booking #{booking._id.slice(-8).toUpperCase()}
                      </span>

                      <div className="booking-actions">
                        {booking.paymentStatus === "paid" &&
                          booking.status !== "cancelled" &&
                          booking.status !== "rejected" && (
                            <Link
                              href={`/companion/messages/${booking._id}`}
                              className="booking-btn ghost"
                            >
                              Open Chat
                            </Link>
                          )}

                        {isPending && (
                          <>
                            <button
                              type="button"
                              className="booking-btn danger"
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
                              className="booking-btn primary"
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


{/* CONFIRMED → go to the check-in page */}
{isConfirmed && (
  <Link
    href={`/companion/checkin?bookingId=${booking._id}`}
    className="booking-btn primary"
  >
    Check in guest
  </Link>
)}

{/* CHECKED-IN → COMPLETE */}
{booking.status === "checked_in" && (
  <button
    type="button"
    className="booking-btn primary"
    disabled={
      actionLoading === `${booking._id}-completed`
    }
    onClick={() =>
      updateBooking(booking._id, "completed")
    }
  >
    {actionLoading === `${booking._id}-completed`
      ? "Completing..."
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
        </section>
      )}

      {/* =========================================================
          EARNINGS TAB
      ========================================================= */}
      {tab === "earnings" && (
        <section className="dashboard-tab-panel">
          {earningsError && (
            <div className="dashboard-error">{earningsError}</div>
          )}

          {/* STATS ROW */}
          <div className="earnings-summary-grid">
            <div className="earnings-summary-card main">
              <span>Total earnings</span>
              <strong>{money(summary.totalEarnings)}</strong>
              <small>
                From {summary.totalBookings || 0}{" "}
                {summary.totalBookings === 1 ? "booking" : "bookings"}
              </small>
            </div>

            <div className="earnings-summary-card">
              <span>Paid to bank</span>
              <strong className="green">
                {money(summary.paidToBank)}
              </strong>
              <small>Successfully paid out</small>
            </div>

            <div className="earnings-summary-card">
              <span>Pending payout</span>
              <strong className="amber">
                {money(summary.pendingPayout)}
              </strong>
              <small>Awaiting payment</small>
            </div>

            <div className="earnings-summary-card">
              <span>This month</span>
              <strong>{money(summary.monthlyEarnings)}</strong>
              <small>Current month</small>
            </div>
          </div>

          {/* FILTERS */}
          <div className="dashboard-filters">
            {[
              ["all", "All"],
              ["paid", "Paid"],
              ["pending", "Pending"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`dashboard-filter ${
                  earningsFilter === key ? "active" : ""
                }`}
                onClick={() => setEarningsFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {earningsLoading ? (
            <div className="dashboard-loading">
              <div className="dashboard-spinner" />
              <p>Loading earnings...</p>
            </div>
          ) : filteredEarnings.length === 0 ? (
            <div className="dashboard-empty">
              <div className="dashboard-empty-icon">₹</div>
              <h2>No earnings yet</h2>
              <p>
                Once you complete bookings, your earnings will appear here.
              </p>
              <button
                type="button"
                className="dashboard-link-btn"
                onClick={() => setTab("bookings")}
              >
                View booking requests →
              </button>
            </div>
          ) : (
            <div className="earnings-table">
              <div className="earnings-table-head">
                <span>Customer</span>
                <span>Session</span>
                <span>Amount</span>
                <span>Payout</span>
              </div>

              {filteredEarnings.map((item) => {
                const name = customerName(item.customer);
                const isPaid = item.payoutPaid === true;

                return (
                  <div className="earnings-row" key={item.id}>
                    <div className="earning-customer">
                      <div className="earning-avatar">
                        {item.customer?.profilePhoto ? (
                          <img
                            src={item.customer.profilePhoto}
                            alt={name}
                          />
                        ) : (
                          name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <strong>{name}</strong>
                        {item.customer?.city && (
                          <small>{item.customer.city}</small>
                        )}
                      </div>
                    </div>

                    <div className="earning-session">
                      <strong>{shortDate(item.date)}</strong>
                      <small>
                        {item.time} · {item.duration}{" "}
                        {item.duration === 1 ? "hour" : "hours"}
                      </small>
                    </div>

                    <div className="earning-amount">
                      <strong>{money(item.amount)}</strong>
                      <small>Session earnings</small>
                    </div>

                    <div>
                      <span
                        className={`payout-status ${
                          isPaid ? "paid" : "pending"
                        }`}
                      >
                        {isPaid ? "Paid to bank" : "Pending"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}