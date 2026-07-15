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
import { sessionCookieOptions } from "./cookie-options";

/**
 * Persiste os tokens nos cookies lidos pelo middleware e pelo client.
 *
 * IMPORTANTE: o `middleware.ts` lê o cookie `token` (e só depois
 * `accessToken`). Se o refresh não atualizar `token`, o middleware
 * continua vendo o access token expirado e derruba a sessão na próxima
 * navegação — por isso `token` é escrito aqui também. Mantém paridade
 * com o que o `useLogin` grava no login.
 */
export const persistTokens = (data: {
  accessToken: string;
  refreshToken: string;
}) => {
  const options = sessionCookieOptions();

  Cookies.set("token", data.accessToken, options);
  Cookies.set("accessToken", data.accessToken, options);
  Cookies.set("refreshToken", data.refreshToken, options);
  // 'tokens' agregado, mantido para compatibilidade com validações legadas.
  Cookies.set(
    "tokens",
    JSON.stringify({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    }),
    options,
  );
};

const http = createApiClient({
  baseURL: getBaseUrl(),
  getToken: () =>
    Cookies.get("accessToken") || Cookies.get("token") || null,
  getRefreshToken: () => Cookies.get("refreshToken") || null,
  onTokenRefreshed: (data) => {
    persistTokens(data);
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
