import { Module } from "@nestjs/common";
import { SettingsController } from "../controllers/settings.controller";
import { SettingsService } from "../services/settings.service";
import { PrismaService } from "../services/prisma.service";

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, PrismaService],
})
export class SettingsModule {}
