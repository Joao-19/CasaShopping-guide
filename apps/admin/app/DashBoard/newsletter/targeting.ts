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
 *
 * NOTA: por ora a segmentação é apenas persistida; o site público aplica
 * `home` only (ver roadmap/06). A lista abaixo é a representação visual fiel ao
 * modelo, adaptada ao casashopping. Quando o targeting virar real, ela passa a
 * ser preenchida pelas rotas/recursos reais do projeto.
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
  {
    id: "blog",
    label: "Blog",
    description: "Todos os artigos do blog",
  },
];

/** Campanhas que podem ser segmentadas individualmente sob "Páginas de campanha". */
export const CAMPAIGNS: Campaign[] = [
  {
    id: "camp-x",
    title: "Campanha X — Black Friday",
    path: "/campanhas/black-friday",
  },
  {
    id: "camp-y",
    title: "Campanha Y — Volta às aulas",
    path: "/campanhas/volta-as-aulas",
  },
  {
    id: "camp-z",
    title: "Campanha Z — Liquidação de verão",
    path: "/campanhas/verao",
  },
];

/** Páginas do projeto que o usuário pode segmentar individualmente (simulado). */
export const PROJECT_PAGES: ProjectPage[] = [
  { id: "pg-home", title: "Home", path: "/", group: "Geral" },
  { id: "pg-about", title: "Sobre nós", path: "/sobre", group: "Geral" },
  { id: "pg-contact", title: "Contato", path: "/contato", group: "Geral" },
  {
    id: "pg-camp-x",
    title: "Campanha X — Black Friday",
    path: "/campanhas/black-friday",
    group: "Campanhas",
  },
  {
    id: "pg-camp-y",
    title: "Campanha Y — Volta às aulas",
    path: "/campanhas/volta-as-aulas",
    group: "Campanhas",
  },
  {
    id: "pg-camp-z",
    title: "Campanha Z — Liquidação de verão",
    path: "/campanhas/verao",
    group: "Campanhas",
  },
  {
    id: "pg-store-nova",
    title: "Loja Nova Moda",
    path: "/lojas/nova-moda",
    group: "Lojas",
  },
  {
    id: "pg-store-tech",
    title: "Loja TechPoint",
    path: "/lojas/techpoint",
    group: "Lojas",
  },
  {
    id: "pg-store-casa",
    title: "Loja Casa & Conforto",
    path: "/lojas/casa-conforto",
    group: "Lojas",
  },
  {
    id: "pg-prod-tenis",
    title: "Tênis Runner Pro",
    path: "/produtos/runner-pro",
    group: "Produtos",
  },
  {
    id: "pg-prod-fone",
    title: "Fone Bass X",
    path: "/produtos/fone-bass-x",
    group: "Produtos",
  },
];
