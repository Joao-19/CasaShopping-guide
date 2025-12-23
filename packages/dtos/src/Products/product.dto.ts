import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { PartialType } from "@nestjs/mapped-types";

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

export class UpdateProductDto extends PartialType(CreateProductDto) {}

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
