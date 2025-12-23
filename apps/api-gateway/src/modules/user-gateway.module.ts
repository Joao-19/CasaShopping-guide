import { Module } from "@nestjs/common";
import { UserGatewayController } from "../controllers/user-gateway.controller";
import { UserGatewayService } from "../services/user-gateway.service";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [UserGatewayController],
  providers: [UserGatewayService],
})
export class UserGatewayModule {}
