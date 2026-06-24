export interface PageTypeRule {
  id: string;
  label: string;
  description: string;
  locked?: boolean;
}

export interface ProjectPage {
  id: string;
  title: string;
  path: string;
  group: string;
}

export interface Campaign {
  id: string;
  title: string;
  path: string;
}

export interface TargetingConfig {
  /** ids dos tipos de página habilitados (regras gerais). */
  pageTypes: string[];
  /** ids das páginas específicas selecionadas. */
  specificPages: string[];
  /** ids das campanhas selecionadas em "Páginas de campanha" (vazio = todas). */
  campaigns: string[];
}

/**
 * Regras gerais — aplicam-se a toda página daquele tipo sem listar uma a uma.
 * "home" fica como padrão fixo: o pop-up sempre exibe na home.
 */
export const PAGE_TYPES: PageTypeRule[] = [
  {
    id: "home",
    label: "Página inicial (Home)",
    description: "Exibição padrão na home do site",
    locked: true,
  },
  {
    id: "store-profiles",
    label: "Perfis de lojas",
    description: "Todas as páginas de perfil de loja",
  },
  {
    id: "campaign-pages",
    label: "Páginas de campanha",
    description: "Landing pages de campanha",
  },
  {
    id: "product-pages",
    label: "Páginas de produto",
    description: "Todas as páginas de produto",
  },
];

/**
 * As listas reais de lojas, campanhas e produtos são buscadas via API pelo
 * componente que renderiza este painel. Mantemos `CAMPAIGNS` e `PROJECT_PAGES`
 * exportados apenas como fallback vazio para tipos.
 */
export const CAMPAIGNS: Campaign[] = [];
export const PROJECT_PAGES: ProjectPage[] = [];
