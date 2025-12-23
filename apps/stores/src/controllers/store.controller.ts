import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
  Param,
  Put,
  UseGuards,
} from "@nestjs/common";
import { StoreService } from "@/services/store.service";
import {
  CreateStoreDto,
  Store,
  UpdateStoreDto,
  PaginatedResult,
} from "@repo/dtos";
import { JwtAuthGuard } from "@repo/auth-guard";

@Controller("stores")
@UseGuards(JwtAuthGuard)
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
  ): Promise<PaginatedResult<Store>> {
    return this.storeService.findAll(+page, search);
  }

  @Delete(":id")
  async delete(@Param("id") id: string): Promise<Store> {
    return this.storeService.delete(id);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateStoreDto: UpdateStoreDto
  ): Promise<Store> {
    return this.storeService.update(id, updateStoreDto);
  }
}
