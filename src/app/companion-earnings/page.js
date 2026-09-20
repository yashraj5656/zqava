"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import "./companion-earnings.css";

export default function CompanionEarningsPage() {
  const [summary, setSummary] = useState({
    totalEarnings: 0,
    completedEarnings: 0,
    paidToBank: 0,
    pendingPayout: 0,
    monthlyEarnings: 0,
    totalBookings: 0,
    completedBookings: 0,
  });

  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadEarnings();
  }, []);

  async function loadEarnings() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/companion-earnings"
      );

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load earnings."
        );
      }

      setSummary(data.summary || {});
      setEarnings(data.earnings || []);
    } catch (error) {
      console.error(error);

      setError(
        error.message || "Unable to load earnings."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredEarnings = useMemo(() => {
    if (filter === "all") {
      return earnings;
    }

    if (filter === "paid") {
      return earnings.filter(
        (item) => item.payoutPaid === true
      );
    }

    if (filter === "pending") {
      return earnings.filter(
        (item) => item.payoutPaid !== true
      );
    }

    return earnings;
  }, [earnings, filter]);

  function money(value) {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN"
    )}`;
  }

  function formatDate(date) {
    if (!date) return "—";

    const parsed = new Date(
      `${date}T00:00:00`
    );

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function customerName(customer) {
    if (!customer) return "Guest";

    return (
      `${customer.firstName || ""} ${
        customer.lastName || ""
      }`.trim() || "Guest"
    );
  }

  return (
    <main className="companion-earnings-page">
      <div className="companion-earnings-container">

        {/* HEADER */}

        <header className="earnings-header">
          <div>
            <Link
              href="/companion-profile"
              className="earnings-back"
            >
              ← Back to profile
            </Link>

            <span className="earnings-eyebrow">
              COMPANION DASHBOARD
            </span>

            <h1>Your Earnings</h1>

            <p>
              Track your earnings, completed sessions,
              and payments sent to your bank account.
            </p>
          </div>

          <button
            type="button"
            className="earnings-refresh"
            onClick={loadEarnings}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </header>

        {/* ERROR */}

        {error && (
          <div className="earnings-error">
            {error}
          </div>
        )}

        {/* MAIN STATS */}

        <section className="earnings-overview">

          <div className="earnings-main-card">
            <span>Total earnings</span>

            <strong>
              {money(summary.totalEarnings)}
            </strong>

            <p>
              From {summary.totalBookings || 0}{" "}
              {summary.totalBookings === 1
                ? "booking"
                : "bookings"}
            </p>
          </div>

          <div className="earnings-stat-card">
            <span>Paid to bank</span>

            <strong className="paid">
              {money(summary.paidToBank)}
            </strong>

            <small>
              Successfully paid out
            </small>
          </div>

          <div className="earnings-stat-card">
            <span>Pending payout</span>

            <strong className="pending">
              {money(summary.pendingPayout)}
            </strong>

            <small>
              Awaiting payment
            </small>
          </div>

          <div className="earnings-stat-card">
            <span>This month</span>

            <strong>
              {money(summary.monthlyEarnings)}
            </strong>

            <small>
              Current month
            </small>
          </div>

        </section>

        {/* PAYOUT INFO */}

        <section className="payout-banner">

          <div className="payout-banner-icon">
            ₹
          </div>

          <div>
            <h2>Bank payouts</h2>

            <p>
              Completed sessions become eligible for
              payout. Once a payment is transferred,
              it will appear in your paid-to-bank total.
            </p>
          </div>

          <Link
            href="/companion/bank-details"
            className="payout-profile-link"
          >
            Manage payouts →
          </Link>

        </section>

        {/* TRANSACTIONS */}

        <section className="earnings-history">

          <div className="history-header">

            <div>
              <span className="history-eyebrow">
                TRANSACTIONS
              </span>

              <h2>Earnings history</h2>
            </div>

            <div className="earnings-filters">

              <button
                className={
                  filter === "all" ? "active" : ""
                }
                onClick={() => setFilter("all")}
              >
                All
              </button>

              <button
                className={
                  filter === "paid" ? "active" : ""
                }
                onClick={() => setFilter("paid")}
              >
                Paid
              </button>

              <button
                className={
                  filter === "pending" ? "active" : ""
                }
                onClick={() => setFilter("pending")}
              >
                Pending
              </button>

            </div>

          </div>

          {loading ? (
            <div className="earnings-loading">
              <div className="earnings-spinner" />
              <p>Loading earnings...</p>
            </div>
          ) : filteredEarnings.length === 0 ? (
            <div className="earnings-empty">

              <div className="earnings-empty-icon">
                ₹
              </div>

              <h3>No earnings yet</h3>

              <p>
                Once you complete bookings, your
                earnings will appear here.
              </p>

              <Link href="/companion-bookings">
                View booking requests →
              </Link>

            </div>
          ) : (
            <div className="earnings-table">

              <div className="earnings-table-header">
                <span>Customer</span>
                <span>Session</span>
                <span>Amount</span>
                <span>Payout</span>
              </div>

              {filteredEarnings.map((item) => {

                const name = customerName(
                  item.customer
                );

                const isPaid =
                  item.payoutPaid === true;

                return (
                  <div
                    className="earning-row"
                    key={item.id}
                  >

                    {/* CUSTOMER */}

                    <div className="earning-customer">

                      <div className="earning-avatar">

                        {item.customer?.profilePhoto ? (
                          <img
                            src={
                              item.customer.profilePhoto
                            }
                            alt={name}
                          />
                        ) : (
                          name
                            .charAt(0)
                            .toUpperCase()
                        )}

                      </div>

                      <div>
                        <strong>{name}</strong>

                        {item.customer?.city && (
                          <small>
                            {item.customer.city}
                          </small>
                        )}
                      </div>

                    </div>

                    {/* SESSION */}

                    <div className="earning-session">

                      <strong>
                        {formatDate(item.date)}
                      </strong>

                      <small>
                        {item.time} ·{" "}
                        {item.duration}{" "}
                        {item.duration === 1
                          ? "hour"
                          : "hours"}
                      </small>

                    </div>

                    {/* AMOUNT */}

                    <div className="earning-amount">

                      <strong>
                        {money(item.amount)}
                      </strong>

                      <small>
                        Session earnings
                      </small>

                    </div>

                    {/* PAYOUT */}

                    <div>

                      <span
                        className={`payout-status ${
                          isPaid
                            ? "paid"
                            : "pending"
                        }`}
                      >
                        {isPaid
                          ? "Paid to bank"
                          : "Pending"}
                      </span>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}