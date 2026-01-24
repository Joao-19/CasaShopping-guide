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
import { JwtAuthGuard, Roles, RolesGuard } from "@repo/auth-guard";

@Controller("stores")
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  async create(@Body() createStoreDto: CreateStoreDto): Promise<Store> {
    console.log("Store Service Controller - Received Data:", createStoreDto);
    return this.storeService.create(createStoreDto);
  }

  @Get()
  async findAll(
    @Query("page") page: string = "1",
    @Query("search") search?: string,
    @Query("limit") limit?: string,
  ): Promise<PaginatedResult<Store>> {
    return this.storeService.findAll(+page, search, limit ? +limit : undefined);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  async delete(@Param("id") id: string): Promise<Store> {
    return this.storeService.delete(id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  async update(
    @Param("id") id: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ): Promise<Store> {
    return this.storeService.update(id, updateStoreDto);
  }
}
