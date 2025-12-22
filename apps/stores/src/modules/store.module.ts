import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { StoreController } from "../controllers/store.controller";
import { StoreService } from "@/services/store.service";
import { PassportModule } from "@nestjs/passport";
import { AuthGuardModule } from "@repo/auth-guard";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    AuthGuardModule,
  ],
  controllers: [StoreController],
  providers: [StoreService],
})
export class StoreModule {}
