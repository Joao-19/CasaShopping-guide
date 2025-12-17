import { useState, useCallback, useEffect } from "react";
import User from "../Domain/User";
import Cookies from "js-cookie";

interface AuthStore {
  token: string | null;
  setToken: (token: string | null) => void;
  user: User | null;
  setUser: (user: User) => void;
}

export function useAuthStore(): AuthStore {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUserState] = useState<User | null>(null);

  // Initialize from localStorage on mount (client-only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("authToken");
      if (storedToken) setTokenState(storedToken);

      const storedUser = localStorage.getItem("authUser");
      if (storedUser) {
        try {
          const data = JSON.parse(storedUser);
          setUserState({
            uuid: data.id || data.uuid,
            name: data.name,
            loginToken: data.loginToken,
            email: data.email,
          });
        } catch (e) {
          console.error("Failed to parse user from local storage", e);
        }
      }
    }
  }, []);

  const setToken = useCallback((newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem("authToken", newToken); // Setting Local Storage
      Cookies.set("token", newToken, { expires: 7 }); // Setting Cookie
    } else {
      localStorage.removeItem("authToken"); // Remove Local Storage
      Cookies.remove("token"); // Remove Cookie
    }
  }, []);

  const setUser = useCallback((user: User) => {
    setUserState(user);
    if (user) {
      localStorage.setItem("authUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("authUser");
    }
  }, []);

  return {
    token,
    setToken,
    user,
    setUser,
  };
}
