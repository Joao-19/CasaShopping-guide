import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  ValidateIf,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { Transform } from "class-transformer";

// Campos opcionais: so valida quando REALMENTE preenchido. @IsOptional sozinho
// nao pula string vazia ("") -> @IsUrl/@Matches estouravam em campos deixados
// em branco. @ValidateIf (class-validator, sempre ativo) garante o skip mesmo
// que o @Transform (class-transformer) nao seja aplicado no runtime empacotado.
const isProvided = (_o: unknown, value: unknown) =>
  value !== null && value !== undefined && value !== "";

export class CreateStoreDto {
  @ApiProperty({ description: "The name of the store" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: "URL slug for the public store page" })
  @ValidateIf(isProvided)
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Invalid slug (lowercase letters, numbers and hyphens only).",
  })
  slug?: string;

  @ApiPropertyOptional({ description: "Image file for the store" })
  @IsOptional()
  image?: any;

  @ApiPropertyOptional({ description: "URL of the logo image" })
  @IsOptional()
  @IsString()
  logoImage?: string;

  @ApiPropertyOptional({ description: "URL of the banner image" })
  @IsOptional()
  @IsString()
  bannerImage?: string;

  @ApiProperty({ description: "Address of the store" })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiPropertyOptional({ description: "Contact phone number" })
  @ValidateIf(isProvided)
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
  @ValidateIf(isProvided)
  @IsUrl()
  @Transform(({ value }) => (value === "" ? null : value))
  site?: string | null;

  @ApiPropertyOptional({ description: "Facebook profile URL" })
  @ValidateIf(isProvided)
  @IsUrl()
  @Transform(({ value }) => (value === "" ? null : value))
  facebookLink?: string | null;

  @ApiPropertyOptional({ description: "Instagram profile URL" })
  @ValidateIf(isProvided)
  @IsUrl()
  @Transform(({ value }) => (value === "" ? null : value))
  instagramLink?: string | null;

  @ApiPropertyOptional({ description: "YouTube channel URL" })
  @ValidateIf(isProvided)
  @IsUrl()
  @Transform(({ value }) => (value === "" ? null : value))
  youtubeLink?: string | null;

  @ApiPropertyOptional({ description: "WhatsApp number" })
  @ValidateIf(isProvided)
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

  @ApiPropertyOptional({ description: "URL slug for the public store page" })
  @ValidateIf(isProvided)
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Invalid slug (lowercase letters, numbers and hyphens only).",
  })
  slug?: string;

  @ApiPropertyOptional({ description: "URL of the logo image" })
  @IsOptional()
  @IsString()
  logoImage?: string;

  @ApiPropertyOptional({ description: "URL of the banner image" })
  @IsOptional()
  @IsString()
  bannerImage?: string;

  @ApiPropertyOptional({ description: "Address of the store" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address?: string;

  @ApiPropertyOptional({ description: "Contact phone number" })
  @ValidateIf(isProvided)
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
  @ValidateIf(isProvided)
  @IsUrl()
  @Transform(({ value }) => (value === "" ? null : value))
  site?: string | null;

  @ApiPropertyOptional({ description: "Facebook profile URL" })
  @ValidateIf(isProvided)
  @IsUrl()
  @Transform(({ value }) => (value === "" ? null : value))
  facebookLink?: string | null;

  @ApiPropertyOptional({ description: "Instagram profile URL" })
  @ValidateIf(isProvided)
  @IsUrl()
  @Transform(({ value }) => (value === "" ? null : value))
  instagramLink?: string | null;

  @ApiPropertyOptional({ description: "YouTube channel URL" })
  @ValidateIf(isProvided)
  @IsUrl()
  @Transform(({ value }) => (value === "" ? null : value))
  youtubeLink?: string | null;

  @ApiPropertyOptional({ description: "WhatsApp number" })
  @ValidateIf(isProvided)
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

// Forma enxuta de loja (id + nome) para casamento em massa — ex.: importação
// de produtos precisa do universo COMPLETO de lojas, sem paginação nem o
// payload pesado de Store (URLs de imagem, datas etc.).
export interface StoreOption {
  id: string;
  name: string;
}

export interface Store {
  id: string;
  name: string;
  slug?: string | null;
  logoImage?: string | null;
  bannerImage?: string | null;
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
