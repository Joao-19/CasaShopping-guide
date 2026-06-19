import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

// --- Escrita (admin) ---
// Estratégia de replace: a UI envia a lista completa de productIds na ordem
// desejada; o backend recria as linhas de junção com `order` = índice do array.
export class CreateCampaignPageDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsOptional()
  @IsString()
  coverDesktop?: string;

  @IsOptional()
  @IsString()
  coverMobile?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID("all", { each: true })
  productIds?: string[];
}

export class UpdateCampaignPageDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  slug?: string;

  @IsOptional()
  @IsString()
  coverDesktop?: string;

  @IsOptional()
  @IsString()
  coverMobile?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID("all", { each: true })
  productIds?: string[];
}

// --- Leitura ---
export interface CampaignProductView {
  id: string;
  name: string;
  description: string;
  price: string;
  tags: string | null;
  storeId: string;
  images: string[]; // URLs públicas resolvidas, na ordem do index
  order: number;
}

// Item de lista (admin) — sem os produtos resolvidos.
export interface CampaignPageListItem {
  id: string;
  title: string;
  slug: string;
  coverDesktop: string | null; // URL pública
  coverMobile: string | null; // URL pública
  isActive: boolean;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Detalhe (admin edita / web renderiza) — com produtos resolvidos.
export interface CampaignPageDetail {
  id: string;
  title: string;
  slug: string;
  coverDesktop: string | null; // URL pública
  coverMobile: string | null; // URL pública
  isActive: boolean;
  products: CampaignProductView[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SlugAvailability {
  slug: string;
  available: boolean;
}
