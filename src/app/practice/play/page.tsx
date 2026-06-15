"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useLang } from "@/context/LangContext";
import { generateMathSequence } from "@/lib/utils";

interface Question {
  numbers: number[];
  answer: number;
}

import Image from "next/image";

import f0 from "@/pictures/fingers/0.png";
import f1 from "@/pictures/fingers/1.png";
import f2 from "@/pictures/fingers/2.png";
import f3 from "@/pictures/fingers/3.png";
import f4 from "@/pictures/fingers/4.png";
import f5 from "@/pictures/fingers/5.png";
import f6 from "@/pictures/fingers/6.png";
import f7 from "@/pictures/fingers/7.png";
import f8 from "@/pictures/fingers/8.png";
import f9 from "@/pictures/fingers/9.png";

import f10 from "@/pictures/fingers/10.png";
import f20 from "@/pictures/fingers/20.png";
import f30 from "@/pictures/fingers/30.png";
import f40 from "@/pictures/fingers/40.png";
import f50 from "@/pictures/fingers/50.png";
import f60 from "@/pictures/fingers/60.png";
import f70 from "@/pictures/fingers/70.png";
import f80 from "@/pictures/fingers/80.png";
import f90 from "@/pictures/fingers/90.png";

import type { StaticImageData } from "next/image";

const rightHandImages: Record<number, StaticImageData> = {
  0: f0, 1: f1, 2: f2, 3: f3, 4: f4,
  5: f5, 6: f6, 7: f7, 8: f8, 9: f9
};

const leftHandImages: Record<number, StaticImageData> = {
  10: f10, 20: f20, 30: f30, 40: f40, 50: f50,
  60: f60, 70: f70, 80: f80, 90: f90
};

function FingermathHands({ value, handType, language }: { value: number; handType: string; language: string }) {
  const T = Math.floor(value / 10) % 10;
  const U = value % 10;

  const showLeft = handType === "left" || handType === "both";
  const showRight = handType === "right" || handType === "both";

  const leftImgSrc = leftHandImages[T * 10];
  const rightImgSrc = rightHandImages[U];

  return (
    <div style={{ display: "flex", gap: "2rem", justifyContent: "center", alignItems: "center", marginTop: "1rem" }}>
      {showLeft && leftImgSrc && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)" }}>
            {language === "vi" ? "Tay Trái (Hàng chục)" : "Left Hand (Tens)"}
          </span>
          <div style={{ position: "relative", width: "100px", height: "120px" }}>
            <Image
              src={leftImgSrc}
              alt={`Left Hand ${T * 10}`}
              fill
              style={{ objectFit: "contain" }}
              sizes="100px"
              priority
            />
          </div>
        </div>
      )}

      {showRight && rightImgSrc && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)" }}>
            {language === "vi" ? "Tay Phải (Hàng đơn vị)" : "Right Hand (Units)"}
          </span>
          <div style={{ position: "relative", width: "100px", height: "120px" }}>
            <Image
              src={rightImgSrc}
              alt={`Right Hand ${U}`}
              fill
              style={{ objectFit: "contain" }}
              sizes="100px"
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
}

