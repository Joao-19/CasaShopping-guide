import { Module } from "@nestjs/common";
import { UserController } from "@/controllers/user.controller";
import { UserService } from "@/services/user.service";
import { ConfigModule } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { AuthGuardModule } from "@repo/auth-guard";

import { HealthController } from "../controllers/health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule,
    AuthGuardModule,
  ],
  controllers: [UserController, HealthController],
  providers: [UserService],
})
export class UserModule {}
