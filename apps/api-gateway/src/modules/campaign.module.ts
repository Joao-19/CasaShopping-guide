import { Module } from "@nestjs/common";
import { CampaignController } from "../controllers/campaign.controller";
import { CampaignService } from "../services/campaign.service";
import { PrismaService } from "../services/prisma.service";

@Module({
  controllers: [CampaignController],
  providers: [CampaignService, PrismaService],
})
export class CampaignModule {}
