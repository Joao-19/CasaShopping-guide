# Frente — Newsletter Builder V2 (refazer fiel ao modelo Figma)

> Refação completa da newsletter para seguir **extremamente fiel** a um modelo
> de referência interno no Figma ("Newsletter creation panel" — fora do repo,
> não comitar).
> Substitui a frente anterior — ver `roadmap/05-newsletter-carrossel.md` (modelo
> antigo: texto sobre imagem 21/9). Branch sugerida: `feat/newsletter-builder-v2`.
> Base: `dev`. Data: 2026-06-18.

## Por que é um "refazer" e não um "ajustar"

O modelo é um **paradigma visual diferente** do que está no projeto hoje:

| Aspecto | Atual (V1, roadmap 05) | Modelo V2 (alvo) |
|---|---|---|
| Layout do modal | Imagem cheia 21/9 com **texto sobreposto** (`textPosition` 9 posições, `textBg` cor/opacidade) | **Split**: imagem de um lado, conteúdo do outro (`imageSide` left/right) |
| Conteúdo do slide | título, subtítulo, 1 CTA | nome, título, descrição, fineprint, **botão primário + secundário** |
| Config global | enabled, autoplay, intervalMs | imageSide, **accentColor** |
| Comportamento | — | **appearDelay** (0/3/5/10s), **autoClose** + autoCloseDelay (8/15/30s) |
| Segmentação | — | **targeting**: tipos de página, páginas específicas, campanhas |
| Admin | tab simples (lista) | **builder 2 painéis**: editor c/ abas + live preview (device toggle + "Testar comportamento") |

## Decisões fechadas (com o dono, 2026-06-18)

1. **Admin = builder completo e fiel** — tela dedicada full-screen, editor 380px
   (abas Conteúdo/Exibição, drag-n-drop, accordion) + live preview com toggle
   desktop/mobile e botão "Testar comportamento" (simula delay/autoclose).
2. **Targeting = salvar config, home-only por ora** — replicar o painel fiel e
   persistir a config, mas o web por enquanto só aplica `home` (como hoje).
   Targeting real (perfis de loja/produtos/campanhas, filtro por rota) = fase futura.
3. **Primitivos = portar shadcn no admin** — trazer os primitivos shadcn que o
   modelo usa para dentro de `apps/admin` (escopo local do builder), + lucide +
   motion + embla. Máxima fidelidade.
4. **Schema = replace total** — dropar campos do modelo antigo
   (`subtitle/ctaText/ctaHref/textPosition/textBg*`, `newsletterAutoplay/IntervalMs`)
   e introduzir os novos. Migration idempotente.

### Ajustes técnicos sobre o modelo (fidelidade visual preservada)

- **Drag-n-drop**: modelo usa `react-dnd`; admin **já tem `@dnd-kit/*`**. Replico
  o mesmo comportamento com `@dnd-kit/sortable` — visual idêntico, sem dep nova.
- **Versões radix**: os pins do modelo (radix 1.1.x) são pré-React-19. Instalar
  versões atuais compatíveis com React 19 / Next 16.
- **Tailwind v4**: admin já está em v4 → `@container`, `@2xl:`, `size-*` funcionam
  nativos. Conferir se o `globals.css`/preset do admin habilita container queries.
- **Botão primário = link** (igual ao modelo). **Não** captura e-mail. O signup de
  e-mail é outra feature (`apps/web/components/NewsletterSection.tsx`), não confundir.
- **Stock images / accent swatches**: manter os swatches de cor; as imagens de
  stock (unsplash) do modelo viram opcional — upload real continua via storage
  presigned (MinIO), fluxo já existente (`useImageUpload`).

## Modelo de dados (alvo)

**`NewsletterSlide`** (replace dos campos):
- mantém: `id`, `imageUrl` (key do storage), `order`, timestamps
- **remove**: `subtitle`, `ctaText`, `ctaHref`, `textPosition`, `textBgEnabled`,
  `textBgColor`, `textBgOpacity`
- **adiciona**: `name`, `description`, `fineprint`, `primaryButtonText`,
  `primaryButtonUrl`, `showSecondaryButton` (bool), `secondaryButtonText`,
  `secondaryButtonUrl`
- mantém: `title`

**`Settings`** (singleton) — flags da newsletter:
- mantém: `newsletterEnabled`
- **remove**: `newsletterAutoplay`, `newsletterIntervalMs`
- **adiciona**: `newsletterImageSide` (`"left"|"right"`, default `"left"`),
  `newsletterAccentColor` (hex, default `"#003ba6"`),
  `newsletterAppearDelay` (int seg, default 5),
  `newsletterAutoClose` (bool, default false),
  `newsletterAutoCloseDelay` (int seg, default 15)
