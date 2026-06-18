import {
  IsArray,
  IsBoolean,
  IsHexColor,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

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

// --- Contrato de leitura (GET /newsletter, público) ---
export interface NewsletterSlide {
  id: string;
  imageUrl?: string | null; // URL pública resolvida na leitura
  title?: string | null;
  subtitle?: string | null;
  ctaText?: string | null;
  ctaHref?: string | null;
  textPosition?: NewsletterTextPosition;
  textBgEnabled?: boolean;
  textBgColor?: string;
  textBgOpacity?: number;
}

export interface NewsletterSettings {
  enabled: boolean;
  autoplay: boolean;
  intervalMs: number;
  slides: NewsletterSlide[];
}

// --- Contrato de escrita (PUT /newsletter, admin) ---
// Como o ValidationPipe usa whitelist + forbidNonWhitelisted, todo campo
// enviado precisa estar declarado aqui (inclusive nos slides aninhados).
export class NewsletterSlideDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string; // key do storage ou URL absoluta

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  ctaText?: string;

  @IsOptional()
  @IsString()
  ctaHref?: string;

  @IsOptional()
  @IsString()
  textPosition?: NewsletterTextPosition;

  @IsOptional()
  @IsBoolean()
  textBgEnabled?: boolean;

  @IsOptional()
  @IsHexColor()
  textBgColor?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  textBgOpacity?: number;
}

export class UpdateNewsletterDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  autoplay?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1500)
  intervalMs?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NewsletterSlideDto)
  slides?: NewsletterSlideDto[];
}
