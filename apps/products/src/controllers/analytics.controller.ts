import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AnalyticsService } from "@/services/analytics.service";
import {
  FavoriteRankingItem,
  ViewRankingItem,
  CategoryHeatItem,
  OriginBreakdownItem,
} from "@repo/dtos";
import { JwtAuthGuard, Roles, RolesGuard } from "@repo/auth-guard";

// Painel de dados (Frente 3) — somente admin. Rotas em /products/analytics/*
// (2 segmentos) não colidem com o catch-all GET /products/:id.
@Controller("products/analytics")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("favorites")
  async favorites(
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("limit") limit?: string,
  ): Promise<FavoriteRankingItem[]> {
    return this.analyticsService.favoritesRanking(from, to, limit ? +limit : undefined);
  }

  @Get("views")
  async views(
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("limit") limit?: string,
  ): Promise<ViewRankingItem[]> {
    return this.analyticsService.viewsRanking(from, to, limit ? +limit : undefined);
  }

  @Get("categories")
  async categories(
    @Query("from") from?: string,
    @Query("to") to?: string,
  ): Promise<CategoryHeatItem[]> {
    return this.analyticsService.categoryHeatmap(from, to);
  }

  @Get("origins")
  async origins(
    @Query("from") from?: string,
    @Query("to") to?: string,
  ): Promise<OriginBreakdownItem[]> {
    return this.analyticsService.originBreakdown(from, to);
  }
}
