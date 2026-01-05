import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import userHttp from "@/Services/http/user.http";

export default function useUser() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading: loading,
    error: listError,
  } = useQuery({
    queryKey: ["users", page, search],
    queryFn: () => userHttp.list({ page, search }),
    placeholderData: (previousData) => previousData,
  });

  const users = response?.data || [];
  const meta = response?.meta || { total: 0, page: 1, lastPage: 1, limit: 15 };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userHttp.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error("Failed to delete user", error);
    },
  });

  const exportUsers = async () => {
    try {
      const blob = await userHttp.export();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `usuarios-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Failed to export users", error);
    }
  };

  return {
    users,
    loading,
    error: listError,
    deleteUser: deleteMutation.mutateAsync,
    page,
    setPage,
    search,
    setSearch,
    meta,
    exportUsers,
  };
}
