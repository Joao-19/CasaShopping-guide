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
  StoreOption,
} from "@repo/dtos";
import { JwtAuthGuard, Roles, RolesGuard } from "@repo/auth-guard";

@Controller("stores")
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  async create(@Body() createStoreDto: CreateStoreDto): Promise<Store> {
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

  // Rotas específicas ANTES de ":id" para ":id" não as sombrear.
  @Get("options")
  async findAllOptions(): Promise<StoreOption[]> {
    return this.storeService.findAllOptions();
  }

  @Get("slug-available")
  async slugAvailable(
    @Query("slug") slug: string,
    @Query("excludeId") excludeId?: string,
  ): Promise<{ available: boolean }> {
    const available = await this.storeService.isSlugAvailable(slug, excludeId);
    return { available };
  }

  @Get("slug/:slug")
  async findBySlug(@Param("slug") slug: string): Promise<Store> {
    return this.storeService.findBySlug(slug);
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<Store> {
    return this.storeService.findOne(id);
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
