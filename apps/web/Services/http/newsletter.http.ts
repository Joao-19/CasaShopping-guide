import http from "./index";

export interface NewsletterSlide {
  id: string;
  images: string[];
  name: string | null;
  title: string | null;
  description: string | null;
  fineprint: string | null;
  primaryButtonText: string | null;
  primaryButtonUrl: string | null;
  showSecondaryButton: boolean;
  secondaryButtonText: string | null;
  secondaryButtonUrl: string | null;
}

export interface NewsletterBehavior {
  appearDelay: number;
  autoClose: boolean;
  autoCloseDelay: number;
  slideInterval: number;
}

export interface NewsletterTargeting {
  pageTypes: string[];
  specificPages: string[];
  campaigns: string[];
  // Janela de exibição (ISO 8601). Opcionais — usados no modal do carrossel.
  startsAt?: string | null;
  endsAt?: string | null;
  // Switch da home (default true quando ausente). false = não exibir na home.
  showOnHome?: boolean;
}

export interface NewsletterSettings {
  enabled: boolean;
  imageSide: "left" | "right";
  accentColor: string;
  behavior: NewsletterBehavior;
  targeting: NewsletterTargeting;
  slides: NewsletterSlide[];
}

export const getNewsletter = async (): Promise<NewsletterSettings> => {
  const { data } = await http.get<NewsletterSettings>("/newsletter");
  return data;
};
