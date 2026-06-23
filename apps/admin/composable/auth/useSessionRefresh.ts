"use client";

import { useEffect, useRef } from "react";
import Cookies from "js-cookie";
import http, { persistTokens } from "@/Services/http";

/**
 * Renova o access token ANTES de ele expirar, mantendo a sessão do admin
 * viva enquanto o refresh token (7d) for válido.
 *
 * Por que é necessário: o `middleware.ts` gateia cada navegação pelo
 * access token (TTL 15m). O refresh por interceptor do api-client só
 * dispara em 401 de chamada XHR — navegação pura nunca renova. Sem este
 * agendamento, o usuário era deslogado ao expirar o access token.
 *
 * Estratégia: decodifica o `exp` do access token e agenda o refresh para
 * ~60s antes da expiração. Após renovar, reagenda com base no novo token.
 */

const SKEW_MS = 60_000; // renova 60s antes de expirar
const MIN_DELAY_MS = 5_000;

function getExpiryMs(jwt: string | undefined): number | null {
  if (!jwt) return null;
  try {
    const payload = jwt.split(".")[1];
    if (!payload) return null;
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );
    return typeof json.exp === "number" ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function useSessionRefresh() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;

    const clear = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const doRefresh = async () => {
      const refreshToken = Cookies.get("refreshToken");
      if (!refreshToken) return; // sem sessão renovável; middleware/login tratam
      try {
        const { data } = await http.post("auth/refresh", { refreshToken });
        if (data?.accessToken && data?.refreshToken) {
          persistTokens(data);
        }
      } catch {
        // Refresh falhou (token inválido/expirado). O onRefreshFail do
        // api-client já cuida do redirect quando uma chamada de API falhar.
      }
    };

    const schedule = async () => {
      if (!active) return;
      clear();

      const accessToken = Cookies.get("token") || Cookies.get("accessToken");
      const expMs = getExpiryMs(accessToken);

      // Sem access token (ou ilegível), mas com refresh: renova já.
      if (!expMs) {
        if (Cookies.get("refreshToken")) {
          await doRefresh();
        }
        if (!active) return;
        // Reagenda com base no token recém-obtido (se houver).
        const newExp = getExpiryMs(
          Cookies.get("token") || Cookies.get("accessToken"),
        );
        if (newExp) {
          timerRef.current = setTimeout(
            schedule,
            Math.max(MIN_DELAY_MS, newExp - Date.now() - SKEW_MS),
          );
        }
        return;
      }

      const delay = expMs - Date.now() - SKEW_MS;
      if (delay <= 0) {
        await doRefresh();
        if (!active) return;
        const newExp = getExpiryMs(
          Cookies.get("token") || Cookies.get("accessToken"),
        );
        timerRef.current = setTimeout(
          schedule,
          newExp
            ? Math.max(MIN_DELAY_MS, newExp - Date.now() - SKEW_MS)
            : 5 * 60_000,
        );
        return;
      }

      timerRef.current = setTimeout(schedule, Math.max(MIN_DELAY_MS, delay));
    };

    schedule();

    return () => {
      active = false;
      clear();
    };
  }, []);
}
