import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export enum PriceTier {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
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
}
