import { Controller, Post, Body, Get, Query, Req } from "@nestjs/common";
import { ProductGatewayService } from "../services/product-gateway.service";
import { CreateProductDto, Product } from "@repo/dtos";
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
    @Query("page") page: string = "1"
  ): Promise<Product[]> {
    const token = req.cookies["access_token"];
    return this.productGatewayService.findAll(storeId, search, token, +page);
  }
}
