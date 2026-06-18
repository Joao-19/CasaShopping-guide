import { Body, Controller, Get, Put } from "@nestjs/common";
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

  // Admin grava config + slides. Guard segue desativado igual /settings;
  // proteger as escritas de admin (settings/newsletter/storage) é follow-up.
  @Put()
  async updateNewsletter(
    @Body() data: UpdateNewsletterDto
  ): Promise<NewsletterSettings> {
    return this.newsletterService.updateNewsletter(data);
  }
}
