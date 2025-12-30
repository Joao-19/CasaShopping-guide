"use client";
import { useState } from "react";
import authHttp, {
  RegisterForm,
  RegisterResponse,
} from "@/Services/http/auth.http";
import { useAuthStore } from "@/store/auth.store";
import { useHttp } from "@repo/api-client";

const useRegister = () => {
  const http = useHttp(authHttp.register);
  const { error, data, loading } = http;
  const authStore = useAuthStore();

  const register = async (form: RegisterForm) => {
    try {
      const response = await http.request(form);
      if (response) {
        authStore.setUser(response);
        if (typeof window !== "undefined" && response.token) {
          // Standardize token storage if needed, though RegisterResponse usually implies immediate login
          localStorage.setItem("accessToken", response.token);
          // Handle refreshToken if available in response in future
        }
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  return {
    register,
    loading,
    error,
    data,
  };
};

export default useRegister;
