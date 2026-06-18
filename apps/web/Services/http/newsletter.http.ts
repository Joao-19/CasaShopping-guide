import http from "./index";

export type NewsletterTextPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface NewsletterSlide {
  id: string;
  imageUrl: string | null;
  title: string | null;
  subtitle: string | null;
  ctaText: string | null;
  ctaHref: string | null;
  textPosition: NewsletterTextPosition;
  textBgEnabled: boolean;
  textBgColor: string;
  textBgOpacity: number;
}

export interface NewsletterSettings {
  enabled: boolean;
  autoplay: boolean;
  intervalMs: number;
  slides: NewsletterSlide[];
}

export const getNewsletter = async (): Promise<NewsletterSettings> => {
  const { data } = await http.get<NewsletterSettings>("/newsletter");
  return data;
};
