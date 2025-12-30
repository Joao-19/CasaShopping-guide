import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { StorageController } from "../controllers/storage.controller";
import { StorageService } from "../services/storage.service";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageModule {}
