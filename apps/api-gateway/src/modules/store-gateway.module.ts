import { Module } from "@nestjs/common";
import { StoreGatewayController } from "../controllers/store-gateway.controller";
import { StoreGatewayService } from "../services/store-gateway.service";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [StoreGatewayController],
  providers: [StoreGatewayService],
})
export class StoreGatewayModule {}
