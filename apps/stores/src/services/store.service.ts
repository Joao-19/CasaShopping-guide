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
}
