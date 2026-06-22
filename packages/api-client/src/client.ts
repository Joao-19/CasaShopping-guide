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
  refreshUrl?: string;
  excludedRefreshRoutes?: string[];
  // Rotas (substring da URL) cujo erro NÃO deve emitir o toast/popup global.
  // Para chamadas best-effort (ex.: tracking de view) que nunca devem
  // interromper a UX se falharem. A promise ainda rejeita (quem chama trata).
  silentErrorRoutes?: string[];
}

export const createApiClient = (
  config: ApiClientConfig = {}
): AxiosInstance => {
  const {
    refreshUrl = "auth/refresh",
    excludedRefreshRoutes = ["auth/login", "auth/admin/login"],
    silentErrorRoutes = [],
  } = config;

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

      // Check if the URL matches any excluded route
      const isExcludedRoute = excludedRefreshRoutes.some((route) =>
        originalRequest.url?.includes(route)
      );

      // Handle 401 (Unauthorized) and attempt refresh
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes(refreshUrl) &&
        !isExcludedRoute
      ) {
        originalRequest._retry = true;

        try {
          // If we have a getRefreshToken callback, we try to refresh manually
          const refreshToken = config.getRefreshToken?.();

          if (refreshToken) {
            const response = await http.post(refreshUrl, { refreshToken });

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
          await http.post(refreshUrl);
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

      // Emit global error event ONLY if it is not a refresh request
      // We don't want to spam toast errors when background refresh fails (user might be guest)
      const isRefreshRequest = originalRequest.url?.includes(refreshUrl);

      // Best-effort routes (ex.: tracking) não devem abrir popup global ao falhar.
      const isSilentRoute = silentErrorRoutes.some((route) =>
        originalRequest.url?.includes(route)
      );

      if (!isRefreshRequest && !isSilentRoute) {
        eventBus.emit("api-error", message);
      }

      return Promise.reject(error);
    }
  );

  return http;
};
