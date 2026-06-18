import { Module } from "@nestjs/common";
import { NewsletterController } from "../controllers/newsletter.controller";
import { NewsletterService } from "../services/newsletter.service";
import { PrismaService } from "../services/prisma.service";

@Module({
  controllers: [NewsletterController],
  providers: [NewsletterService, PrismaService],
})
export class NewsletterModule {}
