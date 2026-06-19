"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import campaignHttp from "@/Services/http/campaign.http";
import { CreateCampaignPageDto, UpdateCampaignPageDto } from "@repo/dtos";

const useCampaign = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading: loadingList,
    error: listError,
  } = useQuery({
    queryKey: ["campaigns", page, search],
    queryFn: () => campaignHttp.list({ page, search }),
    placeholderData: (previousData) => previousData,
  });

  const campaigns = response?.data || [];
  const meta = response?.meta || { total: 0, page: 1, lastPage: 1, limit: 10 };

  const createMutation = useMutation({
    mutationFn: (form: CreateCampaignPageDto) => campaignHttp.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, form }: { id: string; form: UpdateCampaignPageDto }) =>
      campaignHttp.update(id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => campaignHttp.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });

  return {
    // Methods
    createCampaign: createMutation.mutateAsync,
    updateCampaign: (id: string, form: UpdateCampaignPageDto) =>
      updateMutation.mutateAsync({ id, form }),
    deleteCampaign: deleteMutation.mutateAsync,

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
    campaigns,
    meta,
    page,
    search,
  };
};

export default useCampaign;
