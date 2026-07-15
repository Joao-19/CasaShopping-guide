"use client";
import { useState } from "react";
import Admin from "@/Domain/User";
import authHttp, { LoginForm } from "@/Services/http/auth.http";
import { useAuthStore } from "@/store/auth.store";
import { useHttp } from "@repo/api-client";
import { sessionCookieOptions } from "@/Services/http/cookie-options";
import Cookies from "js-cookie";

const useLogin = () => {
  const http = useHttp(authHttp.login);
  const { error, data, loading } = http;
  const authStore = useAuthStore();

  const login = async (form: LoginForm) => {
    try {
      const response = await http.request(form);

      // API pode retornar user diretamente ou aninhado em response.user
      const resp = response as any;
      const user = resp?.user || (resp?.id ? resp : null);
      const accessToken = resp?.accessToken;
      const refreshToken = resp?.refreshToken;

      if (user) {
        authStore.setUser(user);

        // Salva tokens nos cookies para o Middleware validar
        const options = sessionCookieOptions();

        if (accessToken) {
          Cookies.set("token", accessToken, options);
          Cookies.set("accessToken", accessToken, options);
        }
        if (refreshToken) {
          Cookies.set("refreshToken", refreshToken, options);
        }
      } else {
        console.warn("[useLogin] User not found in response:", resp);
      }

      // Retorna o objeto com user para manter compatibilidade
      return { user, accessToken, refreshToken };
    } catch (error) {
      throw error;
    }
  };

  return {
    login,
    loading,
    error,
    data,
  };
};

export default useLogin;
