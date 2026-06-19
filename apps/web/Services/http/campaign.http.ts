import http from "./index";
import { CampaignPageDetail } from "@repo/dtos";

// Página pública lê a campanha ativa por slug; inativa/inexistente => 404.
export const getCampaignBySlug = async (
  slug: string,
): Promise<CampaignPageDetail> => {
  const { data } = await http.get<CampaignPageDetail>(`/campaigns/slug/${slug}`);
  return data;
};
