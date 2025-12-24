import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { eventBus } from "./event-bus";
import { translateError } from "./errors";

export interface ApiClientConfig extends AxiosRequestConfig {
  onRefreshFail?: () => void;
  getToken?: () => string | null;
  getRefreshToken?: () => string | null;
  onTokenRefreshed?: (item: {
    accessToken: string;
    refreshToken: string;
  }) => void;
}

export const createApiClient = (
  config: ApiClientConfig = {}
): AxiosInstance => {
  const getBaseUrl = () => {
    if (config.baseURL) return config.baseURL;
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
      ...config.headers,
    },
    ...config,
  });

  if (config.getToken) {
    http.interceptors.request.use(
      (requestConfig) => {
        const token = config.getToken?.();
        if (token) {
          requestConfig.headers.Authorization = `Bearer ${token}`;
        }
        return requestConfig;
      },
      (error) => Promise.reject(error)
    );
  }

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
          // If we have a getRefreshToken callback, we try to refresh manually
          const refreshToken = config.getRefreshToken?.();

          if (refreshToken) {
            const response = await http.post("auth/refresh", { refreshToken });

            if (config.onTokenRefreshed && response.data) {
              config.onTokenRefreshed(response.data);
            }

            // If we have a new token, we should retry with it
            if (response.data?.accessToken) {
              originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
            }

            return http(originalRequest);
          }

          // Fallback to cookie-based refresh (existing admin flow)
          await http.post("auth/refresh");
          return http(originalRequest);
        } catch (refreshError) {
          // Refresh failed (token expired or invalid)
          if (config.onRefreshFail) {
            config.onRefreshFail();
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

  return http;
};
