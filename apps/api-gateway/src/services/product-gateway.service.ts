import { Injectable } from "@nestjs/common";
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
  }

  async findAll(
    storeId?: string,
    search?: string,
    token?: string
  ): Promise<Product[]> {
    const response = await firstValueFrom(
      this.httpService.get<Product[]>(`${this.productsServiceUrl}/products`, {
        params: { storeId, search },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
    return response.data;
  }
}
