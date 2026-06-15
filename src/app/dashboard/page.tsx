"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useLang } from "@/context/LangContext";

export default function DashboardPage() {
  const { user, loading } = useUser();
  const { language, t } = useLang();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
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

  const cards = [
    {
      id: "lessons",
      title: t.lessonsTab,
      desc: t.lessonsDesc,
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5v-15z" />
        </svg>
      ),
      color: "var(--math-finger)",
      active: false,
      onClick: () => alert(language === "vi" ? "Chức năng Bài Học đang được phát triển!" : "Lessons feature is coming soon!")
    },
    {
      id: "practice",
      title: t.practiceTab,
      desc: t.practiceDesc,
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      color: "var(--math-soroban)",
      active: true,
      onClick: () => router.push("/practice")
    },
    {
      id: "challenge",
      title: t.challengeTab,
      desc: t.challengeDesc,
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      color: "var(--math-challenge)",
      active: false,
      onClick: () => alert(language === "vi" ? "Chức năng Thử Thách đang được phát triển!" : "Challenges feature is coming soon!")
    }
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        padding: "2rem 1.5rem",
        gap: "2.5rem",
        backgroundColor: "var(--bg-primary)"
      }}
    >
      {/* Welcome Banner */}
      <div
        className="animate-slide-up"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--border-radius-lg)",
          padding: "2rem",
          boxShadow: "var(--shadow-md)",
          flexWrap: "wrap",
          gap: "1.5rem"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800 }}>
            {t.welcome}, {user.fullName}!
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
              {t.currentLevel}: <strong style={{ color: "var(--accent)" }}>{user.level}</strong>
            </p>
            {user.role === "admin" && (
              <button
                onClick={() => router.push("/admin/users")}
                className="btn btn-primary"
                style={{
                  padding: "0.35rem 0.85rem",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem"
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                {language === "vi" ? "Quản lý Người dùng" : "Manage Users"}
              </button>
            )}
          </div>
        </div>

        {/* User stats */}
        <div style={{ display: "flex", gap: "2rem" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
              {t.powerScore}
            </span>
            <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent)", lineHeight: "1" }}>
              {user.powerScore}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div
        className="grid grid-cols-3 animate-slide-up"
        style={{
          gap: "2rem",
          animationDelay: "0.1s"
        }}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={card.onClick}
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              borderTop: `6px solid ${card.color}`,
              borderRadius: "var(--border-radius-md)",
              padding: "2.5rem 2rem",
              cursor: "pointer",
              boxShadow: "var(--shadow-sm)",
              transition: "transform var(--transition-fast), box-shadow var(--transition-fast)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "1.25rem",
              position: "relative",
              opacity: card.active ? 1 : 0.85
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "var(--shadow-lg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            }}
          >
            {/* Visual Icon Badge */}
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "var(--bg-primary)",
                color: card.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--shadow-sm)"
              }}
            >
              {card.icon}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                {card.title}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                {card.desc}
              </p>
            </div>

            {!card.active && (
              <span style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                fontSize: "0.7rem",
                fontWeight: 700,
                backgroundColor: "var(--border-color)",
                color: "var(--text-secondary)",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                textTransform: "uppercase"
              }}>
                Soon
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
