import { IsInt, IsOptional, IsString } from "class-validator";

export interface Settings {
  id: number;
  backgroundDesktop?: string | null;
  backgroundMobile?: string | null;
  advertisementBanner?: string | null;
  advertisementBannerDisplay: number;
  updatedAt: Date;
}

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  backgroundDesktop?: string;

  @IsOptional()
  @IsString()
  backgroundMobile?: string;

  @IsOptional()
  @IsString()
  advertisementBanner?: string;

  @IsOptional()
  @IsInt()
  advertisementBannerDisplay?: number;
}
