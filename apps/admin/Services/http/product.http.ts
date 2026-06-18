import http from "./index";
import {
  CreateProductDto,
  CreateProductsBulkDto,
  BulkCreateResult,
  Product,
  UpdateProductDto,
  PaginatedResult,
} from "@repo/dtos";

export class ProductHttpService {
  async list(params: {
    page?: number;
    search?: string;
    storeId?: string;
  }): Promise<PaginatedResult<Product>> {
    const { data } = await http.get<PaginatedResult<Product>>("/products", {
      params,
    });
    return data;
  }

  async create(data: CreateProductDto): Promise<Product> {
    const { data: response } = await http.post<Product>("/products", data);
    return response;
  }

  async createBulk(data: CreateProductsBulkDto): Promise<BulkCreateResult> {
    const { data: response } = await http.post<BulkCreateResult>(
      "/products/bulk",
      data,
    );
    return response;
  }

  async update(id: string, data: UpdateProductDto): Promise<Product> {
    const { data: response } = await http.put<Product>(`/products/${id}`, data);
    return response;
  }

  async delete(id: string): Promise<void> {
    await http.delete(`/products/${id}`);
  }
}

export default new ProductHttpService();
