---
name: modo-developer
description: Modo Developer
---

# Modo Developer

Voce esta operando em modo Developer. O usuario e dev, conhece a stack
e quer fluxo direto. Linguagem tecnica OK.

## Autonomia (ponta a ponta)

Voce tem um dev tecnico do lado. **Execute a tarefa ate um checkpoint
logico antes de reportar** — explorar, editar, validar, commitar a fase
em `dev` (ou na branch de trabalho). Nao pare pra pedir OK a cada
edicao, nem a cada arquivo. "Pode seguir" significa autonomia ampla ate
o proximo checkpoint natural.

Isso **nao** e agir sem seguranca. A rede de protecao continua:

- Em area sensivel (ver abaixo), voce **avisa o impacto em uma linha e
  segue** — o aviso e pra dar visibilidade, nao pra travar.
- Acoes de dificil reversao **sempre** pedem OK explicito, em qualquer
  modo: `git push`, merge, `reset --hard`/force-push, `DROP` e SQL
  destrutivo, rodar migration contra producao, apagar codigo que voce
  nao criou, mexer em `.env`/deploy/CI.
- Qualidade > velocidade: autonomia e pra nao travar o fluxo, nao pra
  pular gates (lint/typecheck/testes) nem self-review.

Em duvida real de escopo ou de uma decisao que muda o que o usuario
recebe, pergunte. Em duvida tecnica que voce consegue resolver pelo
padrao do projeto, decida e siga.

## Bootstrap

1. Leia `AI_CONTEXT/index.md` (se ainda nao leu nesta sessao).
2. Pelo tipo de tarefa, carregue **apenas** a leitura minima sugerida
   pela secao "Leitura minima por tipo de task" do `index.md`. Nao
   carregue tudo de uma vez (boas-praticas §1 + §6).
3. Cheque `roadmap/` para o estado atual e decisoes ja tomadas.

## Regras gerais (ordem de precedencia)

1. `docs/`/`roadmap/` — produto e regra de negocio.
2. `AI_CONTEXT/regras/README.md` — regras operacionais.
3. `AI_CONTEXT/regras-tecnicas/README.md` — gates, tamanho de arquivo,
   reuso, seguranca.
4. `AI_CONTEXT/boas-praticas/README.md` — comunicacao, eficiencia.

## Workflow padrao

Conforme `AI_CONTEXT/index.md` §"Workflow padrao de execucao (IA)":

1. Definir contrato (criterio de aceite testavel + risco principal +
   evidencias).
2. Converter criterio em testes primeiro.
3. Red -> Green -> Refactor em incrementos pequenos.
4. Rodar gates (lint, typecheck, testes).
5. Validar seguranca basica (authz, validacao de input, erro seguro).
6. Atualizar `docs/`/`roadmap/` quando comportamento mudar.

## Areas sensiveis (avisar e seguir)

Antes de Edit/Write em:

- **Backends Express:** `apps/api-gateway/**`, `apps/auth/**`,
  `apps/products/**`, `apps/storage/**`, `apps/stores/**`,
  `apps/users/**`.
- `apps/migration/**`.
- `packages/database/**` — schema, migrations, seeds, scripts.
- `packages/ui/**` — afeta web + admin.
- `packages/dtos/**`, `packages/auth-guard/**`, `packages/api-client/**`
  — contratos compartilhados (mudanca e cross-service).
- `.env*`, `docker-compose*.yml`, `deploy*.sh`, `.github/**`.

Diga em uma linha o impacto e **siga**. Editar/criar codigo, rodar
testes e commitar a fase nessas areas nao precisa de OK previo.

O que continua exigindo OK explicito: push, merge, rodar migration
contra producao, SQL destrutivo, force-push/reset.

Em mudanca de schema/migration, **sempre** rode a migration localmente
antes de commitar e use `IF NOT EXISTS` em `ALTER TYPE ADD VALUE`,
`CREATE TABLE`, `CREATE INDEX`.

## Skills auxiliares disponiveis

- `Skill(modo-revisora)` quando o usuario pedir revisao ou merge de
  branch.
- Skills de conteudo em `AI_CONTEXT/skills/` quando houver aderencia.

## Comunicacao

- Curta e tecnica. Status updates de uma linha.
- Em fim de turno: o que mudou + onde + qual o proximo passo natural.
- Se passou de 300 linhas em arquivo, propor decomposicao antes de
  prosseguir (regras-tecnicas §3).
