"use client";

import { useState } from "react";
import Link from "next/link";
import "./Auth.css";

export function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed.");
        return;
      }

      window.location.href = "/explore";
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-orb auth-orb-one" />
        <div className="auth-orb auth-orb-two" />
      </div>

      <div className="auth-container">
        {/*<Link href="/" className="auth-logo">
          ZQAVA<span>.</span>
        </Link>*/}

        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-eyebrow">WELCOME BACK</span>

            <h1>Good to see you.</h1>

            <p>
              Log in to continue exploring ZQAVA and manage your
              companionship bookings.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="login-email">Email address</label>

              <div className="auth-input-wrap">
                <MailIcon />

                <input
                  id="login-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="login-password">Password</label>

                <Link href="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <div className="auth-input-wrap">
                <LockIcon />

                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <label className="auth-checkbox">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
              />

              <span className="checkbox-box">
                <CheckIcon />
              </span>

              <span>Remember me</span>
            </label>

            <button type="submit" className="auth-submit">
              Log in
              <ArrowIcon />
            </button>
          </form>

          <div className="auth-divider">
           {/* <span>or continue with</span>*/}
          </div>

          {/*<div className="social-auth">
            <button
              type="button"
              className="social-btn"
              onClick={() => console.log("Google login")}
            >
              <GoogleIcon />
              Google
            </button>

            <button
              type="button"
              className="social-btn"
              onClick={() => console.log("Apple login")}
            >
              <AppleIcon />
              Apple
            </button>
          </div>*/}

          <p className="auth-switch">
            Don&apos;t have an account?{" "}
            <Link href="/signup">Create one</Link>
          </p>
        </div>

      
      </div>
    </div>
  );
}


export function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    terms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        alert(data.message || "Signup failed.");
        return;
      }
  
      window.location.href = "/profile";
    } catch (error) {
      console.error("Signup error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-orb auth-orb-one" />
        <div className="auth-orb auth-orb-two" />
      </div>

      <div className="auth-container auth-signup-container">
        {/*<Link href="/" className="auth-logo">
          ZQAVA<span>.</span>
        </Link>*/}

        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-eyebrow">JOIN ZQAVA</span>

            <h1>Make your own plans.</h1>

            <p>
              Create an account and discover people to share
              experiences, conversations, and moments with.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-name-grid">
              <div className="auth-field">
                <label htmlFor="signup-firstName">First name</label>

                <div className="auth-input-wrap">
                  <UserIcon />

                  <input
                    id="signup-firstName"
                    name="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    autoComplete="given-name"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="signup-lastName">Last name</label>

                <div className="auth-input-wrap">
                  <input
                    id="signup-lastName"
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    autoComplete="family-name"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email">Email address</label>

              <div className="auth-input-wrap">
                <MailIcon />

                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="signup-password">Create password</label>

              <div className="auth-input-wrap">
                <LockIcon />

                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              <div className="password-hint">
                Use at least 8 characters.
              </div>
            </div>

            <label className="auth-checkbox auth-terms">
              <input
                type="checkbox"
                name="terms"
                checked={form.terms}
                onChange={handleChange}
                required
              />

              <span className="checkbox-box">
                <CheckIcon />
              </span>

              <span>
                I agree to the{" "}
                <Link href="/terms">Terms</Link>,{" "}
                <Link href="/privacy">Privacy Policy</Link> and{" "}
                <Link href="/guidelines">Community Guidelines</Link>.
              </span>
            </label>

            <button type="submit" className="auth-submit">
              Create account
              <ArrowIcon />
            </button>
          </form>

          <div className="auth-divider">
            {/*<span>or sign up with</span>*/}
          </div>

          {/*<div className="social-auth">
            <button
              type="button"
              className="social-btn"
              onClick={() => console.log("Google signup")}
            >
              <GoogleIcon />
              Google
            </button>

            <button
              type="button"
              className="social-btn"
              onClick={() => console.log("Apple signup")}
            >
              <AppleIcon />
              Apple
            </button>
          </div>*/}

          <p className="auth-switch">
            Already have an account?{" "}
            <Link href="/login">Log in</Link>
          </p>
        </div>

       
      </div>
    </div>
  );
}


/* =========================================================
   SHARED COMPONENTS
   ========================================================= */




/* =========================================================
   ICONS
   ========================================================= */

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M4 7L12 13L20 7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="4"
        y="10"
        width="16"
        height="11"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 10V7.5C8 5.29 9.79 3.5 12 3.5C14.21 3.5 16 5.29 16 7.5V10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle
        cx="12"
        cy="15.5"
        r="1"
        fill="currentColor"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle
        cx="12"
        cy="8"
        r="3.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M5 20C5.8 16.7 8.1 15 12 15C15.9 15 18.2 16.7 19 20"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12S6 6.5 12 6.5S21.5 12 21.5 12S18 17.5 12 17.5S2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3L21 21"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M10.6 6.7C11.05 6.57 11.52 6.5 12 6.5C18 6.5 21.5 12 21.5 12C20.7 13.25 19.72 14.4 18.58 15.35"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.1 8.2C4.55 9.2 3.35 10.65 2.5 12C2.5 12 6 17.5 12 17.5C13.05 17.5 14.03 17.3 14.93 16.95"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12.5L9.2 16.5L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12H19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M13.5 6.5L19 12L13.5 17.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.72-.06-1.42-.19-2.09H12v3.96h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.26Z"
      />
      <path
        fill="#34A853"
        d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.5Z"
      />
      <path
        fill="#FBBC05"
        d="M6.54 13.58A5.85 5.85 0 0 1 6.23 12c0-.55.1-1.08.31-1.58V7.89H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.11l3.24-2.53Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.39c1.43 0 2.72.49 3.73 1.46l2.8-2.8C16.83 3.49 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.39l3.24 2.53C7.31 8.11 9.46 6.39 12 6.39Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.77 12.72c.02 2.28 2 3.04 2.02 3.05-.02.05-.32 1.1-1.04 2.18-.63.95-1.29 1.9-2.32 1.92-1.01.02-1.34-.62-2.5-.62-1.17 0-1.53.6-2.49.64-1 .04-1.76-1.03-2.4-1.98-1.31-1.95-2.31-5.51-.97-7.92.67-1.2 1.88-1.96 3.18-1.98.99-.02 1.92.67 2.5.67.6 0 1.71-.82 2.88-.7.49.02 1.86.2 2.74 1.48-.07.04-1.64.96-1.6 3.26ZM14.91 5.96c.53-.65.89-1.56.79-2.46-.76.03-1.68.51-2.23 1.15-.49.56-.93 1.47-.81 2.34.85.07 1.72-.43 2.25-1.03Z" />
    </svg>
  );
}