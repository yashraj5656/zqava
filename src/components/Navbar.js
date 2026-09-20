"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

          <Link href="/earn">How you earn</Link>
          <Link href="/bookings">My companion</Link>
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
      <Link href="/bookings">My companion</Link>
      <Link href="/earn" onClick={closeMenu}>
        How you earn
      </Link>

      <Link href="/safety" onClick={closeMenu}>
        Safety
      </Link>

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