# CLAUDE.md — casashopping-guide

Carregado automaticamente em todo turno. Define o modus operandi da IA
neste projeto. Toda regra operacional vive em `AI_CONTEXT/` — este
arquivo apenas referencia, **não duplica**.

## Stack (resumo)

Monorepo **pnpm + turbo** (Node ≥ 20). Dois mundos:

- **Backends — microserviços Express:** `apps/api-gateway`, `apps/auth`,
  `apps/products`, `apps/storage`, `apps/stores`, `apps/users`, e o
  runner `apps/migration`.
- **Frontends — Next 16 (App Router):** `apps/web` (site público) e
  `apps/admin` (painel).
- **Packages compartilhados:** `@repo/database` (Prisma + PostgreSQL),
  `@repo/ui` (componentes), `dtos`, `auth-guard`, `api-client`,
  `eslint-config`, `typescript-config`.

## Bootstrap da sessão (obrigatório)

Na **primeira interação** de cada sessão (mesmo um simples "bom dia"):

1. Responda à saudação ou pergunta inicial **naturalmente** — sem ignorar.
2. Em seguida, leia silenciosamente `AI_CONTEXT/index.md`.
3. Apresente o menu de modos abaixo e peça que o usuário escolha 1, 2
   ou 3. Só então inicie a tarefa real.
4. Quando o usuário escolher, invoque `Skill(modo-vibecode)`,
   `Skill(modo-developer)` ou `Skill(modo-revisora)`.

Se o usuário já mandar uma instrução clara junto da saudação (ex.: "bom
dia, revisa a branch X"), responda à saudação, ofereça o menu, mas
sugira o modo mais aderente (no exemplo: 3-Revisora) e pergunte se pode
seguir.

## Menu de modos

```
Antes de começar, qual modo de trabalho?

  1. VibeCode — para quem não programa muito. Eu pergunto antes de
     cada edição, bloqueio áreas sensíveis (backends, db, schema,
     migrations, packages compartilhados) e uso linguagem natural.
     Segurança máxima.

  2. Developer — fluxo técnico. Sigo as regras de AI_CONTEXT/ e mexo
     onde precisar, avisando em zonas sensíveis.

  3. Revisora — para revisar e mergear branch de outra pessoa. Listo
     branches, rodo revisão paralela (backend + frontend + migration)
     e ajudo a fechar fixes antes do merge.

Escolha 1, 2 ou 3.
```

## Fontes (precedência)

1. `docs/` — produto e regras de negócio (quando existir)
2. `roadmap/` — estado atual, fases, decisões e gotchas entre sessões
3. `AI_CONTEXT/regras/` — regras operacionais
4. `AI_CONTEXT/regras-tecnicas/` — engenharia, segurança, tamanho de
   arquivo, reuso
5. `AI_CONTEXT/boas-praticas/` — colaboração, comunicação, eficiência
   de contexto
6. `AI_CONTEXT/skills/` — skills de conteúdo (referências de tarefa)
7. `packages/ui/` — fonte da verdade de componentes reutilizáveis

## Áreas sensíveis (todos os modos)

Antes de Edit/Write em:
- **Backends Express:** `apps/api-gateway/**`, `apps/auth/**`,
  `apps/products/**`, `apps/storage/**`, `apps/stores/**`,
  `apps/users/**`
- `apps/migration/**`
- `packages/database/**` (especialmente `prisma/schema.prisma` e
  `prisma/migrations/**`)
- `packages/ui/**` (afeta web + admin)
- `packages/dtos/**`, `packages/auth-guard/**`, `packages/api-client/**`
- `.env*`, `docker-compose*.yml`, `deploy*.sh`, `.github/**` (CI)

→ **VibeCode:** avise o impacto (cross-stack, dados, contrato
compartilhado) e **peça confirmação** antes de editar (confirmação
dupla em mudança de risco — ver `modo-vibecode`).

→ **Developer / Revisora:** avise o impacto em uma linha e **siga** —
não pare pra pedir OK por edição. A confirmação fica reservada para
ações de difícil reversão (push, merge, `reset --hard`/force-push,
`DROP` e afins, rodar migration contra produção, apagar código que
você não criou, mexer em `.env`/deploy/CI), que continuam exigindo OK
explícito em todos os modos.

## Hooks ativos (informativos, não bloqueantes salvo indicado)

Os hooks em `.claude/settings.json` lembram a IA de:
- Componentes em `apps/web/**` e `apps/admin/**` acima de 300 linhas
  precisam decomposição (regras-tecnicas §3 + §6).
- Antes de criar componente novo, checar `packages/ui/`
  (regras-tecnicas §3.1, regras §7).
- Migrations Prisma devem ser idempotentes (`IF NOT EXISTS` em `ALTER
  TYPE ADD VALUE`); após sync que toque `migrations/`, checar
  `prisma migrate status`.
- `pre-push-validate.js` **bloqueia** `git push`/deploy quando há ciclo
  de Provider (TDZ-prone) ou erro de lint em arquivo sensível alterado
  nos apps Next.

Esses lembretes são genéricos — a IA julga em cada contexto.
