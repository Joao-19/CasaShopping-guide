-- AlterTable: configuração global do carrossel de newsletter (singleton settings)
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "newsletterEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "newsletterAutoplay" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "newsletterIntervalMs" INTEGER NOT NULL DEFAULT 6000;

-- CreateTable: slides do carrossel de newsletter
CREATE TABLE IF NOT EXISTS "newsletter_slides" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT,
    "title" TEXT,
    "subtitle" TEXT,
    "ctaText" TEXT,
    "ctaHref" TEXT,
    "textPosition" TEXT NOT NULL DEFAULT 'bottom-left',
    "textBgEnabled" BOOLEAN NOT NULL DEFAULT true,
    "textBgColor" TEXT NOT NULL DEFAULT '#000000',
    "textBgOpacity" INTEGER NOT NULL DEFAULT 50,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_slides_pkey" PRIMARY KEY ("id")
);
