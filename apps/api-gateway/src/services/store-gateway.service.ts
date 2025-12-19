import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { CreateStoreDto, Store } from "@repo/dtos";
import { firstValueFrom } from "rxjs";

@Injectable()
export class StoreGatewayService {
  private readonly storesServiceUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.storesServiceUrl =
      process.env.STORES_SERVICE_URL || "http://localhost:3005";
  }

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const response = await firstValueFrom(
      this.httpService.post<Store>(
        `${this.storesServiceUrl}/stores`,
        createStoreDto
      )
    );
    return response.data;
  }
}
