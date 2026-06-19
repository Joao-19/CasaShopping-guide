# Frente — Newsletter (Carrossel modal na home)

> Estado e checklist da implementação do carrossel de Newsletter.
> Spec de origem (porte do RPG Worlds): `EXPORT_PERSONALIZACAO_NEWSLETTER.md`.
> Branch: `feat/newsletter-carousel`. Base: `main`. Data: 2026-06-17.

## Resumo

Mini-CMS de um carrossel promocional, editável pelo admin **sem deploy**, que
aparece como **modal auto-open na home** do site público. Adaptado ao padrão do
projeto (tabelas Prisma tipadas + `Settings` singleton + storage presigned),
**não** usa o KV+JSON genérico do doc de origem.

### Decisões de design
- **Dados relacionais** (não KV+JSON): `NewsletterSlide` = 1 linha por slide,
  `order` define a ordem. Config global (liga/desliga, autoplay, intervalo) em
  flags no `Settings` singleton.
- **Consumo público = modal auto-open** (não seção inline). Abre 1× por sessão
  (`sessionStorage`), com delay de ~250ms pra home pintar antes.
- **Escrita = replace**: o admin envia a lista completa de slides; o backend
  apaga e recria (`order` = índice do array). Ids são regenerados (client id é
  só key de React).

## Contrato de API

| Método | Rota | Auth | Papel |
|---|---|---|---|
| GET | `/newsletter` | público | site lê `{ enabled, autoplay, intervalMs, slides[] }` |
| PUT | `/newsletter` | admin (ver pendência §segurança) | grava config + substitui slides |

Imagens: o slide guarda a **key** do storage; `GET` resolve pra URL pública
(`transformToUrl`), `PUT` extrai a key de volta (`extractKey`).

## Arquivos

**Backend / dados / contrato**
- `packages/database/prisma/schema.prisma` — model `NewsletterSlide` + flags no `Settings`
- `packages/database/prisma/migrations/20260617120000_add_newsletter_carousel/migration.sql` — idempotente
- `packages/dtos/src/Newsletter/newsletter.dto.ts` — interfaces + `UpdateNewsletterDto` (validação aninhada)
- `apps/api-gateway/src/services/newsletter.service.ts`
- `apps/api-gateway/src/controllers/newsletter.controller.ts`
- `apps/api-gateway/src/modules/newsletter.module.ts` (registrado em `App.module.ts`)

**Admin** (`apps/admin`)
- `Services/http/newsletter.http.ts`
- `composable/newsletter/useNewsletter.ts`
- `app/DashBoard/personalizacao/components/NewsletterManager.tsx`
- `app/DashBoard/personalizacao/components/SlideEditor.tsx`
- `app/DashBoard/personalizacao/components/newsletter.types.ts`
- `app/DashBoard/personalizacao/page.tsx` — aba "Newsletter"

**Web** (`apps/web`)
- `Services/http/newsletter.http.ts`
- `components/NewsletterCarouselModal.tsx`
- `app/Home/page.tsx` — monta o modal

## Checklist

### Feito
- [x] Schema: `NewsletterSlide` + flags `newsletterEnabled/Autoplay/IntervalMs`
- [x] Migration idempotente (`CREATE TABLE`/`ADD COLUMN IF NOT EXISTS`)
- [x] `prisma generate` (client atualizado)
- [x] DTOs compartilhados + export no `@repo/dtos`
- [x] Backend: service + controller + module + registro no `App.module.ts`
- [x] Admin: hook + http + `NewsletterManager` + `SlideEditor` + aba
- [x] Web: `NewsletterCarouselModal` (Embla, autoplay, reduced-motion, ESC, 1×/sessão) + montagem na home
- [x] Gates: build `dtos`/`api-gateway`; type-check admin/web limpo (newsletter); lint 0 erros; `madge --circular` sem ciclos
- [x] Fix colateral: chaves duplicadas no `handleSave` da personalização
- [x] **Migration aplicada** no database `casashopping` (2026-06-18) — `migrate status: up to date`
- [x] Fix env: `apps/api-gateway/.env` ganhou `DATABASE_URL` próprio (→ casashopping);
      sem ele, `/settings` e `/newsletter` (tratados no gateway) davam 500 herdando o `.env` da raiz

