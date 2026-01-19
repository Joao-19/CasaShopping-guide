import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { StorageController } from "../controllers/storage.controller";
import { StorageService } from "../services/storage.service";

import { HealthController } from "../controllers/health.controller";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [StorageController, HealthController],
  providers: [StorageService],
})
export class StorageModule {}
