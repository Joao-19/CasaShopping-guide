import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "@/services/auth.service";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
