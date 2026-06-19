import type { TargetingConfig } from "./targeting";

/**
 * Imagem de um slide no builder. `url` é sempre o que o <img> renderiza:
 * - se `file` está setado, `url` é um objectURL local (upload pendente no save);
 * - senão, `url` é a key/URL já salva no storage.
 */
export interface SectionImage {
  url: string;
  alt: string;
  file?: File;
}

/** Um slide do pop-up — imagens + conteúdo + CTAs próprios. */
export interface NewsletterSection {
  id: string; // key local de React (regenerada no save)
  name: string;
  images: SectionImage[]; // carrossel interno do slide (ordem = exibição)
  title: string;
  description: string;
  fineprint: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  showSecondaryButton: boolean;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
}

export interface NewsletterBehavior {
  /** segundos a esperar após carregar a página antes de exibir o pop-up. */
  appearDelay: number;
  /** se o pop-up se fecha sozinho. */
  autoClose: boolean;
  /** segundos visível antes do auto-close. */
  autoCloseDelay: number;
  /** segundos entre as imagens do carrossel interno de um slide. */
  slideInterval: number;
}

export interface NewsletterConfig {
  enabled: boolean;
  sections: NewsletterSection[];
  imageSide: "left" | "right";
  accentColor: string;
  behavior: NewsletterBehavior;
  targeting: TargetingConfig;
}

function localId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createSection(name: string): NewsletterSection {
  return {
    id: localId("sec"),
    name,
    images: [],
    title: "",
    description: "",
    fineprint: "",
    primaryButtonText: "Quero meu desconto",
    primaryButtonUrl: "",
    showSecondaryButton: false,
    secondaryButtonText: "Agora não",
    secondaryButtonUrl: "",
  };
}
