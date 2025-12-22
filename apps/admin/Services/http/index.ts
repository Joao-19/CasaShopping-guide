import axios from "axios";
import { eventBus } from "@/utils/eventBus";
import { translateError } from "@/utils/errorTranslation";

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return `${protocol}//${hostname}:3000`;
    }
  }
  return "http://localhost:3000";
};

const http = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 (Unauthorized) and attempt refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("auth/refresh") &&
      !originalRequest.url?.includes("auth/admin/login")
    ) {
      originalRequest._retry = true;

      try {
        await http.post("auth/refresh");
        return http(originalRequest);
      } catch (refreshError) {
        // Refresh failed (token expired or invalid)
        if (typeof window !== "undefined") {
          localStorage.removeItem("authAdmin");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // Translate message
    const message = translateError(error);

    // Emit global error event
    eventBus.emit("api-error", message);

    return Promise.reject(error);
  }
);

export default http;
