"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const TABS = ["live", "past", "drafts", "all"];

export default function HostDashboardClient() {
  const [parties, setParties] = useState([]);
  const [summaryFromApi, setSummaryFromApi] = useState({
    paidToBankTotal: 0,
    hostPayoutTotal: 0,
    pendingPayoutTotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("live");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/host/parties", {
          cache: "no-store",
        });
        const data = await res.json();

        if (res.status === 401) {
          const redirectTo = encodeURIComponent("/host");
          window.location.href = `/signup?redirect=${redirectTo}`;
          return;
        }

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load parties.");
        }

        setParties(Array.isArray(data.parties) ? data.parties : []);
        setSummaryFromApi(
          data.summary || {
            paidToBankTotal: 0,
            hostPayoutTotal: 0,
            pendingPayoutTotal: 0,
          }
        );
      } catch (e) {
        setError(e.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const now = new Date();

  const filtered = useMemo(() => {
    return parties.filter((p) => {
      const isPast = new Date(p.date) < now;

      if (tab === "live") return p.status === "live" && !isPast;
      if (tab === "past") return isPast || p.status === "completed";
      if (tab === "drafts") return p.status === "draft";
      return true;
    });
  }, [parties, tab]);

  const summary = useMemo(() => {
    const live = parties.filter((p) => p.status === "live").length;
    const sold = parties.reduce(
      (sum, p) => sum + (p.stats?.paid || 0),
      0
    );
    const checked = parties.reduce(
      (sum, p) => sum + (p.stats?.checkedIn || 0),
      0
    );
    const earned = parties.reduce(
      (sum, p) => sum + (p.stats?.hostPayout || 0),
      0
    );
    const paid = parties.reduce(
      (sum, p) => sum + (p.stats?.paidToBank || 0),
      0
    );

    return {
      live,
      sold,
      checked,
      earned,
      paid,
      pending: Math.max(0, earned - paid),
    };
  }, [parties]);

  return (
    <div className="host-container">
      {/* HEADER */}
      <div className="host-head">
        <div>
          <span className="host-eyebrow">HOST DASHBOARD</span>
          <h1>Your parties</h1>
          <p>
            Track sales, manage guests, and check in attendees at the door.
          </p>
        </div>

        <Link href="/parties/create" className="host-primary-btn">
          + Host a new party
        </Link>
      </div>

      {/* SUMMARY — 4 cards */}
      <div className="host-summary">
        <div className="host-summary-card">
          <span className="host-summary-icon">🎉</span>
          <div>
            <strong>{summary.live}</strong>
            <small>Live parties</small>
          </div>
        </div>

        <div className="host-summary-card">
          <span className="host-summary-icon">🎟️</span>
          <div>
            <strong>{summary.sold}</strong>
            <small>Tickets sold</small>
          </div>
        </div>

        <div className="host-summary-card">
          <span className="host-summary-icon">✅</span>
          <div>
            <strong>{summary.checked}</strong>
            <small>Checked in</small>
          </div>
        </div>

        <div className="host-summary-card">
          <span className="host-summary-icon">🏦</span>
          <div>
            <strong>₹{summary.paid.toLocaleString("en-IN")}</strong>
            <small>Paid to bank</small>
          </div>
        </div>
      </div>

      {/* 💰 PAYOUT BAR */}
      <div className="host-payout-bar">
        <div className="host-payout-bar-left">
          <span className="host-payout-bar-icon">💰</span>
          <div className="host-payout-bar-text">
            <strong>₹{summary.earned.toLocaleString("en-IN")}</strong>
            <small>Total earned</small>
          </div>
        </div>

        <div className="host-payout-bar-middle">
          <div>
            <small>Paid to bank</small>
            <strong className="green">
              ₹{summary.paid.toLocaleString("en-IN")}
            </strong>
          </div>

          <div>
            <small>Pending payout</small>
            <strong className="amber">
              ₹{summary.pending.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        <Link
          href="/companion/bank-details"
          className="host-payout-bar-link"
        >
          Manage payouts
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* TABS */}
      <div className="host-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`host-tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "live"
              ? "Live"
              : t === "past"
              ? "Past"
              : t === "drafts"
              ? "Drafts"
              : "All"}
          </button>
        ))}
      </div>

      {/* LOADING / ERROR / EMPTY */}
      {loading && (
        <div className="host-loading">
          <div className="parties-spinner" />
          <p>Loading parties...</p>
        </div>
      )}

      {!loading && error && (
        <div className="host-error">
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try again</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="host-empty">
          <div className="host-empty-icon">🎈</div>
          <h3>No parties in this view</h3>
          <p>
            {tab === "live"
              ? "You have no live parties yet."
              : tab === "past"
              ? "Your past parties will appear here."
              : "You haven't created any parties."}
          </p>
          <Link href="/parties/create" className="host-primary-btn">
            Host a party
          </Link>
        </div>
      )}

      {/* PARTY CARDS */}
      {!loading && !error && filtered.length > 0 && (
        <div className="host-grid">
          {filtered.map((party) => (
            <HostPartyCard key={party._id} party={party} />
          ))}
        </div>
      )}
    </div>
  );
}

