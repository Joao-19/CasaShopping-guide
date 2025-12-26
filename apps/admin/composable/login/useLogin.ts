"use client";
import { useState } from "react";
import Admin from "@/Domain/User";
import authHttp, { LoginForm } from "@/Services/http/auth.http";
import { useAuthStore } from "@/store/auth.store";
import { useHttp } from "@repo/api-client";

const useLogin = () => {
  const http = useHttp(authHttp.login);
  const { error, data, loading } = http;
  const authStore = useAuthStore();

  const login = async (form: LoginForm) => {
    try {
      const response = await http.request(form);
      // Backend returns the user object directly now
      if (response) {
        authStore.setUser(response as unknown as Admin);
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
