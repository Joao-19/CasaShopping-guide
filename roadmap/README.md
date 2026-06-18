# Roadmap — Guia de Compras (CasaShopping)

> Planejamento das frentes do "Guia de Compras".
> Estimativas em **dias úteis com desenvolvimento assistido por IA** (código gerado por IA, dev fullstack dirigindo, revisando, testando e fazendo deploy).
> Data base: 2026-06-17.

## Ordem de produção (definida)

1. **Upload em massa** — destrava o cadastro dos ~70 produtos.
2. **Páginas de Campanha** — usa os produtos cadastrados.
3. **Área de Dados** — mede favoritos e visualizações desses produtos.

| # | Frente | Estado atual | Esforço (c/ IA) | Risco | Detalhe |
|---|--------|--------------|------------------|-------|---------|
| 1 | **Upload em massa** (planilha + fotos, ~70 produtos) | ~70% reaproveitável | **~3 dias** | médio | `01-upload-em-massa.md` |
| 2 | **Páginas de Campanha** | ~75% reaproveitável | **~4 dias** | baixo | `02-paginas-de-campanha.md` |
| 3 | **Área de Dados** (favoritos + mapa de calor + **origem do visitante**) | tracking do zero | **~8 dias** | alto (deploy + escala) | `03-area-de-dados.md` |
| | **Total** | | **~15 dias** | | |

> **Backlog** (itens da reunião de 2026-06-17, a priorizar após as Frentes 1–3):
> limites de produto, página por lojista, botão compartilhar e cadastro de popups —
> ver `04-backlog.md`. A "Implementação Principal" da reunião (Páginas de Campanha)
> já corresponde à Frente 2.

> **Newsletter (Carrossel)** — frente paralela, **implementada** na branch
> `feat/newsletter-carousel` (falta aplicar a migration + auth nas escritas).
> Estado e checklist em `05-newsletter-carrossel.md`.

## Recomendação de sprints (2 semanas = 10 dias úteis)

A ordem cabe em **2 sprints**:

- **Sprint 1 → Upload em massa + Páginas de Campanha** (~3 + 4 = 7 dias) + folga
  para refino. Entrega o fluxo completo de conteúdo (cadastrar → publicar campanha).
- **Sprint 2 → Área de Dados** (~8 dias). Frente mais cara/arriscada (tracking
  próprio em Postgres + 1º deploy via Portainer). Cabe em 2 semanas no limite.

> As 3 juntas (~15 dias) **não cabem** num único sprint de 2 semanas.

## Por que mais rápido que a estimativa "tradicional"

| Frente | Estimativa manual | Com IA | O que comprimiu |
|--------|-------------------|--------|------------------|
| Upload em massa | ~5 dias | ~3 dias | parsing, endpoint bulk, lookup; **casamento foto↔produto comprime pouco** |
| Páginas de Campanha | ~7 dias | ~4 dias | CRUD, forms, schema, endpoints, grid — todo o boilerplate |
| Área de Dados | ~12,5 dias | ~8 dias | backend e dashboard sim; **deploy e tuning de perf não comprimem** |

O que **não** acelera com IA: deploy via Portainer (novo no fluxo), ajuste fino
de performance da agregação, debug em ambiente real, configuração de env/secrets.
