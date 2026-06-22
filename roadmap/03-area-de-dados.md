# Frente 3 — Área de Dados (favoritos + mapa de calor)

**Esforço:** ~8 dias úteis (com IA) · **Risco:** alto

## Objetivo

Painel no admin para decisões comerciais: **produtos mais favoritados** e
**mapa de calor sobre produtos/categorias** a partir de visualizações, com
**filtro por período**.

## Decisões já tomadas

- **Fonte das views:** banco próprio (Postgres) — tracking proprietário.
- **Mapa de calor:** calor sobre **produtos/categorias** (não dia×hora, não geo).
- **Deploy:** subir em produção **via Portainer** (entra no escopo).

## ✅ Decidido — Origem do visitante ("de onde veio") via tracking próprio

**Pergunta:** dá pra saber de qual site/canal o usuário veio ao entrar?
**Resposta:** sim — e **sem depender do Google**. `document.referrer` e os
parâmetros `utm_*` são nativos do navegador/URL; o GA4 só *lê* esses mesmos dados.

**Decisão (2026-06-17): tracking próprio no Postgres.** Motivos:
- As duas empresas (GA4) são grandes → **solicitar/exportar dado é lento**.
- Coletando direto, o dado **já aparece no próprio site/admin** sem intermediário.
- **Cruzamento feito por nós** (origem × favoritos × views) — não precisamos juntar
  duas fontes externas nem reconciliar dados de terceiros.

O que será capturado (em ordem de confiabilidade):

- ✅ **UTMs** (`utm_source`, `utm_medium`, `utm_campaign`) — o mais confiável,
  porque **nós** definimos no link divulgado. Casa com a **Frente 2 (campanhas)**.
- ✅ **Referrer** (`document.referrer`) — domínio de origem (Google, Instagram web,
  outro site). ⚠️ App nativo (Insta/WhatsApp/TikTok) muitas vezes **não manda
  referrer** → cai em "direto/none". Quem digita URL/favorito também = "direto".

Implementação: campos extras no modelo `ProductView` / sessão (`referrer`,
`utmSource`, `utmMedium`, `utmCampaign`, `landingPage`), capturados no
**primeiro acesso da sessão**. Entra nos **Dias 1–2** (ver plano).

## Estado atual

| Item | Estado |
|------|--------|
| Favoritos (toggle, lista, tabela `Favorite`) | ✅ ~85% — falta só agregação |
| GA4/GTM | ⚠️ básico, sem eventos custom |
| Contagem de views | ✅ tracking + agregação prontos (Dias 1–3) |
| Dashboard de dados no admin | ✅ `/DashBoard/dados` (favoritos, views, origem) |
| Mapa de calor / filtro por período | ✅ heatmap por categoria + filtro de período |

## O que é novo (onde está o custo)

1. **Pipeline de tracking próprio:** modelo `ProductView`, endpoint de registro,
   dedupe anti-spam (senão a métrica vira lixo).
2. **Agregação/performance:** view materializada ou job — query direta não escala.
   *(parte que menos comprime com IA)*
3. **Dashboard:** ranking de favoritos + mapa de calor de produtos/categorias +
   filtro de datas.
4. **Deploy via Portainer:** primeiro deploy seu nesse fluxo (hoje manual, de
   terceiro). Risco de cronograma — não comprime com IA.

## Plano de execução

### Dias 1–2 — Tracking backend ✅ (concluído 2026-06-22, validado e2e na UI)
- [x] Modelo `ProductView` (productId, userId?, sessionId, viewedAt) + índices
      (`productId`, `viewedAt`, `sessionId+productId`) + migration idempotente
      `20260622_add_product_views`
- [x] Endpoint `POST /products/:id/view` (público) com dedupe por
      `sessionId+productId` (janela 30min) → `{ recorded: bool }`. Proxy no gateway.
- [x] Disparo no front: `composable/useTrackProductView` ligado no
      `ProductDetailsCard` (chokepoint único: página `/produto/[id]` + popup da
      listagem). Best-effort, não quebra a UI.
- [x] Campos `referrer` / `utmSource` / `utmMedium` / `utmCampaign` / `landingPage`
      no modelo + captura no 1º acesso da sessão (`lib/sessionTracking.ts`,
      sessionStorage `cs_sid`/`cs_origin`). Referrer só conta domínio externo.

> **Pendência herdada para a agregação (Dia 3):** `userId` no `ProductView`
> existe mas ainda **não é populado** — o endpoint é público (sem guard) e não
> confiamos em userId vindo do cliente. Para cruzar origem × favoritos × views
> por usuário, capturar `userId` via auth opcional (guard que não rejeita
> anônimo) antes da agregação.

