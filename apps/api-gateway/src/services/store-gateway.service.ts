import { Injectable, HttpException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { CreateStoreDto, Store, PaginatedResult } from "@repo/dtos";
import { firstValueFrom } from "rxjs";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class StoreGatewayService {
  private readonly storesServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.storesServiceUrl =
      this.configService.getOrThrow<string>("STORE_SERVICE_URL");
  }

  async create(createStoreDto: CreateStoreDto, token: string): Promise<Store> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<Store>(
          `${this.storesServiceUrl}/stores`,
          createStoreDto,
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
    page: number,
    token: string,
    search?: string,
    limit?: number
  ): Promise<PaginatedResult<Store>> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<PaginatedResult<Store>>(
          `${this.storesServiceUrl}/stores`,
          {
            params: { page, search, limit },
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

  async delete(id: string, token: string): Promise<Store> {
    try {
      const response = await firstValueFrom(
        this.httpService.delete<Store>(
          `${this.storesServiceUrl}/stores/${id}`,
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

  async update(
    id: string,
    updateStoreDto: Partial<CreateStoreDto>,
    token: string
  ): Promise<Store> {
    try {
      const response = await firstValueFrom(
        this.httpService.put<Store>(
          `${this.storesServiceUrl}/stores/${id}`,
          updateStoreDto,
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
}
