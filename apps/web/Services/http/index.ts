import { createApiClient } from "@repo/api-client";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/casashopping";

const http = createApiClient({
  baseURL:
    typeof window === "undefined"
      ? process.env.INTERNAL_API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:3000"
      : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
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
      const hasToken =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("refreshToken");

      // Only redirect/logout if the user was actually logged in (had tokens)
      // This protects Guest Mode users from being redirected
      if (hasToken) {
        console.error("Refresh token failed. Logging out...");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authUser");
        window.location.href = `${basePath}/login`;
      }
    }
  },
});

export default http;
