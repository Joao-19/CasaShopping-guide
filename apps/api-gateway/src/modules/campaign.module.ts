import { Module } from "@nestjs/common";
import { AuthGuardModule } from "@repo/auth-guard";
import { CampaignController } from "../controllers/campaign.controller";
import { CampaignService } from "../services/campaign.service";
import { PrismaService } from "../services/prisma.service";

@Module({
  imports: [AuthGuardModule],
  controllers: [CampaignController],
  providers: [CampaignService, PrismaService],
})
export class CampaignModule {}
