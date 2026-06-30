import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
  Min,
  Max,
  MaxLength,
  ArrayMaxSize,
} from "class-validator";
import { Type } from "class-transformer";

/** Limites de campos do produto — fonte única (DTO + form admin + service). */
export const PRODUCT_DESCRIPTION_MAX_LENGTH = 500;
export const PRODUCT_MAX_IMAGES = 5;
export const PRODUCT_PRICE_TEXT_MAX_LENGTH = 120;

export enum PriceTier {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  ON_REQUEST = "ON_REQUEST",
}

export class ProductImageDto {
  @IsString()
  @IsNotEmpty()
  path!: string;

  @IsInt()
  @Min(0)
  @Max(4)
  index!: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(PRODUCT_DESCRIPTION_MAX_LENGTH)
  description!: string;

  // Legado: faixa qualitativa. Opcional — o campo oficial agora é priceText.
  @IsOptional()
  @IsEnum(PriceTier)
  price?: PriceTier;

  // Preço em texto livre, exibido exatamente como digitado.
  // Ex.: "R$ 7.847" ou promocional "R$ 7.847 por R$ 4.708,20".
  @IsOptional()
  @IsString()
  @MaxLength(PRODUCT_PRICE_TEXT_MAX_LENGTH)
  priceText?: string;

  @IsArray()
  @IsString({ each: true })
  categories!: string[];

  @IsOptional()
  @IsString()
  tags?: string;

  @IsUUID()
  storeId!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(PRODUCT_MAX_IMAGES)
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @IsOptional()
  @IsBoolean()
  showStorePhone?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class CreateProductsBulkDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductDto)
  products!: CreateProductDto[];
}

export interface BulkRowResult {
  index: number;
  name: string;
  status: "created" | "error";
  productId?: string;
  error?: string;
}

export interface BulkCreateResult {
  created: number;
  failed: number;
  results: BulkRowResult[];
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(PRODUCT_DESCRIPTION_MAX_LENGTH)
  description?: string;

  @IsOptional()
  @IsEnum(PriceTier)
  price?: PriceTier;

  @IsOptional()
  @IsString()
  @MaxLength(PRODUCT_PRICE_TEXT_MAX_LENGTH)
  priceText?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsUUID()
  storeId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(PRODUCT_MAX_IMAGES)
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @IsOptional()
  @IsBoolean()
  showStorePhone?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: PriceTier | null;
  priceText: string | null;
  categories: string[];
  tags: string | null;
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
  images?: ProductImage[];
  showStorePhone: boolean;
  isFeatured: boolean;
}

export interface ProductImage {
  id: string;
  path: string;
  index: number;
  productId: string;
  createdAt: Date;
}
