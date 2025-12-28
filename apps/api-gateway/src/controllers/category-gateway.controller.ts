import { Controller, Get, Req } from "@nestjs/common";
import { ProductGatewayService } from "../services/product-gateway.service";
import { Request } from "express";

@Controller("categories")
export class CategoryGatewayController {
  constructor(private readonly productGatewayService: ProductGatewayService) {}

  @Get()
  async findAll(@Req() req: Request) {
    const token =
      req.cookies?.["access_token"] ||
      req.headers["authorization"]?.split(" ")[1];
    return this.productGatewayService.getCategories(token);
  }
}
