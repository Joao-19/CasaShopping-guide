import { getCampaignBySlug } from "../Services/http/campaign.http";
import type { NewsletterSettings } from "../Services/http/newsletter.http";

type Targeting = NewsletterSettings["targeting"];

// Decide se a página atual (pathname) casa com a segmentação configurada do
// pop-up. Superfícies suportadas: home (raiz "/"), perfil de loja
// (/loja/<slug>), produto (/produto/<id>) e campanha (/campanha/<slug>).
// Campanha resolve slug→id pra aplicar as regras por campanha (specificPages
// "campaign:<id>" e a lista `campaigns`). Demais rotas não exibem.
export async function matchesNewsletterTargeting(
  pathname: string,
  targeting: Targeting,
): Promise<boolean> {
  const pageTypes = targeting?.pageTypes ?? [];
  const specificPages = targeting?.specificPages ?? [];
  const campaigns = targeting?.campaigns ?? [];

  if (pathname === "/") return targeting?.showOnHome !== false;

  if (pathname.startsWith("/loja/")) {
    const slug = pathname.split("/")[2] ?? "";
    return (
      pageTypes.includes("store-profiles") ||
      specificPages.includes(`store:${slug}`)
    );
  }

  if (pathname.startsWith("/produto/")) {
    return pageTypes.includes("product-pages");
  }

  if (pathname.startsWith("/campanha/")) {
    const broad = pageTypes.includes("campaign-pages");
    const hasSpecificCampaign = specificPages.some((p) =>
      p.startsWith("campaign:"),
    );
    // Sem nenhuma regra de campanha ativa, nem busca o id.
    if (!broad && !hasSpecificCampaign) return false;
    let id = "";
    try {
      const slug = pathname.split("/")[2] ?? "";
      id = (await getCampaignBySlug(slug))?.id ?? "";
    } catch {
      id = "";
    }
    if (id && specificPages.includes(`campaign:${id}`)) return true;
    if (broad) return campaigns.length > 0 ? campaigns.includes(id) : true;
    return false;
  }

  // Demais páginas (listagens, login, favoritos…) — não exibe.
  return false;
}
