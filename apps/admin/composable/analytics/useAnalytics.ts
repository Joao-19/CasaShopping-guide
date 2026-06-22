"use client";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getFavoritesRanking,
  getViewsRanking,
  getCategoryHeatmap,
  getOriginBreakdown,
  AnalyticsRange,
} from "@/Services/http/analytics.http";

export type RangePreset = "7d" | "30d" | "90d" | "all" | "custom";

// Converte o preset/custom em from/to ISO. Preset relativo usa "agora" como
// teto. Custom expande o dia inteiro (00:00 → 23:59) pra não cortar a data final.
function computeRange(
  preset: RangePreset,
  customFrom: string,
  customTo: string
): AnalyticsRange {
  if (preset === "all") return {};
  if (preset === "custom") {
    return {
      from: customFrom
        ? new Date(`${customFrom}T00:00:00`).toISOString()
        : undefined,
      to: customTo
        ? new Date(`${customTo}T23:59:59.999`).toISOString()
        : undefined,
    };
  }
  const days = preset === "7d" ? 7 : preset === "90d" ? 90 : 30;
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function useAnalytics() {
  const [preset, setPreset] = useState<RangePreset>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const range = useMemo(
    () => computeRange(preset, customFrom, customTo),
    [preset, customFrom, customTo]
  );

  // Chave estável do período pra cache do react-query.
  const key = `${range.from ?? "-"}_${range.to ?? "-"}`;

  const favorites = useQuery({
    queryKey: ["analytics", "favorites", key],
    queryFn: () => getFavoritesRanking(range),
  });
  const views = useQuery({
    queryKey: ["analytics", "views", key],
    queryFn: () => getViewsRanking(range),
  });
  const categories = useQuery({
    queryKey: ["analytics", "categories", key],
    queryFn: () => getCategoryHeatmap(range),
  });
  const origins = useQuery({
    queryKey: ["analytics", "origins", key],
    queryFn: () => getOriginBreakdown(range),
  });

  return {
    // período
    preset,
    setPreset,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    // dados
    favorites: favorites.data ?? [],
    views: views.data ?? [],
    categories: categories.data ?? [],
    origins: origins.data ?? [],
    // estado
    loading: {
      favorites: favorites.isLoading,
      views: views.isLoading,
      categories: categories.isLoading,
      origins: origins.isLoading,
    },
    isError:
      favorites.isError ||
      views.isError ||
      categories.isError ||
      origins.isError,
  };
}
