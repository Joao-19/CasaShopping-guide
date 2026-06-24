-- Janela de exibição da campanha (agendamento). Colunas nullable, sem backfill:
-- campanhas existentes ficam sem prazo (comportamento atual preservado). Idempotente.

ALTER TABLE "campaign_pages" ADD COLUMN IF NOT EXISTS "startsAt" TIMESTAMP(3);
ALTER TABLE "campaign_pages" ADD COLUMN IF NOT EXISTS "endsAt" TIMESTAMP(3);
