-- Newsletter: slide passa a suportar várias imagens (carrossel interno).
-- Idempotente. Migra a imagem única existente para o array antes de dropar.

ALTER TABLE "newsletter_slides"
  ADD COLUMN IF NOT EXISTS "images" TEXT[] NOT NULL DEFAULT '{}';

-- Backfill: imageUrl atual vira o primeiro item do array (se houver coluna+valor).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'newsletter_slides' AND column_name = 'imageUrl'
  ) THEN
    UPDATE "newsletter_slides"
      SET "images" = ARRAY["imageUrl"]
      WHERE "imageUrl" IS NOT NULL
        AND ("images" IS NULL OR cardinality("images") = 0);
  END IF;
END $$;

ALTER TABLE "newsletter_slides" DROP COLUMN IF EXISTS "imageUrl";
