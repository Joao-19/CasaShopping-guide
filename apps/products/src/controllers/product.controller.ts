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
  Product,
  UpdateProductDto,
  PaginatedResult,
} from "@repo/dtos";
import { JwtAuthGuard } from "@repo/auth-guard";

@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.create(createProductDto);
  }

  @Get()
  async findAll(
    @Query("storeId") storeId?: string,
    @Query("search") search?: string,
    @Query("isFeatured") isFeatured?: string,
    @Query("page") page: string = "1"
  ): Promise<PaginatedResult<Product>> {
    return this.productService.findAll(
      storeId,
      search,
      isFeatured ? isFeatured === "true" : undefined,
      +page
    );
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  async update(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto
  ): Promise<Product> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async delete(@Param("id") id: string): Promise<Product> {
    return this.productService.delete(id);
  }
  @Post(":id/favorite")
  @UseGuards(JwtAuthGuard)
  async toggleFavorite(
    @Param("id") id: string,
    @Req() req: any
  ): Promise<{ isFavorited: boolean }> {
    return this.productService.toggleFavorite(req.user.id, id);
  }
}
