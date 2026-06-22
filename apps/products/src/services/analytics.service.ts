import { Injectable } from "@nestjs/common";
import { prisma, Prisma } from "@repo/database";
import {
  FavoriteRankingItem,
  ViewRankingItem,
  CategoryHeatItem,
  OriginBreakdownItem,
} from "@repo/dtos";

// Agregações do painel de dados (Frente 3). Tudo em SQL para não puxar linhas
// cruas pro app — escala melhor que groupBy quando o volume cresce. Os índices
// em product_views (productId, viewedAt, sessionId) sustentam essas queries.
@Injectable()
export class AnalyticsService {
  // Datas inválidas viram undefined (filtro ignorado), não erro.
  private parseDate(value?: string): Date | undefined {
    if (!value) return undefined;
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d;
  }

  private clampLimit(limit?: number, fallback = 20): number {
    if (!limit || isNaN(limit) || limit < 1) return fallback;
    return Math.min(limit, 100);
  }

  // Ranking de produtos mais favoritados no período.
  async favoritesRanking(
    fromStr?: string,
    toStr?: string,
    limit?: number,
  ): Promise<FavoriteRankingItem[]> {
    const from = this.parseDate(fromStr);
    const to = this.parseDate(toStr);
    const take = this.clampLimit(limit);

    return prisma.$queryRaw<FavoriteRankingItem[]>(Prisma.sql`
      SELECT p.id AS "productId", p.name AS name, s.name AS "storeName",
             COUNT(f.id)::int AS favorites
      FROM favorites f
      JOIN products p ON p.id = f."productId"
      LEFT JOIN stores s ON s.id = p."storeId"
      WHERE 1=1
        ${from ? Prisma.sql`AND f."createdAt" >= ${from}` : Prisma.empty}
        ${to ? Prisma.sql`AND f."createdAt" <= ${to}` : Prisma.empty}
      GROUP BY p.id, p.name, s.name
      ORDER BY favorites DESC, p.name ASC
      LIMIT ${take}
    `);
  }

  // Ranking de produtos mais vistos no período (+ sessões únicas).
  async viewsRanking(
    fromStr?: string,
    toStr?: string,
    limit?: number,
  ): Promise<ViewRankingItem[]> {
    const from = this.parseDate(fromStr);
    const to = this.parseDate(toStr);
    const take = this.clampLimit(limit);

    return prisma.$queryRaw<ViewRankingItem[]>(Prisma.sql`
      SELECT p.id AS "productId", p.name AS name, s.name AS "storeName",
             COUNT(v.id)::int AS views,
             COUNT(DISTINCT v."sessionId")::int AS "uniqueSessions"
      FROM product_views v
      JOIN products p ON p.id = v."productId"
      LEFT JOIN stores s ON s.id = p."storeId"
      WHERE 1=1
        ${from ? Prisma.sql`AND v."viewedAt" >= ${from}` : Prisma.empty}
        ${to ? Prisma.sql`AND v."viewedAt" <= ${to}` : Prisma.empty}
      GROUP BY p.id, p.name, s.name
      ORDER BY views DESC, p.name ASC
      LIMIT ${take}
    `);
  }

  // Mapa de calor por categoria: views e favoritos somados por categoria.
  // `categories` é text[] no produto → unnest. COUNT(DISTINCT) evita inflar
  // pelo produto cartesiano views×favoritos. Datas no JOIN (não no WHERE) para
  // não derrubar categorias sem atividade no período.
  async categoryHeatmap(
    fromStr?: string,
    toStr?: string,
  ): Promise<CategoryHeatItem[]> {
    const from = this.parseDate(fromStr);
    const to = this.parseDate(toStr);

    return prisma.$queryRaw<CategoryHeatItem[]>(Prisma.sql`
      SELECT cat AS category,
             COUNT(DISTINCT v.id)::int AS views,
             COUNT(DISTINCT f.id)::int AS favorites
      FROM products p
      CROSS JOIN LATERAL unnest(p.categories) AS cat
      LEFT JOIN product_views v ON v."productId" = p.id
        ${from ? Prisma.sql`AND v."viewedAt" >= ${from}` : Prisma.empty}
        ${to ? Prisma.sql`AND v."viewedAt" <= ${to}` : Prisma.empty}
      LEFT JOIN favorites f ON f."productId" = p.id
        ${from ? Prisma.sql`AND f."createdAt" >= ${from}` : Prisma.empty}
        ${to ? Prisma.sql`AND f."createdAt" <= ${to}` : Prisma.empty}
      GROUP BY cat
      ORDER BY views DESC, favorites DESC, cat ASC
    `);
  }

  // Origem do tráfego: agrupa por utm_source (preferido), senão referrer,
  // senão "direto". Referrers (URL completa) são colapsados ao hostname em JS
  // e os baldes resultantes re-somados (poucas linhas, custo desprezível).
  async originBreakdown(
    fromStr?: string,
    toStr?: string,
  ): Promise<OriginBreakdownItem[]> {
    const from = this.parseDate(fromStr);
    const to = this.parseDate(toStr);

    const rows = await prisma.$queryRaw<OriginBreakdownItem[]>(Prisma.sql`
      SELECT
        CASE
          WHEN v."utmSource" IS NOT NULL AND v."utmSource" <> '' THEN v."utmSource"
          WHEN v.referrer IS NOT NULL AND v.referrer <> '' THEN v.referrer
          ELSE 'direto'
        END AS source,
        COUNT(*)::int AS views
      FROM product_views v
      WHERE 1=1
        ${from ? Prisma.sql`AND v."viewedAt" >= ${from}` : Prisma.empty}
        ${to ? Prisma.sql`AND v."viewedAt" <= ${to}` : Prisma.empty}
      GROUP BY 1
    `);

    const merged = new Map<string, number>();
    for (const row of rows) {
      const key = this.normalizeSource(row.source);
      merged.set(key, (merged.get(key) ?? 0) + row.views);
    }

    return Array.from(merged.entries())
      .map(([source, views]) => ({ source, views }))
      .sort((a, b) => b.views - a.views);
  }

  // Referrer em URL → hostname sem "www." (ex.: https://www.instagram.com/ →
  // instagram.com). utm_source / "direto" passam direto.
  private normalizeSource(source: string): string {
    if (!source.startsWith("http")) return source;
    try {
      return new URL(source).host.replace(/^www\./, "");
    } catch {
      return source;
    }
  }
}
