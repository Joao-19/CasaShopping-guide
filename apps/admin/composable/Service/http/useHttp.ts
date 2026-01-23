import { useState, useCallback } from "react";
import { AxiosError, AxiosResponse } from "axios";
import { ApiError, ListResult } from "@/Services/http/http.type";
import { useAuthStore } from "@/store/auth.store";
import axios from "@/Services/http/index";

export function useBaseHttp<Response, Form, DefaultValue>(
  api: (form: Form) => Promise<any>,
  defaultValue: DefaultValue,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<Response | DefaultValue>(defaultValue);
  const authStore = useAuthStore();

  const request = useCallback(
    async (form: Form): Promise<Response> => {
      setLoading(true);
      setError(null);
      try {
        if (authStore.token) {
          axios.defaults.headers.authorization = authStore.token;
        }
        const res = await api(form);
        if (
          res &&
          typeof res === "object" &&
          "data" in res &&
          "headers" in res
        ) {
          const axiosRes = res as AxiosResponse<Response>;
          if (axiosRes.headers.token) {
            authStore.setToken(axiosRes.headers.token);
          }
          setData(axiosRes.data);
          return axiosRes.data;
        }
        setData(res as Response);
        return res as Response;
      } catch (e) {
        const apiError = e as AxiosError;
        setError(
          (apiError.response?.data ? apiError.response.data : e) as ApiError,
        );
        if (apiError.response?.status === 401) {
          authStore.setToken(null);
          const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/admin";
          window.location.href = `${basePath}/login/`;
        }
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [api, authStore],
  );

  return {
    request,
    loading,
    error,
    data,
  };
}

export function useHttp<Response, Form>(
  api: (form: Form) => Promise<AxiosResponse<Response>> | Promise<Response>,
) {
  return useBaseHttp<Response, Form, Response | null>(api, null);
}

export function useHttpList<Response, Form>(
  api: (form: Form) => Promise<AxiosResponse<Response>> | Promise<Response>,
) {
  return useBaseHttp<Response, Form, Response[]>(api, []);
}
export function useHttpPaginate<Response, Form>(
  api: (
    form: Form,
  ) =>
    | Promise<AxiosResponse<ListResult<Response>>>
    | Promise<ListResult<Response>>,
) {
  return useBaseHttp<ListResult<Response>, Form, ListResult<Response>>(api, {
    page: 0,
    total: 0,
    rows: [],
    totalPages: 0,
    pageSize: 0,
  } as ListResult<Response>);
}