- **targeting** (3 arrays de ids): armazenar como `Json` — `newsletterTargeting`
  (`{ pageTypes: string[], specificPages: string[], campaigns: string[] }`).
  *Decisão:* targeting é lista de ids variável → 1 coluna `Json` é pragmático aqui
  (a frente V1 evitou KV+JSON pro conteúdo dos slides, mas isso é config de
  segmentação, não conteúdo relacional). Reavaliar se virar targeting real.

## Contrato de API (evolução do existente)

`GET /newsletter` (público) e `PUT /newsletter` (admin) — **mesma mecânica**
(replace de slides, `extractKey`/`transformToUrl`), shape novo:

```ts
// GET retorna
{
  enabled: boolean;
  imageSide: "left" | "right";
  accentColor: string;
  behavior: { appearDelay: number; autoClose: boolean; autoCloseDelay: number };
  targeting: { pageTypes: string[]; specificPages: string[]; campaigns: string[] };
  slides: Array<{
    id; imageUrl; name; title; description; fineprint;
    primaryButtonText; primaryButtonUrl;
    showSecondaryButton; secondaryButtonText; secondaryButtonUrl;
  }>;
}
```

`UpdateNewsletterDto` segue com `whitelist + forbidNonWhitelisted` → todo campo
(incl. aninhados em slide/behavior/targeting) precisa estar declarado no DTO.

## Iteração 1 (2026-06-19) — feedback do dono

- **Múltiplas imagens por slide:** `NewsletterSlide.imageUrl` (única) → `images
  String[]` (carrossel interno). Migration `20260619120000_newsletter_slide_multi_image`
  (idempotente, backfill da imagem antiga → array, aplicada). DTO/service resolvem
  o array (extractKey/transformToUrl por item). Editor: `SectionImagesField`
  (upload múltiplo + thumbs numeradas + remover). Preview e web: image pane vira
  crossfade auto-rotativo com dots. `prisma generate --no-engine` (driblou o lock
  de DLL dos backends em execução).
- **Bug do drag com card aberto:** `onDragStart` colapsa o card (`setOpenIndex(null)`)
  — card expandido é alto e quebrava o sortable.
- **Decomposição:** `EditorPanel` (572→293 linhas) dividido em `SectionCard.tsx`
  + `SectionImagesField.tsx`.
- Gates revalidados: dtos/gateway build, admin+gateway tsc 0, web tsc (só erro WS
  pré-existente), lints e madge limpos.

## Iteração 2 (2026-06-19) — reordenar imagens dentro do slide

- **Drag-n-drop nas imagens do slide:** `SectionImagesField` ganhou DnD igual ao
  de produto (`produtos/-components/SortableImage` + `CreateProductForm`). Grid de
  thumbs vira `DndContext` + `SortableContext` (`rectSortingStrategy`); cada thumb é
  um `SortableThumb` com `useSortable`. Reorder no `dragEnd` via `arrayMove`. Id do
  sortable = `img.url` (objectURL p/ upload pendente, key do storage p/ salva — único
  dentro do slide, sem precisar adicionar campo `id` ao `SectionImage`).
- A ordem das imagens já é a ordem de exibição do carrossel interno (preview + web),
  então reordenar reflete direto — sem mudança de schema/DTO/service.
- Botão remover usa `onPointerDown` stopPropagation pra não disparar o drag (mesmo
  truque do `SortableImage` de produto). Botão "+" fica fora do `SortableContext`.
- `DndContext` aninhado: o grid roda dentro do `SectionCard`, que já é sortable no
  DnD de slides do `EditorPanel`. Sem conflito — o drag de slide só dispara pelo grip
  (`GripVertical`); o grid captura seus próprios eventos de ponteiro.
- Gates: admin tsc 0, eslint do arquivo limpo.

## Iteração 3 (2026-06-19) — tempo de troca das imagens do slide configurável

- **Antes:** o crossfade do carrossel **interno** (imagens de um mesmo slide) era
  fixo em `3500ms`, hardcoded em `NewsletterModal` (preview admin) e
  `NewsletterCarouselModal` (web). Curto demais.
- **Agora:** `behavior.slideInterval` (segundos) — flui por toda a vertical igual
  aos outros campos de behavior:
  - `Settings.newsletterSlideInterval Int @default(5)` + migration
    `20260619140000_newsletter_slide_interval` (idempotente, `ADD COLUMN IF NOT EXISTS`).
  - DTO: `NewsletterBehavior.slideInterval` + `NewsletterBehaviorDto` (`@IsInt @Min(1) @Max(60)`).
  - `newsletter.service`: read (`?? 5`) + write no `settingsUpdate`.
  - Admin: `NewsletterBehavior.slideInterval` (types) + UI no `BehaviorPanel`
    ("Troca de imagens do slide", presets 3/5/8/12s) + `ImagePane` usa `intervalMs`.
  - Web: shape em `newsletter.http.ts` + `SlideView`→`SlideImages` recebe `intervalMs`.
