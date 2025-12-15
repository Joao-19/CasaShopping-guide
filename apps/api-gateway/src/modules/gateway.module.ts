import { Module } from "@nestjs/common";
import { AuthController } from "../controllers/gateway.controller";
import { AuthService } from "@/services/gateway.service";

@Module({
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