function PlayArenaContent() {
  const { user, refreshUser, loading: userLoading } = useUser();
  const { language, t } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Params extraction
  const category = searchParams.get("category") || "Fingermath";
  const mode = searchParams.get("mode") || t.basicMode;
  const digits = parseInt(searchParams.get("digits") || "1");
  const rows = parseInt(searchParams.get("rows") || "5");
  const duration = parseFloat(searchParams.get("duration") || "3.0");
  const inputTimeout = parseInt(searchParams.get("inputTimeout") || "10");
  const totalQuestions = parseInt(searchParams.get("questions") || "10");
  const handType = searchParams.get("handType") || "both";

  const isFingermathFlashcard = category === "Fingermath" && (
    mode.includes("Flashcard") || 
    mode.includes("chớp nhoáng") || 
    mode.includes("Thẻ số") || 
    mode.includes("Flash")
  );

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  
  // Game state: "start" | "flashing" -> "inputting" -> "checked" -> "summary"
  const [gameState, setGameState] = useState<"start" | "flashing" | "inputting" | "checked" | "summary">("flashing");
  
  // Flashing index
  const [flashIndex, setFlashIndex] = useState<number>(0);
  const [currentFlashVal, setCurrentFlashVal] = useState<string>("");
  
  // Input answer state
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);
  
  // Countdown timer state
  const [inputTimerVal, setInputTimerVal] = useState<number>(inputTimeout);
  
  // Submitting final score state
  const [savingResult, setSavingResult] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sound ref for feedback (optional simple oscillator sound to bypass asset loading issues)
  const playBeep = React.useCallback((freq: number, type: OscillatorType, duration: number) => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context blocked or unsupported
    }
  }, []);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/");
      return;
    }

    if (questions.length === 0) {
      // Generate questions on mount
      const generated: Question[] = [];
      const actualRows = isFingermathFlashcard ? 1 : rows;
      for (let i = 0; i < totalQuestions; i++) {
        generated.push(generateMathSequence(category, mode, digits, actualRows, handType));
      }
      setTimeout(() => {
        setQuestions(generated);
      }, 0);
    }
  }, [user, userLoading, router, category, mode, digits, rows, totalQuestions, questions.length, handType, isFingermathFlashcard]);

  // Flashing step timings based on total duration and number of rows
  const stepMs = (duration / rows) * 1000;
  const blankMs = Math.min(100, stepMs * 0.2);
  const visibleMs = stepMs - blankMs;

  // Handle flashing cycle
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameState === "flashing" && questions.length > 0) {
      const currentQ = questions[currentQIndex];
      const isMulti = mode.includes("Multiplication") || mode.includes("Phép nhân") || mode.includes("Nhân") || mode.includes("x") || mode.includes("X");
      const isDiv = mode.includes("Division") || mode.includes("Phép chia") || mode.includes("Chia") || mode.includes("÷");

      if (isMulti || isDiv) {
        const symbol = isMulti ? "×" : "÷";
        const formattedVal = `${currentQ.numbers[0]} ${symbol} ${currentQ.numbers[1]}`;
        setTimeout(() => {
          setCurrentFlashVal(formattedVal);
        }, 0);
        playBeep(600, "sine", 0.1);

        timer = setTimeout(() => {
          setGameState("inputting");
          setUserAnswer("");
          playBeep(800, "triangle", 0.15);
        }, duration * 1000);
      } else {
        if (flashIndex < currentQ.numbers.length) {
          const val = currentQ.numbers[flashIndex];
          // Format string with sign
          const formattedVal = val > 0 && flashIndex > 0 ? `+${val}` : `${val}`;
          setTimeout(() => {
            setCurrentFlashVal(formattedVal);
          }, 0);
          playBeep(600, "sine", 0.1);

          timer = setTimeout(() => {
            // Temporarily empty value for brief flash effect
            setCurrentFlashVal("");
            timer = setTimeout(() => {
              setFlashIndex(flashIndex + 1);
            }, blankMs); // Dynamic blank state
          }, visibleMs); // Dynamic visible state
        } else {
          // Flashing complete, proceed to input
          setTimeout(() => {
            setGameState("inputting");
            setUserAnswer("");
          }, 0);
          playBeep(800, "triangle", 0.15);
        }
      }
    }

    return () => clearTimeout(timer);
  }, [gameState, flashIndex, currentQIndex, questions, visibleMs, blankMs, playBeep, mode, duration]);

  const handleKeypadPress = React.useCallback((val: string) => {
    if (gameState !== "inputting") return;

    if (val === "backspace") {
      setUserAnswer((prev) => prev.slice(0, -1));
    } else if (val === "-") {
      if (userAnswer === "") {
        setUserAnswer("-");
      }
    } else {
      // Avoid double minus or leading zeros
      if (userAnswer === "0") {
        setUserAnswer(val);
      } else {
        setUserAnswer((prev) => prev + val);
      }
    }
  }, [gameState, userAnswer]);

  const handleCheckAnswer = React.useCallback(() => {
    if (gameState !== "inputting") return;
    
    const ansNum = userAnswer === "" ? NaN : parseInt(userAnswer);
    const correctAns = questions[currentQIndex].answer;
    const isAnsCorrect = ansNum === correctAns;

    setIsCorrect(isAnsCorrect);
    setGameState("checked");

    if (isAnsCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
      setTotalScore((prev) => prev + 10);
      playBeep(880, "sine", 0.2); // high beep for correct
    } else {
      playBeep(220, "sawtooth", 0.3); // low buzz for incorrect
    }
  }, [gameState, userAnswer, questions, currentQIndex, playBeep]);

  const checkAnswerRef = useRef(handleCheckAnswer);
  useEffect(() => {
    checkAnswerRef.current = handleCheckAnswer;
  }, [handleCheckAnswer]);

  // Synchronize timer value when game enters inputting state
  useEffect(() => {
    if (gameState === "inputting") {
      setTimeout(() => {
        setInputTimerVal(inputTimeout);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    }
  }, [gameState, inputTimeout]);

  // Countdown timer handler for inputting state
  useEffect(() => {
    if (gameState !== "inputting" || inputTimeout <= 0) return;

    const intervalId = setInterval(() => {
      setInputTimerVal((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          // Trigger timeout check
          checkAnswerRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [gameState, inputTimeout]);

  const handleFinishGame = React.useCallback(async () => {
    setGameState("summary");
    setSavingResult(true);
    
    try {
      const configStr = `${digits}D/${rows}R/${duration}S` + (inputTimeout > 0 ? `/${inputTimeout}T` : "/InfT");
      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: category,
          mode,
          config: configStr,
          score: totalScore,
          totalQns: totalQuestions,
          correctQns: correctAnswersCount,
        }),
      });
      // Refresh user stats so score updates immediately in Navbar
      await refreshUser();
    } catch (err) {
      console.error("Failed to save play history:", err);
    } finally {
      setSavingResult(false);
    }
  }, [digits, rows, duration, inputTimeout, category, mode, totalScore, totalQuestions, correctAnswersCount, refreshUser]);

  const handleNextQuestion = React.useCallback(() => {
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex((prev) => prev + 1);
      setFlashIndex(0);
      setCurrentFlashVal("");
      setGameState("flashing");
    } else {
      // Finished all questions, save scores
      handleFinishGame();
    }
  }, [currentQIndex, questions.length, handleFinishGame]);

  // Listen to physical keyboard events during input phase
  useEffect(() => {
    if (gameState !== "inputting") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleCheckAnswer();
        return;
      }

      // If user presses keys but doesn't have focus, redirect it
      if (document.activeElement !== inputRef.current && inputRef.current) {
        inputRef.current.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, handleCheckAnswer]);

  // Automatically transition to next question or summary after checking answer
  useEffect(() => {
    if (gameState !== "checked") return;

    const timer = setTimeout(() => {
      handleNextQuestion();
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, [gameState, handleNextQuestion]);

  if (userLoading || !user || questions.length === 0) {
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

  const currentQ = questions[currentQIndex];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      <div
        className="animate-pop"
        style={{
          width: "100%",
          maxWidth: "540px",
          backgroundColor: "var(--bg-secondary)",
          border: `1px solid ${
            gameState === "checked"
              ? isCorrect
                ? "var(--success)"
                : "var(--error)"
              : "var(--border-color)"
          }`,
          borderRadius: "var(--border-radius-lg)",
          boxShadow: "var(--shadow-lg)",
          padding: "2.5rem 2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          transition: "border var(--transition-normal)",
        }}
      >
        {/* Game Arena Head */}
        {gameState !== "summary" && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", width: "100%" }}>
            <button
              onClick={() => router.push("/practice")}
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
                padding: "0.25rem 0.5rem",
                borderRadius: "var(--border-radius-sm)",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--accent)";
                e.currentTarget.style.backgroundColor = "var(--bg-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              id="arena-back-button"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>{language === "vi" ? "Quay lại" : "Back"}</span>
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                {mode} ({digits}D/{rows}R)
              </span>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent)", backgroundColor: "var(--accent-light)", padding: "0.25rem 0.75rem", borderRadius: "var(--border-radius-full)" }}>
                {t.sentenceProgress} {currentQIndex + 1}/{totalQuestions}
              </span>
            </div>
          </div>
        )}

        {/* 2. FLASHING Screen */}
        {gameState === "flashing" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "260px",
              position: "relative",
              overflow: "hidden",
              gap: "1.5rem"
            }}
          >
            {currentFlashVal && !isFingermathFlashcard && (
              <span
                key={flashIndex}
                className="animate-flash"
                style={{
                  fontSize: currentFlashVal.length > 5 ? "3.5rem" : currentFlashVal.length > 3 ? "5.0rem" : "6.5rem",
                  fontWeight: 800,
                  fontFamily: "var(--font-outfit)",
                  color: currentFlashVal.startsWith("-") ? "var(--error)" : "var(--accent)",
                  userSelect: "none",
                }}
              >
                {currentFlashVal}
              </span>
            )}
            {category === "Fingermath" && currentFlashVal && (
              <FingermathHands 
                value={Math.abs(parseInt(currentFlashVal) || 0)} 
                handType={handType} 
                language={language}
              />
            )}
          </div>
        )}

        {/* 3. INPUTTING / CHECKED Screen */}
        {(gameState === "inputting" || gameState === "checked") && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {category === "Fingermath" && (
              <div style={{ display: "flex", justifyContent: "center", margin: "0.5rem 0" }}>
                <FingermathHands 
                  value={Math.abs(gameState === "checked" ? (questions[currentQIndex]?.answer || 0) : (parseInt(userAnswer) || 0))} 
                  handType={handType} 
                  language={language}
                />
              </div>
            )}
            {/* Countdown timer for entering result */}
            {gameState === "inputting" && inputTimeout > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--border-radius-sm)",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  backgroundColor: inputTimerVal <= 3 ? "var(--error-light)" : "var(--accent-light)",
                  color: inputTimerVal <= 3 ? "var(--error)" : "var(--accent)",
                  transition: "all var(--transition-normal)",
                }}
              >
                <span>{t.timeRemaining}:</span>
                <span style={{ fontFamily: "var(--font-outfit)", fontSize: "1.15rem" }}>
                  {inputTimerVal}s
                </span>
              </div>
            )}

            {/* Real Text Input for keyboard entry (mobile & desktop) */}
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="-?[0-9]*"
              value={userAnswer}
              onChange={(e) => {
                if (gameState !== "inputting") return;
                const val = e.target.value;
                if (/^-?[0-9]*$/.test(val)) {
                  setUserAnswer(val);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && userAnswer !== "") {
                  e.preventDefault();
                  handleCheckAnswer();
                }
              }}
              readOnly={gameState === "checked"}
              placeholder={gameState === "inputting" ? t.enterResult : ""}
              autoFocus
              style={{
                backgroundColor: "var(--bg-primary)",
                border: `1.5px solid ${gameState === "checked" ? (isCorrect ? "var(--success)" : "var(--error)") : "var(--border-color)"}`,
                borderRadius: "var(--border-radius-md)",
                padding: "1rem",
                textAlign: "center",
                fontSize: "2.5rem",
                fontWeight: 800,
                width: "100%",
                height: "76px",
                color: gameState === "checked" ? (isCorrect ? "var(--success)" : "var(--error)") : "var(--text-primary)",
                outline: "none",
                fontFamily: "var(--font-outfit)",
                transition: "all var(--transition-normal)",
              }}
            />

            {/* Answer Feedbacks */}
            {gameState === "checked" && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--border-radius-sm)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  textAlign: "center",
                  backgroundColor: isCorrect ? "var(--success-light)" : "var(--error-light)",
                  color: isCorrect ? "var(--success)" : "var(--error)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                {isCorrect ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{t.correct} (+10 score)</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <span>
                      {t.incorrect}. {t.correctAnswer}: <strong style={{ fontSize: "1.1rem" }}>{currentQ.answer}</strong>
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Custom Interactive Keypad (Task 4.2 controls) */}
            {gameState === "inputting" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }} className="keypad-container">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        handleKeypadPress(num);
                        inputRef.current?.focus();
                      }}
                      className="btn btn-secondary"
                      style={{ padding: "0.75rem", fontSize: "1.5rem", fontWeight: 700 }}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      handleKeypadPress("-");
                      inputRef.current?.focus();
                    }}
                    className="btn btn-secondary"
                    style={{ padding: "0.75rem", fontSize: "1.5rem", fontWeight: 700 }}
                  >
                    -
                  </button>
                  <button
                    onClick={() => {
                      handleKeypadPress("0");
                      inputRef.current?.focus();
                    }}
                    className="btn btn-secondary"
                    style={{ padding: "0.75rem", fontSize: "1.5rem", fontWeight: 700 }}
                  >
                    0
                  </button>
                  <button
                    onClick={() => {
                      handleKeypadPress("backspace");
                      inputRef.current?.focus();
                    }}
                    className="btn btn-secondary"
                    style={{ padding: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}
                    aria-label="Delete"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                      <line x1="18" y1="9" x2="12" y2="15" />
                      <line x1="12" y1="9" x2="18" y2="15" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={handleCheckAnswer}
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "1rem", fontSize: "1.15rem", fontWeight: 700, marginTop: "0.5rem" }}
                  disabled={userAnswer === ""}
                  id="submit-answer-button"
                >
                  Ok
                </button>
              </div>
            ) : (
              /* Action button after answer checked */
              <button
                onClick={handleNextQuestion}
                className="btn btn-primary"
                style={{ width: "100%", padding: "1rem", fontSize: "1.15rem", fontWeight: 700 }}
                id="next-question-button"
              >
                {currentQIndex + 1 < questions.length ? t.nextBtn : t.finishBtn}
              </button>
            )}
          </div>
        )}

        {/* 4. SUMMARY Screen */}
        {gameState === "summary" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "1rem 0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "center" }}>
              <h2 style={{ fontSize: "2rem", fontWeight: 800 }}>{t.resultsTitle}</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                {language === "vi" ? "Bài luyện tập đã hoàn thành!" : "Practice session completed!"}
              </p>
            </div>

            {/* Score box */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "var(--bg-primary)",
                border: "1.5px solid var(--border-color)",
                borderRadius: "var(--border-radius-md)",
                padding: "2rem",
                gap: "1.5rem",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  {t.resultsAccuracy}
                </span>
                <span style={{ fontSize: "3rem", fontWeight: 800, color: "var(--accent)" }}>
                  {correctAnswersCount} / {totalQuestions}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", borderTop: "1px solid var(--border-color)", paddingTop: "1rem", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{t.resultsScore}</span>
                <strong style={{ color: "var(--accent)" }}>+{totalScore} Power</strong>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <button
                onClick={() => router.push("/practice")}
                className="btn btn-secondary"
                style={{ flex: 1 }}
                disabled={savingResult}
              >
                {t.backToDashboard}
              </button>
              <button
                onClick={() => {
                  // Restart the same settings
                  setCurrentQIndex(0);
                  setCorrectAnswersCount(0);
                  setTotalScore(0);
                  setFlashIndex(0);
                  setCurrentFlashVal("");
                  setGameState("flashing");
                  // Regenerate questions
                  const generated: Question[] = [];
                  const actualRows = isFingermathFlashcard ? 1 : rows;
                  for (let i = 0; i < totalQuestions; i++) {
                    generated.push(generateMathSequence(category, mode, digits, actualRows, handType));
                  }
                  setQuestions(generated);
                }}
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={savingResult}
                id="practice-again-button"
              >
                {t.practiceAgain}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlayArenaPage() {
  return (
    <Suspense fallback={
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
    }>
      <PlayArenaContent />
    </Suspense>
  );
}
