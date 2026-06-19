import { Module } from "@nestjs/common";
import { AuthGuardModule } from "@repo/auth-guard";
import { SettingsController } from "../controllers/settings.controller";
import { SettingsService } from "../services/settings.service";
import { PrismaService } from "../services/prisma.service";

@Module({
  imports: [AuthGuardModule],
  controllers: [SettingsController],
  providers: [SettingsService, PrismaService],
})
export class SettingsModule {}
