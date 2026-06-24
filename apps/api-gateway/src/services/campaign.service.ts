import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "./prisma.service";
import { Prisma } from "@repo/database";
import {
  CampaignPageDetail,
  CampaignPageListItem,
  CampaignProductView,
  CampaignSectionDto,
  CampaignSectionView,
  CampaignStatus,
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

  // --- Janela de exibição (agendamento) ---
  // Input do admin vem como "YYYY-MM-DD" (HTML date) ou ISO completo. Guardamos
  // o início no começo do dia e o fim no fim do dia (UTC), assim o dia final é
  // inclusivo e o round-trip `.slice(0,10)` no admin devolve a mesma data.
  private toDateBound(
    value: string | null | undefined,
    edge: "start" | "end"
  ): Date | null {
    if (!value) return null;
    const day = value.slice(0, 10); // "YYYY-MM-DD"
    const time = edge === "start" ? "00:00:00.000" : "23:59:59.999";
    const d = new Date(`${day}T${time}Z`);
    return isNaN(d.getTime()) ? null : d;
  }

  // Status efetivo no instante `now`. Espelha o tipo CampaignStatus do DTO.
  private computeStatus(
    isActive: boolean,
    startsAt: Date | null,
    endsAt: Date | null,
    now: Date = new Date()
  ): CampaignStatus {
    if (!isActive) return "inactive";
    if (startsAt && now < startsAt) return "scheduled";
    if (endsAt && now > endsAt) return "expired";
    return "active";
  }

  // União dedup (preserva ordem de 1ª aparição) dos productIds das seções.
  private unionProductIds(sections: CampaignSectionDto[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const s of sections)
      for (const id of s.productIds)
        if (!seen.has(id)) {
          seen.add(id);
          out.push(id);
        }
    return out;
  }

  // Normaliza p/ armazenamento: [] => null (cai no modo plano).
  private normalizeSections(
    sections?: CampaignSectionDto[] | null
  ): CampaignSectionView[] | null {
    if (!sections || sections.length === 0) return null;
    return sections.map((s) => ({
      id: s.id,
      title: s.title,
      type: s.type,
      productIds: s.productIds,
    }));
  }

  // Valor pronto pro Prisma (DbNull p/ limpar o Json? nullable).
  private sectionsForDb(sections?: CampaignSectionDto[] | null) {
    const normalized = this.normalizeSections(sections);
    return normalized === null
      ? Prisma.DbNull
      : (normalized as unknown as Prisma.InputJsonValue);
  }

  // Pool de produtos = união das seções (se houver) ou productIds (modo plano).
  private poolIds(data: {
    productIds?: string[];
    sections?: CampaignSectionDto[] | null;
  }): string[] {
    if (data.sections && data.sections.length > 0)
      return this.unionProductIds(data.sections);
    return data.productIds ?? [];
  }

  // include reutilizado para montar o detalhe (campanha + produtos ordenados).
  private get detailInclude() {
    return {
      products: {
        orderBy: { order: "asc" as const },
        include: { product: { include: { images: true, store: true } } },
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
    startsAt: Date | null;
    endsAt: Date | null;
    sections: Prisma.JsonValue;
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
        showStorePhone: boolean;
        images: Array<{ path: string; index: number }>;
        store: {
          name: string;
          logoImage: string | null;
          phone: string | null;
          address: string | null;
          site: string | null;
          instagramLink: string | null;
          facebookLink: string | null;
          youtubeLink: string | null;
          whatsapp: string | null;
        } | null;
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
      showStorePhone: cp.product.showStorePhone,
      store: cp.product.store
        ? {
            name: cp.product.store.name,
            logoImage: this.transformToUrl(cp.product.store.logoImage),
            phone: cp.product.store.phone,
            address: cp.product.store.address,
            site: cp.product.store.site,
            instagramLink: cp.product.store.instagramLink,
            facebookLink: cp.product.store.facebookLink,
            youtubeLink: cp.product.store.youtubeLink,
            whatsapp: cp.product.store.whatsapp,
          }
        : null,
    }));

    // Seções: filtra ids órfãos (produto deletado) contra o pool resolvido.
    const poolIds = new Set(products.map((p) => p.id));
    const rawSections =
      (campaign.sections as unknown as CampaignSectionView[] | null) ?? null;
    const sections =
      rawSections && rawSections.length
        ? rawSections.map((s) => ({
            ...s,
            productIds: s.productIds.filter((id) => poolIds.has(id)),
          }))
        : null;

    return {
      id: campaign.id,
      title: campaign.title,
      slug: campaign.slug,
      coverDesktop: this.transformToUrl(campaign.coverDesktop),
      coverMobile: this.transformToUrl(campaign.coverMobile),
      isActive: campaign.isActive,
      startsAt: campaign.startsAt ? campaign.startsAt.toISOString() : null,
      endsAt: campaign.endsAt ? campaign.endsAt.toISOString() : null,
      status: this.computeStatus(
        campaign.isActive,
        campaign.startsAt,
        campaign.endsAt
      ),
      products,
      sections,
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
        startsAt: c.startsAt ? c.startsAt.toISOString() : null,
        endsAt: c.endsAt ? c.endsAt.toISOString() : null,
        status: this.computeStatus(c.isActive, c.startsAt, c.endsAt),
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

  // Público: só campanha "ao vivo" (ativa E dentro da janela); senão => 404.
  async findBySlug(slug: string): Promise<CampaignPageDetail> {
    const campaign = await this.prisma.campaignPage.findUnique({
      where: { slug },
      include: this.detailInclude,
    });
    if (
      !campaign ||
      this.computeStatus(
        campaign.isActive,
        campaign.startsAt,
        campaign.endsAt
      ) !== "active"
    )
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
        startsAt: this.toDateBound(data.startsAt, "start"),
        endsAt: this.toDateBound(data.endsAt, "end"),
        sections: this.sectionsForDb(data.sections),
        products: {
          create: this.poolIds(data).map((productId, index) => ({
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
          ...(data.startsAt !== undefined && {
            startsAt: this.toDateBound(data.startsAt, "start"),
          }),
          ...(data.endsAt !== undefined && {
            endsAt: this.toDateBound(data.endsAt, "end"),
          }),
          ...(data.sections !== undefined && {
            sections: this.sectionsForDb(data.sections),
          }),
        },
      });

      // Replace do pool: union das seções (se houver) ou productIds (modo plano).
      if (data.sections !== undefined || data.productIds !== undefined) {
        const ids = this.poolIds(data);
        await tx.campaignProduct.deleteMany({ where: { campaignId: id } });
        if (ids.length > 0) {
          await tx.campaignProduct.createMany({
            data: ids.map((productId, index) => ({
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
