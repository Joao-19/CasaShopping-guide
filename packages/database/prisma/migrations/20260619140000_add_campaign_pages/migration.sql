-- Frente 02 — Páginas de Campanha. Idempotente.
-- CampaignPage (página temática) + CampaignProduct (junção com ordem).

-- CreateTable: campaign_pages
CREATE TABLE IF NOT EXISTS "campaign_pages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "coverDesktop" TEXT,
    "coverMobile" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_pages_pkey" PRIMARY KEY ("id")
);

-- slug único (rota pública)
CREATE UNIQUE INDEX IF NOT EXISTS "campaign_pages_slug_key" ON "campaign_pages"("slug");

-- CreateTable: campaign_products (junção com ordem)
CREATE TABLE IF NOT EXISTS "campaign_products" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_products_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "campaign_products_campaignId_productId_key" ON "campaign_products"("campaignId", "productId");

-- FKs idempotentes (Postgres não tem ADD CONSTRAINT IF NOT EXISTS p/ FK)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'campaign_products_campaignId_fkey') THEN
        ALTER TABLE "campaign_products"
            ADD CONSTRAINT "campaign_products_campaignId_fkey"
            FOREIGN KEY ("campaignId") REFERENCES "campaign_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'campaign_products_productId_fkey') THEN
        ALTER TABLE "campaign_products"
            ADD CONSTRAINT "campaign_products_productId_fkey"
            FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
