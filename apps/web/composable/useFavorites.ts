import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFavoriteIds, toggleFavorite } from "@/Services/http/product.http";

/**
 * Global hook to manage favorites state across the entire app.
 * Uses TanStack Query to fetch and cache the list of favorited product IDs.
 */
export function useFavorites() {
  const queryClient = useQueryClient();

  // Fetch the list of favorite IDs
  const { data: favoriteIds = [], isLoading } = useQuery({
    queryKey: ["favorites-ids"],
    queryFn: getFavoriteIds,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation to toggle favorite status
  const toggleMutation = useMutation({
    mutationFn: (productId: string) => toggleFavorite(productId),
    onMutate: async (productId) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["favorites-ids"] });

      // Snapshot the previous value
      const previousIds = queryClient.getQueryData<string[]>(["favorites-ids"]);

      // Optimistically update to the new value
      queryClient.setQueryData<string[]>(["favorites-ids"], (old = []) => {
        if (old.includes(productId)) {
          return old.filter((id) => id !== productId);
        } else {
          return [...old, productId];
        }
      });

      // Return a context object with the snapshotted value
      return { previousIds };
    },
    onError: (err, productId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousIds) {
        queryClient.setQueryData(["favorites-ids"], context.previousIds);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server state is in sync
      queryClient.invalidateQueries({ queryKey: ["favorites-ids"] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  return {
    favoriteIds,
    isLoading,
    isFavorited: (productId: string) => favoriteIds.includes(productId),
    toggleFavorite: (productId: string) => toggleMutation.mutate(productId),
    isToggling: toggleMutation.isPending,
  };
}
