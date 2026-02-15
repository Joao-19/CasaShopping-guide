import http from "./index";

export interface Settings {
  id: number;
  backgroundDesktop: string | null;
  backgroundMobile: string | null;
  advertisementBanner: string | null;
  advertisementBannerDisplay: number;
}

export const getSettings = async (): Promise<Settings> => {
  const { data } = await http.get<Settings>("/settings");
  return data;
};
