# Roadmap — Guia de Compras (CasaShopping)

> Planejamento das frentes do "Guia de Compras".
> Estimativas em **dias úteis com desenvolvimento assistido por IA** (código gerado por IA, dev fullstack dirigindo, revisando, testando e fazendo deploy).
> Data base: 2026-06-17.

## Estado das frentes (atualizado 2026-06-20)

**✅ Concluídas** (movidas para `completos/`):
1. **Upload em massa** — `completos/01-upload-em-massa.md` (falta só teste de
   volume real ~70 + push/PR; não-bloqueante).
2. **Páginas de Campanha** — `completos/02-paginas-de-campanha.md` (validada e2e).

**🟡 Em andamento / planejadas:**

| # | Frente | Estado | Esforço (c/ IA) | Risco | Detalhe |
|---|--------|--------|------------------|-------|---------|
| 3 | **Área de Dados** (favoritos + mapa de calor + origem do visitante) | Dias 1–6 ✅ (tracking+analytics+dashboard, validado e2e); falta só deploy (Dia 7) | ~8 dias | alto (deploy + escala) | `03-area-de-dados.md` |
| 6 | **Newsletter Builder V2** | Fases 0–4 ✅, falta Fase 5 (e2e) | — | baixo | `06-newsletter-builder-v2.md` |
| 7 | **Melhorias em Camadas** | Rodada 1 (B1/B2/B3/B4) ✅; Rodada 2 (B5/B6/B7/B11) em andamento | baixo/médio | `07-melhorias-camadas.md` |

> **Frente 7 é a ativa.** Rodada 1 (limites, compartilhar, página de loja, popups)
> concluída e validada. Rodada 2 (revisão completa da ata): B6 responsividade do
> produto, B7 preview WhatsApp/OG, B11 seletor de produtos rico na campanha; B5
> (redesign do bloco da loja) aguarda Figma do Felipe.

> **Pendências** (bloqueadas por decisão/estudo nosso + cliente): B8 banners,
> B9 mapa do shopping, B10 revista/PDF — ver `pendencias.md`. Fora de escopo até
> destravar.

> **Newsletter (Carrossel V1)** — substituída pela Frente 6. Registro em
> `05-newsletter-carrossel.md`.

> **Infra/Deploy (Frente 10)** — `10-infra-portainer-nginx.md`: nginx em stack
> separada, app no Portainer (Git), tela de manutenção + pendências de infra
> (ACL/segurança, limpeza, R2). Base já feita: GHCR + escravo/VPN.

> **Ajustes do cliente (Frente 11)** — `11-ajustes-cliente-junho.md` (nova,
> 2026-06-26): 5 pedidos pós-entrega. Prioritário = **preço em texto livre
> (de/por)**. Demais: destaque só com produto, fallback de banner sem 2025,
> exclusão em massa, logos em massa (já pronto via script). Classificação
> demanda-nova × já-entregue em `../DEMANDA-NOVA-AJUSTES-JUNHO.md` (raiz).

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
