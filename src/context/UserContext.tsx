"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useTheme } from "./ThemeContext";
import { useLang } from "./LangContext";

export interface User {
  id: string;
  username: string;
  fullName: string;
  powerScore: number;
  theme: string;
  language: string;
  level: string;
  role: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setTheme } = useTheme();
  const { setLanguage } = useLang();

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
          if (data.user.theme) {
            setTheme(data.user.theme as "light" | "dark");
          }
          if (data.user.language) {
            setLanguage(data.user.language as "vi" | "en");
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user session:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setTheme, setLanguage]);

  useEffect(() => {
    const handleInit = () => {
      refreshUser();
    };
    // Defer state update to avoid cascading renders warning
    setTimeout(handleInit, 0);
  }, [refreshUser]);

  const login = (newUser: User) => {
    setUser(newUser);
    if (newUser.theme) setTheme(newUser.theme as "light" | "dark");
    if (newUser.language) setLanguage(newUser.language as "vi" | "en");
  };

  const logout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout, updateUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
