-- Newsletter: intervalo configurável do carrossel interno do slide
-- (tempo entre as imagens de um mesmo slide). Antes era fixo (3500ms).
-- Idempotente.

ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "newsletterSlideInterval" INTEGER NOT NULL DEFAULT 5;
