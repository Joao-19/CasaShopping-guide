import {
  IsArray,
  IsBoolean,
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

// Seção opcional de uma campanha. `productIds` referenciam produtos do pool
// (CampaignProduct). `type: "highlights"` recebe realce visual no público.
export class CampaignSectionDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsIn(["custom", "highlights"])
  type!: "custom" | "highlights";

  @IsArray()
  @IsUUID("all", { each: true })
  productIds!: string[];
}

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

  // Janela de exibição (agendamento). Aceita "YYYY-MM-DD" (input date) ou ISO.
  // null limpa o limite correspondente. Ambos ausentes/null => sem prazo.
  @IsOptional()
  @IsISO8601()
  startsAt?: string | null;

  @IsOptional()
  @IsISO8601()
  endsAt?: string | null;

  @IsOptional()
  @IsArray()
  @IsUUID("all", { each: true })
  productIds?: string[];

  // Modo seções (opcional). Se ausente/null => vitrine plana via productIds.
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CampaignSectionDto)
  sections?: CampaignSectionDto[] | null;
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

  // Janela de exibição (agendamento). Aceita "YYYY-MM-DD" (input date) ou ISO.
  // null limpa o limite correspondente. Ambos ausentes/null => sem prazo.
  @IsOptional()
  @IsISO8601()
  startsAt?: string | null;

  @IsOptional()
  @IsISO8601()
  endsAt?: string | null;

  @IsOptional()
  @IsArray()
  @IsUUID("all", { each: true })
  productIds?: string[];

  // null explícito limpa as seções (volta pro modo simples).
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CampaignSectionDto)
  sections?: CampaignSectionDto[] | null;
}

// --- Leitura ---
export interface CampaignProductStore {
  name: string;
  logoImage: string | null; // URL pública
  phone: string | null;
  address: string | null;
  site: string | null;
  instagramLink: string | null;
  facebookLink: string | null;
  youtubeLink: string | null;
  whatsapp: string | null;
}

export interface CampaignProductView {
  id: string;
  name: string;
  description: string;
  price: string;
  tags: string | null;
  storeId: string;
  images: string[]; // URLs públicas resolvidas, na ordem do index
  order: number;
  showStorePhone: boolean;
  store: CampaignProductStore | null;
}

// Status efetivo da campanha, derivado de isActive + janela vs. agora:
// - inactive : isActive=false (desligada no master)
// - scheduled: ligada, mas a janela ainda não começou
// - expired  : ligada, mas a janela já terminou
// - active   : ligada e (sem janela ou dentro dela) => visível no público
export type CampaignStatus = "active" | "scheduled" | "expired" | "inactive";

// Item de lista (admin) — sem os produtos resolvidos.
export interface CampaignPageListItem {
  id: string;
  title: string;
  slug: string;
  coverDesktop: string | null; // URL pública
  coverMobile: string | null; // URL pública
  isActive: boolean;
  startsAt: string | null; // ISO (UTC) ou null
  endsAt: string | null; // ISO (UTC) ou null
  status: CampaignStatus; // calculado no backend (no momento da leitura)
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Seção resolvida na leitura (productIds já saneados contra o pool).
export interface CampaignSectionView {
  id: string;
  title: string;
  type: "custom" | "highlights";
  productIds: string[];
}

// Detalhe (admin edita / web renderiza) — com produtos resolvidos.
export interface CampaignPageDetail {
  id: string;
  title: string;
  slug: string;
  coverDesktop: string | null; // URL pública
  coverMobile: string | null; // URL pública
  isActive: boolean;
  startsAt: string | null; // ISO (UTC) ou null
  endsAt: string | null; // ISO (UTC) ou null
  status: CampaignStatus; // calculado no backend (no momento da leitura)
  products: CampaignProductView[];
  sections: CampaignSectionView[] | null; // null => vitrine plana
  createdAt: Date;
  updatedAt: Date;
}

export interface SlugAvailability {
  slug: string;
  available: boolean;
}
