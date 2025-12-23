import { Controller, Post, Body, Get, Query, UseGuards } from "@nestjs/common";
import { ProductService } from "@/services/product.service";
import { CreateProductDto, Product } from "@repo/dtos";
import { JwtAuthGuard } from "@repo/auth-guard";

@Controller("products")
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.create(createProductDto);
  }

  @Get()
  async findAll(
    @Query("storeId") storeId?: string,
    @Query("search") search?: string,
    @Query("page") page: string = "1"
  ): Promise<Product[]> {
    return this.productService.findAll(storeId, search, +page);
  }
}