### Testes (e2e) — rodados em 2026-06-18 (Playwright + curl)
> API e modal validados. Upload real bloqueado por infra (MinIO fora do ar).

- [x] **Reiniciar o api-gateway** pra aplicar o novo `DATABASE_URL` (feito pelo dev)
- [x] `GET /newsletter` retorna o default (`enabled:false`, `slides:[]`) sem 500 — HTTP 200
- [x] `PUT /newsletter` cria slide(s) + `enabled:true` e persiste (replace) — testado replace 2→1 slide
- [x] `GET /newsletter` pós-PUT: ordem por índice OK; `extractKey` (bare key e URL absoluta) + `transformToUrl` resolvem pra URL pública; partial update preserva `enabled`
- [x] Admin: login OK (senha = `ADMIN_PASSWORD` de `apps/auth/.env` = `admin123`, **não** a `Mudar@123` do `seed.ts`); aba "Newsletter" hidrata do `GET`; `POST /storage/upload-url` retorna presign (201)
- [x] Admin upload real no MinIO — **OK após apontar pro MinIO :9100** (ver §MinIO abaixo): `upload-url` 201 → `PUT` no MinIO `:9100` **200** → `PUT /newsletter` 200 → persiste. `GET` retorna `imageUrl` em `:9100`; objeto público legível (200, `image/webp`).
- [x] Web: modal auto-open na home com `enabled:true` — auto-open (~250ms), prev/next + dots (só com >1 slide), autoplay avançando, CTA→href, **ESC fecha**, **1×/sessão** (reload não reabre). **Imagem real renderiza** (screenshot conferido).

### MinIO local — porta :9100 (resolvido em 2026-06-18)
A porta 9000 está ocupada por outra app desta máquina. O MinIO de fato é o
container compartilhado **`rpg-gaming-minio-1`** (`minio/minio:latest`), exposto
no host em **`9100:9000`** (API) e `9101:9001` (console), creds root
`admin/password123`. Repontados pra ele:
- `apps/storage/.env`: `MINIO_PUBLIC_ENDPOINT` e `MINIO_INTERNAL_ENDPOINT` → `http://localhost:9100`
- `apps/api-gateway/.env`: add `STORAGE_URL=http://localhost:9100/casashopping`
  (resolve key→URL pública no `GET /newsletter` e `/settings`)

No boot, o `ensureBucket` do storage criou o bucket `casashopping` no `:9100`,
aplicou **CORS** (preflight do PUT volta 204 com `Access-Control-Allow-Origin`)
e a **policy public-read**. Após editar os `.env`, reiniciar storage (`:3007`) e
gateway (`:3000`).

> Frontends leem a `imageUrl` que o gateway já devolve (`:9100`), então não
> precisaram de mudança. Se algum render usar `NEXT_PUBLIC_STORAGE_URL`
> direto, alinhar pra `:9100` também.

### Achados do e2e (infra, fora do escopo da newsletter)
- **Porta 9000 tomada**: o MinIO real está na `:9100` (acima). Em outro ambiente
  (docker-compose próprio), o MinIO sobe na 9000 — conferir a porta efetiva.
