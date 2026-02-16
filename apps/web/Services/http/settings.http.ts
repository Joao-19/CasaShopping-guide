import http from "./index";

export interface Settings {
  id: number;
  backgroundDesktop: string | null;
  backgroundMobile: string | null;
  advertisementBannerDesktop: string | null;
  advertisementBannerMobile: string | null;
  advertisementBannerDisplay: number;
  homeTitleBold: string | null;
  homeTitleNormal: string | null;
}

export const getSettings = async (): Promise<Settings> => {
  const { data } = await http.get<Settings>("/settings");
  return data;
};
