"use client";

import React from "react";
import { useLang } from "@/context/LangContext";

export const LangToggle: React.FC = () => {
  const { language, setLanguage } = useLang();

  return (
    <div
      style={{
        display: "inline-flex",
        backgroundColor: "var(--bg-primary)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--border-radius-md)",
        padding: "0.25rem",
        gap: "0.25rem",
        boxShadow: "var(--shadow-sm)",
      }}
      id="lang-toggle"
    >
      <button
        onClick={() => setLanguage("vi")}
        style={{
          padding: "0.25rem 0.75rem",
          borderRadius: "8px",
          border: "none",
          backgroundColor: language === "vi" ? "var(--accent)" : "transparent",
          color: language === "vi" ? "#ffffff" : "var(--text-secondary)",
          fontWeight: 600,
          fontSize: "0.875rem",
          cursor: "pointer",
          transition: "all var(--transition-fast)",
        }}
      >
        VN
      </button>
      <button
        onClick={() => setLanguage("en")}
        style={{
          padding: "0.25rem 0.75rem",
          borderRadius: "8px",
          border: "none",
          backgroundColor: language === "en" ? "var(--accent)" : "transparent",
          color: language === "en" ? "#ffffff" : "var(--text-secondary)",
          fontWeight: 600,
          fontSize: "0.875rem",
          cursor: "pointer",
          transition: "all var(--transition-fast)",
        }}
      >
        EN
      </button>
    </div>
  );
};
