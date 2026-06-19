import { Module } from "@nestjs/common";
import { AuthGuardModule } from "@repo/auth-guard";
import { NewsletterController } from "../controllers/newsletter.controller";
import { NewsletterService } from "../services/newsletter.service";
import { PrismaService } from "../services/prisma.service";

@Module({
  imports: [AuthGuardModule],
  controllers: [NewsletterController],
  providers: [NewsletterService, PrismaService],
})
export class NewsletterModule {}
