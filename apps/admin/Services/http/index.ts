import { createApiClient } from "@repo/api-client";

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

const http = createApiClient({
  baseURL: getBaseUrl(),
  onRefreshFail: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authAdmin");
      window.location.href = "/login";
    }
  },
});

export default http;
