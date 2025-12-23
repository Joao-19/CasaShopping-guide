import { Injectable, HttpException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { CreateProductDto, Product } from "@repo/dtos";
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
  ): Promise<Product[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<Product[]>(`${this.productsServiceUrl}/products`, {
          params: { storeId, search, page },
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
}
