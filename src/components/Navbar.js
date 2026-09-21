"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./NotificationBell.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();
        setUser(data.user || null);
      } catch (error) {
        console.error("Failed to load user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const accountType = user?.role;

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        {/* Logo */}
        <Link href="/" className="logo" onClick={closeMenu}>
          ZQ<span>Q</span>AVA
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-links">
          <Link href="/explore">Explore</Link>

          <Link href="/become-a-companion">Become Companion</Link>
          <Link href="/bookings">My companion</Link>
          <Link href="/companion-bookings">Bookings</Link>
          <Link href="/companion-bookings">Earnings</Link>
          {!loading && user && (
            accountType === "companion" ? (
              <Link href="/companion-profile">
                Account
              </Link>
            ) : (
              <Link href="/profile">
                Account
              </Link>
            )
          )}
         

        </nav>

        {/* Desktop Actions */}
        <div className="nav-actions">
          {!loading && user ? (
            <>
              <span className="nav-user">
                Hi, {user.firstName || "there"}
              </span>
              <NotificationBell />


            </>
          ) : (
            <>
              <Link href="/login" className="login-btn">
                Log in
              </Link>

              <Link href="/signup" className="nav-cta">
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

{/* Mobile Menu */}
{menuOpen && (
  <div className="zqava-mobile-menu">
    <div className="zqava-mobile-links">
      <Link href="/" onClick={closeMenu}>
        Home
      </Link>

      <Link href="/explore" onClick={closeMenu}>
        Explore
      </Link>
      <Link href="/bookings" onClick={closeMenu}>My Companion</Link>
      <Link href="/companion-bookings" onClick={closeMenu}>My Bookings</Link>
      <Link href="/companion-bookings" onClick={closeMenu}>My Earnings</Link>
      <Link href="/become-a-companion" onClick={closeMenu}>Become Companion</Link>
      <Link href="/earn" onClick={closeMenu}>
        How you earn
      </Link>

     {/* <Link href="/safety" onClick={closeMenu}>
        Safety
      </Link>*/}

      {/* Logged-in user */}
      {!loading && user && (
        accountType === "companion" ? (
          <Link
            href="/companion-profile"
            onClick={closeMenu}
          >
            Companion Profile
          </Link>
        ) : (
          <Link
            href="/profile"
            onClick={closeMenu}
          >
            Profile
          </Link>
        )
      )}
    </div>

    {/* Mobile Actions */}
    <div className="zqava-mobile-actions">
      {!loading && user ? (
        <>
          <Link
            href={
              accountType === "companion"
                ? "/companion-profile"
                : "/profile"
            }
            className="zqava-mobile-account"
            onClick={closeMenu}
          >
            My Account
          </Link>

          <button
            type="button"
            className="zqava-mobile-logout"
            onClick={async () => {
              try {
                await fetch("/api/auth/logout", {
                  method: "POST",
                });

                closeMenu();
                window.location.href = "/";
              } catch (error) {
                console.error("Logout failed:", error);
              }
            }}
          >
            Log out
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="zqava-mobile-login"
            onClick={closeMenu}
          >
            Log in
          </Link>

          <Link
            href="/signup"
            className="zqava-mobile-signup"
            onClick={closeMenu}
          >
            Get started
          </Link>
        </>
      )}
    </div>
  </div>
)}
    </header>
  );
}






/* =========================================================
   NOTIFICATION ICONS
========================================================= */

function BellIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M18 8C18 4.686 15.314 2 12 2C8.686 2 6 4.686 6 8C6 14 3.5 14 3.5 17H20.5C20.5 14 18 14 18 8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M9.5 20C10.1 21.2 10.9 22 12 22C13.1 22 13.9 21.2 14.5 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 8.7 8.7 0 0 1-4.2-1.1L3 20l1.3-4.1A8.3 8.3 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z" />
      <path d="M8 11h.01" />
      <path d="M12 11h.01" />
      <path d="M16 11h.01" />
    </svg>
  );
}

function BookingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="17" rx="3" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 9h18" />
      <path d="M8 13h3" />
      <path d="M8 17h6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.3 3.7 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

/* =========================================================
   NOTIFICATION TYPE HELPERS
========================================================= */

function getNotificationType(notification) {
  const type = notification?.type;

  if (type === "message") {
    return {
      className: "notification-type-message",
      label: "Message",
      Icon: MessageIcon,
    };
  }

  if (
    type === "booking_created" ||
    type === "booking_confirmed" ||
    type === "booking_rejected" ||
    type === "booking_cancelled" ||
    type === "booking_completed"
  ) {
    return {
      className: "notification-type-booking",
      label: "Booking",
      Icon: BookingIcon,
    };
  }

  return {
    className: "notification-type-system",
    label: "Notification",
    Icon: AlertIcon,
  };
}

/* =========================================================
   TIME FORMATTER
========================================================= */

function formatNotificationTime(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = Date.now();
  const difference = now - date.getTime();

  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 10) {
    return "Just now";
  }

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

