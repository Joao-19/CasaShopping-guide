-- Frente 11 / Item 4 — Preço em texto livre (de/por). Idempotente.
-- Product ganha priceText (texto livre exibido igual ao digitado).
-- price (PriceTier) vira legado/opcional — mantido para dados antigos.

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "priceText" TEXT;

-- price deixa de ser obrigatório (novos produtos usam priceText).
ALTER TABLE "products" ALTER COLUMN "price" DROP NOT NULL;
