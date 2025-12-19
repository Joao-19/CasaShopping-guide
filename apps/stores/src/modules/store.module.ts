import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { StoreController } from "../controllers/store.controller";
import { StoreService } from "@/services/store.service";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [StoreController],
  providers: [StoreService],
})
export class StoreModule {}