- `behavior` trafega como objeto inteiro no admin (`page.tsx`), então hidratação/save
  não precisaram de mudança.
- **Gates:** dtos build, admin tsc/lint, web tsc (só erro WS pré-existente)/lint OK.
- **Pendente (precisa do dono):** aplicar migration no DB local + `prisma generate`
  (lock de DLL com backend de pé) e então `api-gateway` tsc. Validação visual do
  novo tempo no preview/web.

## Estado da implementação (2026-06-19)

Fases 0–4 **implementadas e com gates verdes**. Falta validação e2e visual
(revisão lado a lado com o Figma + Playwright admin↔web).

- [x] **Fase 0** — primitivos shadcn portados (valores literais, escopo
  `app/DashBoard/newsletter/_ui/`); deps instaladas no admin.
- [x] **Fase 1** — schema reescrito + migration `20260618130000_newsletter_builder_v2`
  aplicada no DB; `prisma generate` OK.
- [x] **Fase 2** — DTOs novos + `newsletter.service` adaptado; `settings.service`
  ajustado (Json nullable fora do spread). `dtos` + `api-gateway` buildam.
- [x] **Fase 3** — builder de 2 painéis em `DashBoard/newsletter/` (rota dedicada,
  item de menu novo, dnd-kit, device toggle, "Testar comportamento"). V1
  aposentada (tab removida da `personalizacao`, componentes antigos deletados).
- [x] **Fase 4** — modal público web reescrito (split + behavior, home-only).
- **Gates:** admin tsc/lint/madge limpos; web tsc (só erro pré-existente do
  WebSocket) e lint limpos; gateway build OK.
- [ ] **Fase 5** — e2e Playwright (admin salva → web reflete; upload MinIO) +
  revisão visual fiel com o dono.

### Desvios conscientes sobre o modelo (preservando fidelidade visual)
- `react-dnd` → `@dnd-kit/sortable` (já no admin); reorder no `dragEnd`.
- Primitivos shadcn com **valores literais** do `theme.css` (não tokens globais)
  para não ativar classes inertes de `@repo/ui` e repintar telas existentes.
- Grid de imagens stock (unsplash) do modelo **removido** — substituído pelo
  upload real via storage presigned (prototype stock não vai pra produção).
- Header do builder ganhou **switch "Exibir na home"** e botão **Salvar** (o
  modelo é protótipo Figma sem persistência).
- Autoplay/intervalo do modal antigo **removidos** — o modelo avança por
  interação (arrastar/setas); behavior agora é appearDelay + autoClose.

## Fases

### Fase 0 — Setup de deps e primitivos (admin)
- [ ] Add deps no `apps/admin`: `lucide-react`, `motion`, `embla-carousel-react`,
      `class-variance-authority`, `clsx`, `tailwind-merge`, e radix:
      `@radix-ui/react-tabs`, `react-switch`, `react-separator`,
      `react-checkbox`, `react-label`, `react-slot` (versões React-19).
- [ ] Conferir container queries no Tailwind v4 do admin (preview usa `@container`).
- [ ] Portar `cn` util + primitivos shadcn usados (button, input, textarea, switch,
      label, separator, tabs, checkbox) para `apps/admin/components/ui/` (ou
      `app/DashBoard/newsletter/ui/`). **Escopo local do builder**, não `@repo/ui`.
- **Aceite:** `pnpm --filter admin build` limpo; primitivos renderizam isolados.

### Fase 1 — Schema + migration (replace)
- [ ] `schema.prisma`: reescrever `NewsletterSlide` + flags da newsletter no
      `Settings` conforme "Modelo de dados".
- [ ] Migration idempotente (`ADD COLUMN IF NOT EXISTS`, `DROP COLUMN IF EXISTS`).
      Rodar localmente (`prisma migrate dev`/`deploy`) antes de commitar; conferir
      `migrate status: up to date`.
- [ ] `prisma generate`.
- **Aceite:** migration aplica limpa no db `casashopping`; client tipado novo.
- **Sensível:** `packages/database/**` — avisar impacto e seguir; migration contra
  produção continua exigindo OK.

### Fase 2 — DTOs + backend (gateway)
- [ ] `packages/dtos/.../newsletter.dto.ts`: novas interfaces + `UpdateNewsletterDto`
      (com `NewsletterSlideDto`, `BehaviorDto`, `TargetingDto` aninhados, validação).
- [ ] `newsletter.service.ts`: adaptar `getNewsletter`/`updateNewsletter` ao novo
      shape (manter replace + extractKey/transformToUrl + upsert Settings).
- [ ] Build `dtos` e `api-gateway`.
- **Aceite:** `GET` retorna default novo sem 500; `PUT` persiste e replica slides;
      partial update preserva `enabled`.

