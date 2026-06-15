"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useLang } from "@/context/LangContext";

interface HistoryRecord {
  id: string;
  type: string;
  mode: string;
  config: string;
  score: number;
  totalQns: number;
  correctQns: number;
  createdAt: string;
}

export default function PracticeLevelsPage() {
  const { user, loading: userLoading } = useUser();
  const { language, t } = useLang();
  const router = useRouter();

  // Selected mode state
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);

  const isMulti = selectedMode.includes("Multiplication") || selectedMode.includes("Phép nhân") || selectedMode.includes("Nhân");
  const isDiv = selectedMode.includes("Division") || selectedMode.includes("Phép chia") || selectedMode.includes("Chia");

  // Configuration settings state
  const [digits, setDigits] = useState<number>(1);
  const [rows, setRows] = useState<number>(5);
  const [duration, setDuration] = useState<number>(3);
  const [inputTimeout, setInputTimeout] = useState<number>(10);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [handType, setHandType] = useState<"right" | "left" | "both">("both");

  // History state
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(true);

  const fetchHistory = React.useCallback(async () => {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/");
      return;
    }
    if (user) {
      setTimeout(() => {
        fetchHistory();
      }, 0);
    }
  }, [user, userLoading, router, fetchHistory]);

  const handleOpenConfig = (category: string, mode: string) => {
    setSelectedCategory(category);
    setSelectedMode(mode);
    setShowModal(true);

    const isMulti = mode.includes("Multiplication") || mode.includes("Phép nhân") || mode.includes("Nhân");
    const isDiv = mode.includes("Division") || mode.includes("Phép chia") || mode.includes("Chia");

    if (category === "Fingermath") {
      setHandType("both");
      setDigits(2);
      setRows(5);
      setDuration(3);
      setInputTimeout(10);
    } else if (isMulti) {
      setDigits(2); // default: 2D x 1D
      setDuration(5);
      setInputTimeout(10);
    } else if (isDiv) {
      setDigits(1); // default: 3D ÷ 1D
      setDuration(6);
      setInputTimeout(10);
    } else {
      setDigits(1);
      setRows(10);
      setDuration(5);
      setInputTimeout(15);
    }
  };

  const handleStartPlay = () => {
    const isMulti = selectedMode.includes("Multiplication") || selectedMode.includes("Phép nhân") || selectedMode.includes("Nhân");
    const isDiv = selectedMode.includes("Division") || selectedMode.includes("Phép chia") || selectedMode.includes("Chia");

    // Navigate to Arena with params
    const query = new URLSearchParams({
      category: selectedCategory,
      mode: selectedMode,
      digits: digits.toString(),
      rows: (isMulti || isDiv) ? "2" : rows.toString(),
      duration: duration.toString(),
      inputTimeout: inputTimeout.toString(),
      questions: questionCount.toString(),
      handType: selectedCategory === "Fingermath" ? handType : "both"
    });
    router.push(`/practice/play?${query.toString()}`);
  };

  if (userLoading || !user) {
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
      </div>
    );
  }

  // Categories definitions
  const categories = [
    {
      id: "Fingermath",
      title: t.fingermathTitle,
      color: "var(--math-finger)",
      modes: [
        t.flashcardMode,
        t.basicMode,
        t.littleBuddyPlus,
        t.littleBuddyMinus,
        t.bigBuddyPlus,
        t.bigBuddyMinus,
        t.mixPlusMinus,
      ],
    },
    {
      id: "Super1",
      title: language === "vi" ? "Super 1 (Soroban Cơ bản)" : "Super 1 (Abacus Basic)",
      color: "var(--math-soroban)",
      modes: [
        t.flashcardMode,
        t.basicMode,
        t.littleBuddyPlus,
        t.littleBuddyMinus,
        t.bigBuddyPlus,
        t.bigBuddyMinus,
        t.mixPlusMinus,
      ],
    },
    {
      id: "Super23",
      title: language === "vi" ? "Super 2 & 3 (Soroban Nâng cao)" : "Super 2 & 3 (Abacus Intermediate)",
      color: "var(--math-challenge)",
      modes: [
        "Super 2: +/-",
        "Super 2: " + t.multiplicationMode,
        "Super 3: +/-",
        "Super 3: " + t.multiplicationMode,
      ],
    },
    {
      id: "Super4",
      title: language === "vi" ? "Super 4 (Soroban Siêu cấp)" : "Super 4 (Abacus Advanced)",
      color: "var(--math-challenge)",
      modes: [
        "Super 4: +/-",
        "Super 4: " + t.multiplicationMode,
        "Super 4: " + t.divisionMode,
      ],
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        padding: "2rem 1.5rem",
        gap: "2.5rem",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      {/* Back button to dashboard */}
      <div className="animate-slide-up" style={{ alignSelf: "flex-start", marginBottom: "-1.5rem" }}>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            padding: "0.35rem 0.65rem",
            borderRadius: "var(--border-radius-sm)",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--accent)";
            e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-secondary)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          id="practice-back-button"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>{language === "vi" ? "Quay lại" : "Back"}</span>
        </button>
      </div>

      {/* Title */}
      <div className="animate-slide-up" style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>{t.levelSelectTitle}</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          {language === "vi" ? "Luyện tập tư duy cùng bàn tính ảo và ngón tay" : "Develop mental skills with abacus and finger techniques"}
        </p>
      </div>

      {/* Categories Grid */}
      <div
        className="animate-slide-up"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "2rem",
          animationDelay: "0.1s",
        }}
      >
        {categories.map((cat) => (
          <div
            key={cat.id}
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              borderTop: `6px solid ${cat.color}`,
              borderRadius: "var(--border-radius-md)",
              padding: "1.75rem",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
            }}
          >
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)" }}>
              {cat.title}
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
              {cat.modes.map((mode, i) => (
                <button
                  key={i}
                  onClick={() => handleOpenConfig(cat.id, mode)}
                  className="btn btn-secondary"
                  style={{
                    justifyContent: "space-between",
                    padding: "0.75rem 1rem",
                    width: "100%",
                    fontSize: "0.875rem",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{mode}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: cat.color }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* History Panel */}
      <div
        className="animate-slide-up"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--border-radius-md)",
          padding: "2rem",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          animationDelay: "0.2s",
        }}
      >
        <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>{t.historyTitle}</h3>

        {historyLoading ? (
          <div style={{ padding: "2rem 0", textAlign: "center", color: "var(--text-secondary)" }}>
            Loading history...
          </div>
        ) : history.length === 0 ? (
          <div style={{ padding: "2rem 0", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {t.historyEmpty}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid var(--border-color)", color: "var(--text-secondary)" }}>
                  <th style={{ padding: "0.75rem 1rem" }}>{t.historyDate}</th>
                  <th style={{ padding: "0.75rem 1rem" }}>{t.historyMode}</th>
                  <th style={{ padding: "0.75rem 1rem" }}>{t.historyConfig}</th>
                  <th style={{ padding: "0.75rem 1rem" }}>{t.historyCorrect}</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>{t.historyScore}</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record) => (
                  <tr key={record.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-secondary)" }}>
                      {new Date(record.createdAt).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>
                      <span style={{ color: record.type === "Fingermath" ? "var(--math-finger)" : record.type === "Soroban" ? "var(--math-soroban)" : "var(--math-challenge)", marginRight: "0.5rem" }}>
                        ●
                      </span>
                      {record.mode}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-secondary)" }}>{record.config}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <strong>{record.correctQns}</strong>/{record.totalQns}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 700, color: "var(--accent)" }}>
                      +{record.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            className="animate-pop"
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--border-radius-lg)",
              width: "100%",
              maxWidth: "460px",
              padding: "2.5rem 2rem",
              boxShadow: "var(--shadow-lg)",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{t.settingsTitle}</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                {selectedCategory} › {selectedMode}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Digits / Hand selection */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontWeight: 600 }}>
                  <span style={{ color: "var(--text-secondary)" }}>
                    {selectedCategory === "Fingermath"
                      ? (language === "vi" ? "Luyện tập tay" : "Finger Practice Mode")
                      : isMulti
                        ? (language === "vi" ? "Dạng phép nhân" : "Multiplication Format")
                        : isDiv
                          ? (language === "vi" ? "Dạng phép chia" : "Division Format")
                          : t.digitLabel}
                  </span>
                  <span style={{ color: "var(--accent)" }}>
                    {selectedCategory === "Fingermath"
                      ? handType === "right"
                        ? (language === "vi" ? "Tay phải (0-9)" : "Right Hand (0-9)")
                        : handType === "left"
                          ? (language === "vi" ? "Tay trái (10-90)" : "Left Hand (10-90)")
                          : (language === "vi" ? "Cả hai tay (0-99)" : "Both Hands (0-99)")
                      : isMulti
                        ? digits === 1
                          ? "1D × 1D"
                          : digits === 2
                            ? "2D × 1D"
                            : digits === 3
                              ? "2D × 2D"
                              : "3D × 1D"
                        : isDiv
                          ? digits === 1
                            ? "3D ÷ 1D"
                            : digits === 2
                              ? "4D ÷ 1D"
                              : "4D ÷ 2D"
                          : digits}
                  </span>
                </div>
                {selectedCategory === "Fingermath" ? (
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    {[
                      { key: "right", label: language === "vi" ? "Tay phải" : "Right Hand" },
                      { key: "left", label: language === "vi" ? "Tay trái" : "Left Hand" },
                      { key: "both", label: language === "vi" ? "Cả hai tay" : "Both Hands" }
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          setHandType(item.key as "right" | "left" | "both");
                          setDigits(item.key === "right" ? 1 : 2);
                        }}
                        className="btn"
                        style={{
                          flex: 1,
                          padding: "0.5rem 0.25rem",
                          fontSize: "0.85rem",
                          fontWeight: handType === item.key ? 700 : 500,
                          backgroundColor: handType === item.key ? "var(--accent)" : "var(--bg-primary)",
                          color: handType === item.key ? "#ffffff" : "var(--text-primary)",
                          border: `1px solid ${handType === item.key ? "var(--accent)" : "var(--border-color)"}`,
                          borderRadius: "var(--border-radius-md)",
                          cursor: "pointer",
                          textAlign: "center",
                          boxShadow: handType === item.key ? "var(--shadow-sm)" : "none",
                          transition: "all var(--transition-fast)",
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    {(isMulti ? [1, 2, 3, 4] : [1, 2, 3]).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDigits(d)}
                        className="btn"
                        style={{
                          flex: 1,
                          padding: "0.5rem 0.25rem",
                          fontSize: "0.85rem",
                          fontWeight: digits === d ? 700 : 500,
                          backgroundColor: digits === d ? "var(--accent)" : "var(--bg-primary)",
                          color: digits === d ? "#ffffff" : "var(--text-primary)",
                          border: `1px solid ${digits === d ? "var(--accent)" : "var(--border-color)"}`,
                          borderRadius: "var(--border-radius-md)",
                          cursor: "pointer",
                          textAlign: "center",
                          boxShadow: digits === d ? "var(--shadow-sm)" : "none",
                          transition: "all var(--transition-fast)",
                        }}
                      >
                        {isMulti
                          ? d === 1
                            ? "1D×1D"
                            : d === 2
                              ? "2D×1D"
                              : d === 3
                                ? "2D×2D"
                                : "3D×1D"
                          : isDiv
                            ? d === 1
                              ? "3D÷1D"
                              : d === 2
                              ? "4D÷1D"
                                : "4D÷2D"
                            : `${d}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Rows selection (Segmented button bar) - Hidden for Multi/Div */}
              {!isMulti && !isDiv && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontWeight: 600 }}>
                    <span style={{ color: "var(--text-secondary)" }}>{t.rowsLabel}</span>
                    <span style={{ color: "var(--accent)" }}>{rows}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                    {[2, 3, 4, 5, 6, 10, 15, 20].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRows(r)}
                        className="btn"
                        style={{
                          flex: "1 0 calc(25% - 0.35rem)",
                          minWidth: "48px",
                          padding: "0.5rem 0.25rem",
                          fontSize: "0.85rem",
                          fontWeight: rows === r ? 700 : 500,
                          backgroundColor: rows === r ? "var(--accent)" : "var(--bg-primary)",
                          color: rows === r ? "#ffffff" : "var(--text-primary)",
                          border: `1px solid ${rows === r ? "var(--accent)" : "var(--border-color)"}`,
                          borderRadius: "var(--border-radius-md)",
                          cursor: "pointer",
                          textAlign: "center",
                          boxShadow: rows === r ? "var(--shadow-sm)" : "none",
                          transition: "all var(--transition-fast)",
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Display Duration selection (Segmented button bar) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontWeight: 600 }}>
                  <span style={{ color: "var(--text-secondary)" }}>{t.displayDurationLabel}</span>
                  <span style={{ color: "var(--accent)" }}>{duration}s</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {[2, 3, 4, 5, 6, 10].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className="btn"
                      style={{
                        flex: "1 0 calc(33.33% - 0.35rem)",
                        minWidth: "60px",
                        padding: "0.5rem 0.25rem",
                        fontSize: "0.85rem",
                        fontWeight: duration === d ? 700 : 500,
                        backgroundColor: duration === d ? "var(--accent)" : "var(--bg-primary)",
                        color: duration === d ? "#ffffff" : "var(--text-primary)",
                        border: `1px solid ${duration === d ? "var(--accent)" : "var(--border-color)"}`,
                        borderRadius: "var(--border-radius-md)",
                        cursor: "pointer",
                        textAlign: "center",
                        boxShadow: duration === d ? "var(--shadow-sm)" : "none",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Timeout selection (Segmented button bar) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontWeight: 600 }}>
                  <span style={{ color: "var(--text-secondary)" }}>{t.inputTimeoutLabel}</span>
                  <span style={{ color: "var(--accent)" }}>{inputTimeout === 0 ? t.infinite : `${inputTimeout}s`}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {[5, 10, 15, 20, 30, 0].map((tVal) => (
                    <button
                      key={tVal}
                      type="button"
                      onClick={() => setInputTimeout(tVal)}
                      className="btn"
                      style={{
                        flex: "1 0 calc(33.33% - 0.35rem)",
                        minWidth: "60px",
                        padding: "0.5rem 0.25rem",
                        fontSize: "0.85rem",
                        fontWeight: inputTimeout === tVal ? 700 : 500,
                        backgroundColor: inputTimeout === tVal ? "var(--accent)" : "var(--bg-primary)",
                        color: inputTimeout === tVal ? "#ffffff" : "var(--text-primary)",
                        border: `1px solid ${inputTimeout === tVal ? "var(--accent)" : "var(--border-color)"}`,
                        borderRadius: "var(--border-radius-md)",
                        cursor: "pointer",
                        textAlign: "center",
                        boxShadow: inputTimeout === tVal ? "var(--shadow-sm)" : "none",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      {tVal === 0 ? t.infinite : `${tVal}s`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Questions selection */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontWeight: 600 }}>
                  <span style={{ color: "var(--text-secondary)" }}>{t.questionLimitLabel}</span>
                  <span style={{ color: "var(--accent)" }}>{questionCount}</span>
                </div>
                <div style={{ display: "flex", gap: "0.35rem" }}>
                  {[5, 10, 15, 20].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuestionCount(q)}
                      className="btn"
                      style={{
                        flex: 1,
                        padding: "0.5rem 0.25rem",
                        fontSize: "0.85rem",
                        fontWeight: questionCount === q ? 700 : 500,
                        backgroundColor: questionCount === q ? "var(--accent)" : "var(--bg-primary)",
                        color: questionCount === q ? "#ffffff" : "var(--text-primary)",
                        border: `1px solid ${questionCount === q ? "var(--accent)" : "var(--border-color)"}`,
                        borderRadius: "var(--border-radius-md)",
                        cursor: "pointer",
                        textAlign: "center",
                        boxShadow: questionCount === q ? "var(--shadow-sm)" : "none",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                {t.cancelBtn}
              </button>
              <button
                onClick={handleStartPlay}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {t.startBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
