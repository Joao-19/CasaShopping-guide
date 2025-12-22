export type PriceTier = "LOW" | "MEDIUM" | "HIGH";

export interface CreateProductDto {
  name: string;
  description: string;
  price: PriceTier;
  categories: string[];
  tags?: string;
  storeId: string;
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
