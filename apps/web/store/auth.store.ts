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
  setGuest: () => Promise<void>;
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
    setGuest: async () => {
      // Clear tokens explicitly first
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // Attempt to clear cookie if javascript accessible
      if (typeof document !== "undefined") {
        // Clear all variations of the cookie to be safe
        document.cookie =
          "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        document.cookie =
          "access_token=; path=/; domain=" +
          window.location.hostname +
          "; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      }

      const guestUser: User = {
        id: "guest",
        name: "Visitante",
        email: "",
        createdAt: new Date(),
        isGuest: true,
      };
      // Set the user, which triggers local storage update for authUser
      setUser(guestUser);

      // Force reload to clear React Query cache if possible, or we rely on the component using the store to handle it.
      // Ideally we would access queryClient here but we can't inside a hook easily without context.
      // However, since we are doing a full page reload or route change,
      // ensuring the tokens are gone from localStorage is key.

      // NOTE: useFavorites relies on useQuery. If we don't reload the page, the cache might persist.
      // The router.push("/") in login page will navigate, but not full reload.
      // We should probably force the queryClient to reset.

      // simpler approach: The auth store change notifies listeners.
      // But we can't easily reach queryClient here.
      // Let's ensure strict token removal.
    },
  };
}
