# AI_CONTEXT - Indice Operacional para IA

Este diretorio define o workflow padrao para execucao com IA no
`casashopping-guide`.

## Objetivo
- Reduzir ambiguidade para agentes.
- Garantir entrega robusta, escalavel e segura.
- Padronizar como requisitos viram testes e depois codigo.

## Precedencia de fontes (obrigatorio)
1. `docs/` (produto e regras de negocio) — quando existir
2. `roadmap/` (estado atual, fases, decisoes e gotchas entre sessoes)
3. `AI_CONTEXT/regras/`
4. `AI_CONTEXT/regras-tecnicas/`
5. `AI_CONTEXT/boas-praticas/`
6. `AI_CONTEXT/skills/`

## Bootstrap obrigatorio por task
1. Ler `roadmap/README.md` (ou `roadmap/index.md`) para o estado atual.
2. Se existir `docs/`, ler o documento funcional relacionado ao escopo.
3. Ler `AI_CONTEXT/regras/README.md`.
4. Ler `AI_CONTEXT/regras-tecnicas/README.md`.
5. Ler `AI_CONTEXT/boas-praticas/README.md`.
6. Aplicar skill local de `AI_CONTEXT/skills/` quando houver aderencia.

## Mapa da stack (para localizar o escopo)
- **api-gateway** (`apps/api-gateway`) — Express; roteia/agrega os
  microservicos. Ponto de entrada da API.
- **auth** (`apps/auth`) — Express; autenticacao, tokens, sessao.
- **products** (`apps/products`) — Express; catalogo de produtos.
- **stores** (`apps/stores`) — Express; lojas.
- **users** (`apps/users`) — Express; usuarios.
- **storage** (`apps/storage`) — Express; upload/serving de arquivos.
- **migration** (`apps/migration`) — runner de migrations.
- **web** (`apps/web`) — Next 16 (App Router); site publico.
- **admin** (`apps/admin`) — Next 16 (App Router); painel administrativo.
- **@repo/database** (`packages/database`) — Prisma + PostgreSQL
  (`prisma/schema.prisma`, `prisma/migrations/**`, `scripts/`).
- **@repo/ui** (`packages/ui`) — componentes reutilizaveis.
- **dtos / auth-guard / api-client** (`packages/*`) — contratos e
  helpers compartilhados entre apps.

## Componentes e design (tarefas visuais)
- **Fonte da verdade de componentes reutilizaveis:** `packages/ui/src/`.
  Antes de criar componente visual novo em `apps/web` ou `apps/admin`,
  buscar equivalente em `packages/ui/src/` por nome.
- Se houver `docs/` com tokens/guia visual, ele tem precedencia sobre
  valores proprios — nao inventar cores/raios/padroes fora do catalogo.
- Componentes genericos (textos, inputs, badges, avatares, switches)
  pertencem a `packages/ui`, nao duplicados dentro de cada app.

## Leitura minima por tipo de task
- Mudanca visual / novo componente de UI:
  - `packages/ui/src/` (equivalente existente)
  - `docs/` visual, se existir
- Mudanca de regra de negocio:
  - documento de `docs/` correspondente, se existir
  - `AI_CONTEXT/regras/README.md`
- Mudanca em backend (microservico Express):
  - codigo do servico afetado em `apps/<servico>/`
  - contrato em `packages/dtos/` e guarda em `packages/auth-guard/`
  - `packages/database/prisma/schema.prisma` se tocar dados
- Mudanca de schema/dados:
  - `packages/database/prisma/schema.prisma`
  - `packages/database/prisma/migrations/`
- Mudanca em frontend (web/admin):
  - componente/route afetado em `apps/web/` ou `apps/admin/`
  - `packages/api-client/` para chamadas
  - `packages/ui/` para primitivos

## Workflow padrao de execucao (IA)
1. Definir contrato da entrega:
   - criterio de aceite observavel;
   - risco principal;
   - evidencias esperadas.
2. Converter criterio em testes primeiro.
3. Executar Red -> Green -> Refactor em incrementos pequenos.
4. Rodar gates de qualidade (lint, typecheck, testes).
5. Validar seguranca basica (authz, validacao de input, erro seguro).
6. Atualizar documentacao contextual (`docs/` e/ou `roadmap/`) quando
   houver mudanca de comportamento.

## Politica de origem de skills (obrigatoria)
- Primeiro, buscar skills dentro deste projeto em `AI_CONTEXT/skills`.
- Se nao existir skill aplicavel no projeto, e permitido buscar em
  `C:\Users\jjjoa\Documents\Projects\AI_CONTEXTS`.
- Qualquer outro local fora desses dois esta estritamente proibido.
