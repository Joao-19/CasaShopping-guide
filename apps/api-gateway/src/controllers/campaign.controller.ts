import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { CampaignService } from "../services/campaign.service";
import {
  CampaignPageDetail,
  CampaignPageListItem,
  CreateCampaignPageDto,
  PaginatedResult,
  SlugAvailability,
  UpdateCampaignPageDto,
} from "@repo/dtos";

@Controller("campaigns")
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  // Admin — lista paginada com busca por título/slug.
  @Get()
  async findAll(
    @Query("search") search?: string,
    @Query("page") page = "1"
  ): Promise<PaginatedResult<CampaignPageListItem>> {
    return this.campaignService.findAll(search, +page || 1);
  }

  // Verifica disponibilidade de slug (feedback "essa URL já existe").
  // Declarado antes de :id para não ser capturado pelo param.
  @Get("slug-available")
  async checkSlug(
    @Query("slug") slug: string,
    @Query("excludeId") excludeId?: string
  ): Promise<SlugAvailability> {
    return this.campaignService.checkSlug(slug, excludeId);
  }

  // Público — site lê a campanha ativa por slug; inativa/inexistente => 404.
  @Get("slug/:slug")
  async findBySlug(@Param("slug") slug: string): Promise<CampaignPageDetail> {
    return this.campaignService.findBySlug(slug);
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<CampaignPageDetail> {
    return this.campaignService.findOne(id);
  }

  // Admin grava. Guard segue desativado igual /newsletter e /settings;
  // proteger as escritas de admin é follow-up (ver roadmap 05/06 §segurança).
  @Post()
  async create(
    @Body() data: CreateCampaignPageDto
  ): Promise<CampaignPageDetail> {
    return this.campaignService.create(data);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() data: UpdateCampaignPageDto
  ): Promise<CampaignPageDetail> {
    return this.campaignService.update(id, data);
  }

  @Delete(":id")
  async remove(@Param("id") id: string): Promise<{ id: string }> {
    return this.campaignService.remove(id);
  }
}