function NotificationBell() {
  const router = useRouter();

  const wrapperRef = useRef(null);
  const intervalRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     FETCH NOTIFICATIONS
  ======================================================= */

  async function fetchNotifications(showLoader = false) {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const response = await fetch("/api/notifications", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load notifications."
        );
      }

      setNotifications(
        Array.isArray(data.notifications)
          ? data.notifications
          : []
      );

      setUnreadCount(
        Number(data.unreadCount) || 0
      );

      setError("");
    } catch (err) {
      console.error(
        "Notification fetch error:",
        err
      );

      /*
       * Don't destroy existing notifications if
       * one background refresh fails.
       */
      if (showLoader) {
        setError(
          "Unable to load notifications."
        );
      }
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }

  /* =======================================================
     INITIAL FETCH + AUTO REFRESH
  ======================================================= */

  useEffect(() => {
    fetchNotifications(true);

    /*
     * Refresh every 10 seconds.
     */
    intervalRef.current = setInterval(() => {
      fetchNotifications(false);
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  /* =======================================================
     CLOSE WHEN CLICKING OUTSIDE
  ======================================================= */

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [isOpen]);

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener(
        "keydown",
        handleEscape
      );
    }

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [isOpen]);

  /* =======================================================
     MARK AS READ
  ======================================================= */

  async function markAsRead(notificationId) {
    if (!notificationId) {
      return;
    }

    try {
      const response = await fetch(
        `/api/notifications/${notificationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            read: true,
          }),
        }
      );

      if (!response.ok) {
        return;
      }

      /*
       * Update UI immediately instead of waiting
       * for the next 10-second refresh.
       */
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );

      setUnreadCount((current) =>
        Math.max(0, current - 1)
      );
    } catch (err) {
      console.error(
        "Mark notification read error:",
        err
      );
    }
  }

  /* =======================================================
     HANDLE NOTIFICATION CLICK
  ======================================================= */

  async function handleNotificationClick(
    notification
  ) {
    if (!notification) {
      return;
    }

    if (!notification.read) {
      await markAsRead(notification._id);
    }

    setIsOpen(false);

    const type = notification.type;
    const bookingId =
      notification.bookingId?._id ||
      notification.bookingId;

    /*
     * MESSAGE
     *
     * Opens the booking conversation.
     */
    if (
      type === "message" &&
      bookingId
    ) {
      router.push(
        `/messages/${encodeURIComponent(
          bookingId
        )}`
      );

      return;
    }

    /*
     * BOOKING
     *
     * Opens booking page.
     */
    if (
      (
        type === "booking_created" ||
        type === "booking_confirmed" ||
        type === "booking_rejected" ||
        type === "booking_cancelled" ||
        type === "booking_completed"
      ) &&
      bookingId
    ) {
      router.push(
        `/companion-bookings`
      );

      return;
    }
  }

  /* =======================================================
     TOGGLE DROPDOWN
  ======================================================= */

  function toggleNotifications() {
    setIsOpen((current) => !current);

    /*
     * Refresh immediately when opening.
     * This means the user doesn't have to wait
     * for the 10-second polling interval.
     */
    if (!isOpen) {
      fetchNotifications(false);
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="notification-wrapper"
      ref={wrapperRef}
    >
      {/* ===================================================
          BELL BUTTON
      =================================================== */}

      <button
        type="button"
        className={`notification-bell ${
          isOpen
            ? "notification-bell-active"
            : ""
        }`}
        onClick={toggleNotifications}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <BellIcon />

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {/* ===================================================
          DROPDOWN
      =================================================== */}

      {isOpen && (
        <div
          className="notification-dropdown"
          role="dialog"
          aria-label="Notifications"
        >
          {/* HEADER */}

          <div className="notification-header">
            <div>
              <h3>Notifications</h3>

              <span>
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "You're all caught up"}
              </span>
            </div>

            {unreadCount > 0 && (
              <span className="notification-live">
                <span className="notification-live-dot" />
                Live
              </span>
            )}
          </div>

          {/* CONTENT */}

          {loading ? (
            <div className="notification-loading">
              Loading notifications...
            </div>
          ) : error ? (
            <div className="notification-empty">
              <div className="notification-empty-icon">
                <AlertIcon />
              </div>

              <h4>
                Something went wrong
              </h4>

              <p>{error}</p>

              <button
                type="button"
                className="notification-retry"
                onClick={() =>
                  fetchNotifications(true)
                }
              >
                Try again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">
              <div className="notification-empty-icon">
                <CheckIcon />
              </div>

              <h4>
                No notifications
              </h4>

              <p>
                New bookings and messages will
                appear here.
              </p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map(
                (notification) => {
                  const notificationType =
                    getNotificationType(
                      notification
                    );

                  const TypeIcon =
                    notificationType.Icon;

                  return (
                    <button
                      key={notification._id}
                      type="button"
                      className={`notification-item ${
                        !notification.read
                          ? "unread"
                          : ""
                      }`}
                      onClick={() =>
                        handleNotificationClick(
                          notification
                        )
                      }
                    >
                      {/* ICON */}

                      <div
                        className={`notification-item-icon ${notificationType.className}`}
                      >
                        <TypeIcon />
                      </div>

                      {/* CONTENT */}

                      <div className="notification-content">
                        <div className="notification-item-top">
                          <span className="notification-category">
                            {notificationType.label}
                          </span>

                          {!notification.read && (
                            <span className="notification-unread-dot" />
                          )}
                        </div>

                        <p className="notification-title">
                          {notification.title ||
                            "Notification"}
                        </p>

                        <p className="notification-message">
                          {notification.message ||
                            ""}
                        </p>

                        <span className="notification-time">
                          {formatNotificationTime(
                            notification.createdAt
                          )}
                        </span>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          )}

          {/* FOOTER */}

          {notifications.length > 0 && (
            <div className="notification-footer">
              <button
                type="button"
                onClick={() =>
                  fetchNotifications(true)
                }
              >
                Refresh notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}