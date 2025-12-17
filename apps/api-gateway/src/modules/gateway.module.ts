import { Module } from "@nestjs/common";
import { AuthController } from "../controllers/gateway.controller";
import { GatewayService } from "../services/gateway.service";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { PassportModule } from "@nestjs/passport";

@Module({
  imports: [ConfigModule, HttpModule, PassportModule],
  controllers: [AuthController],
  providers: [GatewayService],
})
export class GatewayModule {}
