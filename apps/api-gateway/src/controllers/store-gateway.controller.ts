import { Controller, Post, Body } from "@nestjs/common";
import { StoreGatewayService } from "../services/store-gateway.service";
import { CreateStoreDto, Store } from "@repo/dtos";

@Controller("stores")
export class StoreGatewayController {
  constructor(private readonly storeGatewayService: StoreGatewayService) {}

  @Post()
  async create(@Body() createStoreDto: CreateStoreDto): Promise<Store> {
    return this.storeGatewayService.create(createStoreDto);
  }
}
