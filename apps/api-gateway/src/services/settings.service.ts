import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { Settings } from "@repo/database";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  private get STORAGE_PUBLIC_URL(): string {
    return this.configService.get<string>("STORAGE_URL") || "http://localhost:9000/casashopping";
  }

  private extractKey(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      try {
        const parsed = new URL(url);
        const parts = parsed.pathname.split("/").filter(Boolean);
        if (parts[0] === "casashopping") return parts.slice(1).join("/");
        return parts.join("/");
      } catch {
        return url;
      }
    }
    if (url.startsWith(this.STORAGE_PUBLIC_URL)) {
      return url.replace(`${this.STORAGE_PUBLIC_URL}/`, "");
    }
    return url;
  }

  private transformToUrl(key: string | null): string | null {
    if (!key) return null;
    let cleanKey = key;
    if (key.startsWith("http://") || key.startsWith("https://")) {
      try {
        const parsed = new URL(key);
        const parts = parsed.pathname.split("/").filter(Boolean);
        cleanKey = parts[0] === "casashopping" ? parts.slice(1).join("/") : parts.join("/");
      } catch {
        cleanKey = key;
      }
    }
    console.log(111111111111, this.STORAGE_PUBLIC_URL);
    
    cleanKey = cleanKey.startsWith("/") ? cleanKey.slice(1) : cleanKey;
    return `${this.STORAGE_PUBLIC_URL}/${cleanKey}`;
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

    console.log(settings)
const formatterd = {
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
    console.log(formatterd)

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
