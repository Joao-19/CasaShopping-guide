"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import storeHttp from "@/Services/http/store.http";

const useStore = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const {
    data: response,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["stores", page, search, limit],
    queryFn: () => storeHttp.list({ page, search, limit }),
    placeholderData: (previousData) => previousData,
  });

  const stores = response?.data || [];
  const meta = response?.meta || { total: 0, page: 1, lastPage: 1, limit: 10 };

  return {
    // State Setters
    setPage,
    setSearch,
    setLimit,

    // Status
    loading,
    error,

    // Data
    stores,
    meta,
    page,
    search,
    limit,
  };
};

export default useStore;
