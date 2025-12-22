import { Injectable } from "@nestjs/common";
import { prisma } from "@repo/database";
import { CreateStoreDto, Store } from "@repo/dtos";

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
        // logoImage will be handled later, after create works
      },
    });

    return store;
  }

  async findAll(page: number = 1, search?: string): Promise<Store[]> {
    const take = 15;
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

    return prisma.store.findMany({
      take,
      skip,
      orderBy: {
        name: "asc",
      },
      where,
    });
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

    return prisma.store.update({
      where: { id },
      data: updateData,
    });
  }
}
