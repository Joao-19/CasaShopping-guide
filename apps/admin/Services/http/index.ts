import { createApiClient } from "@repo/api-client";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const getBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (url) {
    console.log("Build/Runtime: Using NEXT_PUBLIC_API_URL:", url);
    return url;
  }
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return `${protocol}//${hostname}:3000`;
    }
  }
  console.log("Build/Runtime: Fallback to localhost:3000");
  return "http://localhost:3000";
};

import Cookies from "js-cookie";

const http = createApiClient({
  baseURL: getBaseUrl(),
  getRefreshToken: () => Cookies.get("refreshToken") || null,
  onTokenRefreshed: (data) => {
    Cookies.set("accessToken", data.accessToken);
    Cookies.set("refreshToken", data.refreshToken);
    // Optional: Update 'tokens' cookie if validation logic relies on it
    Cookies.set(
      "tokens",
      JSON.stringify({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      }),
    );
  },
  onRefreshFail: () => {
    if (typeof window !== "undefined") {
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      Cookies.remove("tokens");
      localStorage.removeItem("authAdmin");
      window.location.href = `${basePath}/login/`;
    }
  },
});

export default http;
