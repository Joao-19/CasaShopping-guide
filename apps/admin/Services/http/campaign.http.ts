import http from "./index";
import {
  CampaignPageDetail,
  CampaignPageListItem,
  CreateCampaignPageDto,
  PaginatedResult,
  SlugAvailability,
  UpdateCampaignPageDto,
} from "@repo/dtos";

export class CampaignHttpService {
  async list(params: {
    page?: number;
    search?: string;
  }): Promise<PaginatedResult<CampaignPageListItem>> {
    const { data } = await http.get<PaginatedResult<CampaignPageListItem>>(
      "/campaigns",
      { params },
    );
    return data;
  }

  async getById(id: string): Promise<CampaignPageDetail> {
    const { data } = await http.get<CampaignPageDetail>(`/campaigns/${id}`);
    return data;
  }

  async checkSlug(slug: string, excludeId?: string): Promise<SlugAvailability> {
    const { data } = await http.get<SlugAvailability>(
      "/campaigns/slug-available",
      { params: { slug, excludeId } },
    );
    return data;
  }

  async create(data: CreateCampaignPageDto): Promise<CampaignPageDetail> {
    const { data: response } = await http.post<CampaignPageDetail>(
      "/campaigns",
      data,
    );
    return response;
  }

  async update(
    id: string,
    data: UpdateCampaignPageDto,
  ): Promise<CampaignPageDetail> {
    const { data: response } = await http.put<CampaignPageDetail>(
      `/campaigns/${id}`,
      data,
    );
    return response;
  }

  async delete(id: string): Promise<void> {
    await http.delete(`/campaigns/${id}`);
  }
}

export default new CampaignHttpService();
