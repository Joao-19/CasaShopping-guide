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
}

export interface NewsletterTargeting {
  pageTypes: string[];
  specificPages: string[];
  campaigns: string[];
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
