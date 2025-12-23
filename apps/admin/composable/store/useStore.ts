"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import storeHttp from "@/Services/http/store.http";
import { CreateStoreDto } from "@repo/dtos";

const useStore = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading: loadingList,
    error: listError,
  } = useQuery({
    queryKey: ["stores", page, search],
    queryFn: () => storeHttp.list({ page, search }),
    placeholderData: (previousData) => previousData,
  });

  const stores = response?.data || [];
  const meta = response?.meta || { total: 0, page: 1, lastPage: 1, limit: 15 };

  const createMutation = useMutation({
    mutationFn: (form: CreateStoreDto) => storeHttp.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, form }: { id: string; form: Partial<CreateStoreDto> }) =>
      storeHttp.update(id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => storeHttp.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });

  return {
    // Methods
    createStore: createMutation.mutateAsync,
    updateStore: (id: string, form: Partial<CreateStoreDto>) =>
      updateMutation.mutateAsync({ id, form }),
    deleteStore: deleteMutation.mutateAsync,

    // State Setters
    setPage,
    setSearch,

    // Status
    loading:
      loadingList ||
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,

    // Errors
    errors: {
      create: createMutation.error,
      list: listError,
      update: updateMutation.error,
      delete: deleteMutation.error,
    },

    // Data
    stores,
    meta,
    page,
    search,
  };
};

export default useStore;
