"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function MyTicketsClient() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("upcoming");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/tickets", { cache: "no-store" });
        const data = await res.json();

        if (res.status === 401) {
          const redirectTo = encodeURIComponent("/my-tickets");
          window.location.href = `/signup?redirect=${redirectTo}`;
          return;
        }

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load tickets.");
        }

        setTickets(Array.isArray(data.tickets) ? data.tickets : []);
      } catch (e) {
        setError(e.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();

    return tickets.filter((t) => {
      if (!t.partyId) return false;
      const partyDate = new Date(t.partyId.date);

      if (filter === "upcoming") return partyDate >= now;
      if (filter === "past") return partyDate < now;
      return true;
    });
  }, [tickets, filter]);

  return (
    <div className="my-tickets-container">
      {/* HEADER */}
      <div className="my-tickets-head">
        <div>
          <span className="my-tickets-eyebrow">ZQAVA</span>
          <h1>My tickets</h1>
          <p>
            All the parties you&apos;ve booked. Show the ticket code at the door
            to get in.
          </p>
        </div>

        <Link href="/parties" className="my-tickets-browse-btn">
          Browse parties →
        </Link>
      </div>

      {/* FILTER TABS */}
      <div className="my-tickets-tabs">
        {["upcoming", "past", "all"].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`my-tickets-tab ${
              filter === tab ? "active" : ""
            }`}
            onClick={() => setFilter(tab)}
          >
            {tab === "upcoming"
              ? "Upcoming"
              : tab === "past"
              ? "Past"
              : "All tickets"}
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="my-tickets-loading">
          <div className="parties-spinner" />
          <p>Loading your tickets...</p>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="my-tickets-error">
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try again</button>
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && filtered.length === 0 && (
        <div className="my-tickets-empty">
          <div className="my-tickets-empty-icon">🎟️</div>
          <h3>
            {filter === "upcoming"
              ? "No upcoming tickets"
              : filter === "past"
              ? "No past tickets"
              : "No tickets yet"}
          </h3>
          <p>
            {filter === "upcoming"
              ? "Grab a ticket to your next party and it will show up here."
              : "You haven't booked any tickets yet."}
          </p>
          <Link href="/parties" className="my-tickets-primary-btn">
            Browse parties
          </Link>
        </div>
      )}

      {/* GRID */}
      {!loading && !error && filtered.length > 0 && (
        <div className="my-tickets-grid">
          {filtered.map((ticket) => {
            const party = ticket.partyId || {};
            const partyDate = new Date(party.date);
            const isPast = partyDate < new Date();
            const isCheckedIn = ticket.status === "checked_in";

            return (
              <Link
                key={ticket._id}
                href={`/my-tickets/${ticket._id}`}
                className={`my-ticket-card ${
                  isPast ? "past" : ""
                } ${isCheckedIn ? "checked-in" : ""}`}
              >
                <div className="my-ticket-cover">
                  {party.coverImage ? (
                    <img src={party.coverImage} alt={party.title} />
                  ) : (
                    <div className="my-ticket-cover-fallback">
                      {party.title?.charAt(0)?.toUpperCase() || "P"}
                    </div>
                  )}

                  <span
                    className={`my-ticket-badge ${
                      isPast
                        ? "past"
                        : isCheckedIn
                        ? "checked-in"
                        : "active"
                    }`}
                  >
                    {isPast
                      ? "Event ended"
                      : isCheckedIn
                      ? "Checked in"
                      : "Active"}
                  </span>
                </div>

                <div className="my-ticket-body">
                  <div className="my-ticket-date">
                    <strong>
                      {partyDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </strong>
                    <span>{party.startTime}</span>
                  </div>

                  <h3 className="my-ticket-title">{party.title}</h3>

                  <p className="my-ticket-venue">
                    📍 {party.venue}, {party.city}
                  </p>

                  <div className="my-ticket-footer">
                    <div className="my-ticket-code-chip">
                      <small>Ticket code</small>
                      <strong>{ticket.ticketCode}</strong>
                    </div>

                    <span className="my-ticket-qty">
                      {ticket.quantity}{" "}
                      {ticket.quantity === 1 ? "person" : "people"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}