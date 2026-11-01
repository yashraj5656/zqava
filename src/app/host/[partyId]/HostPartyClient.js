"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HostPartyClient({ partyId }) {
  const [party, setParty] = useState(null);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);

  // Inline check-in state
  const [checkinCode, setCheckinCode] = useState("");
  const [checkinBusy, setCheckinBusy] = useState(false);
  const [checkinResult, setCheckinResult] = useState(null);

  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      const [partyRes, guestsRes] = await Promise.all([
        fetch(`/api/host/parties/${partyId}`, { cache: "no-store" }),
        fetch(`/api/host/parties/${partyId}/guests`, {
          cache: "no-store",
        }),
      ]);

      if (partyRes.status === 401 || guestsRes.status === 401) {
        const redirectTo = encodeURIComponent(`/host/${partyId}`);
        window.location.href = `/signup?redirect=${redirectTo}`;
        return;
      }

      const partyData = await partyRes.json();
      const guestsData = await guestsRes.json();

      if (!partyRes.ok || !partyData.success) {
        throw new Error(partyData.message || "Failed to load party.");
      }
      if (!guestsRes.ok || !guestsData.success) {
        throw new Error(guestsData.message || "Failed to load guests.");
      }

      setParty(partyData.party);
      setGuests(Array.isArray(guestsData.tickets) ? guestsData.tickets : []);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, [partyId]);

  async function handleCheckin(e) {
    e?.preventDefault?.();
    if (!checkinCode.trim()) return;

    setCheckinBusy(true);
    setCheckinResult(null);

    try {
      const res = await fetch("/api/tickets/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: checkinCode.trim().toUpperCase() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Check-in failed.");
      }

      setCheckinResult(data);
      setCheckinCode("");

      // Refresh guest list so status updates
      const guestsRes = await fetch(
        `/api/host/parties/${partyId}/guests`,
        { cache: "no-store" }
      );
      const guestsData = await guestsRes.json();
      if (guestsData.success) setGuests(guestsData.tickets || []);
    } catch (e) {
      setCheckinResult({ success: false, message: e.message });
    } finally {
      setCheckinBusy(false);
    }
  }

  async function handleCancel() {
    if (
      !confirm(
        "Are you sure? This will cancel the party and mark all paid tickets as cancelled. Users will need to be refunded."
      )
    )
      return;

    setBusy(true);
    try {
      const res = await fetch(`/api/host/parties/${partyId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to cancel party.");
      }
      await loadAll();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="host-party-loading">
        <div className="parties-spinner" />
        <p>Loading party...</p>
      </div>
    );
  }

  if (error || !party) {
    return (
      <div className="host-party-error">
        <h2>Party not found</h2>
        <p>{error || "This party may have been removed."}</p>
        <Link href="/host" className="host-primary-btn">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const stats = party.stats || {};
  const dateObj = new Date(party.date);
  const isPast = dateObj < new Date();

  const filteredGuests = guests.filter((g) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      g.ticketCode?.toLowerCase().includes(q) ||
      (g.buyerId?.name || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="host-party-container">
      <Link href="/host" className="host-party-back">
        ← Dashboard
      </Link>

      {/* HEADER */}
      <div className="host-party-head">
        <div className="host-party-head-left">
          {party.coverImage ? (
            <img
              src={party.coverImage}
              alt={party.title}
              className="host-party-head-thumb"
            />
          ) : (
            <div className="host-party-head-thumb fallback">
              {party.title?.charAt(0)?.toUpperCase() || "P"}
            </div>
          )}

          <div>
            <h1>{party.title}</h1>
            <p>
              📍 {party.venue}, {party.city} •{" "}
              {dateObj.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}{" "}
              • {party.startTime}
            </p>
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
        </div>

        <div className="host-party-head-actions">
          {!isPast && party.status !== "cancelled" && (
            <Link
              href={`/parties/${party._id}/checkin`}
              className="host-primary-btn"
            >
              Open check-in screen
            </Link>
          )}
          {party.status !== "cancelled" && !isPast && (
            <button
              type="button"
              className="host-danger-btn"
              onClick={handleCancel}
              disabled={busy}
            >
              {busy ? "Cancelling..." : "Cancel party"}
            </button>
          )}
        </div>
      </div>

      {/* STATS */}
      <div className="host-stats-grid">
        <div className="host-stat-card">
          <small>Tickets sold</small>
          <strong>{stats.paid || 0}</strong>
          <span>of {party.totalTickets} total</span>
        </div>

        <div className="host-stat-card">
          <small>Checked in</small>
          <strong>{stats.checkedIn || 0}</strong>
          <span>
            {stats.paid
              ? `${Math.round((stats.checkedIn / stats.paid) * 100)}%`
              : "0%"}
          </span>
        </div>

        <div className="host-stat-card">
          <small>Gross revenue</small>
          <strong>₹{(stats.revenue || 0).toLocaleString("en-IN")}</strong>
          <span>After sales</span>
        </div>

        <div className="host-stat-card highlight">
          <small>Your payout (90%)</small>
          <strong>₹{(stats.hostPayout || 0).toLocaleString("en-IN")}</strong>
          <span>
            Fee: ₹{(stats.platformFee || 0).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* QUICK CHECK-IN */}
      {!isPast && party.status !== "cancelled" && (
        <div className="host-quick-checkin">
          <h2>Quick check-in</h2>
          <p>Enter a guest&apos;s ticket code to check them in.</p>

          <form onSubmit={handleCheckin} className="host-checkin-form">
            <input
              value={checkinCode}
              onChange={(e) => setCheckinCode(e.target.value.toUpperCase())}
              placeholder="ZQ-XXXXXXXXXX"
              disabled={checkinBusy}
            />
            <button
              type="submit"
              disabled={checkinBusy || !checkinCode.trim()}
            >
              {checkinBusy ? "Checking..." : "Check in"}
            </button>
          </form>

          {checkinResult && (
            <div
              className={`host-checkin-result ${
                checkinResult.success && !checkinResult.alreadyCheckedIn
                  ? "success"
                  : checkinResult.alreadyCheckedIn
                  ? "warn"
                  : "error"
              }`}
            >
              {checkinResult.success &&
                !checkinResult.alreadyCheckedIn &&
                `✅ Checked in — ${
                  checkinResult.ticket?.buyerName || "Guest"
                } (${checkinResult.ticket?.quantity || 1})`}
              {checkinResult.alreadyCheckedIn &&
                `⚠️ Already checked in — ${
                  checkinResult.ticket?.buyerName || "Guest"
                }`}
              {!checkinResult.success && `❌ ${checkinResult.message}`}
            </div>
          )}
        </div>
      )}

      {/* GUEST LIST */}
      <div className="host-guests">
        <div className="host-guests-head">
          <h2>Guest list</h2>
          <input
            type="text"
            placeholder="Search by name or ticket code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="host-guests-search"
          />
        </div>

        {filteredGuests.length === 0 ? (
          <div className="host-guests-empty">
            <p>
              {search
                ? "No guests match your search."
                : "No guests have booked yet."}
            </p>
          </div>
        ) : (
          <div className="host-guests-table">
            <div className="host-guests-row head">
              <span>Guest</span>
              <span>Ticket</span>
              <span>Qty</span>
              <span>Status</span>
              <span>Amount</span>
            </div>

            {filteredGuests.map((t) => (
              <div key={t._id} className="host-guests-row">
                <span className="host-guest-name">
                  {t.buyerId?.profilePhoto ? (
                    <img
                      src={t.buyerId.profilePhoto}
                      alt={t.buyerId.name || "Guest"}
                    />
                  ) : (
                    <span className="host-guest-avatar">
                      {(t.buyerId?.name || "G").charAt(0).toUpperCase()}
                    </span>
                  )}
                  {t.buyerId?.name || "Guest"}
                </span>

                <span className="host-guest-code">{t.ticketCode}</span>
                <span>{t.quantity}</span>
                <span>
                  <span
                    className={`host-guest-badge ${
                      t.status === "checked_in" ? "in" : "paid"
                    }`}
                  >
                    {t.status === "checked_in" ? "Checked in" : "Paid"}
                  </span>
                </span>
                <span>₹{t.totalAmount?.toLocaleString("en-IN") || 0}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}