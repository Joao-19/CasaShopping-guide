import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { prisma } from "@repo/database";
import { CreateStoreDto, Store, PaginatedResult, StoreOption } from "@repo/dtos";

const STORAGE_SERVICE_URL =
  process.env.STORAGE_SERVICE_URL || "http://storage-service:3007";

// Gera slug "amigável" (sem acento, kebab) a partir de um texto.
function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

@Injectable()
export class StoreService {
  async create(data: CreateStoreDto): Promise<Store> {
    const existingStore = await prisma.store.findFirst({
      where: {
        name: { equals: data.name, mode: "insensitive" },
        deletedAt: null,
      },
    });

    if (existingStore) {
      throw new ConflictException(
        `A store with name "${data.name}" already exists.`,
      );
    }

    // Slug: usa o informado (se válido/único) ou gera do nome, garantindo unicidade.
    const slug = await this.resolveUniqueSlug(data.slug || slugify(data.name));

    const store = await prisma.store.create({
      data: {
        name: data.name,
        slug,
        address: data.address,
        phone: data.phone,
        site: data.site,
        facebookLink: data.facebookLink,
        instagramLink: data.instagramLink,
        youtubeLink: data.youtubeLink,
        whatsapp: data.whatsapp,
        logoImage: data.logoImage,
        bannerImage: data.bannerImage,
      },
    });

    return this.transformStore(store);
  }

  // Garante slug único: se já existe (ignorando excludeId), anexa sufixo numérico.
  private async resolveUniqueSlug(
    base: string,
    excludeId?: string,
  ): Promise<string> {
    const root = slugify(base) || "loja";
    let candidate = root;
    let n = 2;
    // Loop curto: na prática 1-2 iterações; protege contra colisão.
    while (true) {
      const clash = await prisma.store.findFirst({
        where: { slug: candidate, id: excludeId ? { not: excludeId } : undefined },
        select: { id: true },
      });
      if (!clash) return candidate;
      candidate = `${root}-${n++}`;
    }
  }

