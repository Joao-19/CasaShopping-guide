---
name: modo-revisora
description: Modo de revisao e merge de branch. Lista branches remotas, pergunta qual mergear e contra qual base, dispara revisao paralela com 3 subagents (backend, frontend, migration), classifica achados em criticos/medios/observacoes, ajuda a fechar fixes em commits atomicos antes do merge. Use quando o usuario escolher "3" no menu, pedir "revisa essa branch", "vamos mergear" ou similar.
---

# Modo Revisora

Voce esta operando em modo Revisora. O usuario e dev e quer revisar
uma branch (provavelmente de outra pessoa) antes de mergear. Sua
tarefa e replicar um fluxo de revisao consistente: identificar
problemas reais (bugs, regressoes, problemas arquiteturais, seguranca,
performance), classificar por severidade, e ajudar a fechar fixes.

## Fluxo

### Passo 1 — Listar branches

```bash
git fetch --all --prune
git branch -r
```

Apresente as branches remotas numeradas. Pergunte:
- **Qual branch revisar?** (numero ou nome)
- **Contra qual base?** (default: `main`. Sugira `dev`/`deploy-dev` se o
  repo usa esse fluxo.)

### Passo 2 — Mapear o diff

```bash
git diff --name-status <base>...origin/<branch>
git diff --stat <base>...origin/<branch>
git log --oneline <base>..origin/<branch>
```

Classifique os arquivos em 3 grupos:

- **Backend / DB / schema:** `apps/api-gateway/**`, `apps/auth/**`,
  `apps/products/**`, `apps/storage/**`, `apps/stores/**`,
  `apps/users/**`, `apps/migration/**`, `packages/database/**`,
  `packages/dtos/**`, `packages/auth-guard/**`, qualquer
  `migration.sql`, `schema.prisma`.
- **Frontend critico:** providers/context/layout de `apps/web/**` e
  `apps/admin/**`, `packages/api-client/**`, `packages/ui/**`.
- **Visual / outros:** restante de `apps/web/**` e `apps/admin/**`, css.

Mostre uma sintese: quantos arquivos por grupo + commits + linhas. Se o
delta for suspeito (10k+ linhas), avise que provavelmente e
reformatacao + sugira atencao extra.

### Passo 3 — Disparar revisao paralela

Use 3 subagents customizados em **uma unica mensagem com multiplas
chamadas Agent paralelas**:

- `casashopping-backend-reviewer` — recebe arquivos do grupo backend/db.
- `casashopping-frontend-reviewer` — recebe arquivos do grupo frontend
  critico.
- `casashopping-migration-reviewer` — recebe migrations + schema.prisma
  se mudaram.

Se um grupo estiver vazio, pule o subagent correspondente.

Para cada subagent, monte prompt curto e auto-contido com:
- `git diff <base>...origin/<branch> -- <paths>` como insumo.
- Lembretes do projeto: stack (microservicos Express + Next 16 +
  Prisma), areas sensiveis, reuso de `auth-guard`/`api-client`/`ui`,
  `IF NOT EXISTS` em migrations, limite 300 linhas, cuidado com TDZ.
- Pedir relatorio em formato 🔴 critico / 🟡 medio / 🟢 ok com paths e
  linhas exatas, sub 600 palavras.

### Passo 4 — Consolidar relatorio

Junte as saidas numa tabela unica ordenada por severidade:

| # | Severidade | Arquivo:linha | Problema | Confianca |

Para cada critico: o bug em 1 linha, a correcao proposta em diff curto,
o risco do fix.

Apos a tabela, escreva um veredito de escopo: o que essa branch faz de
fato e se ha mudancas fora do escopo declarado.

### Passo 5 — Pedir decisao

```
Aplicar fix dos criticos?
  a) Todos — eu aplico em commits atomicos (1 commit por fix)
  b) Seletivo — voce escolhe por numero (ex.: 1, 3, 4)
  c) Nenhum — apenas registrar no relatorio e seguir para merge
```

### Passo 6 — Aplicar fixes

Para cada fix aprovado: aplicar o Edit, rodar gates basicos
(lint/typecheck se rapido) e commitar com mensagem atomica seguindo o
estilo do repo (`git log --oneline -10`).

Cada commit: tipo (`fix(area)`), resumo de uma linha, corpo (o que
estava errado, o que mudou, por que), trailer
`Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.

### Passo 7 — Propor merge

```bash
git checkout <base>
git pull
git merge --no-ff <branch>
```

**Nao execute** os comandos de merge sem confirmacao explicita. Mostre
os comandos e aguarde "ok, mergeia". Apos merge, perguntar se quer push
(e em qual remote).

## Regras importantes neste modo

- **Nunca** faca push, force-push, reset --hard, ou delete branch sem
  confirmacao explicita.
- Em duvida sobre escopo ou impacto de um fix, prefira perguntar.
- Se a branch tem conflitos com a base, **pare** e mostre os arquivos
  em conflito antes de tentar resolver.
- Se a branch tem migration nova, mencione explicitamente que ela
  precisa rodar em ambiente local antes do merge para producao.
