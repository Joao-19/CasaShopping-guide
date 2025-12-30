import { useState, useEffect } from "react";
import User from "../Domain/User";

// Global State (Singleton)
let globalUser: User | null = null;
const listeners = new Set<(user: User | null) => void>();

// Helper to notify all listeners
const notify = () => {
  listeners.forEach((listener) => listener(globalUser));
};

// Initialize from localStorage immediately (if in browser) to set initial state
if (typeof window !== "undefined") {
  try {
    const stored = localStorage.getItem("authUser");
    if (stored) {
      const data = JSON.parse(stored);
      globalUser = {
        ...data,
        createdAt: new Date(data.createdAt),
      };
    }
  } catch (e) {
    console.error("Failed to parse user from local storage", e);
  }
}

interface AuthStore {
  token: string | null;
  setToken: (token: string | null) => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

export function useAuthStore(): AuthStore {
  const [user, setUserState] = useState<User | null>(globalUser);

  useEffect(() => {
    // Sync local state with global state on mount
    setUserState(globalUser);

    // Subscribe to changes
    const listener = (newUser: User | null) => {
      setUserState(newUser);
    };
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const setUser = (newUser: User | null) => {
    globalUser = newUser;
    if (newUser) {
      localStorage.setItem("authUser", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("authUser");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
    notify();
  };

  return {
    token: null,
    setToken: () => {}, // No-op
    user,
    setUser,
  };
}
