import {
  Injectable,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { prisma } from "@repo/database";
import {
  CreateProductDto,
  Product,
  UpdateProductDto,
  PaginatedResult,
} from "@repo/dtos";

const STORAGE_SERVICE_URL =
  process.env.STORAGE_SERVICE_URL || "http://localhost:3007";

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

    if (data.images && data.images.length > 5) {
      throw new BadRequestException("Maximum of 5 images allowed per product");
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        categories: data.categories,
        tags: data.tags,
        storeId: data.storeId,
        images: {
          create: data.images?.map((img) => ({
            path: img.path,
            index: img.index,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    return this.transformProduct(product) as unknown as Product;
  }

  private transformProduct(product: any): any {
    if (product.images) {
      const baseUrl =
        process.env.STORAGE_URL || "http://localhost:9000/casashopping";
      const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

      product.images = product.images.map((img: any) => {
        if (!img.path.startsWith("http")) {
          const cleanKey = img.path.startsWith("/")
            ? img.path.slice(1)
            : img.path;
          img.path = `${cleanBase}/${cleanKey}`;
        }
        return img;
      });
      // Sort by index
      product.images.sort((a: any, b: any) => a.index - b.index);
    }
    return product;
  }

  async findAll(
    storeId?: string,
    search?: string,
    isFeatured?: boolean,
    page: number = 1
  ): Promise<PaginatedResult<Product>> {
    const take = 15;
    const skip = (page - 1) * take;
    const where: any = {};

    if (storeId) {
      where.storeId = storeId;
    }

    if (isFeatured === true || isFeatured === false) {
      where.isFeatured = isFeatured;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { contains: search, mode: "insensitive" } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take,
        skip,
        orderBy: isFeatured ? { updatedAt: "desc" } : { name: "asc" },
        include: {
          images: true,
          store: {
            select: {
              name: true,
              address: true,
              phone: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products.map((p) =>
        this.transformProduct(p)
      ) as unknown as Product[],
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / take),
        limit: take,
      },
    };
  }
  async update(id: string, data: UpdateProductDto): Promise<Product> {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });

    if (!existingProduct) {
      throw new ConflictException("Product not found"); // Or NotFoundException, using Conflict for simplified import reuse or ideally separate exception
    }

    if (data.images && data.images.length > 5) {
      throw new BadRequestException("Maximum of 5 images allowed per product");
    }

    const product = await prisma.$transaction(async (tx) => {
      // Handle Image Updates (Re-create strategy)
      if (data.images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({
          data: data.images.map((img) => ({
            productId: id,
            path: img.path,
            index: img.index,
          })),
        });
      }

      // Explicitly construct update data to avoid 'images' being passed directly to update if it's in data
      // (Though DTO validation usually handles this, safe to key it out)
      const { images, ...otherData } = data;

      return tx.product.update({
        where: { id },
        data: {
          ...otherData,
          updatedAt: new Date(),
        },
        include: {
          images: true,
        },
      });
    });

    // Post-transaction: Delete orphaned images from storage
    if (data.images && existingProduct.images) {
      const newPaths = new Set(data.images.map((img) => img.path));
      const imagesToDelete = existingProduct.images.filter(
        (img) => !newPaths.has(img.path)
      );

      for (const img of imagesToDelete) {
        await this.deleteFileFromStorage(img.path);
      }
    }

    return this.transformProduct(product) as unknown as Product;
  }
  async delete(id: string): Promise<Product> {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new ConflictException("Product not found");
    }

    const product = await prisma.product.delete({
      where: { id },
      include: { images: true },
    }); // Images cascade deleted in DB

    // Cleanup storage
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        await this.deleteFileFromStorage(img.path);
      }
    }

    return product as unknown as Product;
  }
  async toggleFavorite(
    userId: string,
    productId: string
  ): Promise<{ isFavorited: boolean }> {
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      throw new ConflictException("Product not found");
    }

    const favorite = await prisma.favorite.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (favorite) {
      await prisma.favorite.delete({
        where: { id: favorite.id },
      });
      return { isFavorited: false };
    } else {
      await prisma.favorite.create({
        data: {
          userId,
          productId,
        },
      });
      return { isFavorited: true };
    }
  }

  async deleteFileFromStorage(key: string) {
    try {
      if (!key) return;
      // Ensure we don't try to delete external http links if they somehow exist
      if (key.startsWith("http")) return;

      console.log(`Deleting orphaned file: ${key}`);

      const response = await fetch(`${STORAGE_SERVICE_URL}/storage/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        console.error(
          `Failed to delete file ${key} from storage: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error(`Error deleting file ${key} from storage:`, error);
    }
  }
}
