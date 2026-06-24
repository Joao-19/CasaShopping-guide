import {
  IsArray,
  IsBoolean,
  IsHexColor,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export type NewsletterImageSide = "left" | "right";

// --- Contrato de leitura (GET /newsletter, público) ---
export interface NewsletterSlide {
  id: string;
  images: string[]; // URLs públicas resolvidas na leitura, em ordem
  name?: string | null;
  title?: string | null;
  description?: string | null;
  fineprint?: string | null;
  primaryButtonText?: string | null;
  primaryButtonUrl?: string | null;
  showSecondaryButton: boolean;
  secondaryButtonText?: string | null;
  secondaryButtonUrl?: string | null;
}

export interface NewsletterBehavior {
  appearDelay: number; // segundos até aparecer
  autoClose: boolean;
  autoCloseDelay: number; // segundos visível antes de fechar
  slideInterval: number; // segundos entre imagens do carrossel interno do slide
}

export interface NewsletterTargeting {
  pageTypes: string[];
  specificPages: string[];
  campaigns: string[];
  /** Janela de exibição (ISO 8601). Opcionais — vazios = sempre. */
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface NewsletterSettings {
  enabled: boolean;
  imageSide: NewsletterImageSide;
  accentColor: string;
  behavior: NewsletterBehavior;
  targeting: NewsletterTargeting;
  slides: NewsletterSlide[];
}

// --- Contrato de escrita (PUT /newsletter, admin) ---
// O ValidationPipe usa whitelist + forbidNonWhitelisted: todo campo enviado
// (inclusive aninhado em slide/behavior/targeting) precisa estar declarado.
export class NewsletterSlideDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[]; // keys do storage ou URLs absolutas, em ordem

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  fineprint?: string;

  @IsOptional()
  @IsString()
  primaryButtonText?: string;

  @IsOptional()
  @IsString()
  primaryButtonUrl?: string;

  @IsOptional()
  @IsBoolean()
  showSecondaryButton?: boolean;

  @IsOptional()
  @IsString()
  secondaryButtonText?: string;

  @IsOptional()
  @IsString()
  secondaryButtonUrl?: string;
}

export class NewsletterBehaviorDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(600)
  appearDelay?: number;

  @IsOptional()
  @IsBoolean()
  autoClose?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(600)
  autoCloseDelay?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  slideInterval?: number;
}

export class NewsletterTargetingDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pageTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specificPages?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  campaigns?: string[];

  // Janela de exibição (opcional). Formato ISO 8601 (YYYY-MM-DD ou completo).
  @IsOptional()
  @IsISO8601()
  startsAt?: string | null;

  @IsOptional()
  @IsISO8601()
  endsAt?: string | null;
}

export class UpdateNewsletterDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsIn(["left", "right"])
  imageSide?: NewsletterImageSide;

  @IsOptional()
  @IsHexColor()
  accentColor?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => NewsletterBehaviorDto)
  behavior?: NewsletterBehaviorDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NewsletterTargetingDto)
  targeting?: NewsletterTargetingDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NewsletterSlideDto)
  slides?: NewsletterSlideDto[];
}
