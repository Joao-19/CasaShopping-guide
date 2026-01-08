import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { Transform } from "class-transformer";

export class CreateStoreDto {
  @ApiProperty({ description: "The name of the store" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: "Image file for the store" })
  @IsOptional()
  image?: any;

  @ApiPropertyOptional({ description: "URL of the logo image" })
  @IsOptional()
  @IsString()
  logoImage?: string;

  @ApiProperty({ description: "Address of the store" })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiPropertyOptional({ description: "Contact phone number" })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (!value) return null;
    return value.replace(/\D/g, "");
  })
  @Matches(/^(\d{2}9\d{8}|\d{10}|0800\d{7})$/, {
    message:
      "Invalid phone number (10 or 11 digits; cell phones must have 9 in the third digit, or 0800).",
  })
  phone?: string | null;

  @ApiPropertyOptional({ description: "Website URL" })
  @IsOptional()
  @IsUrl()
  @Transform(({ value }) => (value === "" ? null : value))
  site?: string | null;

  @ApiPropertyOptional({ description: "Facebook profile URL" })
  @IsOptional()
  @IsUrl()
  @Transform(({ value }) => (value === "" ? null : value))
  facebookLink?: string | null;

  @ApiPropertyOptional({ description: "Instagram profile URL" })
  @IsOptional()
  @IsUrl()
  @Transform(({ value }) => (value === "" ? null : value))
  instagramLink?: string | null;

  @ApiPropertyOptional({ description: "YouTube channel URL" })
  @IsOptional()
  @IsUrl()
  @Transform(({ value }) => (value === "" ? null : value))
  youtubeLink?: string | null;

  @ApiPropertyOptional({ description: "WhatsApp number" })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (!value) return null;
    return value.replace(/\D/g, "");
  })
  @Matches(/^(\d{10,11})$/, {
    message: "Invalid phone number (10 or 11 digits).",
  })
  whatsapp?: string | null;
}

export class UpdateStoreDto {
  @ApiPropertyOptional({ description: "The name of the store" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ description: "URL of the logo image" })
  @IsOptional()
  @IsString()
  logoImage?: string;

  @ApiPropertyOptional({ description: "Address of the store" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address?: string;

  @ApiPropertyOptional({ description: "Contact phone number" })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (!value) return null;
    return value.replace(/\D/g, "");
  })
  @Matches(/^(\d{2}9\d{8}|\d{10}|0800\d{7})$/, {
    message:
      "Invalid phone number (10 or 11 digits; cell phones must have 9 in the third digit, or 0800).",
  })
  phone?: string | null;

  @ApiPropertyOptional({ description: "Website URL" })
  @IsOptional()
  @IsUrl()
  @Transform(({ value }) => (value === "" ? null : value))
  site?: string | null;

  @ApiPropertyOptional({ description: "Facebook profile URL" })
  @IsOptional()
  @IsUrl()
  @Transform(({ value }) => (value === "" ? null : value))
  facebookLink?: string | null;

  @ApiPropertyOptional({ description: "Instagram profile URL" })
  @IsOptional()
  @IsUrl()
  @Transform(({ value }) => (value === "" ? null : value))
  instagramLink?: string | null;

  @ApiPropertyOptional({ description: "YouTube channel URL" })
  @IsOptional()
  @IsUrl()
  @Transform(({ value }) => (value === "" ? null : value))
  youtubeLink?: string | null;

  @ApiPropertyOptional({ description: "WhatsApp number" })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (!value) return null;
    return value.replace(/\D/g, "");
  })
  @Matches(/^(\d{10,11})$/, {
    message: "Invalid phone number (10 or 11 digits).",
  })
  whatsapp?: string | null;
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
  whatsapp: string | null;
  createdAt: Date;
  modifiedAt: Date;
  deletedAt?: Date | null;
}
