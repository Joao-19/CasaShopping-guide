import { Controller, Get, Query, Req } from "@nestjs/common";
import { Request } from "express";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AnalyticsGatewayService } from "../services/analytics-gateway.service";
import {
  FavoriteRankingItem,
  ViewRankingItem,
  CategoryHeatItem,
  OriginBreakdownItem,
} from "@repo/dtos";

@ApiTags("Analytics")
@Controller("products/analytics")
export class AnalyticsGatewayController {
  constructor(
    private readonly analyticsGatewayService: AnalyticsGatewayService
  ) {}

  @Get("favorites")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Ranking de produtos mais favoritados (admin)" })
  async favorites(
    @Req() req: Request,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("limit") limit?: string
  ): Promise<FavoriteRankingItem[]> {
    const token = req.cookies["access_token"];
    return this.analyticsGatewayService.favorites(token, { from, to, limit });
  }

  @Get("views")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Ranking de produtos mais vistos (admin)" })
  async views(
    @Req() req: Request,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("limit") limit?: string
  ): Promise<ViewRankingItem[]> {
    const token = req.cookies["access_token"];
    return this.analyticsGatewayService.views(token, { from, to, limit });
  }

  @Get("categories")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mapa de calor por categoria (admin)" })
  async categories(
    @Req() req: Request,
    @Query("from") from?: string,
    @Query("to") to?: string
  ): Promise<CategoryHeatItem[]> {
    const token = req.cookies["access_token"];
    return this.analyticsGatewayService.categories(token, { from, to });
  }

  @Get("origins")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Origem do tráfego (admin)" })
  async origins(
    @Req() req: Request,
    @Query("from") from?: string,
    @Query("to") to?: string
  ): Promise<OriginBreakdownItem[]> {
    const token = req.cookies["access_token"];
    return this.analyticsGatewayService.origins(token, { from, to });
  }
}
