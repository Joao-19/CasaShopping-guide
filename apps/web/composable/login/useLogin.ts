"use client";
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

  const logout = async () => {
    const user = authStore.user;
    const isGuest =
      user?.isGuest ||
      user?.id === "guest" ||
      !localStorage.getItem("accessToken");

    // 1. API Logout (for authenticated users)
    if (!isGuest) {
      try {
        await authHttp.logout();
      } catch (error) {
        console.warn("Backend logout failed", error);
      }
    }

    // 2. Session Cookie Cleanup (Server Route)
    try {
      await authHttp.destroySession();
    } catch (e) {
      console.error("Failed to call server logout", e);
    }

    // 3. Local Cleanup
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("authUser");

    // 4. Store Cleanup
    authStore.setUser(null);

    // 5. Hard Redirect
    if (typeof window !== "undefined") {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/casashopping";
      window.location.href = `${basePath}/login`;
    }
  };

  return {
    login,
    logout,
    loading,
    error,
    data,
  };
};

export default useLogin;
