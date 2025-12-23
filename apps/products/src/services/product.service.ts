import { Injectable, ConflictException } from "@nestjs/common";
import { prisma } from "@repo/database";
import { CreateProductDto, Product, UpdateProductDto } from "@repo/dtos";

@Injectable()
export class ProductService {
  async create(data: CreateProductDto): Promise<Product> {
    const existingProduct = await prisma.product.findFirst({
      where: {
        storeId: data.storeId,
        name: {
          equals: data.name,
          mode: "insensitive",
        },
      },
    });

    if (existingProduct) {
      throw new ConflictException(
        "Product with this name already exists in this store"
      );
    }

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

    return product as unknown as Product;
  }

  async findAll(
    storeId?: string,
    search?: string,
    page: number = 1
  ): Promise<Product[]> {
    const take = 15;
    const skip = (page - 1) * take;
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
      take,
      skip,
      orderBy: {
        name: "asc",
      },
    });

    return products as unknown as Product[];
  }
  async update(id: string, data: UpdateProductDto): Promise<Product> {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new ConflictException("Product not found"); // Or NotFoundException, using Conflict for simplified import reuse or ideally separate exception
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return product as unknown as Product;
  }
}
