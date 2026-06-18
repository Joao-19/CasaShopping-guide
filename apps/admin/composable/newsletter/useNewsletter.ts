"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import newsletterHttp from "@/Services/http/newsletter.http";
import { UpdateNewsletterDto } from "@repo/dtos";

const useNewsletter = () => {
  const queryClient = useQueryClient();

  const {
    data: newsletter,
    isLoading: loadingNewsletter,
    error: newsletterError,
  } = useQuery({
    queryKey: ["newsletter"],
    queryFn: () => newsletterHttp.get(),
  });

  const updateMutation = useMutation({
    mutationFn: (form: UpdateNewsletterDto) => newsletterHttp.update(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletter"] });
    },
  });

  return {
    updateNewsletter: updateMutation.mutateAsync,
    loading: loadingNewsletter || updateMutation.isPending,
    errors: {
      newsletter: newsletterError,
      update: updateMutation.error,
    },
    newsletter,
  };
};

export default useNewsletter;
