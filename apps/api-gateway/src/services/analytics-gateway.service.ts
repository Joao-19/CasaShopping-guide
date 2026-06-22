import { Injectable, HttpException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import {
  FavoriteRankingItem,
  ViewRankingItem,
  CategoryHeatItem,
  OriginBreakdownItem,
} from "@repo/dtos";

// Proxy das agregações do painel de dados (Frente 3) para o products-service.
// O guard admin roda lá; aqui só repassamos o token (cookie access_token) e os
// filtros de período.
@Injectable()
export class AnalyticsGatewayService {
  private readonly productsServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.productsServiceUrl = this.configService.getOrThrow<string>(
      "PRODUCTS_SERVICE_URL"
    );
  }

  private async forward<T>(
    path: string,
    token: string,
    params: Record<string, string | number | undefined>
  ): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<T>(
          `${this.productsServiceUrl}/products/analytics/${path}`,
          {
            params,
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || "Internal Server Error",
        error.response?.status || 500
      );
    }
  }

  favorites(
    token: string,
    params: { from?: string; to?: string; limit?: string }
  ): Promise<FavoriteRankingItem[]> {
    return this.forward("favorites", token, params);
  }

  views(
    token: string,
    params: { from?: string; to?: string; limit?: string }
  ): Promise<ViewRankingItem[]> {
    return this.forward("views", token, params);
  }

  categories(
    token: string,
    params: { from?: string; to?: string }
  ): Promise<CategoryHeatItem[]> {
    return this.forward("categories", token, params);
  }

  origins(
    token: string,
    params: { from?: string; to?: string }
  ): Promise<OriginBreakdownItem[]> {
    return this.forward("origins", token, params);
  }
}
