import { Injectable } from "@nestjs/common";
import { prisma } from "@repo/database";
import { CreateProductDto, Product } from "@repo/dtos";

@Injectable()
export class ProductService {
  async create(data: CreateProductDto): Promise<Product> {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        categories: data.categories,
        tags: data.tags,
        storeId: data.storeId,
      },
    });

    return product as unknown as Product; // Casting due to potential slight type mismatch if strict or validation needed
  }

  async findAll(storeId?: string, search?: string): Promise<Product[]> {
    const where: any = {};

    if (storeId) {
      where.storeId = storeId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: {
        name: "asc",
      },
    });

    return products as unknown as Product[];
  }
}
