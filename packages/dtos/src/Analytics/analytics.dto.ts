// Tipos de resposta do painel de dados (Frente 3 — Área de Dados).
// Todas as agregações aceitam filtro de período (from/to ISO) no endpoint.

/** Produto no ranking de favoritados. */
export interface FavoriteRankingItem {
  productId: string;
  name: string;
  storeName: string | null;
  favorites: number;
}

/** Produto no ranking de visualizações (com sessões únicas no período). */
export interface ViewRankingItem {
  productId: string;
  name: string;
  storeName: string | null;
  views: number;
  uniqueSessions: number;
}

/** Categoria "quente" — views e favoritos somados no período. */
export interface CategoryHeatItem {
  category: string;
  views: number;
  favorites: number;
}

/** Origem do tráfego — utm_source, domínio do referrer, ou "direto". */
export interface OriginBreakdownItem {
  source: string;
  views: number;
}
