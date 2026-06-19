import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { JwtAuthGuard, Roles, RolesGuard } from "@repo/auth-guard";
import { NewsletterService } from "../services/newsletter.service";
import { NewsletterSettings, UpdateNewsletterDto } from "@repo/dtos";

@Controller("newsletter")
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  // Público — o site lê o carrossel (mesmo padrão do GET /settings).
  @Get()
  async getNewsletter(): Promise<NewsletterSettings> {
    return this.newsletterService.getNewsletter();
  }

  // Admin grava config + slides — protegido por JWT + papel admin.
  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  async updateNewsletter(
    @Body() data: UpdateNewsletterDto
  ): Promise<NewsletterSettings> {
    return this.newsletterService.updateNewsletter(data);
  }
}
