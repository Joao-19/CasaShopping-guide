-- Frente 7 — Seções personalizadas em páginas de campanha. Idempotente.
-- sections JSONB: [{ id, title, type: "custom"|"highlights", productIds: [] }] | null
ALTER TABLE "campaign_pages" ADD COLUMN IF NOT EXISTS "sections" JSONB;
