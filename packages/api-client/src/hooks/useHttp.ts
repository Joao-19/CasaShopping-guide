"use client";

import { useState, useCallback } from "react";
import { AxiosError, AxiosResponse } from "axios";
import { translateError } from "../errors";

export interface ApiError {
  message: string;
  statusCode?: number;
  [key: string]: any;
}

export interface ListResult<T> {
  page: number;
  total: number;
  rows: T[];
  totalPages: number;
  pageSize: number;
}

export function useBaseHttp<Response, Form, DefaultValue>(
  api: (form: Form) => Promise<any>,
  defaultValue: DefaultValue
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<Response | DefaultValue>(defaultValue);

  const request = useCallback(
    async (form: Form): Promise<Response> => {
      setLoading(true);
      setError(null);
      try {
        const res = await api(form);
        if (
          res &&
          typeof res === "object" &&
          "data" in res &&
          "headers" in res
        ) {
          const axiosRes = res as AxiosResponse<Response>;
          setData(axiosRes.data);
          return axiosRes.data;
        }
        setData(res as Response);
        return res as Response;
      } catch (e) {
        const axiosError = e as AxiosError;
        const statusCode = axiosError.response?.status;
        const responseData = axiosError.response?.data as any;

        const apiError: ApiError = {
          message: translateError(e),
          statusCode,
          ...(typeof responseData === "object" ? responseData : {}),
        };

        setError(apiError);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  return {
    request,
    loading,
    error,
    data,
  };
}

export function useHttp<Response, Form>(
  api: (form: Form) => Promise<AxiosResponse<Response>> | Promise<Response>
) {
  return useBaseHttp<Response, Form, Response | null>(api, null);
}

export function useHttpList<Response, Form>(
  api: (form: Form) => Promise<AxiosResponse<Response>> | Promise<Response>
) {
  return useBaseHttp<Response, Form, Response[]>(api, []);
}

export function useHttpPaginate<Response, Form>(
  api: (
    form: Form
  ) =>
    | Promise<AxiosResponse<ListResult<Response>>>
    | Promise<ListResult<Response>>
) {
  return useBaseHttp<ListResult<Response>, Form, ListResult<Response>>(api, {
    page: 0,
    total: 0,
    rows: [],
    totalPages: 0,
    pageSize: 0,
  } as ListResult<Response>);
}
