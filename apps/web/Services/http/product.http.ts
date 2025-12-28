import http from "./index";
import { Product } from "@repo/dtos";

export interface ProductWithStore extends Product {
  store?: {
    name: string;
    address: string;
    phone?: string;
  };
}

export interface ProductResponse {
  data: ProductWithStore[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getProducts = async (params?: {
  category?: string;
  limit?: number;
  page?: number;
  search?: string;
  isFeatured?: boolean;
}) => {
  // Assuming the API returns { data: [...], meta: ... } or similar for pagination
  // If the API currently returns just an array, we might need to adjust or mock the meta structure until the backend is fully ready.
  // For now, let's assume standard pagination structure or mapping.

  // Since I don't know the exact API response structure for pagination yet, I'll assume a standard one or just return data for now.
  // Converting to a structure that supports infinite query.
  const { data } = await http.get<any>("/products", { params }); // Use any temporarily to cast response

  if (Array.isArray(data)) {
    // Fallback if API returns just array
    return {
      data,
      meta: {
        total: data.length,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: 1,
      },
    };
  }

  // Normalize backend response (lastPage -> totalPages)
  return {
    ...data,
    meta: {
      ...data.meta,
      totalPages: data.meta.lastPage ?? data.meta.totalPages ?? 0,
    },
  };
};
