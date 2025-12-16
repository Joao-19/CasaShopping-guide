"use client";
import { useState } from "react";
import { useHttp } from "@/composable/Service/http/useHttp";
import authHttp, { LoginForm } from "@/Services/http/auth.http";
import { useAuthStore } from "@/store/auth.store";

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const http = useHttp(authHttp.login);
  const { error, data } = http;
  const authStore = useAuthStore();

  const login = async (form: LoginForm) => {
    setLoading(true);
    try {
      const response = await http.request(form);
      if (response.token) authStore.setToken(response.token);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
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
