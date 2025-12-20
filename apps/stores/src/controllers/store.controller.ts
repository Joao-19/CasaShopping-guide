import { Controller, Post, Body, Get, Query } from "@nestjs/common";
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
  async findAll(@Query("page") page: string = "1"): Promise<Store[]> {
    return this.storeService.findAll(+page);
  }
}
