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
  CreateProductsBulkDto,
  BulkCreateResult,
  Product,
  UpdateProductDto,
  PaginatedResult,
} from "@repo/dtos";
import { Request } from "express";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from "@nestjs/swagger";

@ApiTags("Products")
@Controller("products")
export class ProductGatewayController {
  constructor(private readonly productGatewayService: ProductGatewayService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new product" })
  @ApiResponse({
    status: 201,
    description: "The product has been successfully created.",
  })
  @ApiResponse({ status: 403, description: "Forbidden." })
  async create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request
  ): Promise<Product> {
    const token = req.cookies["access_token"];
    return this.productGatewayService.create(createProductDto, token);
  }

  @Post("bulk")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create products in bulk (partial failure)" })
  @ApiResponse({
    status: 201,
    description: "Per-row result with created/failed counts.",
  })
  @ApiResponse({ status: 403, description: "Forbidden." })
  async createBulk(
    @Body() createProductsBulkDto: CreateProductsBulkDto,
    @Req() req: Request
  ): Promise<BulkCreateResult> {
    const token = req.cookies["access_token"];
    return this.productGatewayService.createBulk(createProductsBulkDto, token);
  }

  @Get()
  @ApiOperation({ summary: "Retrieve all products with filtering" })
  @ApiResponse({ status: 200, description: "Return paginated products." })
  @ApiQuery({ name: "page", required: false, description: "Page number" })
  @ApiQuery({ name: "limit", required: false, description: "Items per page" })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "storeId", required: false })
  @ApiQuery({ name: "category", required: false })
  @ApiQuery({ name: "isFeatured", required: false })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a product" })
  @ApiResponse({
    status: 200,
    description: "The product has been successfully updated.",
  })
  async update(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: Request
  ): Promise<Product> {
    const token = req.cookies["access_token"];
    return this.productGatewayService.update(id, updateProductDto, token);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a product" })
  @ApiResponse({
    status: 200,
    description: "The product has been successfully deleted.",
  })
  async delete(@Param("id") id: string, @Req() req: Request): Promise<Product> {
    const token = req.cookies["access_token"];
    return this.productGatewayService.delete(id, token);
  }

  @Get("favorites/ids")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get IDs of favorite products" })
  @ApiResponse({
    status: 200,
    description: "Return list of favorite product IDs.",
  })
  async getFavoriteIds(@Req() req: Request): Promise<{ ids: string[] }> {
    const token = req.cookies["access_token"];
    return this.productGatewayService.getFavoriteIds(token);
  }

  @Get("favorites")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get favorite products (full details)" })
  @ApiResponse({
    status: 200,
    description: "Return paginated favorite products.",
  })
  async findFavorites(
    @Req() req: Request,
    @Query("page") page: string = "1"
  ): Promise<PaginatedResult<Product>> {
    const token = req.cookies["access_token"];
    return this.productGatewayService.getFavorites(token, +page);
  }

  @Post(":id/favorite")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Toggle favorite status of a product" })
  @ApiResponse({ status: 200, description: "Favorite status toggled." })
  async toggleFavorite(
    @Param("id") id: string,
    @Req() req: Request
  ): Promise<{ isFavorited: boolean }> {
    const token = req.cookies["access_token"];
    return this.productGatewayService.toggleFavorite(id, token);
  }

  // Público — detalhe de 1 produto (página /produto/[id]).
  // Declarado por último: ":id" não pode sombrear "favorites"/"favorites/ids".
  @Get(":id")
  @ApiOperation({ summary: "Retrieve a single product by id" })
  @ApiResponse({ status: 200, description: "Return the product." })
  @ApiResponse({ status: 404, description: "Product not found." })
  async findById(@Param("id") id: string): Promise<Product> {
    return this.productGatewayService.findById(id);
  }
}
