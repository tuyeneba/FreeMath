"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useLang } from "@/context/LangContext";

export default function LoginPage() {
  const { user, login, loading } = useUser();
  const { t } = useLang();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username.trim() || !password.trim()) {
      setErrorMsg(t.loginEmpty);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          login(data.user);
          router.push("/dashboard");
        } else {
          setErrorMsg(t.loginError);
        }
      } else {
        const data = await res.json();
        setErrorMsg(data.error === "Invalid credentials" ? t.loginError : "An error occurred");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div className="spinner" style={{
          width: "40px",
          height: "40px",
          border: "4px solid var(--border-color)",
          borderTopColor: "var(--accent)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        background: "linear-gradient(180deg, var(--bg-primary) 0%, rgba(var(--bg-secondary-rgb), 0.5) 100%)"
      }}
    >
      <div
        className="animate-slide-up"
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--border-radius-lg)",
          padding: "2.5rem 2rem",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem"
        }}
      >
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
            {t.loginTitle}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
            {t.loginSubtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {errorMsg && (
            <div
              style={{
                backgroundColor: "var(--error-light)",
                color: "var(--error)",
                padding: "0.75rem 1rem",
                borderRadius: "var(--border-radius-sm)",
                fontSize: "0.875rem",
                fontWeight: 500,
                borderLeft: "4px solid var(--error)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label htmlFor="username-input" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>
              {t.usernameLabel}
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. nhi0908664418"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={submitting}
              id="username-input"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label htmlFor="password-input" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>
              {t.passwordLabel}
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              id="password-input"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.875rem", marginTop: "0.5rem" }}
            disabled={submitting}
            id="login-button"
          >
            {submitting ? (
              <div style={{
                width: "20px",
                height: "20px",
                border: "2px solid #ffffff",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }}></div>
            ) : t.loginBtn}
          </button>
        </form>

        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            FreeMath online math training portal.
          </p>
        </div>
      </div>
    </div>
  );
}
