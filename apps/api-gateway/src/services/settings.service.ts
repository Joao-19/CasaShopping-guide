import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { Settings } from "@repo/database";

@Injectable()
export class SettingsService {
  private readonly STORAGE_PUBLIC_URL = process.env.STORAGE_URL || "http://localhost:9000/casashopping";

  constructor(private prisma: PrismaService) {}

  private transformToUrl(key: string | null): string | null {
    if (!key) return null;
    if (key.startsWith("http")) return key;
    return `${this.STORAGE_PUBLIC_URL}/${key}`;
  }

  private extractKey(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith(this.STORAGE_PUBLIC_URL)) {
      return url.replace(`${this.STORAGE_PUBLIC_URL}/`, "");
    }
    return url;
  }

  async getSettings(): Promise<Settings> {
    const settings = await this.prisma.settings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      return this.prisma.settings.create({
        data: {
          id: 1,
          advertisementBannerDisplay: 3,
        },
      });
    }

    return {
      ...settings,
      backgroundDesktop: this.transformToUrl(settings.backgroundDesktop),
      backgroundMobile: this.transformToUrl(settings.backgroundMobile),
      advertisementBannerDesktop: this.transformToUrl(
        settings.advertisementBannerDesktop,
      ),
      advertisementBannerMobile: this.transformToUrl(
        settings.advertisementBannerMobile,
      ),
    };
  }

  async updateSettings(data: Partial<Settings>): Promise<Settings> {
    const settings = await this.prisma.settings.upsert({
      where: { id: 1 },
      update: {
        ...data,
        backgroundDesktop: this.extractKey(data.backgroundDesktop),
        backgroundMobile: this.extractKey(data.backgroundMobile),
        advertisementBannerDesktop: this.extractKey(
          data.advertisementBannerDesktop,
        ),
        advertisementBannerMobile: this.extractKey(
          data.advertisementBannerMobile,
        ),
        updatedAt: new Date(),
      },
      create: {
        id: 1,
        ...data,
        backgroundDesktop: this.extractKey(data.backgroundDesktop),
        backgroundMobile: this.extractKey(data.backgroundMobile),
        advertisementBannerDesktop: this.extractKey(
          data.advertisementBannerDesktop,
        ),
        advertisementBannerMobile: this.extractKey(
          data.advertisementBannerMobile,
        ),
        advertisementBannerDisplay: data.advertisementBannerDisplay || 3,
      },
    });

    return {
      ...settings,
      backgroundDesktop: this.transformToUrl(settings.backgroundDesktop),
      backgroundMobile: this.transformToUrl(settings.backgroundMobile),
      advertisementBannerDesktop: this.transformToUrl(
        settings.advertisementBannerDesktop,
      ),
      advertisementBannerMobile: this.transformToUrl(
        settings.advertisementBannerMobile,
      ),
    };
  }
}