### Fase 3 — Admin builder (o coração visual)
Tela dedicada (sugestão: `apps/admin/app/DashBoard/newsletter/page.tsx`,
full-screen 2 painéis). Portar fiel do modelo:
- [ ] `EditorPanel` — 380px, abas Conteúdo/Exibição, accordion de slides,
      drag-n-drop (**@dnd-kit**), SectionImageField (upload real via storage),
      aparência (imageSide + accentColor com swatches/color picker).
- [ ] `BehaviorPanel` — appearDelay (0/3/5/10s), autoClose + autoCloseDelay.
- [ ] `TargetingPanel` — tipos de página (home travado), páginas específicas
      (busca), campanhas. Dados ainda **simulados** (lista local), config persistida.
- [ ] `NewsletterModal` (preview) — split layout embla, dots/arrows, accentColor.
- [ ] `App`-equivalente — header com device toggle (desktop/mobile) + "Testar
      comportamento" (simulação de delay/autoclose com countdown).
- [ ] Hidratar do `GET`, salvar via `PUT` (hook `useNewsletter` adaptado).
- [ ] Remover/aposentar V1: `NewsletterManager`, `SlideEditor`, `newsletter.types`
      antigos (tab em `personalizacao`). Decidir se a entrada vira item de menu novo.
- **Aceite:** builder bate visualmente com o Figma (revisão lado a lado com o dono);
      drag reordena; preview reflete edição em tempo real; simulação roda.
- **Regra:** componentes > 300 linhas → decompor (hooks do admin lembram).

### Fase 4 — Web (modal público fiel)
- [ ] Reescrever `NewsletterCarouselModal.tsx` para o **split layout** do modelo
      (imagem/conteúdo, botões primário/secundário, accentColor, imageSide).
- [ ] Aplicar `behavior`: `appearDelay` (substitui o 250ms fixo), `autoClose` +
      `autoCloseDelay`. Manter 1×/sessão, ESC, reduced-motion, pausa no hover.
- [ ] Targeting: por ora só **home** (modal já montado em `app/Home/page.tsx`).
- [ ] Adaptar `Services/http/newsletter.http.ts` (web) ao novo shape.
- **Aceite:** modal na home idêntico ao preview do builder; botões/links OK;
      comportamento (delay/autoclose) honra a config.

### Fase 5 — Gates + validação e2e
- [ ] Lint 0, type-check admin/web limpo (newsletter), `madge --circular` sem ciclos.
- [ ] e2e (Playwright): admin edita+salva → web reflete; upload real no MinIO.
- [ ] Atualizar este roadmap + marcar a frente V1 (05) como substituída.

## Pendências herdadas (da frente V1, ainda válidas)
- [x] **Segurança (2026-06-19) — ✅ validado e2e:** `PUT /newsletter` e `PUT /settings`
      protegidos com `@UseGuards(JwtAuthGuard, RolesGuard) @Roles("admin")`
      (gateway-local; `AuthGuardModule` importado nos módulos; tsc verde).
      Validado via curl: sem token → 401, com token admin → 200. Detalhes e o
      pré-requisito de runtime em `02-paginas-de-campanha.md` §Segurança.
      **Dev:** o gateway precisou de `JWT_SECRET` no `apps/api-gateway/.env`
      (gitignored; no dev o NestJS só lê o `.env` do app, que não tinha). **Prod
      já coberto:** `docker-compose.yml` injeta `JWT_SECRET=${JWT_SECRET}` no
      gateway (linha 105) do env central; mesmo secret que o `auth` assina.
      Nenhuma mudança de env/CI necessária no deploy.
      `POST /storage/*` **continua aberto** — guard header-only barraria o upload
      quando o `access_token` é cookie HttpOnly (`useImageUpload`); além disso o
      microserviço `apps/storage` tem os guards comentados. Fix coordenado à parte.
- [ ] Alinhar `.env` da raiz (→ `casashopping`) pro runner/frontends.
- [ ] MinIO local na `:9100` (container `rpg-gaming-minio-1`) — ver roadmap 05.

## Gotchas
- `ValidationPipe` (whitelist+forbidNonWhitelisted): todo campo novo precisa estar
  no DTO, inclusive aninhados (behavior/targeting/slide).
- React 19 + radix: usar versões atuais (não os pins 1.1.x do bundle Figma).
- `@dnd-kit` no lugar de `react-dnd` — replicar o `moveSection` por índice.
- Preview usa container queries (`@container`/`@2xl:`) — sem isso o split não
  responde dentro do painel; validar no Tailwind v4 do admin.
- `NewsletterSection.tsx` (web) = signup de e-mail, **outra feature**. Não mexer.
- Modelo original num diretório de referência interno **fora do repo**
  — **não comitar** esse diretório (é só referência).