function HostPartyCard({ party }) {
  const dateObj = new Date(party.date);
  const isPast = dateObj < new Date();
  const stats = party.stats || {};
  const fillPercent = party.totalTickets
    ? Math.min(
        100,
        Math.round(((party.ticketsSold || 0) / party.totalTickets) * 100)
      )
    : 0;

  const paidToBank = Number(stats.paidToBank || 0);
  const pendingPayout = Number(stats.pendingPayout || 0);
  const fullySettled = pendingPayout === 0 && paidToBank > 0;

  return (
    <article className="host-party-card">
      <div className="host-party-cover">
        {party.coverImage ? (
          <img src={party.coverImage} alt={party.title} />
        ) : (
          <div className="host-party-cover-fallback">
            {party.title?.charAt(0)?.toUpperCase() || "P"}
          </div>
        )}

        <span
          className={`host-party-status ${party.status} ${
            isPast ? "past" : ""
          }`}
        >
          {isPast
            ? "Past"
            : party.status === "live"
            ? "Live"
            : party.status === "sold_out"
            ? "Sold out"
            : party.status === "cancelled"
            ? "Cancelled"
            : "Draft"}
        </span>
      </div>

      <div className="host-party-body">
        <span className="host-party-date">
          {dateObj.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}{" "}
          • {party.startTime}
        </span>

        <h3 className="host-party-title">{party.title}</h3>
        <p className="host-party-venue">
          📍 {party.venue}, {party.city}
        </p>

        <div className="host-party-stats">
          <div>
            <strong>{stats.paid || 0}</strong>
            <small>sold</small>
          </div>
          <div>
            <strong>{stats.checkedIn || 0}</strong>
            <small>checked</small>
          </div>
          <div>
            <strong>
              ₹{(stats.hostPayout || 0).toLocaleString("en-IN")}
            </strong>
            <small>payout</small>
          </div>
        </div>

        {/* Payout breakdown */}
        <div className="host-party-payout">
          <div className="host-party-payout-row">
            <span>Paid to bank</span>
            <strong className="green">
              ₹{paidToBank.toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="host-party-payout-row">
            <span>Pending payout</span>
            <strong className={pendingPayout === 0 ? "green" : "amber"}>
              ₹{pendingPayout.toLocaleString("en-IN")}
            </strong>
          </div>

          {fullySettled && (
            <div className="host-party-payout-settled">
              ✓ Fully settled
            </div>
          )}
        </div>

        <div className="host-party-fill">
          <div className="host-party-fill-bar">
            <div
              className="host-party-fill-progress"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          <small>
            {party.ticketsSold || 0}/{party.totalTickets} tickets (
            {fillPercent}%)
          </small>
        </div>

        <div className="host-party-actions">
          <Link
            href={`/host/${party._id}`}
            className="host-party-btn primary"
          >
            Manage
          </Link>

          {!isPast && party.status !== "cancelled" && (
            <Link
              href={`/parties/${party._id}/checkin`}
              className="host-party-btn ghost"
            >
              Check in
            </Link>
          )}

          {party.status === "live" && !isPast && (
            <Link
              href={`/parties/${party._id}`}
              className="host-party-btn ghost"
              title="View public page"
            >
              View ↗
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}