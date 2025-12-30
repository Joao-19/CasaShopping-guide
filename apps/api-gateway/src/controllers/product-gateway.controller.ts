import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Req,
  Put,
  Param,
  Delete,
} from "@nestjs/common";
import { ProductGatewayService } from "../services/product-gateway.service";
import {
  CreateProductDto,
  Product,
  UpdateProductDto,
  PaginatedResult,
} from "@repo/dtos";
import { Request } from "express";

@Controller("products")
export class ProductGatewayController {
  constructor(private readonly productGatewayService: ProductGatewayService) {}

  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request
  ): Promise<Product> {
    const token = req.cookies["access_token"];
    return this.productGatewayService.create(createProductDto, token);
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Query("storeId") storeId?: string,
    @Query("search") search?: string,
    @Query("category") category?: string,
    @Query("page") page: string = "1",
    @Query("isFeatured") isFeatured?: string
  ): Promise<PaginatedResult<Product>> {
    const token = req.cookies["access_token"];
    return this.productGatewayService.findAll(
      storeId,
      search,
      category,
      isFeatured,
      token,
      +page
    );
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: Request
  ): Promise<Product> {
    const token = req.cookies["access_token"];
    return this.productGatewayService.update(id, updateProductDto, token);
  }

  @Delete(":id")
  async delete(@Param("id") id: string, @Req() req: Request): Promise<Product> {
    const token = req.cookies["access_token"];
    return this.productGatewayService.delete(id, token);
  }

  @Get("favorites/ids")
  async getFavoriteIds(@Req() req: Request): Promise<{ ids: string[] }> {
    const token = req.cookies["access_token"];
    return this.productGatewayService.getFavoriteIds(token);
  }

  @Get("favorites")
  async findFavorites(
    @Req() req: Request,
    @Query("page") page: string = "1"
  ): Promise<PaginatedResult<Product>> {
    const token = req.cookies["access_token"];
    return this.productGatewayService.getFavorites(token, +page);
  }

  @Post(":id/favorite")
  async toggleFavorite(
    @Param("id") id: string,
    @Req() req: Request
  ): Promise<{ isFavorited: boolean }> {
    const token = req.cookies["access_token"];
    return this.productGatewayService.toggleFavorite(id, token);
  }
}
