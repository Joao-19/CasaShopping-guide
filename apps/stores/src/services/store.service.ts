import { Injectable } from "@nestjs/common";
import { prisma } from "@repo/database";
import { CreateStoreDto, Store, PaginatedResult } from "@repo/dtos";

@Injectable()
export class StoreService {
  async create(data: CreateStoreDto): Promise<Store> {
    const store = await prisma.store.create({
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        site: data.site,
        facebookLink: data.facebookLink,
        instagramLink: data.instagramLink,
        youtubeLink: data.youtubeLink,
        logoImage: data.logoImage,
      },
    });

    return this.transformStore(store);
  }

  private transformStore(store: Store): Store {
    if (store.logoImage && !store.logoImage.startsWith("http")) {
      const baseUrl =
        process.env.STORAGE_URL || "http://localhost:9000/casashopping";
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
    limit?: number
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

  async delete(id: string): Promise<Store> {
    return prisma.store.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async update(id: string, data: Partial<CreateStoreDto>): Promise<Store> {
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
    return this.transformStore(updatedStore);
  }
}
