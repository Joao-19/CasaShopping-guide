import http from "./index";
import {
  FavoriteRankingItem,
  ViewRankingItem,
  CategoryHeatItem,
  OriginBreakdownItem,
} from "@repo/dtos";

// Painel de dados (Frente 3). Período via from/to ISO (omitidos = tudo).
// Auth é por cookie (access_token) — o api-client já manda withCredentials.
export interface AnalyticsRange {
  from?: string;
  to?: string;
}

export const getFavoritesRanking = async (
  range: AnalyticsRange,
  limit = 10
): Promise<FavoriteRankingItem[]> => {
  const { data } = await http.get<FavoriteRankingItem[]>(
    "/products/analytics/favorites",
    { params: { ...range, limit } }
  );
  return data;
};

export const getViewsRanking = async (
  range: AnalyticsRange,
  limit = 10
): Promise<ViewRankingItem[]> => {
  const { data } = await http.get<ViewRankingItem[]>(
    "/products/analytics/views",
    { params: { ...range, limit } }
  );
  return data;
};

export const getCategoryHeatmap = async (
  range: AnalyticsRange
): Promise<CategoryHeatItem[]> => {
  const { data } = await http.get<CategoryHeatItem[]>(
    "/products/analytics/categories",
    { params: { ...range } }
  );
  return data;
};

export const getOriginBreakdown = async (
  range: AnalyticsRange
): Promise<OriginBreakdownItem[]> => {
  const { data } = await http.get<OriginBreakdownItem[]>(
    "/products/analytics/origins",
    { params: { ...range } }
  );
  return data;
};
