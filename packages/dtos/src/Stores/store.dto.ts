import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
} from "class-validator";

import { Transform } from "class-transformer";

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  image?: any;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (!value) return null;
    return value.replace(/\D/g, "");
  })
  @Matches(/^(\d{2}9\d{8}|\d{10})$/, {
    message:
      "Invalid phone number (10 or 11 digits; cell phones must have 9 in the third digit).",
  })
  phone?: string | null;

  @IsOptional()
  @IsUrl()
  @Transform(({ value }) => (value === "" ? null : value))
  site?: string | null;

  @IsOptional()
  @IsUrl()
  @Transform(({ value }) => (value === "" ? null : value))
  facebookLink?: string | null;

  @IsOptional()
  @IsUrl()
  @Transform(({ value }) => (value === "" ? null : value))
  instagramLink?: string | null;

  @IsOptional()
  @IsUrl()
  @Transform(({ value }) => (value === "" ? null : value))
  youtubeLink?: string | null;
}

export class UpdateStoreDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  image?: any;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (!value) return null;
    return value.replace(/\D/g, "");
  })
  @Matches(/^(\d{2}9\d{8}|\d{10})$/, {
    message:
      "Invalid phone number (10 or 11 digits; cell phones must have 9 in the third digit).",
  })
  phone?: string | null;

  @IsOptional()
  @IsUrl()
  @Transform(({ value }) => (value === "" ? null : value))
  site?: string | null;

  @IsOptional()
  @IsUrl()
  @Transform(({ value }) => (value === "" ? null : value))
  facebookLink?: string | null;

  @IsOptional()
  @IsUrl()
  @Transform(({ value }) => (value === "" ? null : value))
  instagramLink?: string | null;

  @IsOptional()
  @IsUrl()
  @Transform(({ value }) => (value === "" ? null : value))
  youtubeLink?: string | null;
}

export interface Store {
  id: string;
  name: string;
  logoImage?: string | null;
  address: string;
  phone?: string | null;
  site?: string | null;
  facebookLink?: string | null;
  instagramLink?: string | null;
  youtubeLink?: string | null;
  createdAt: Date;
  modifiedAt: Date;
  deletedAt?: Date | null;
}
