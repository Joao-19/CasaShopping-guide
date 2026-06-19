-- Newsletter Builder V2 — replace do modelo antigo (texto sobre imagem)
-- pelo split layout + behavior + targeting. Idempotente.

-- settings: novas flags globais
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "newsletterImageSide"      TEXT    NOT NULL DEFAULT 'left';
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "newsletterAccentColor"    TEXT    NOT NULL DEFAULT '#003ba6';
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "newsletterAppearDelay"    INTEGER NOT NULL DEFAULT 5;
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "newsletterAutoClose"      BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "newsletterAutoCloseDelay" INTEGER NOT NULL DEFAULT 15;
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "newsletterTargeting"      JSONB;

-- settings: dropar flags do modelo antigo
ALTER TABLE "settings" DROP COLUMN IF EXISTS "newsletterAutoplay";
ALTER TABLE "settings" DROP COLUMN IF EXISTS "newsletterIntervalMs";

-- newsletter_slides: novos campos do split layout
ALTER TABLE "newsletter_slides" ADD COLUMN IF NOT EXISTS "name"                TEXT;
ALTER TABLE "newsletter_slides" ADD COLUMN IF NOT EXISTS "description"         TEXT;
ALTER TABLE "newsletter_slides" ADD COLUMN IF NOT EXISTS "fineprint"           TEXT;
ALTER TABLE "newsletter_slides" ADD COLUMN IF NOT EXISTS "primaryButtonText"   TEXT;
ALTER TABLE "newsletter_slides" ADD COLUMN IF NOT EXISTS "primaryButtonUrl"    TEXT;
ALTER TABLE "newsletter_slides" ADD COLUMN IF NOT EXISTS "showSecondaryButton" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "newsletter_slides" ADD COLUMN IF NOT EXISTS "secondaryButtonText" TEXT;
ALTER TABLE "newsletter_slides" ADD COLUMN IF NOT EXISTS "secondaryButtonUrl"  TEXT;

-- newsletter_slides: dropar campos do modelo antigo
ALTER TABLE "newsletter_slides" DROP COLUMN IF EXISTS "subtitle";
ALTER TABLE "newsletter_slides" DROP COLUMN IF EXISTS "ctaText";
ALTER TABLE "newsletter_slides" DROP COLUMN IF EXISTS "ctaHref";
ALTER TABLE "newsletter_slides" DROP COLUMN IF EXISTS "textPosition";
ALTER TABLE "newsletter_slides" DROP COLUMN IF EXISTS "textBgEnabled";
ALTER TABLE "newsletter_slides" DROP COLUMN IF EXISTS "textBgColor";
ALTER TABLE "newsletter_slides" DROP COLUMN IF EXISTS "textBgOpacity";
