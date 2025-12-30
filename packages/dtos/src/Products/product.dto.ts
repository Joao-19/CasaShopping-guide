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
} from "class-validator";
import { Type } from "class-transformer";

export enum PriceTier {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
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
  description!: string;

  @IsEnum(PriceTier)
  price!: PriceTier;

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

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsEnum(PriceTier)
  price?: PriceTier;

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
  price: PriceTier;
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
