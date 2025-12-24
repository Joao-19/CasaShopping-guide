import { createApiClient } from "@repo/api-client";

const http = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  },
  getRefreshToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refreshToken");
    }
    return null;
  },
  onTokenRefreshed: (tokens) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
    }
  },
  onRefreshFail: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("authUser");
      window.location.href = "/login";
    }
  },
});

export default http;
