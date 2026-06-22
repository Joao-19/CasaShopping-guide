import { Module } from "@nestjs/common";
import { ProductGatewayController } from "../controllers/product-gateway.controller";
import { CategoryGatewayController } from "../controllers/category-gateway.controller";
import { AnalyticsGatewayController } from "../controllers/analytics-gateway.controller";
import { ProductGatewayService } from "../services/product-gateway.service";
import { AnalyticsGatewayService } from "../services/analytics-gateway.service";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [
    ProductGatewayController,
    CategoryGatewayController,
    AnalyticsGatewayController,
  ],
  providers: [ProductGatewayService, AnalyticsGatewayService],
})
export class ProductGatewayModule {}
