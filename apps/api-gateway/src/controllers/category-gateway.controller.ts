import { Controller, Get, Req } from "@nestjs/common";
import { ProductGatewayService } from "../services/product-gateway.service";
import { Request } from "express";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Categories")
@Controller("categories")
export class CategoryGatewayController {
  constructor(private readonly productGatewayService: ProductGatewayService) {}

  @Get()
  @ApiOperation({ summary: "List all product categories" })
  @ApiResponse({ status: 200, description: "Return list of categories." })
  async findAll(@Req() req: Request) {
    const token =
      req.cookies?.["access_token"] ||
      req.headers["authorization"]?.split(" ")[1];
    return this.productGatewayService.getCategories(token);
  }
}
