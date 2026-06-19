import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "./prisma.service";
import {
  CampaignPageDetail,
  CampaignPageListItem,
  CampaignProductView,
  CreateCampaignPageDto,
  PaginatedResult,
  SlugAvailability,
  UpdateCampaignPageDto,
} from "@repo/dtos";

const PAGE_SIZE = 10;

@Injectable()
export class CampaignService {
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

  // Helpers de key<->url espelhados de settings/newsletter.service (mesmo storage).
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

  // include reutilizado para montar o detalhe (campanha + produtos ordenados).
  private get detailInclude() {
    return {
      products: {
        orderBy: { order: "asc" as const },
        include: { product: { include: { images: true } } },
      },
    };
  }

  private toDetail(campaign: {
    id: string;
    title: string;
    slug: string;
    coverDesktop: string | null;
    coverMobile: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    products: Array<{
      order: number;
      product: {
        id: string;
        name: string;
        description: string;
        price: string;
        tags: string | null;
        storeId: string;
        images: Array<{ path: string; index: number }>;
      };
    }>;
  }): CampaignPageDetail {
    const products: CampaignProductView[] = campaign.products.map((cp) => ({
      id: cp.product.id,
      name: cp.product.name,
      description: cp.product.description,
      price: cp.product.price,
      tags: cp.product.tags,
      storeId: cp.product.storeId,
      images: [...cp.product.images]
        .sort((a, b) => a.index - b.index)
        .map((img) => this.transformToUrl(img.path))
        .filter((url): url is string => !!url),
      order: cp.order,
    }));

    return {
      id: campaign.id,
      title: campaign.title,
      slug: campaign.slug,
      coverDesktop: this.transformToUrl(campaign.coverDesktop),
      coverMobile: this.transformToUrl(campaign.coverMobile),
      isActive: campaign.isActive,
      products,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    };
  }

  async findAll(
    search?: string,
    page = 1
  ): Promise<PaginatedResult<CampaignPageListItem>> {
    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { slug: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [total, rows] = await Promise.all([
      this.prisma.campaignPage.count({ where }),
      this.prisma.campaignPage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: { _count: { select: { products: true } } },
      }),
    ]);

    return {
      data: rows.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        coverDesktop: this.transformToUrl(c.coverDesktop),
        coverMobile: this.transformToUrl(c.coverMobile),
        isActive: c.isActive,
        productCount: c._count.products,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      meta: {
        total,
        page,
        lastPage: Math.max(1, Math.ceil(total / PAGE_SIZE)),
        limit: PAGE_SIZE,
      },
    };
  }

  async findOne(id: string): Promise<CampaignPageDetail> {
    const campaign = await this.prisma.campaignPage.findUnique({
      where: { id },
      include: this.detailInclude,
    });
    if (!campaign) throw new NotFoundException("Campanha não encontrada");
    return this.toDetail(campaign);
  }

  // Público: só campanha ativa; inexistente/inativa => 404.
  async findBySlug(slug: string): Promise<CampaignPageDetail> {
    const campaign = await this.prisma.campaignPage.findUnique({
      where: { slug },
      include: this.detailInclude,
    });
    if (!campaign || !campaign.isActive)
      throw new NotFoundException("Campanha não encontrada");
    return this.toDetail(campaign);
  }

  async checkSlug(slug: string, excludeId?: string): Promise<SlugAvailability> {
    const existing = await this.prisma.campaignPage.findUnique({
      where: { slug },
      select: { id: true },
    });
    const available = !existing || existing.id === excludeId;
    return { slug, available };
  }

  async create(data: CreateCampaignPageDto): Promise<CampaignPageDetail> {
    const taken = await this.prisma.campaignPage.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });
    if (taken) throw new ConflictException("Essa URL (slug) já existe");

    const created = await this.prisma.campaignPage.create({
      data: {
        title: data.title,
        slug: data.slug,
        coverDesktop: this.extractKey(data.coverDesktop),
        coverMobile: this.extractKey(data.coverMobile),
        isActive: data.isActive ?? true,
        products: {
          create: (data.productIds ?? []).map((productId, index) => ({
            productId,
            order: index,
          })),
        },
      },
      include: this.detailInclude,
    });
    return this.toDetail(created);
  }

  async update(
    id: string,
    data: UpdateCampaignPageDto
  ): Promise<CampaignPageDetail> {
    const current = await this.prisma.campaignPage.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!current) throw new NotFoundException("Campanha não encontrada");

    if (data.slug !== undefined) {
      const taken = await this.prisma.campaignPage.findUnique({
        where: { slug: data.slug },
        select: { id: true },
      });
      if (taken && taken.id !== id)
        throw new ConflictException("Essa URL (slug) já existe");
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.campaignPage.update({
        where: { id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.slug !== undefined && { slug: data.slug }),
          ...(data.coverDesktop !== undefined && {
            coverDesktop: this.extractKey(data.coverDesktop),
          }),
          ...(data.coverMobile !== undefined && {
            coverMobile: this.extractKey(data.coverMobile),
          }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });

      // Replace dos produtos: a UI envia a lista completa na ordem desejada.
      if (data.productIds) {
        await tx.campaignProduct.deleteMany({ where: { campaignId: id } });
        if (data.productIds.length > 0) {
          await tx.campaignProduct.createMany({
            data: data.productIds.map((productId, index) => ({
              campaignId: id,
              productId,
              order: index,
            })),
          });
        }
      }
    });

    return this.findOne(id);
  }

  async remove(id: string): Promise<{ id: string }> {
    const current = await this.prisma.campaignPage.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!current) throw new NotFoundException("Campanha não encontrada");
    await this.prisma.campaignPage.delete({ where: { id } });
    return { id };
  }
}