- **Bug no `apps/storage` `ensureBucket` (latente)**: `configureCorsManual(internalEndpoint)` (storage.service.ts:125) usa o endpoint interno mesmo quando o HeadBucket caiu no fallback público — se o interno for inalcançável, o CORS do bucket nunca é aplicado (catch+warn). Localmente o `.env` usa `localhost:9000` nos dois, então não dispara; mas em docker (`storage:9000`) rodando o app fora do compose, dispararia.
- **Modal de erro global na home** (`z-[9999]`, "Ops! Algo deu errado / Internal server error") aparecia por um **500 do `/stores`** e **fica por cima** do modal da newsletter (`z-[100]`), interceptando cliques. **Resolvido (2026-06-18):** `apps/stores/.env` tinha `DATABASE_URL` **comentado** → o stores caía no DB errado (raiz/weplanner, sem a tabela `stores`) e o Prisma dava `KnownRequestError`. Descomentei a linha (→ casashopping) e reiniciei; `GET /stores` volta 200. Auditoria dos backends: só o `stores` estava comentado (`auth` não tem `DATABASE_URL` mas herda o do `@repo/database` → casashopping; demais ok).

### Pendente — outros
- [ ] **Segurança:** proteger as escritas de admin (`PUT /newsletter`,
      `PUT /settings`, `POST /storage/*`) com `JwtAuthGuard + RolesGuard`
      `@Roles("admin")` — hoje as 3 estão abertas (consistente entre si)
- [ ] **Alinhar `.env` da raiz** (`postgres@.../postgres` → `.../casashopping?schema=public`)
      pra o runner `apps/migration`/frontends não apontarem pro DB do weplanner
- [ ] (Opcional) Persistir "já visto" além da sessão / re-exibir ao trocar slides
- [ ] (Opcional) Imagem mobile dedicada por slide (hoje 1 imagem, aspect 21/9)
- [ ] (Opcional) Decompor `personalizacao/page.tsx` (430 linhas; `BannerUpload` inline)

## Banco (resolvido em 2026-06-18)

Postgres em `localhost:5432` é **compartilhado** entre projetos, cada um no seu
**database dedicado** (`rpg_gaming`, `weplanner_test`). Faltava o database
`casashopping` — que **todos os `apps/*/.env` dos backends já esperam**
(`.../casashopping?schema=public`). Por isso o Products falhava no init do
Prisma (`PrismaClientInitializationError`): o database não existia.

Correção (convenção do servidor = 1 database por projeto):
```bash
docker exec postgres psql -U postgres -c "CREATE DATABASE casashopping OWNER admin;"
cd packages/database && npx prisma migrate deploy   # -> up to date
```
- `DATABASE_URL` dos backends e do `packages/database/.env`:
  `postgresql://admin:admin123@localhost:5432/casashopping?schema=public`.
- Tabelas (incl. `newsletter_slides`) e colunas `newsletter*` no `settings`
  confirmadas no database.
- **Tentativa anterior descartada:** cheguei a criar um *schema* `casashopping`
  dentro do database `postgres` — abordagem errada (os `.env` dos apps querem um
  *database*, não schema). Esse schema foi removido (`DROP SCHEMA ... CASCADE`),
  sem afetar o weplanner (que mora no `public` do `postgres`).
- **Atenção:** o `.env` da **raiz** está como
  `postgresql://postgres@127.0.0.1:5432/postgres` (sem `casashopping`) — aponta
  pro DB do weplanner. Os backends não usam ele (têm `.env` próprio), mas o
  runner `apps/migration`/frontends podem. Recomendado alinhar pra
  `.../casashopping?schema=public`.

Reverter tudo (se precisar): `DROP DATABASE casashopping;`.

Em produção, a migration roda pelo runner `apps/migration` / pipeline de deploy.

## Gotchas / notas
- `NewsletterSection.tsx` (em `apps/web/components`) é **outra feature** (signup
  de e-mail) e nem está montada na home. Não confundir com este carrossel.
- O `ValidationPipe` do api-gateway usa `whitelist + forbidNonWhitelisted`: todo
  campo enviado no `PUT` precisa estar declarado no DTO (inclusive nos slides) —
  por isso o `NewsletterSlideDto` lista todos os campos.
- Erros de type-check pré-existentes (alheios a esta frente):
  `apps/admin/.../CreateStoreForm.tsx` e `apps/web/.../useBaseWebSocket.ts`.
