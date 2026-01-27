import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { prisma } from "@repo/database";
import { CreateStoreDto, Store, PaginatedResult } from "@repo/dtos";

const STORAGE_SERVICE_URL =
  process.env.STORAGE_SERVICE_URL || "http://storage-service:3007";

@Injectable()
export class StoreService {
  async create(data: CreateStoreDto): Promise<Store> {
    const existingStore = await prisma.store.findFirst({
      where: {
        name: { equals: data.name, mode: "insensitive" },
        deletedAt: null,
      },
    });

    if (existingStore) {
      throw new ConflictException(
        `A store with name "${data.name}" already exists.`,
      );
    }

    const store = await prisma.store.create({
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        site: data.site,
        facebookLink: data.facebookLink,
        instagramLink: data.instagramLink,
        youtubeLink: data.youtubeLink,
        whatsapp: data.whatsapp,
        logoImage: data.logoImage,
      },
    });

    return this.transformStore(store);
  }

  private transformStore(store: Store): Store {
    if (store.logoImage && !store.logoImage.startsWith("http")) {
      const publicEndpoint = process.env.MINIO_PUBLIC_ENDPOINT;
      const bucketName = process.env.MINIO_BUCKET_NAME || "casashopping";

      let baseUrl = publicEndpoint
        ? `${publicEndpoint.replace(/\/$/, "")}/${bucketName}`
        : process.env.STORAGE_URL || "http://localhost:9000/casashopping";

      const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
      const cleanKey = store.logoImage.startsWith("/")
        ? store.logoImage.slice(1)
        : store.logoImage;
      store.logoImage = `${cleanBase}/${cleanKey}`;
    }
    return store;
  }

  async findAll(
    page: number = 1,
    search?: string,
    limit?: number,
  ): Promise<PaginatedResult<Store>> {
    const MAX_LIMIT = 25;
    const DEFAULT_LIMIT = 15;
    const take = Math.min(limit || DEFAULT_LIMIT, MAX_LIMIT);
    const skip = (page - 1) * take;

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        take,
        skip,
        orderBy: {
          name: "asc",
        },
        where,
      }),
      prisma.store.count({ where }),
    ]);

    return {
      data: stores.map((store) => this.transformStore(store)),
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / take),
        limit: take,
      },
    };
  }

  async findOne(id: string): Promise<Store> {
    const store = await prisma.store.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    return this.transformStore(store);
  }

  async delete(id: string): Promise<Store> {
    return prisma.$transaction(async (tx) => {
      // 1. Find all products to delete images from storage
      const products = await tx.product.findMany({
        where: { storeId: id },
        include: { images: true },
      });

      // 2. Delete images from storage (non-transactional side effect, but necessary)
      for (const product of products) {
        for (const img of product.images) {
          await this.deleteFileFromStorage(img.path);
        }
      }

      // 3. Delete products
      // This explicit deleteMany triggers the deletion of products.
      // Because `Product` has `onDelete: Cascade` relations with `ProductImage` and `Favorite` in schema.prisma,
      // the database (Postgres) will handle deleting those children automatically IF foreign keys are set up correctly.
      // If Prisma is managing the relation, `deleteMany` might NOT cascade automatically in all cases without middleware,
      // but here we are relying on the database or explicit cleanup if needed.
      // Given the schema, cascade should work at DB level.
      await tx.product.deleteMany({
        where: { storeId: id },
      });

      // 4. Get store to delete logo
      const store = await tx.store.findUnique({ where: { id } });
      if (store?.logoImage) {
        await this.deleteFileFromStorage(store.logoImage);
      }

      // 5. Soft delete the store
      return tx.store.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });
  }

  async update(id: string, data: Partial<CreateStoreDto>): Promise<Store> {
    const existingStore = await prisma.store.findUnique({ where: { id } });
    if (!existingStore) throw new Error("Store not found");

    if (data.name) {
      const duplicateName = await prisma.store.findFirst({
        where: {
          name: { equals: data.name, mode: "insensitive" },
          id: { not: id },
          deletedAt: null,
        },
      });

      if (duplicateName) {
        throw new ConflictException(
          `A store with name "${data.name}" already exists.`,
        );
      }
    }

    const updateData: any = {
      ...data,
      modifiedAt: new Date(),
    };

    // Remove image if it's sent as file (handled separately) or handle as needed
    // For now, we sanitize strictly what is in the DTO that maps to DB fields
    delete updateData.image;

    const updatedStore = await prisma.store.update({
      where: { id },
      data: updateData,
    });

    // Cleanup old image if changed
    if (
      data.logoImage &&
      existingStore.logoImage &&
      data.logoImage !== existingStore.logoImage
    ) {
      await this.deleteFileFromStorage(existingStore.logoImage);
    }

    return this.transformStore(updatedStore);
  }

  async deleteFileFromStorage(key: string) {
    try {
      if (!key) return;
      // Ensure we don't try to delete external http links
      if (key.startsWith("http")) return;

      console.log(`Deleting old store logo: ${key}`);

      const response = await fetch(`${STORAGE_SERVICE_URL}/storage/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        console.error(
          `Failed to delete file ${key} from storage: ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error(`Error deleting file ${key} from storage:`, error);
    }
  }
}