  async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    const clash = await prisma.store.findFirst({
      where: { slug, id: excludeId ? { not: excludeId } : undefined },
      select: { id: true },
    });
    return !clash;
  }

  async findBySlug(slug: string): Promise<Store> {
    const store = await prisma.store.findFirst({
      where: { slug, deletedAt: null },
    });
    if (!store) {
      throw new NotFoundException(`Store with slug "${slug}" not found`);
    }
    return this.transformStore(store);
  }

  private transformStore(store: Store): Store {
    const publicEndpoint = process.env.MINIO_PUBLIC_ENDPOINT;
    const bucketName = process.env.MINIO_BUCKET_NAME || "casashopping";
    // STORAGE_URL e a base de LEITURA publica (MinIO: endpoint/bucket; R2:
    // dominio publico pub-*.r2.dev). MINIO_PUBLIC_ENDPOINT e o endpoint S3 de
    // UPLOAD (privado no R2) — so serve de fallback se STORAGE_URL faltar.
    const baseUrl =
      process.env.STORAGE_URL ||
      (publicEndpoint
        ? `${publicEndpoint.replace(/\/$/, "")}/${bucketName}`
        : "http://localhost:9000/casashopping");
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

    const toPublicUrl = (key: string) =>
      `${cleanBase}/${key.startsWith("/") ? key.slice(1) : key}`;

    if (store.logoImage && !store.logoImage.startsWith("http")) {
      store.logoImage = toPublicUrl(store.logoImage);
    }
    if (store.bannerImage && !store.bannerImage.startsWith("http")) {
      store.bannerImage = toPublicUrl(store.bannerImage);
    }
    return store;
  }

  // Converte um valor de logo/banner na KEY canônica do storage:
  //  - key relativa ("stores/x.jpg")           -> ela mesma (sem barra inicial)
  //  - URL absoluta do NOSSO storage           -> a key relativa correspondente
  //  - URL externa (outro host) / vazio / nulo -> null (não é arquivo deletável)
  // Isso existe porque transformStore devolve URL ABSOLUTA na leitura; sem
  // canonicalizar, o update comparava "absoluta != relativa" e deletava o
  // arquivo real num simples save da loja (incidente jul/2026 — logos sumiram).
  private toStorageKey(value?: string | null): string | null {
    if (!value) return null;
    if (!value.startsWith("http")) return value.replace(/^\/+/, "");
    const bucket = process.env.MINIO_BUCKET_NAME || "casashopping";
    const publicEndpoint = process.env.MINIO_PUBLIC_ENDPOINT;
    const bases = [
      process.env.STORAGE_URL,
      publicEndpoint ? `${publicEndpoint.replace(/\/$/, "")}/${bucket}` : null,
      "http://localhost:9000/casashopping",
    ].filter((b): b is string => Boolean(b));
    for (const b of bases) {
      const base = b.replace(/\/$/, "");
      if (value.startsWith(base + "/")) return value.slice(base.length + 1);
    }
    return null; // URL de outro host — não mexe
  }

  async findAll(
    page: number = 1,
    search?: string,
    limit?: number,
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

  // Universo COMPLETO de lojas (id + nome), sem paginação. Serve o
  // casamento em massa da importação de produtos, que precisa de todos os
  // nomes para resolver — o /stores paginado (cap 25) deixava milhares de
  // lojas invisíveis ao matching. Payload mínimo: sem transform de imagem.
  async findAllOptions(): Promise<StoreOption[]> {
    return prisma.store.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  }

  async findOne(id: string): Promise<Store> {
    const store = await prisma.store.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    return this.transformStore(store);
  }

  async delete(id: string): Promise<Store> {
    return prisma.$transaction(async (tx) => {
      // 1. Find all products to delete images from storage
      const products = await tx.product.findMany({
        where: { storeId: id },
        include: { images: true },
      });

      // 2. Delete images from storage (non-transactional side effect, but necessary)
      for (const product of products) {
        for (const img of product.images) {
          await this.deleteFileFromStorage(img.path);
        }
      }

      // 3. Delete products
      // This explicit deleteMany triggers the deletion of products.
      // Because `Product` has `onDelete: Cascade` relations with `ProductImage` and `Favorite` in schema.prisma,
      // the database (Postgres) will handle deleting those children automatically IF foreign keys are set up correctly.
      // If Prisma is managing the relation, `deleteMany` might NOT cascade automatically in all cases without middleware,
      // but here we are relying on the database or explicit cleanup if needed.
      // Given the schema, cascade should work at DB level.
      await tx.product.deleteMany({
        where: { storeId: id },
      });

      // 4. Get store to delete logo + banner
      const store = await tx.store.findUnique({ where: { id } });
      const logoKey = this.toStorageKey(store?.logoImage);
      if (logoKey) {
        await this.deleteFileFromStorage(logoKey);
      }
      const bannerKey = this.toStorageKey(store?.bannerImage);
      if (bannerKey) {
        await this.deleteFileFromStorage(bannerKey);
      }

      // 5. Soft delete the store
      return tx.store.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });
  }

  async update(id: string, data: Partial<CreateStoreDto>): Promise<Store> {
    const existingStore = await prisma.store.findUnique({ where: { id } });
    if (!existingStore) throw new Error("Store not found");

    if (data.name) {
      const duplicateName = await prisma.store.findFirst({
        where: {
          name: { equals: data.name, mode: "insensitive" },
          id: { not: id },
          deletedAt: null,
        },
      });

      if (duplicateName) {
        throw new ConflictException(
          `A store with name "${data.name}" already exists.`,
        );
      }
    }

    // Slug explícito: precisa ser único (409 p/ o admin tratar, igual campanha).
    if (data.slug) {
      const available = await this.isSlugAvailable(data.slug, id);
      if (!available) {
        throw new ConflictException(
          `A store with slug "${data.slug}" already exists.`,
        );
      }
    }

    const updateData: any = {
      ...data,
      modifiedAt: new Date(),
    };

    // Normaliza logo/banner para KEY relativa antes de gravar. A leitura
    // (transformStore) devolve URL absoluta; se o cliente reenviar essa URL num
    // save (ex.: admin editando só o telefone), gravamos de volta a key relativa
    // e evitamos tanto a "falsa mudança" quanto a deleção indevida abaixo.
    if (updateData.logoImage !== undefined) {
      const k = this.toStorageKey(updateData.logoImage);
      if (k !== null) updateData.logoImage = k;
    }
    if (updateData.bannerImage !== undefined) {
      const k = this.toStorageKey(updateData.bannerImage);
      if (k !== null) updateData.bannerImage = k;
    }

    // Remove image if it's sent as file (handled separately)
    delete updateData.image;

    const updatedStore = await prisma.store.update({
      where: { id },
      data: updateData,
    });

    // Deleta o arquivo antigo SOMENTE quando a key canônica muda de verdade
    // (troca real de logo/banner) — comparando keys normalizadas, nunca
    // "absoluta vs relativa". Se a loja perdeu a imagem (""), a antiga também
    // é removida. Assim um save que não mexe na imagem NÃO apaga o arquivo.
    const oldLogoKey = this.toStorageKey(existingStore.logoImage);
    if (
      data.logoImage !== undefined &&
      oldLogoKey &&
      oldLogoKey !== this.toStorageKey(updateData.logoImage)
    ) {
      await this.deleteFileFromStorage(oldLogoKey);
    }

    const oldBannerKey = this.toStorageKey(existingStore.bannerImage);
    if (
      data.bannerImage !== undefined &&
      oldBannerKey &&
      oldBannerKey !== this.toStorageKey(updateData.bannerImage)
    ) {
      await this.deleteFileFromStorage(oldBannerKey);
    }

    return this.transformStore(updatedStore);
  }

  async deleteFileFromStorage(key: string) {
    try {
      if (!key) return;
      // Ensure we don't try to delete external http links
      if (key.startsWith("http")) return;

      console.log(`Deleting old store logo: ${key}`);

      const response = await fetch(`${STORAGE_SERVICE_URL}/storage/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        console.error(
          `Failed to delete file ${key} from storage: ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error(`Error deleting file ${key} from storage:`, error);
    }
  }
}
