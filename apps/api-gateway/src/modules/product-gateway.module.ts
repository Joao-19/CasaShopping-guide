import { Module } from "@nestjs/common";
import { ProductGatewayController } from "../controllers/product-gateway.controller";
import { CategoryGatewayController } from "../controllers/category-gateway.controller";
import { ProductGatewayService } from "../services/product-gateway.service";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [ProductGatewayController, CategoryGatewayController],
  providers: [ProductGatewayService],
})
export class ProductGatewayModule {}
