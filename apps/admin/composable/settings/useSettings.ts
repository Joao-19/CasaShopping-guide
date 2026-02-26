"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import settingsHttp from "@/Services/http/settings.http";
import { UpdateSettingsDto } from "@repo/dtos";

const useSettings = () => {
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading: loadingSettings,
    error: settingsError,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsHttp.get(),
  });

  const updateMutation = useMutation({
    mutationFn: (form: UpdateSettingsDto) => settingsHttp.update(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  return {
    // Methods
    updateSettings: updateMutation.mutateAsync,

    // Status
    loading: loadingSettings || updateMutation.isPending,

    // Errors
    errors: {
      settings: settingsError,
      update: updateMutation.error,
    },

    // Data
    settings,
  };
};

export default useSettings;
