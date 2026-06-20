-- Frente 07 / B2 — Página por lojista. Idempotente.
-- Store ganha slug (rota pública /loja/[slug]) + bannerImage (banner próprio).

ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "bannerImage" TEXT;

-- Backfill: gera slug das lojas existentes a partir do nome (kebab, minúsculo,
-- não-alfanumérico -> '-', sem '-' nas pontas). Nomes de loja já são únicos
-- (regra de negócio), então o slug derivado também tende a ser. Acentos viram
-- '-' (cosmético; o admin pode editar). Sufixo curto do id evita colisão rara.
UPDATE "stores"
SET "slug" =
    trim(both '-' from
        regexp_replace(lower("name"), '[^a-z0-9]+', '-', 'g')
    ) || '-' || substring("id" from 1 for 4)
WHERE "slug" IS NULL;

-- slug único (índice permite múltiplos NULL no Postgres, mas backfill já cobriu)
CREATE UNIQUE INDEX IF NOT EXISTS "stores_slug_key" ON "stores"("slug");
