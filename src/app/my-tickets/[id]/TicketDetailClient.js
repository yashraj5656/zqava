"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TicketDetailClient({ id }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  /* Load ticket */
  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Invalid ticket link.");
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/tickets/${id}`, { cache: "no-store" });
        const data = await res.json();

        if (cancelled) return;

        if (res.status === 401) {
          const redirectTo = encodeURIComponent(`/my-tickets/${id}`);
          window.location.href = `/signup?redirect=${redirectTo}`;
          return;
        }

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Ticket not found.");
        }

        setTicket(data.ticket);
      } catch (e) {
        if (!cancelled) setError(e.message || "Something went wrong.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  /* Copy ticket code */
  async function copyCode() {
    if (!ticket?.ticketCode) return;

    try {
      await navigator.clipboard.writeText(ticket.ticketCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback for older browsers / insecure contexts
      const el = document.createElement("textarea");
      el.value = ticket.ticketCode;
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        /* ignore */
      }
      document.body.removeChild(el);
    }
  }

  if (loading) {
    return (
      <div className="ticket-detail-loading">
        <div className="parties-spinner" />
        <p>Loading ticket...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="ticket-detail-error">
        <h2>Ticket not found</h2>
        <p>{error || "This ticket may have been removed."}</p>
        <Link href="/my-tickets" className="my-tickets-primary-btn">
          Back to my tickets
        </Link>
      </div>
    );
  }

  const party = ticket.partyId || {};
  const partyDate = new Date(party.date);
  const isPast = partyDate < new Date();
  const isCheckedIn = ticket.status === "checked_in";

  return (
    <div className="ticket-detail-container">
      <Link href="/my-tickets" className="ticket-detail-back">
        ← All tickets
      </Link>

      {/* TICKET */}
      <div className="ticket-stub">
        {/* LEFT — party info */}
        <div className="ticket-stub-left">
          <div className="ticket-stub-cover">
            {party.coverImage ? (
              <img src={party.coverImage} alt={party.title} />
            ) : (
              <div className="ticket-stub-cover-fallback">
                {party.title?.charAt(0)?.toUpperCase() || "P"}
              </div>
            )}

            <span
              className={`ticket-stub-badge ${
                isPast ? "past" : isCheckedIn ? "checked-in" : "active"
              }`}
            >
              {isPast
                ? "Event ended"
                : isCheckedIn
                ? "Checked in"
                : "Active ticket"}
            </span>
          </div>

          <div className="ticket-stub-info">
            <span className="ticket-stub-label">ADMIT</span>
            <h1>{party.title}</h1>

            <p className="ticket-stub-venue">
              📍 {party.venue}, {party.city}
            </p>

            <div className="ticket-stub-meta">
              <div>
                <small>DATE</small>
                <strong>
                  {partyDate.toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </strong>
              </div>

              <div>
                <small>TIME</small>
                <strong>
                  {party.startTime} – {party.endTime}
                </strong>
              </div>

              <div>
                <small>GUESTS</small>
                <strong>
                  {ticket.quantity}{" "}
                  {ticket.quantity === 1 ? "person" : "people"}
                </strong>
              </div>

              <div>
                <small>AGE</small>
                <strong>{party.ageLimit || 18}+</strong>
              </div>
            </div>

            {party.hostId?.name && (
              <p className="ticket-stub-host">
                Hosted by <strong>{party.hostId.name}</strong>
              </p>
            )}
          </div>
        </div>

        {/* DIVIDER (perforated edge) */}
        <div className="ticket-stub-divider">
          <span className="ticket-stub-notch top" />
          <span className="ticket-stub-notch bottom" />
        </div>

        {/* RIGHT — code only */}
        <div className="ticket-stub-right">
          <p className="ticket-stub-scan-label">SHOW AT THE DOOR</p>

          <div className="ticket-code-display">
            <small>Your ticket code</small>
            <strong>{ticket.ticketCode}</strong>
          </div>

          <button
            type="button"
            onClick={copyCode}
            className={`ticket-code-copy ${copied ? "copied" : ""}`}
          >
            {copied ? "✓ Copied" : "Copy code"}
          </button>

          <p className="ticket-stub-hint">
            Show this code to the host at the door. They&apos;ll check you in.
          </p>

          {isCheckedIn && (
            <div className="ticket-stub-checked">
              ✓ Already checked in
            </div>
          )}
        </div>
      </div>

      {/* INSTRUCTIONS */}
      <div className="ticket-detail-notes">
        <h3>How to use this ticket</h3>
        <ol>
          <li>Arrive within 30 minutes of the start time.</li>
          <li>Show the ticket code above to the host at the door.</li>
          <li>Bring a valid government ID (age {party.ageLimit || 18}+).</li>
          <li>Once checked in, the ticket is marked as used.</li>
        </ol>
      </div>
    </div>
  );
}