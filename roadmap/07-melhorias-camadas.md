# Frente 7 — Melhorias em Camadas (produto, loja, compartilhar, popups)

> Promove os itens "Outros" da reunião de 2026-06-17 (antes no `04-backlog.md`)
> a frente executável. **Estado verificado contra o código em 2026-06-20** —
> os "o que falta" abaixo refletem o que realmente existe no repo hoje, não o
> resumo preliminar do backlog.
> Data base: 2026-06-20. Branch sugerida: `feat/melhorias-camadas` (base `dev`).

## Decisões travadas (2026-06-20)

- **Ordem de execução:** B1 → B3 → B2 → B4 (quick win primeiro; deep-link de
  produto cedo porque destrava o compartilhar e ajuda SEO do site todo).
- **B1 — limite de descrição:** **500 caracteres**.
- **B3 — deep-link de produto:** **rota dedicada `/produto/[id]`** (não query
  param) — melhor SEO + preview de link no WhatsApp (Open Graph).

## Decisões resolvidas

- **B2 — design do banner:** default implementado (banner imagem/gradiente +
  scrim + overlay logo/nome/contato). Aprovado na validação.
- **B4 — popups:** **atendido pela Newsletter (Frente 6)** — sem CRUD separado
  (decisão do dono, 2026-06-20).

## Status da frente

**Rodada 1 — ✅ CONCLUÍDA (2026-06-20)**

| Passo | Item | Status |
|---|---|---|
| 1 | **B1** Limites do produto | ✅ `c4bc261` — validado e2e |
| 2 | **B3** Compartilhar (deep-link + share) | ✅ `eedf36d` — validado e2e |
| 3 | **B2** Página por lojista | ✅ `bd800e3`+`914f8f3` · ⚠️ **acesso faltava — corrigido 2026-06-21** (ver nota) |
| 4 | **B4** Popups | ✅ atendido pela Newsletter (Frente 6) |

**Rodada 2 — 🟡 EM ANDAMENTO (itens da revisão completa da ata, 2026-06-20)**

| Passo | Item | Status |
|---|---|---|
| 5 | **B6** Responsividade do produto + "ler mais" | ✅ validado e2e |
| 6 | **B7** Preview WhatsApp (Open Graph) + link de compartilhar | ✅ validado e2e |
| 7 | **B11** Campanha: seletor de produtos rico (tabs + filtros) | ✅ `c6721f8` (price/recent: restart do gateway) |
| 8 | **B5** Redesign do bloco da loja no modal | 🔒 aguardando Figma/visual do Felipe |

> Branch `feat/melhorias-camadas` (base `dev`). Pendente: merge/push (exige OK do dono).
> **Pendências fora de escopo** (decisão/estudo nosso+cliente): B8, B9, B10 →
> ver `pendencias.md`.
> Dívida técnica: `CreateStoreForm.tsx` (~505 linhas) e `CreateProductForm.tsx`
> (~539) acima do alvo de 300 — candidatos a decomposição num refactor à parte.

---

## Rodada 2 — itens em aberto

### B6 — Responsividade do card/modal do produto + "ler mais"
**Risco:** baixo · **Status: ✅ CONCLUÍDA** (2026-06-20).
Ata 00:03: descrição e imagem **cortadas**. **Feito** no `ProductDetailsCard`:
descrição ganhou **"Ler mais"/"Ler menos"** (clamp 3 linhas → texto completo;
toggle só aparece se desc > 120 chars); imagem do produto trocada de
`object-cover` (cortava) para **`object-contain` + fundo branco** (mostra a peça
inteira, sem crop). Vídeos seguem `object-cover`.
**Validado e2e (Playwright):** com descrição longa de teste, "Ler mais" expande
e vira "Ler menos"; imagem sem corte; 0 erros console. Gates verdes.

### B7 — Preview no WhatsApp (Open Graph) + link de compartilhar
**Risco:** médio · **Status: ✅ CONCLUÍDA** (2026-06-20).
A B3 entregou o deep-link + `ShareButton`, mas a página era client-side e não
emitia OG. **Feito:** `/produto/[id]/page.tsx` virou **server component** com
`generateMetadata` (busca o produto no servidor → `og:title`/`description`/`image`
+ `twitter:*`); a interatividade saiu pro client `ProdutoDetail.tsx`. Fetch
server-side **resiliente** (tenta `INTERNAL_API_URL` → `NEXT_PUBLIC_API_URL` →
`localhost:3000`) — em prod usa o hostname Docker `api-gateway`, em dev cai pra
localhost (achado: `INTERNAL_API_URL=api-gateway:3000` não resolve em dev local).
`turbo.json`: `INTERNAL_API_URL` declarada no `globalEnv`.
**Validado e2e:** curl do HTML mostra og:title/description/image + twitter card;
página ainda renderiza o card (Playwright); 404 e SEO OK. 0 erros console.
> Obs.: em dev o `og:image` aponta pro MinIO local (`localhost:9000`, não acessível
> pelo WhatsApp); em prod é o endpoint público do MinIO, com preview real.

