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

### Dia 2 — Admin (CRUD + banners)
- [ ] Item "Páginas de Campanha" na Sidebar
- [ ] Lista (tabela + paginação + busca) reusando padrão de produtos
- [ ] Form de criar/editar: título + `BannerUpload` desktop + `BannerUpload` mobile
- [ ] Geração de slug sugerido a partir do título + campo editável

### Dia 3 — Seletor de produtos + publicação
- [ ] Seletor de produtos com busca na API, paginação e seleção múltipla
- [ ] (Opcional) ordenação dos produtos selecionados
- [ ] Fluxo de publicação: confirma/edita URL → salva → trata conflito de slug

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
