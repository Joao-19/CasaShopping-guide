"use client";
import { useState } from "react";
import authHttp, { LoginForm, LoginResponse } from "@/Services/http/auth.http";
import { useAuthStore } from "@/store/auth.store";
import { useHttp } from "@repo/api-client";

const useLogin = () => {
  const http = useHttp(authHttp.login);
  const { error, data, loading } = http;
  const authStore = useAuthStore();

  const login = async (form: LoginForm) => {
    try {
      const response = await http.request(form);
      if (response) {
        authStore.setUser(response);
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("refreshToken", response.refreshToken);
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
