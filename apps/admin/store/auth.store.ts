import { useState, useCallback, useEffect } from "react";
import Admin from "../Domain/User";

interface AuthStore {
  token: string | null;
  setToken: (token: string | null) => void;
  user: Admin | null;
  setUser: (user: Admin | null) => void;
}

export function useAuthStore(): AuthStore {
  const [user, setUserState] = useState<Admin | null>(null);

  // Initialize from localStorage on mount (client-only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("authAdmin");
      if (storedUser) {
        try {
          const data = JSON.parse(storedUser);
          setUserState({
            id: data.id,
            name: data.name,
            email: data.email,
            createdAt: new Date(data.createdAt),
          });
        } catch (e) {
          console.error("Failed to parse user from local storage", e);
        }
      }
    }
  }, []);

  const setUser = useCallback((user: Admin | null) => {
    setUserState(user);
    if (user) {
      localStorage.setItem("authAdmin", JSON.stringify(user));
    } else {
      localStorage.removeItem("authAdmin");
    }
  }, []);

  return {
    token: null, // Legacy support, always null for cookie auth
    setToken: () => {}, // No-op
    user,
    setUser,
  };
}
