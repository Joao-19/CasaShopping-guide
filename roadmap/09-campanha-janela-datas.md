# Campanha — janela de datas + status ao vivo

> Sessão local em **dev** (2026-06-24). **Com migration** (colunas novas em
> `campaign_pages`), aditiva e idempotente. Espelha a janela do popup, mas aqui
> a campanha é um modelo Prisma real (não JSON), então tem coluna própria.

## O que mudou

### 1. Janela de exibição (data início/fim)
`CampaignPage` ganhou `startsAt`/`endsAt` (`DateTime?`). Dentro do intervalo a
campanha fica "ao vivo"; fora dele o público recebe 404 mesmo com `isActive=true`.
Ambos `null` = sem prazo (comportamento anterior preservado).

Datas guardadas em UTC: início = `00:00:00.000Z`, fim = `23:59:59.999Z` do dia
(dia final **incluso**, igual ao popup). Admin envia/recebe `YYYY-MM-DD`.

### 2. Status efetivo (`CampaignStatus`)
Novo tipo no DTO: `active | scheduled | expired | inactive`, calculado no backend
no momento da leitura (`computeStatus`):
- `inactive` — `isActive=false` (master desligado)
- `scheduled` — ligada, janela ainda não começou
- `expired` — ligada, janela já terminou
- `active` — ligada e (sem janela ou dentro dela) → único que o público abre

`findBySlug` passou a barrar no **status** (`!== "active"` → 404), não só `isActive`.

### 3. Admin
- **Form** (`CreateCampaignForm.tsx`): seção "Janela de exibição" (Início/Fim +
  Limpar + validação fim≥início). Bloqueia salvar com janela invertida.
- **Lista** (`page.tsx` + `StatusToggle.tsx`): switch de ativar/desativar direto
  na coluna Status (flipa `isActive` sem abrir o modal) + badge ao vivo
  (Ativa/Agendada/Expirada/Inativa). `StatusToggle` tolera `status` ausente
  (fallback por `isActive`) pra não quebrar contra cache antigo do gateway.

## Arquivos
- `packages/database/prisma/schema.prisma` — `startsAt`/`endsAt` em `CampaignPage`
- `packages/database/prisma/migrations/20260624_add_campaign_window/migration.sql`
  — `ADD COLUMN IF NOT EXISTS` (sem backfill)
- `packages/dtos/src/CampaignPages/campaign-page.dto.ts` — campos + `CampaignStatus`
- `apps/api-gateway/src/services/campaign.service.ts` — `toDateBound`,
  `computeStatus`, persistência, gate no `findBySlug`
- `apps/admin/.../campanhas/-components/CreateCampaignForm.tsx`,
  `.../campanhas/page.tsx`, `.../campanhas/-components/StatusToggle.tsx`
- `apps/admin/.../newsletter/targeting.ts` — quitada a dívida #1 do doc 08
  (`TargetingConfig` agora declara `startsAt`/`endsAt`; destravava `check-types`)

## Pra rodar localmente após pull
DTO e schema mudaram:
```
pnpm --filter @repo/dtos build
pnpm --filter @repo/database db:generate
pnpm --filter @repo/database exec prisma migrate deploy   # ou via sync-db em prod
```
Reiniciar o **gateway** depois (o `dev` é `nest start`, **sem watch** — não
recarrega backend sozinho). Em produção o build do Docker já cobre tudo.

## Validação (e2e via API, com login admin)
Playwright MCP caiu na sessão; validado direto na API (mesmos payloads do admin):
- Agendada → `scheduled` + público **404** ✓
- Vigente → `active` + público **200** ✓
- Expirada → `expired` + público **404** ✓
- Master OFF → `inactive` ✓
- Janela limpa (null) → `active` sem prazo ✓

## Dívida (não-bloqueante)
- `CreateCampaignForm.tsx` passou de 300 linhas (≈436). Candidato a decompor a
  aba "Campanha" (básico + capas + janela) num subcomponente.
- Janela em UTC: para fuso BR (GMT-3) o limite cai algumas horas "cedo" no
  horário local. Aceitável p/ agendamento de campanha; mesmo trade-off do popup.
