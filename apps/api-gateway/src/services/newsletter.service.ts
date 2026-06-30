import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@repo/database";
import { PrismaService } from "./prisma.service";
import {
  NewsletterImageSide,
  NewsletterSettings,
  NewsletterTargeting,
  UpdateNewsletterDto,
} from "@repo/dtos";

const DEFAULT_TARGETING: NewsletterTargeting = {
  pageTypes: [],
  specificPages: [],
  campaigns: [],
  startsAt: null,
  endsAt: null,
  showOnHome: true,
};

function parseTargeting(value: unknown): NewsletterTargeting {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const t = value as Record<string, unknown>;
    return {
      pageTypes: Array.isArray(t.pageTypes) ? (t.pageTypes as string[]) : [],
      specificPages: Array.isArray(t.specificPages)
        ? (t.specificPages as string[])
        : [],
      campaigns: Array.isArray(t.campaigns) ? (t.campaigns as string[]) : [],
      startsAt: typeof t.startsAt === "string" ? t.startsAt : null,
      endsAt: typeof t.endsAt === "string" ? t.endsAt : null,
      // Legado (ausente) = true: sempre exibia na home.
      showOnHome: typeof t.showOnHome === "boolean" ? t.showOnHome : true,
    };
  }
  return { ...DEFAULT_TARGETING };
}

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
      imageSide: (settings?.newsletterImageSide as NewsletterImageSide) ?? "left",
      accentColor: settings?.newsletterAccentColor ?? "#003ba6",
      behavior: {
        appearDelay: settings?.newsletterAppearDelay ?? 5,
        autoClose: settings?.newsletterAutoClose ?? false,
        autoCloseDelay: settings?.newsletterAutoCloseDelay ?? 15,
        slideInterval: settings?.newsletterSlideInterval ?? 5,
      },
      targeting: parseTargeting(settings?.newsletterTargeting),
      slides: slides.map((s) => ({
        id: s.id,
        images: s.images
          .map((key) => this.transformToUrl(key))
          .filter((url): url is string => !!url),
        name: s.name ?? "",
        title: s.title ?? "",
        description: s.description ?? "",
        fineprint: s.fineprint ?? "",
        primaryButtonText: s.primaryButtonText ?? "",
        primaryButtonUrl: s.primaryButtonUrl ?? "",
        showSecondaryButton: s.showSecondaryButton,
        secondaryButtonText: s.secondaryButtonText ?? "",
        secondaryButtonUrl: s.secondaryButtonUrl ?? "",
      })),
    };
  }

  async updateNewsletter(
    data: UpdateNewsletterDto
  ): Promise<NewsletterSettings> {
    const settingsUpdate: {
      newsletterEnabled?: boolean;
      newsletterImageSide?: string;
      newsletterAccentColor?: string;
      newsletterAppearDelay?: number;
      newsletterAutoClose?: boolean;
      newsletterAutoCloseDelay?: number;
      newsletterSlideInterval?: number;
      newsletterTargeting?: Prisma.InputJsonValue;
    } = {};
    if (data.enabled !== undefined)
      settingsUpdate.newsletterEnabled = data.enabled;
    if (data.imageSide !== undefined)
      settingsUpdate.newsletterImageSide = data.imageSide;
    if (data.accentColor !== undefined)
      settingsUpdate.newsletterAccentColor = data.accentColor;
    if (data.behavior?.appearDelay !== undefined)
      settingsUpdate.newsletterAppearDelay = data.behavior.appearDelay;
    if (data.behavior?.autoClose !== undefined)
      settingsUpdate.newsletterAutoClose = data.behavior.autoClose;
    if (data.behavior?.autoCloseDelay !== undefined)
      settingsUpdate.newsletterAutoCloseDelay = data.behavior.autoCloseDelay;
    if (data.behavior?.slideInterval !== undefined)
      settingsUpdate.newsletterSlideInterval = data.behavior.slideInterval;
    if (data.targeting !== undefined)
      settingsUpdate.newsletterTargeting = {
        pageTypes: data.targeting.pageTypes ?? [],
        specificPages: data.targeting.specificPages ?? [],
        campaigns: data.targeting.campaigns ?? [],
        startsAt: data.targeting.startsAt ?? null,
        endsAt: data.targeting.endsAt ?? null,
        // Ausente = true (legado sempre exibia na home); false = home off.
        showOnHome: data.targeting.showOnHome ?? true,
      };

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
              images: (s.images ?? [])
                .map((url) => this.extractKey(url))
                .filter((key): key is string => !!key),
              name: s.name ?? null,
              title: s.title ?? null,
              description: s.description ?? null,
              fineprint: s.fineprint ?? null,
              primaryButtonText: s.primaryButtonText ?? null,
              primaryButtonUrl: s.primaryButtonUrl ?? null,
              showSecondaryButton: s.showSecondaryButton ?? false,
              secondaryButtonText: s.secondaryButtonText ?? null,
              secondaryButtonUrl: s.secondaryButtonUrl ?? null,
              order: index,
            })),
          });
        }
      }
    });

    return this.getNewsletter();
  }
}
