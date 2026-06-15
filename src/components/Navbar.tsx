"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { useLang } from "@/context/LangContext";
import { ThemeToggle } from "./ThemeToggle";
import { LangToggle } from "./LangToggle";

export const Navbar: React.FC = () => {
  const { user, logout } = useUser();
  const { language, t } = useLang();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "rgba(var(--bg-secondary-rgb, 255, 255, 255), 0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-color)",
        padding: "0.75rem 1.5rem",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 0,
        }}
      >
        <Link
          href={user ? "/dashboard" : "/"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          <Image
            src="/Logo/free_math_logo.png"
            alt="FreeMath Logo"
            width={40}
            height={40}
            style={{
              height: "40px",
              width: "auto",
              objectFit: "contain",
              borderRadius: "8px",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-outfit)",
              fontWeight: 800,
              fontSize: "1.25rem",
              background: "linear-gradient(135deg, var(--accent), var(--math-soroban))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.5px",
            }}
          >
            FreeMath
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          {user && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                fontSize: "0.9rem",
              }}
              className="user-profile-nav"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  backgroundColor: "var(--accent-light)",
                  color: "var(--accent)",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "var(--border-radius-full)",
                  fontWeight: 700,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>
                  {user.powerScore}
                </span>
              </div>
              
              <span
                style={{
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                }}
              >
                {t.welcome}, <strong style={{ color: "var(--text-primary)" }}>{user.fullName}</strong>
              </span>
              {user.role === "admin" && (
                <Link
                  href="/admin/users"
                  style={{
                    fontWeight: 700,
                    color: "var(--accent)",
                    textDecoration: "none",
                    backgroundColor: "var(--accent-light)",
                    padding: "0.35rem 0.75rem",
                    borderRadius: "var(--border-radius-sm)",
                    fontSize: "0.85rem",
                  }}
                  id="admin-panel-link"
                >
                  {language === "vi" ? "Quản trị" : "Admin Panel"}
                </Link>
              )}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ThemeToggle />
            <LangToggle />
          </div>

          {user && (
            <button
              onClick={logout}
              className="btn btn-secondary"
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.9rem",
                borderRadius: "var(--border-radius-md)",
              }}
              id="logout-button"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: "0.25rem" }}
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {t.logoutBtn}
            </button>
          )}
        </div>
      </div>
      <style jsx global>{`
        :root {
          --bg-secondary-rgb: 255, 255, 255;
        }
        [data-theme="dark"] {
          --bg-secondary-rgb: 15, 23, 42;
        }
        @media (max-width: 640px) {
          .user-profile-nav {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
