"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "vi" | "en";

const translations = {
  vi: {
    loginTitle: "HỌC TOÁN TRÍ TUỆ",
    loginSubtitle: "Chào mừng bạn đến với FreeMath - Nâng tầm trí tuệ trẻ thơ",
    usernameLabel: "Tên đăng nhập / Số điện thoại",
    passwordLabel: "Mật khẩu",
    loginBtn: "Đăng nhập",
    loginError: "Sai tài khoản hoặc mật khẩu!",
    loginEmpty: "Vui lòng nhập đầy đủ thông tin đăng nhập!",
    logoutBtn: "Đăng xuất",
    welcome: "Xin chào",
    powerScore: "Điểm năng lượng",
    currentLevel: "Trình độ hiện tại",
    lessonsTab: "BÀI HỌC",
    lessonsDesc: "XÂY DỰNG NỀN TẢNG VỮNG CHẮC",
    practiceTab: "LUYỆN TẬP",
    practiceDesc: "RÈN LUYỆN TƯ DUY MỖI NGÀY",
    challengeTab: "THỬ THÁCH",
    challengeDesc: "THI ĐẤU CÙNG CÁC BẠN BÈ",
    levelSelectTitle: "Lựa chọn Trình độ & Chuyên đề",
    fingermathTitle: "Luyện tập Ngón tay (Fingermath)",
    sorobanTitle: "Bàn tính Soroban",
    superTitle: "Các cấp độ siêu cấp (Super Levels)",
    // Modes
    flashcardMode: "Thẻ số chớp nhoáng (Flashcard)",
    basicMode: "Cộng trừ cơ bản (Basic)",
    littleBuddyPlus: "Anh bạn nhỏ cộng (Little Buddy +)",
    littleBuddyMinus: "Anh bạn nhỏ trừ (Little Buddy -)",
    bigBuddyPlus: "Anh bạn lớn cộng (Big Buddy +)",
    bigBuddyMinus: "Anh bạn lớn trừ (Big Buddy -)",
    mixPlusMinus: "Phối hợp cộng trừ (+/-)",
    // Config modal
    settingsTitle: "Cấu hình bài luyện tập",
    digitLabel: "Số chữ số",
    rowsLabel: "Số dòng (phép tính)",
    speedLabel: "Tốc độ chớp số (giây)",
    questionLimitLabel: "Số câu hỏi",
    startBtn: "Bắt đầu",
    cancelBtn: "Hủy bỏ",
    // Arena
    sentenceProgress: "Câu hỏi",
    enterResult: "Nhập kết quả...",
    showAnswer: "Hiện đáp án",
    nextBtn: "Tiếp theo",
    finishBtn: "Hoàn thành",
    correct: "Chính xác!",
    incorrect: "Sai rồi!",
    correctAnswer: "Đáp án đúng là",
    yourAnswer: "Đáp án của bạn là",
    resultsTitle: "KẾT QUẢ BÀI LUYỆN TẬP",
    resultsScore: "Điểm đạt được",
    resultsAccuracy: "Độ chính xác",
    backToDashboard: "Về trang chủ",
    practiceAgain: "Luyện tập lại",
    historyTitle: "Lịch sử luyện tập",
    historyEmpty: "Chưa có dữ liệu luyện tập nào.",
    historyDate: "Ngày",
    historyMode: "Chuyên đề",
    historyConfig: "Cấu hình",
    historyScore: "Điểm",
    historyCorrect: "Đúng/Tổng",
    levelPrefix: "Trình độ",
    displayDurationLabel: "Thời gian hiển thị (giây)",
    inputTimeoutLabel: "Thời gian nhập câu trả lời (giây)",
    infinite: "Vô hạn",
    timeRemaining: "Thời gian còn lại",
    multiplicationMode: "Phép nhân (Multiplication)",
    divisionMode: "Phép chia (Division)",
  },
  en: {
    loginTitle: "MENTAL MATH PORTAL",
    loginSubtitle: "Welcome to FreeMath - Unleashing kids' cognitive potential",
    usernameLabel: "Username / Phone number",
    passwordLabel: "Password",
    loginBtn: "Log In",
    loginError: "Incorrect username or password!",
    loginEmpty: "Please enter all login credentials!",
    logoutBtn: "Log Out",
    welcome: "Welcome",
    powerScore: "Power Score",
    currentLevel: "Current Level",
    lessonsTab: "LESSONS",
    lessonsDesc: "BUILD A STRONG FOUNDATION",
    practiceTab: "PRACTICE",
    practiceDesc: "SHARPEN MIND EVERY DAY",
    challengeTab: "CHALLENGE",
    challengeDesc: "COMPETE WITH FRIENDS",
    levelSelectTitle: "Select Training Levels",
    fingermathTitle: "Fingermath Training",
    sorobanTitle: "Soroban Abacus",
    superTitle: "Super Levels",
    // Modes
    flashcardMode: "Flash Numbers (Flashcard)",
    basicMode: "Basic Arithmetic",
    littleBuddyPlus: "Little Buddy Addition (+)",
    littleBuddyMinus: "Little Buddy Subtraction (-)",
    bigBuddyPlus: "Big Buddy Addition (+)",
    bigBuddyMinus: "Big Buddy Subtraction (-)",
    mixPlusMinus: "Mix Addition/Subtraction (+/-)",
    // Config modal
    settingsTitle: "Practice Configuration",
    digitLabel: "Number of Digits",
    rowsLabel: "Number of Rows",
    speedLabel: "Flash Speed (seconds)",
    questionLimitLabel: "Number of Questions",
    startBtn: "Start",
    cancelBtn: "Cancel",
    // Arena
    sentenceProgress: "Question",
    enterResult: "Enter result...",
    showAnswer: "Show Answer",
    nextBtn: "Next",
    finishBtn: "Finish",
    correct: "Correct!",
    incorrect: "Incorrect!",
    correctAnswer: "Correct answer is",
    yourAnswer: "Your answer is",
    resultsTitle: "PRACTICE RESULTS",
    resultsScore: "Score Earned",
    resultsAccuracy: "Accuracy",
    backToDashboard: "Back to Home",
    practiceAgain: "Practice Again",
    historyTitle: "Practice History",
    historyEmpty: "No practice history found.",
    historyDate: "Date",
    historyMode: "Mode",
    historyConfig: "Config",
    historyScore: "Score",
    historyCorrect: "Correct/Total",
    levelPrefix: "Level",
    displayDurationLabel: "Display duration (seconds)",
    inputTimeoutLabel: "Time limit to answer (seconds)",
    infinite: "Infinite",
    timeRemaining: "Time remaining",
    multiplicationMode: "Multiplication (x)",
    divisionMode: "Division (÷)",
  }
};

type Dict = typeof translations.vi;

interface LangContextType {
  language: Language;
  t: Dict;
  setLanguage: (lang: Language) => void;
}

const LangContext = createContext<LangContextType | undefined>(undefined);

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("vi");

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang === "vi" || savedLang === "en") {
      setTimeout(() => {
        setLanguageState(savedLang);
      }, 0);
    }
  }, []);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem("language", newLang);

    // Sync database settings if authenticated
    fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: newLang }),
    }).catch(() => {});
  };

  const t = translations[language];

  return (
    <LangContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error("useLang must be used within a LangProvider");
  }
  return context;
};
