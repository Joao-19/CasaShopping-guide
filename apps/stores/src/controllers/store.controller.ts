import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
  Param,
} from "@nestjs/common";
import { StoreService } from "@/services/store.service";
import { CreateStoreDto, Store } from "@repo/dtos";

@Controller("stores")
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  async create(@Body() createStoreDto: CreateStoreDto): Promise<Store> {
    return this.storeService.create(createStoreDto);
  }

  @Get()
  async findAll(
    @Query("page") page: string = "1",
    @Query("search") search?: string
  ): Promise<Store[]> {
    return this.storeService.findAll(+page, search);
  }

  @Delete(":id")
  async delete(@Param("id") id: string): Promise<Store> {
    return this.storeService.delete(id);
  }
}