### B11 — Campanha: seletor de produtos rico (tela com tabs + filtros)
**Risco:** médio · **Status: ✅ CONCLUÍDA** (2026-06-20, commit `c6721f8`) ·
**⚠️ price/recent só end-to-end após restart do gateway.**
Substituído o `ProductSelector` inline (apertado no modal) por `CampaignProductPicker`
— drawer full-screen (z-60) com **tabs Catálogo | Selecionados(N)**, filtros
(busca, loja, categoria, preço, toggle "adicionados recentemente"), grade com
toggle add/remove + "carregar mais" (`useInfiniteQuery`), aba Selecionados com
reorder dnd-kit, footer Concluir. Form: botão "Gerenciar produtos" abre o drawer.
**Backend:** products `findAll` ganhou filtro `price` (PriceTier) + `sort=recent`
(createdAt desc) — products-service + gateway + admin http.
**Validado e2e (Playwright):** drawer/tabs/seleção/contador/reorder/Concluir OK,
visual conferido por screenshot, 0 erros console. Backend price/recent confirmado
por curl direto no products-service (:3006). **Pendente:** o gateway (`nest start`
sem `--watch`) não repassa `price`/`sort` até reiniciar — busca/loja/categoria já
funcionam via gateway. **Dívida:** `CampaignProductPicker.tsx` (~351 linhas) >
alvo 300 — candidato a decompor.

### B5 — Redesign do bloco da loja no modal do produto
**Risco:** baixo · **Status: 🔒 BLOQUEADO — aguardando o Felipe entregar o visual novo (Figma).**
Ata 00:09–00:10: o bloco "ligar/loja" do `StoreDetailsCard` "tá pobre"; há um
**bloco pronto no Figma**. Fica no roadmap ativo (não é decisão, só falta o asset).
Quando o Figma chegar, implementar fiel. Distinto da B2 (página da loja).

---

## B1 — Limites/validação de campos do produto

**Esforço:** ~2-3h · **Risco:** baixo · **Status: ✅ CONCLUÍDA** (2026-06-20, commit `c4bc261`)

> Entregue: limite de 500 chars na descrição em 3 camadas (DTO `@MaxLength`,
> service defensivo, form com contador + cap nativo) + `@ArrayMaxSize(5)` nas
> imagens. Constantes `PRODUCT_DESCRIPTION_MAX_LENGTH`/`PRODUCT_MAX_IMAGES` em
> `@repo/dtos` como fonte única (DTO + form + service + bulk). Validado e2e via
> Playwright (contador 0→491→500, cap trava 600→500). Gates verdes, 0 erros console.

### Estado real (verificado 2026-06-20)
- ✅ **Limite de 5 fotos JÁ ESTÁ PRONTO** em 3 camadas:
  - Front: `apps/admin/.../produtos/-components/CreateProductForm.tsx` — botão
    "Adicionar" some em 5; multi-select faz `slice(0, 5)`.
  - Back: `apps/products/src/services/product.service.ts` (`create` e `update`)
    — `BadRequestException` se `images.length > 5`.
  - Bulk: `apps/admin/.../importar/-lib/buildRows.ts` — `MAX_IMAGES = 5`, trunca.
- ❌ **Limite de descrição não existe** em nenhuma camada: `product.dto.ts` só
  tem `@IsString/@IsNotEmpty`; sem contador no textarea; sem validação no service.

### O que fazer
1. **DTO** (`packages/dtos/src/Products/product.dto.ts`): `@MaxLength(500)` no
   `description` de `CreateProductDto` (~linha 40) e `UpdateProductDto` (~linha 101).
   Sensível (`packages/dtos` = contrato cross-service) — avisar e seguir.
2. **DTO (cosmético):** `@ArrayMaxSize(5)` no array `images` (regra já cumprida
   no service; aqui é type-safety/documentação).
3. **Form admin** (`CreateProductForm.tsx`): contador de caracteres no textarea
   da descrição (`{len}/500`), bloqueio/feedback visual ao passar.
4. **Backend** (`product.service.ts`): validação defensiva de tamanho em
   `create`/`update` (espelha o padrão do limite de imagens já existente).

