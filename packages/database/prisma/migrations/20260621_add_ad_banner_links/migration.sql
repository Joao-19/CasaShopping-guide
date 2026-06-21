-- Frente 07 — link clicável nos banners de Publicidade (personalização).
-- Settings ganha URL de destino por formato (desktop/mobile). Idempotente.

ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "advertisementBannerLinkDesktop" TEXT;
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "advertisementBannerLinkMobile" TEXT;
