"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import productHttp from "@/Services/http/product.http";
import { CreateProductDto, UpdateProductDto } from "@repo/dtos";

const useProduct = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [storeId, setStoreId] = useState("");
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading: loadingList,
    error: listError,
  } = useQuery({
    queryKey: ["products", page, search, storeId],
    queryFn: () => productHttp.list({ page, search, storeId }),
    placeholderData: (previousData) => previousData,
  });

  const products = response?.data || [];
  const meta = response?.meta || { total: 0, page: 1, lastPage: 1, limit: 15 };

  const createMutation = useMutation({
    mutationFn: (form: CreateProductDto) => productHttp.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, form }: { id: string; form: UpdateProductDto }) =>
      productHttp.update(id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productHttp.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return {
    // Methods
    createProduct: createMutation.mutateAsync,
    updateProduct: (id: string, form: UpdateProductDto) =>
      updateMutation.mutateAsync({ id, form }),
    deleteProduct: deleteMutation.mutateAsync,

    // State Setters
    setPage,
    setSearch,
    setStoreId,

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
    products,
    meta,
    page,
    search,
    storeId,
  };
};

export default useProduct;