### Critérios de aceite
- [x] Descrição > 500 chars é rejeitada no backend (400) e barrada no form.
- [x] Form mostra contador `{len}/500` e impede submit acima do limite.
- [x] Limite de 5 fotos continua funcionando (regressão) no form, bulk e API.

---

## B3 — Compartilhar produto (deep-link + share)

**Esforço:** ~1–1,5 dia · **Risco:** baixo (médio pela rota nova) · **Status: ✅ CONCLUÍDA** (2026-06-20, commit `eedf36d`)

> Achado: **não existia `GET /products/:id` no gateway** — criado no products-service
> + gateway (rota pública, declarada por último p/ não sombrear `/products/favorites`).
> Share extraído em `ShareButton.tsx` (nativo + fallback menu). `ProductDetailsCard`
> ganhou prop `onClose`. **Validado e2e (Playwright):** share nativo dispara; fallback
> mostra Copiar link (toast `writeText` ok) + WhatsApp; `/produto/[id]` renderiza o card
> (SEO `document.title`); id inexistente → "Produto não encontrado" (404). Visual OK.

### Critérios de aceite — ✅ validados
- [x] `/produto/[id]` renderiza o produto; id inexistente → 404.
- [x] Botão Compartilhar: share nativo no mobile; fallback Copiar link + WhatsApp no desktop.
- [x] Link compartilhado abre direto a página do produto.

### Estado real (verificado 2026-06-20)
- ✅ Confirmado: produto abre **só em modal** (`showPopup(<ProductDetailsCard/>)`)
  na home, listagem e campanha. **Não existe rota de produto** — sem link, não há
  o que compartilhar (por isso a rota vem primeiro).
- ❌ Botão de compartilhar não existe. `ProductDetailsCard` tem 3 ações:
  Favoritar, WhatsApp, Ligar.
- ⚠️ O WhatsApp atual é **contato com a loja** (`wa.me/55...?text=interessado`),
  **não** compartilhamento de link.
- ✅ Reaproveitável: sistema de popup (`usePopup`/`showPopup` em
  `packages/ui/src/context/PopupContext.tsx`).

### O que fazer
1. **Rota dedicada** `apps/web/app/produto/[id]/page.tsx` (decidido): busca o
   produto por id, renderiza `ProductDetailsCard` em página (não modal). Clonar o
   padrão de `apps/web/app/campanha/[slug]/page.tsx` (Toolbar + conteúdo + Footer,
   404, `document.title`/SEO). Avaliar Open Graph (`og:image`, `og:title`) pro
   preview no WhatsApp.
2. **Botão Compartilhar** no `ProductDetailsCard` (na barra de ações): abre
   `showPopup(<ShareProductPopup/>)`.
3. **`ShareProductPopup`** (novo, `apps/web/components/`): tenta
   `navigator.share({ url: /produto/[id] })` (Web Share API nativa do celular);
   fallback desktop/sem suporte → popup com opções (Copiar link, WhatsApp).
4. **Link compartilhável** = `${origin}/produto/${id}` — distinto do botão de
   contato com a loja (que continua como está).

### Critérios de aceite
- [ ] `/produto/[id]` renderiza o produto (menu + detalhe + footer); id inexistente → 404.
- [ ] Botão Compartilhar no card abre share nativo no mobile.
- [ ] Desktop sem `navigator.share` → popup com Copiar link + WhatsApp.
- [ ] Link compartilhado abre direto a página do produto (preview de link no zap).

### Fora de escopo
- Slug amigável do produto (`/produto/[slug]`) — id resolve; slug pode virar incremento.

---

## B2 — Página pública por lojista

**Esforço:** ~2 dias · **Risco:** médio · **Status: ✅ CONCLUÍDA** (2026-06-20, commits `bd800e3`+`914f8f3`)

