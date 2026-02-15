import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { Settings } from "@repo/database";

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(): Promise<Settings> {
    const settings = await this.prisma.settings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      // Create default settings if not exists
      return this.prisma.settings.create({
        data: {
          id: 1,
          advertisementBannerDisplay: 3,
        },
      });
    }

    return settings;
  }

  async updateSettings(data: Partial<Settings>): Promise<Settings> {
    return this.prisma.settings.upsert({
      where: { id: 1 },
      update: {
        ...data,
        updatedAt: new Date(),
      },
      create: {
        id: 1,
        ...data,
        advertisementBannerDisplay: data.advertisementBannerDisplay || 3,
      },
    });
  }
}
