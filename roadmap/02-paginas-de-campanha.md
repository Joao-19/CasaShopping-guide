# Frente 2 — Páginas de Campanha

**Esforço:** ~4 dias úteis (com IA) · **Risco:** baixo

## Objetivo

Permitir que o admin crie páginas temáticas de campanha (ex.: Copa) com layout
fixo: **menu padrão + banner (desktop/mobile) + título + vitrine de produtos**.
Sem editor de blocos — o layout não muda.

## Fluxo do usuário (admin)

1. Acessa nova seção **"Páginas de Campanha"** no menu lateral.
2. Clica em **+ Criar**.
3. Preenche: **título**, **capa desktop**, **capa mobile**, **seleção de produtos**.
4. Na publicação, o sistema **sugere uma URL** baseada no título.
5. Usuário **confirma ou edita** a URL antes de salvar.
6. Página fica disponível em `/campanha/[slug]` no site público.

## O que reaproveita (já existe)

| Recurso | Onde |
|---------|------|
| Upload banner desktop + mobile | `apps/admin/.../personalizacao/page.tsx` (`BannerUpload`) |
| Compressão + presigned URL + MinIO | `apps/admin/composable/storage/useImageUpload.ts` |
| Padrão lista + modal CRUD | `apps/admin/.../produtos/page.tsx` |
| Grid/vitrine de produtos público | `apps/web/.../produtos/page.tsx`, `ProductShowcase.tsx` |
| Menu lateral | `apps/admin/.../DashBoard/components/Sidebar.tsx` |

## O que é novo (onde está o custo)

1. **Seletor de produtos com busca paginada + ordenação** — o multi-select atual
   é array fixo; este busca na API. Item mais trabalhoso.
2. **Slug**: sugestão a partir do título + edição + **validação de unicidade** no
   backend (feedback "essa URL já existe").
3. **Rota dinâmica pública** `/campanha/[slug]` — primeira do site (hoje tudo é
   estático). Inclui 404, meta/SEO e cache.
4. **Schema** `CampaignPage` + `CampaignProduct` + migration + endpoints CRUD.

## Plano de execução

### Dia 1 — Backend ✅ (2026-06-19)
- [x] Schema Prisma: `CampaignPage` (title, slug único, coverDesktop, coverMobile, isActive) + `CampaignProduct` (ordem)
- [x] Migration `20260619140000_add_campaign_pages` (idempotente: `CREATE TABLE IF NOT EXISTS`, `CREATE UNIQUE INDEX IF NOT EXISTS`, FKs em DO-block por `pg_constraint`). Aplicada no DB `casashopping` (migrate status up to date).
- [x] Endpoints (gateway-local Prisma, espelhando `newsletter`): `GET /campaigns` (lista paginada + busca), `GET /campaigns/:id`, `GET /campaigns/slug/:slug` (público, ativa-only→404), `POST /campaigns`, `PUT /campaigns/:id`, `DELETE /campaigns/:id`
- [x] `GET /campaigns/slug-available?slug=&excludeId=` (unicidade de slug; `POST`/`PUT` retornam 409 em conflito)
- [x] DTOs em `@repo/dtos` (`Create`/`Update` + views `CampaignPageListItem`/`CampaignPageDetail`/`CampaignProductView` + `SlugAvailability`)

> **Decisões:** (1) gateway-local Prisma (não microserviço novo) — campanha é conteúdo tipo-CMS como newsletter/settings; produtos resolvidos via `include` no mesmo DB compartilhado. (2) `CampaignProduct` relacional com `order`; a API aceita `productIds[]` ordenado (write=replace, `order`=índice). (3) Sem link no menu público (acesso por URL direta).
> **Gates Dia 1:** dtos build, api-gateway build, `madge` web sem ciclos — verdes.
> **Pendente (herdado):** proteger escritas admin com guard `@Roles("admin")` (consistente com newsletter/settings, hoje abertas).

### Dia 2 — Admin (CRUD + banners) ✅ (2026-06-19)
- [x] Item "Campanhas" na Sidebar (`/DashBoard/campanhas`)
- [x] Lista (`campanhas/page.tsx`): tabela + paginação + busca, reusando o padrão de produtos (`useCampaign` espelha `useProduct`; `campaign.http` espelha `product.http`)
- [x] Form criar/editar (`-components/CreateCampaignForm.tsx`): título + slug + `BannerUpload` desktop (32:9) + mobile (1:1) + toggle "Exibir no site"; upload via `useImageUpload` (folder `campaigns`)
- [x] Slug sugerido do título (`slugify`, kebab sem acento) + editável; checagem de disponibilidade com debounce (`GET /campaigns/slug-available`) e tratamento de 409 no submit
- [x] **Reuso:** `BannerUpload` extraído de `personalizacao/page.tsx` → `DashBoard/components/BannerUpload.tsx` (exportado no barrel); personalização religada ao componente compartilhado

> **Gates Dia 2:** admin tsc 0 erros, eslint 0 erros (só warnings `any`/`<img>` já existentes), `madge` admin sem ciclos.
> **Validação e2e (Playwright, UI real, 2026-06-19):** login admin → Campanhas → criar "Especial Copa 2026" (slug auto + "URL disponível" via backend) → persiste e aparece na lista; editar título → PUT persiste, slug intacto; criar com slug repetido → "Essa URL já existe" + botão Criar travado. 0 erros de console.
> **Fix:** `CreateCampaignForm` usava `useFormField` (exige `FormProvider`) → runtime error ao abrir o modal. Trocado por validação inline (required + touched), sem dependência de contexto.
> **Pendente p/ Dia 3:** seletor de produtos (busca na API + ordenação). O form já preserva `productIds` no edit; a UI de seleção entra no Dia 3.

### Dia 3 — Seletor de produtos + publicação ✅ (2026-06-19)
- [x] Seletor de produtos (`-components/ProductSelector.tsx`): busca na API (`productHttp.list`, debounce 300ms, dropdown), seleção múltipla (exclui já selecionados), integrado ao `CreateCampaignForm`
- [x] Ordenação por drag-n-drop (`@dnd-kit`, `verticalListSortingStrategy`); ordem = posição na vitrine, enviada como `productIds[]` (replace)
- [x] Fluxo de publicação: toggle "Exibir no site" (`isActive`) + slug confirma/edita com unicidade (já no Dia 2; 409 tratado)

> **Validação e2e (Playwright, UI real, 2026-06-19):** abrir campanha → buscar "a" (lista produtos reais da API) → adicionar 2 (Cadeira Background 1, Cama Box Queen) → Salvar → coluna Produtos vira **2**; reabrir → produtos hidratam na ordem #1/#2 (`getById` ordena por `order`). 0 erros de console.

### Dia 4 — Página pública + refino
- [ ] Rota `apps/web/app/campanha/[slug]/page.tsx`
- [ ] Layout: menu + banner responsivo (desktop/mobile) + título + grid
- [ ] 404 para slug inexistente/inativo + meta/SEO básico
- [ ] Testes manuais, ajustes responsivos, buffer

## Critérios de aceite

- [ ] Admin cria uma página de campanha com capa desktop/mobile e ≥1 produto.
- [ ] Sistema sugere URL a partir do título e permite editar antes de salvar.
- [ ] Slug duplicado é bloqueado com mensagem clara.
- [ ] Página pública renderiza menu + banner correto por dispositivo + título + vitrine.
- [ ] Slug inexistente/inativo retorna 404.

## Fora de escopo (deste sprint)

- Editor de blocos / layout customizável.
- Agendamento de publicação (data início/fim) — pode virar incremento.
- Métricas de visualização da campanha (depende da Frente 2).
