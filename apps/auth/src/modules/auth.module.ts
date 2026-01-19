import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "@/services/auth.service";

import { HealthController } from "../controllers/health.controller";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" })],
  controllers: [AuthController, HealthController],
  providers: [AuthService],
})
export class AuthModule {}
