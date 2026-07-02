-- Frente 12 / Item 1 — Consentimento LGPD no cadastro. Idempotente.
-- User ganha privacyAcceptedAt: data/hora do aceite da Política de
-- Privacidade. Null = cadastros antigos (antes do aceite obrigatório).

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "privacyAcceptedAt" TIMESTAMP(3);
