-- Incidente imagens / achado #2b — trava atômica contra duplicata em corrida.
--
-- Até aqui a unicidade era só no app (findFirst -> create, NÃO-atômico): duas
-- criações concorrentes (ex.: várias pessoas na mesma conta de admin) passavam
-- as duas na checagem e geravam duplicata. Estes índices são o backstop no
-- banco, garantindo a regra mesmo sob corrida.
--
-- LOWER(name): casa com a checagem do app (mode: "insensitive"), então
--   "Loja X" e "loja x" também colidem.
-- Loja: índice PARCIAL (deletedAt IS NULL) — não conflita com lojas
--   soft-deleted de mesmo nome (o app recria nome livre após soft-delete).
-- Produto: não tem soft-delete, então sem WHERE; escopo por (storeId, nome).
--
-- Idempotente (IF NOT EXISTS). Pré-verificado em 2026-07-03 via manifest do
-- backup: 0 duplicatas (108 lojas, 81 produtos) — seguro criar sem limpeza.
--
-- Índices funcionais/parciais NÃO são expressáveis em schema.prisma; ficam
-- aqui em SQL cru (padrão recomendado do Prisma p/ case-insensitive/partial).
-- Não afetam o client gerado (sem prisma generate).

-- Produto: único por (loja, nome), ignorando caixa.
CREATE UNIQUE INDEX IF NOT EXISTS "products_storeId_lower_name_key"
  ON "products" ("storeId", LOWER("name"));

-- Loja: nome único entre ATIVAS (não-deletadas), ignorando caixa.
CREATE UNIQUE INDEX IF NOT EXISTS "stores_lower_name_active_key"
  ON "stores" (LOWER("name"))
  WHERE "deletedAt" IS NULL;
