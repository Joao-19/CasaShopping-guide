import { Store } from "./Store";

export enum PriceTier {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export interface ProductImage {
  id: string;
  path: string;
  index: number;
  productId: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: PriceTier; // This corresponds to the price tier enum
  categories: string[];
  tags: string | null;
  storeId: string;
  createdAt: string;
  updatedAt: string;
  images?: ProductImage[];
  showStorePhone: boolean;
  isFeatured: boolean;

  // Relations
  store?: Store;
}