> Entregue: `Store.slug`+`bannerImage` (migration idempotente + backfill); backend
> `findBySlug`/`slug-available` (auto-gera slug do nome, 409 se em uso); admin com
> campo slug (sugestão + disponibilidade) + upload de banner; página `/loja/[slug]`
> com banner+overlay (logo/nome/endereço/contato) e produtos por categoria.
> **Design do banner:** default — banner (imagem ou gradiente #003ba6→#162e47) +
> scrim + overlay no canto inferior. **Validado e2e (Playwright):** criar loja
> "Móveis do João Teste" → slug auto `moveis-do-joao-teste` + "URL disponível";
> slug repetido → "Essa URL já existe"; upload de banner → persiste (webp MinIO);
> página pública mostra banner real + nome legível (fix `!text-white` sobre regra
> global de h1) + produtos agrupados em 6 categorias; click → modal. 0 erros console.

### Critérios de aceite — ✅ validados
- [x] `/loja/[slug]` mostra banner + logo/contato + produtos da loja por categoria.
- [x] Slug único; admin sugere do nome e permite editar; duplicado bloqueado.
- [x] Slug inexistente → 404.
- [x] Upload de banner da loja funciona (presigned MinIO).

### ⚠️ Correção 2026-06-21 — a página estava ÓRFÃ (sem ponto de entrada)

A B2 entregou a página `/loja/[slug]`, mas **nada no site linkava pra ela** —
a validação e2e original só abriu a URL direta, nunca testou o *caminho de
descoberta* (como o usuário chega lá a partir da home/listagem). Resultado:
feature isolada, inacessível. Corrigido nesta data ligando os dois fluxos:

1. **Botão "Ver loja"** no `StoreDetailsCard` (modal aberto pela seção "Lojas"
   da home e pela página `/stores`) → `/loja/${slug}`. O `slug` já vinha no
   payload da listagem (`stores.findAll` sem `select`) — só não estava ligado.
2. **Botão "Ver loja"** no bloco da loja dentro do `ProductDetailsCard` (modal
   do produto, em toda a home/listagem/campanha) → `/loja/${slug}`. Exigiu
   adicionar `slug` à projeção `store.select` do products-service (3 queries),
   plumbar `storeSlug` nos 10 mappers que montam o objeto `product` no web, e
   adicionar `slug` em `Domain/Store` + `HighlightItem.store`.

**Validado e2e (Playwright, UI real, 2026-06-21):** home → "Lojas" → clica
"Loja Beta" → modal → "Ver loja" → `/loja/loja-beta-2451` renderiza (banner +
produtos por categoria). `/produtos` → abre produto → bloco da loja → "Ver loja"
→ `/loja/loja-teste-d833` ("Loja Teste — CasaShopping"). 0 erros de JS (só 404s
pré-existentes de assets estáticos). Backend confirmado por curl (`store.slug`
presente em `/stores` e `/products`). Campanha **fora desta rodada** (decisão do dono).

> **Gap correlato ainda aberto (não corrigido — não é regressão):** a página
> `/campanha/[slug]` também é órfã no site público, mas isso foi **decisão
> documentada** (`completos/02` §Dia 1: "sem link no menu público, acesso por
> URL direta"). O entry point natural — o `AdvertisementBanner` apontar pra uma
> campanha — não existe (o banner nem tem campo `link`). Promover a frente
> própria se/quando o cliente quiser campanhas descobríveis.

> **Lição (regra de validação):** "validado e2e" só conta quando o teste começa
> do **fluxo real de descoberta** (home/listagem/menu), não da URL da própria
> página. Toda página/rota nova precisa de pelo menos um ponto de entrada
> navegável testado de ponta a ponta.

### Estado real (verificado 2026-06-20)
- ❌ Rota `/loja/[slug]` não existe (só `/stores` = listagem geral).
- ❌ `Store` não tem `slug` (precisa campo + migration).
- ❌ Banner próprio da loja: `Store` só tem `logoImage`; `CreateStoreForm` só
  sobe logo. Sem campo banner nos DTOs/schema/UI.
- ✅ Reaproveitável e pronto: `GET /products?storeId=` **e** `?category=` já
  existem no gateway; `StoreDetailsCard` (logo+contato+redes); `ProductShowcase`;
  padrão `/campanha/[slug]` pra clonar.
- ⚠️ **Pegadinha:** `Product.categories` é `String[]` (tipo tag), **não** join
  relacional com `Category`. Agrupar "por categoria" é client-side sobre strings.

### O que fazer
1. **Schema** (`packages/database/prisma/schema.prisma`): `Store.slug String?
   @unique` + `Store.bannerImage String?`. Migration idempotente
   (`ADD COLUMN IF NOT EXISTS`, `CREATE UNIQUE INDEX IF NOT EXISTS`), rodar local
   antes de commitar. Backfill de slug a partir do `name` (kebab sem acento).
   Sensível (`packages/database`) — avisar e seguir; migration contra prod = OK explícito.
2. **DTOs** (`packages/dtos/src/Stores/store.dto.ts`): `slug` + `bannerImage` em
   Create/Update/view.
3. **Admin** (`CreateStoreForm.tsx`): upload de banner (reusar `BannerUpload` +
   `useImageUpload`, folder `stores`); slug sugerido do nome + editável.
4. **Rota pública** `apps/web/app/loja/[slug]/page.tsx` (clonar campanha):
   banner + overlay (logo + contato via `StoreDetailsCard`) + produtos da loja
   (`getProducts({ storeId })`) **agrupados por categoria** (client-side sobre
   `categories[]`). 404 para slug inexistente.
5. **Design do banner** — *pendente, definir antes de codar o overlay.*

### Critérios de aceite
- [ ] `/loja/[slug]` mostra banner + logo/contato + produtos da loja por categoria.
- [ ] Slug único; admin sugere do nome e permite editar; duplicado bloqueado.
- [ ] Slug inexistente → 404.
- [ ] Upload de banner da loja funciona (presigned MinIO).

---

## B4 — Cadastro de popups configuráveis

**Esforço:** ~2 dias · **Risco:** médio · **Status: ✅ ATENDIDO pela Newsletter (Frente 6)** (decisão do dono, 2026-06-20)

> **Decisão (2026-06-20):** o dono considera o B4 **coberto pelo modal da newsletter**
> (Frente 6) — que já é um popup do site **configurável**: imagem, título/descrição,
> botões primário/secundário, `accentColor`, `appearDelay`, `autoClose`+`autoCloseDelay`,
> `slideInterval`, exibição 1×/sessão. Não haverá CRUD de múltiplos popups nem janela
> por datas/`repeatEveryHours` por ora. Reabrir como frente própria só se surgir a
> necessidade de popups múltiplos/segmentados além da newsletter.

### Estado real (verificado 2026-06-20)
A **Frente 6 (newsletter v2) já construiu ~80% da mecânica** — é o molde, não o
`EXPORT_PERSONALIZACAO_NEWSLETTER.md` antigo. Já existe, pronto e em uso:
- Modal auto-open na home com `appearDelay`, `autoClose`+`autoCloseDelay`,
  `slideInterval`, `accentColor`, `imageSide`, upload de imagem, 1x/sessão
  (`sessionStorage`) — `apps/web/components/NewsletterCarouselModal.tsx`.
- Builder visual completo no admin (preview, device toggle, "testar
  comportamento") — `apps/admin/app/DashBoard/newsletter/`.
- `targeting` (JSON) no schema; `GET /newsletter` (público) + `PUT` (admin, guard).

**O que falta pra virar "popups genéricos":**
- ❌ **Múltiplos popups** (hoje é singleton newsletter no `Settings`).
- ❌ **Frequência além de 1x/sessão**: `startsAt`/`endsAt` (janela de datas) e
  `repeatEveryHours` — nada disso existe (só `sessionStorage`). **Esse é o gap real.**

### Recomendação de arquitetura (confirmar ao iniciar)
- **Novo model `Popup`** (tabela própria, espelhando `NewsletterSlide`): permite
  N popups via CRUD, sem inflar o `Settings` singleton. Campos: `imageUrl`,
  `title`/`description`, `buttonText`/`buttonUrl`, `accentColor`, `appearDelay`,
  `autoClose`/`autoCloseDelay`, `startsAt`/`endsAt`, `repeatEveryHours`,
  `isActive`, `order`. Migration idempotente.
- **Generalizar** o builder da newsletter e o `NewsletterCarouselModal` em um
  `PopupManager` reusável, em vez de portar o export antigo.
- Endpoints `GET /popups` (público, só ativos na janela) + `PUT/POST/DELETE`
  (admin, guard) — espelhar `newsletter`/`campaigns` (gateway-local Prisma).

### O que fazer
1. Decidir model `Popup` vs. KV (recomendado: model `Popup`).
2. Schema + migration idempotente + `prisma generate`.
3. DTOs + endpoints gateway-local (guard admin nas escritas, GET público).
4. Admin: seção "Popups" (CRUD) reusando o builder da newsletter.
5. Web: `PopupManager` com controle de frequência real (datas + `repeatEveryHours`
   + `localStorage` por versão/id).

### Critérios de aceite
- [ ] Admin cadastra/edita/remove múltiplos popups com imagem, botão e visual.
- [ ] Duração funciona nos dois sentidos: tempo na tela (`autoCloseDelay`) e
      janela de campanha (`startsAt`/`endsAt`).
- [ ] Frequência respeita "não repetir na sessão" e "repetir a cada X horas".
- [ ] Só popups ativos e dentro da janela aparecem no site.

---

## Gates (todas as sub-frentes)
- Lint 0, type-check limpo (admin/web/dtos/gateway), `madge --circular` sem ciclos.
- Migration: rodar local antes de commitar; `IF NOT EXISTS` em ALTER/CREATE.
- Validação e2e via Playwright na UI real antes de marcar ✅ (gates verdes não bastam).
- Áreas sensíveis (dtos, database, gateway, storage): avisar impacto e seguir;
  push/merge/migration-contra-prod continuam exigindo OK explícito.
