import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "./prisma.service";
import {
  NewsletterSettings,
  NewsletterTextPosition,
  UpdateNewsletterDto,
} from "@repo/dtos";

@Injectable()
export class NewsletterService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  private get STORAGE_PUBLIC_URL(): string {
    return (
      this.configService.get<string>("STORAGE_URL") ||
      "http://localhost:9000/casashopping"
    );
  }

  // Helpers de key<->url espelhados de settings.service.ts (mesmo storage).
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
        cleanKey =
          parts[0] === "casashopping"
            ? parts.slice(1).join("/")
            : parts.join("/");
      } catch {
        cleanKey = key;
      }
    }
    cleanKey = cleanKey.startsWith("/") ? cleanKey.slice(1) : cleanKey;
    return `${this.STORAGE_PUBLIC_URL}/${cleanKey}`;
  }

  async getNewsletter(): Promise<NewsletterSettings> {
    const [settings, slides] = await Promise.all([
      this.prisma.settings.findUnique({ where: { id: 1 } }),
      this.prisma.newsletterSlide.findMany({ orderBy: { order: "asc" } }),
    ]);

    return {
      enabled: settings?.newsletterEnabled ?? false,
      autoplay: settings?.newsletterAutoplay ?? true,
      intervalMs: settings?.newsletterIntervalMs ?? 6000,
      slides: slides.map((s) => ({
        id: s.id,
        imageUrl: this.transformToUrl(s.imageUrl),
        title: s.title ?? "",
        subtitle: s.subtitle ?? "",
        ctaText: s.ctaText ?? "",
        ctaHref: s.ctaHref ?? "",
        textPosition: (s.textPosition as NewsletterTextPosition) ?? "bottom-left",
        textBgEnabled: s.textBgEnabled,
        textBgColor: s.textBgColor,
        textBgOpacity: s.textBgOpacity,
      })),
    };
  }

  async updateNewsletter(
    data: UpdateNewsletterDto
  ): Promise<NewsletterSettings> {
    const settingsUpdate: {
      newsletterEnabled?: boolean;
      newsletterAutoplay?: boolean;
      newsletterIntervalMs?: number;
    } = {};
    if (data.enabled !== undefined) settingsUpdate.newsletterEnabled = data.enabled;
    if (data.autoplay !== undefined)
      settingsUpdate.newsletterAutoplay = data.autoplay;
    if (data.intervalMs !== undefined)
      settingsUpdate.newsletterIntervalMs = data.intervalMs;

    await this.prisma.$transaction(async (tx) => {
      if (Object.keys(settingsUpdate).length > 0) {
        await tx.settings.upsert({
          where: { id: 1 },
          update: settingsUpdate,
          create: {
            id: 1,
            advertisementBannerDisplay: 3,
            ...settingsUpdate,
          },
        });
      }

      // Estratégia de replace: a UI envia a lista completa de slides na ordem
      // desejada. Apaga tudo e recria com `order` = índice do array.
      if (data.slides) {
        await tx.newsletterSlide.deleteMany({});
        if (data.slides.length > 0) {
          await tx.newsletterSlide.createMany({
            data: data.slides.map((s, index) => ({
              imageUrl: this.extractKey(s.imageUrl),
              title: s.title ?? null,
              subtitle: s.subtitle ?? null,
              ctaText: s.ctaText ?? null,
              ctaHref: s.ctaHref ?? null,
              textPosition: s.textPosition ?? "bottom-left",
              textBgEnabled: s.textBgEnabled ?? true,
              textBgColor: s.textBgColor ?? "#000000",
              textBgOpacity: s.textBgOpacity ?? 50,
              order: index,
            })),
          });
        }
      }
    });

    return this.getNewsletter();
  }
}
