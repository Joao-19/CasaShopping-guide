"use client";
import { useState } from "react";
import { useHttp } from "@/composable/Service/http/useHttp";
import authHttp, { RegisterForm } from "@/Services/http/auth.http";
import { useAuthStore } from "@/store/auth.store";

const userRegister = () => {
  const [loading, setLoading] = useState(false);
  const http = useHttp(authHttp.register);
  const { error, data } = http;
  const authStore = useAuthStore();

  const register = async (form: RegisterForm) => {
    setLoading(true);
    try {
      const response = await http.request(form);
      if (response) {
        authStore.setUser(response);
        if (typeof window !== "undefined" && response.token) {
          // Assuming 'token' is the accessToken based on interface, but checking for others if available
          localStorage.setItem("accessToken", response.token);
          // If backend returns refreshToken in future, handle it here.
        }
      }
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    loading,
    error,
    data,
  };
};

export default userRegister;
