import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Put,
  Param,
  Delete,
  Req,
} from "@nestjs/common";
import { ProductService } from "@/services/product.service";
import {
  CreateProductDto,
  CreateProductsBulkDto,
  BulkCreateResult,
  Product,
  UpdateProductDto,
  PaginatedResult,
} from "@repo/dtos";
import { JwtAuthGuard, Roles, RolesGuard } from "@repo/auth-guard";

@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.create(createProductDto);
  }

  @Post("bulk")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  async createBulk(
    @Body() createProductsBulkDto: CreateProductsBulkDto,
  ): Promise<BulkCreateResult> {
    return this.productService.createBulk(createProductsBulkDto);
  }

  @Get()
  async findAll(
    @Query("storeId") storeId?: string,
    @Query("search") search?: string,
    @Query("category") category?: string,
    @Query("isFeatured") isFeatured?: string,
    @Query("page") page: string = "1",
  ): Promise<PaginatedResult<Product>> {
    return this.productService.findAll(
      storeId,
      search,
      category,
      isFeatured ? isFeatured === "true" : undefined,
      +page,
    );
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  async update(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  async delete(@Param("id") id: string): Promise<Product> {
    return this.productService.delete(id);
  }
  @Get("favorites/ids")
  @UseGuards(JwtAuthGuard)
  async getFavoriteIds(@Req() req: any): Promise<{ ids: string[] }> {
    const ids = await this.productService.getFavoriteIds(req.user.userId);
    return { ids };
  }

  @Get("favorites")
  @UseGuards(JwtAuthGuard)
  async findFavorites(
    @Req() req: any,
    @Query("page") page: string = "1",
  ): Promise<PaginatedResult<Product>> {
    return this.productService.findFavorites(req.user.userId, +page);
  }

  @Post(":id/favorite")
  @UseGuards(JwtAuthGuard)
  async toggleFavorite(
    @Param("id") id: string,
    @Req() req: any,
  ): Promise<{ isFavorited: boolean }> {
    return this.productService.toggleFavorite(req.user.userId, id);
  }

  // Público — detalhe de 1 produto (página /produto/[id]).
  // Declarado por último: ":id" não pode sombrear "favorites"/"favorites/ids".
  @Get(":id")
  async findById(@Param("id") id: string): Promise<Product> {
    return this.productService.findById(id);
  }
}
