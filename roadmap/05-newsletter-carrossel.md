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

### Pendente
- [] **Aplicar a migration no banco** (requer OK; DB local `casashopping` ainda
      não existe nesse Postgres — ver §"Como aplicar a migration")
- [ ] **Segurança:** proteger as escritas de admin (`PUT /newsletter`,
      `PUT /settings`, `POST /storage/*`) com `JwtAuthGuard + RolesGuard`
      `@Roles("admin")` — hoje as 3 estão abertas (consistente entre si)
- [ ] Smoke test e2e com serviços de pé (admin salva → web abre modal)
- [ ] Validar upload real no MinIO (folder `newsletter/`) e resolução de URL
- [ ] (Opcional) Persistir "já visto" além da sessão / re-exibir ao trocar slides
- [ ] (Opcional) Imagem mobile dedicada por slide (hoje 1 imagem, aspect 21/9)
- [ ] (Opcional) Decompor `personalizacao/page.tsx` (430 linhas; `BannerUpload` inline)

## Como aplicar a migration

DB local em `localhost:5432`, banco `casashopping` (ainda não criado nesse
servidor). Aplica todas as migrations pendentes (cria o banco do zero):

```bash
cd packages/database
npx prisma migrate deploy      # cria banco + aplica migrations
npx prisma migrate status      # conferir que ficou em dia
```

Em produção, a migration roda pelo runner `apps/migration` / pipeline de deploy.

## Gotchas / notas
- `NewsletterSection.tsx` (em `apps/web/components`) é **outra feature** (signup
  de e-mail) e nem está montada na home. Não confundir com este carrossel.
- O `ValidationPipe` do api-gateway usa `whitelist + forbidNonWhitelisted`: todo
  campo enviado no `PUT` precisa estar declarado no DTO (inclusive nos slides) —
  por isso o `NewsletterSlideDto` lista todos os campos.
- Erros de type-check pré-existentes (alheios a esta frente):
  `apps/admin/.../CreateStoreForm.tsx` e `apps/web/.../useBaseWebSocket.ts`.
