import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
  Param,
  Put,
} from "@nestjs/common";
import { StoreGatewayService } from "../services/store-gateway.service";
import { CreateStoreDto, Store } from "@repo/dtos";

@Controller("stores")
export class StoreGatewayController {
  constructor(private readonly storeGatewayService: StoreGatewayService) {}

  @Post()
  async create(@Body() createStoreDto: CreateStoreDto): Promise<Store> {
    return this.storeGatewayService.create(createStoreDto);
  }

  @Get()
  async findAll(
    @Query("page") page: string = "1",
    @Query("search") search?: string
  ): Promise<Store[]> {
    return this.storeGatewayService.findAll(+page, search);
  }

  @Delete(":id")
  async delete(@Param("id") id: string): Promise<Store> {
    return this.storeGatewayService.delete(id);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateStoreDto: Partial<CreateStoreDto>
  ): Promise<Store> {
    return this.storeGatewayService.update(id, updateStoreDto);
  }
}
