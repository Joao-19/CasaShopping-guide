"use client";
import { useState } from "react";
import Admin from "@/Domain/User";
import authHttp, { LoginForm } from "@/Services/http/auth.http";
import { useAuthStore } from "@/store/auth.store";
import { useHttp } from "@repo/api-client";
import Cookies from "js-cookie";

const useLogin = () => {
  const http = useHttp(authHttp.login);
  const { error, data, loading } = http;
  const authStore = useAuthStore();

  const login = async (form: LoginForm) => {
    try {
      const response = await http.request(form);

      if (response && response.user) {
        authStore.setUser(response.user);

        // Salva tokens nos cookies para o Middleware validar
        if (response.accessToken) {
          Cookies.set("token", response.accessToken, { path: "/" });
          Cookies.set("accessToken", response.accessToken, { path: "/" });
        }
        if (response.refreshToken) {
          Cookies.set("refreshToken", response.refreshToken, { path: "/" });
        }
      }
      return response;
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
