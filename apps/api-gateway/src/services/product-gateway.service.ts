import { Injectable, HttpException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import {
  CreateProductDto,
  Product,
  UpdateProductDto,
  PaginatedResult,
} from "@repo/dtos";
import { firstValueFrom } from "rxjs";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ProductGatewayService {
  private readonly productsServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.productsServiceUrl = this.configService.getOrThrow<string>(
      "PRODUCTS_SERVICE_URL"
    );
  }

  async create(
    createProductDto: CreateProductDto,
    token: string
  ): Promise<Product> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<Product>(
          `${this.productsServiceUrl}/products`,
          createProductDto,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
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

  async findAll(
    storeId?: string,
    search?: string,
    token?: string,
    page: number = 1
  ): Promise<PaginatedResult<Product>> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<PaginatedResult<Product>>(
          `${this.productsServiceUrl}/products`,
          {
            params: { storeId, search, page },
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
  async update(
    id: string,
    updateProductDto: any,
    token: string
  ): Promise<Product> {
    try {
      const response = await firstValueFrom(
        this.httpService.put<Product>(
          `${this.productsServiceUrl}/products/${id}`,
          updateProductDto,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
  async delete(id: string, token: string): Promise<Product> {
    try {
      const response = await firstValueFrom(
        this.httpService.delete<Product>(
          `${this.productsServiceUrl}/products/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
  async getCategories(token?: string): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<any[]>(`${this.productsServiceUrl}/categories`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || "Internal Server Error",
        error.response?.status || 500
      );
    }
  }

  async toggleFavorite(
    id: string,
    token: string
  ): Promise<{ isFavorited: boolean }> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<{ isFavorited: boolean }>(
          `${this.productsServiceUrl}/products/${id}/favorite`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
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

  async getFavorites(
    token: string,
    page: number = 1
  ): Promise<PaginatedResult<Product>> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<PaginatedResult<Product>>(
          `${this.productsServiceUrl}/products/favorites`,
          {
            params: { page },
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
}
