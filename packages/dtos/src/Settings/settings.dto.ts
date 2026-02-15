import { IsInt, IsOptional, IsString } from "class-validator";

export interface Settings {
  id: number;
  backgroundDesktop?: string | null;
  backgroundMobile?: string | null;
  advertisementBannerDesktop?: string | null;
  advertisementBannerMobile?: string | null;
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
  advertisementBannerDesktop?: string;

  @IsOptional()
  @IsString()
  advertisementBannerMobile?: string;

  @IsOptional()
  @IsInt()
  advertisementBannerDisplay?: number;
}