### Dia 3 — Agregação ✅ (concluído 2026-06-22, validado via API)
- [x] Camada de agregação em SQL (`apps/products/src/services/analytics.service.ts`)
      — sem materialização ainda (volume baixo); índices de `product_views`
      sustentam. Materializar só se a query degradar.
- [x] Agregação de favoritos por produto (ranking) + views por produto
      (ranking, com sessões únicas) + heatmap por categoria (views+favoritos,
      `unnest` da array `categories`, `COUNT(DISTINCT)` p/ não inflar) +
      breakdown de origem (utm_source → referrer→host → "direto").
- [x] Endpoints admin `GET /products/analytics/{favorites,views,categories,origins}`
      com filtro `from`/`to`/`limit`; proxy no gateway (token via cookie).
      Validado: contagens corretas, dedupe de origem por host, filtro de período,
      401 sem token.

> **Nota deploy:** o gateway roda `nest start` (sem `--watch`) → exige restart
> ao mexer em controllers/módulos do gateway (products tem `--watch`).

#### Follow-ups da revisão (3 revisores especialistas — 2026-06-22)
- ✅ **CRÍTICO resolvido:** falha do tracking de view abria o `ErrorPopup` global
  (o interceptor do `@repo/api-client` emite `api-error` antes de rejeitar). Fix:
  opção `silentErrorRoutes` no api-client + `["/view"]` no client do web; `"use
  client"` explícito no `ProductDetailsCard`. Validado por injeção de 500 na UI:
  sem popup, página intacta.
- ⏳ **Pré-deploy (Dia 7/8):** endpoint público `POST /products/:id/view` sem
  rate limit — `sessionId` vem do cliente; ator pode inflar views/uniqueSessions
  ou floodar escrita. Adicionar `@nestjs/throttler` antes de produção.
- ⏳ **Escala (se a telemetria crescer):** índice de dedupe `(sessionId,
  productId)` não cobre o range em `viewedAt`. Trocar por `@@index([sessionId,
  productId, viewedAt])` quando o volume justificar (hoje irrelevante).

### Dias 4–5 — API + Dashboard ✅ (concluído 2026-06-22, validado na UI)
- [x] Endpoints de analytics — feitos no Dia 3 (ver acima).
- [x] Nova rota admin `/DashBoard/dados` + item "Dados" no Sidebar.
- [x] "Produtos mais favoritados" (ranking de barras) + "Produtos mais vistos"
      (com sessões únicas) + totais do período.
- [x] Filtro por intervalo de datas (presets 7/30/90d + Tudo + custom).
      `composable/analytics/useAnalytics` controla o período e refaz as 4 queries.

### Dia 6 — Mapa de calor ✅ (concluído 2026-06-22)
- [x] Componente de heatmap por categoria (`CategoryHeatmap`) — grid de células
      com intensidade de cor por views. **Sem Recharts**: gráficos leves em
      CSS/Tailwind (barras + grid de calor), zero dependência nova ("equivalente").
- [x] Cruzamento com período selecionado (mesmo filtro afeta todos os widgets).
- [x] Bônus: breakdown de "Origem do tráfego" (UTM/referrer/direto).

> **Validado na UI** (admin :3002, login real): 4 widgets renderizam com dados
> corretos; trocar 7d↔30d recalcula tudo (views 10→8, exclui as fora da janela).
> Componentes leves em `apps/admin/app/DashBoard/dados/components/`.

### Dia 7 — Deploy Portainer
- [ ] Configuração do stack/serviço no Portainer
- [ ] Primeira subida em produção + validação + ajustes de env

### Dia 8 — Testes / refino / buffer
- [ ] Validação de números, performance da agregação, refino de UI

## Critérios de aceite

- [ ] Visualizações de produto são registradas no Postgres (com dedupe).
- [ ] Origem do visitante (referrer + UTMs) é registrada no 1º acesso da sessão.
- [ ] Admin vê ranking de produtos mais favoritados.
- [ ] Mapa de calor mostra produtos/categorias "quentes" no período filtrado.
- [ ] Filtro por intervalo de datas afeta favoritos e heatmap.
- [ ] Feature rodando em produção via Portainer.

## Riscos

- **Performance da agregação** conforme o volume cresce — mitigar com view
  materializada/índices desde o início.
- **Deploy Portainer** novo no fluxo — reservar o buffer; se travar, considerar
  tirar o deploy do sprint e entregar em staging.

## Alternativa para reduzir custo/risco

- Mapa de calor via **GA4 Data API** em vez de tracking próprio: corta ~2–3 dias
  e o risco de escala, mas perde controle/posse do dado. Reavaliar se prazo apertar.
