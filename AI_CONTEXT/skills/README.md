# Skills

Existem **dois tipos** de skills neste projeto, em locais diferentes:

## 1. Skills operacionais — `.claude/skills/`

Skills que controlam o **modus operandi** da IA. Sao acionadas pelo
menu de modos do `CLAUDE.md` raiz (1=VibeCode, 2=Developer,
3=Revisora) ou explicitamente via `Skill(<nome>)`.

- `modo-vibecode` — guardrails fortes, linguagem natural, para
  usuarios nao-tecnicos.
- `modo-developer` — fluxo tecnico, segue precedencia de fontes em
  `AI_CONTEXT/`.
- `modo-revisora` — revisao paralela de branch (backend + frontend
  + migration), classificacao 🔴/🟡/🟢, fixes em commits atomicos
  antes do merge.

Subagents pre-configurados (em `.claude/agents/`) que essas skills
podem invocar:
- `casashopping-backend-reviewer`
- `casashopping-frontend-reviewer`
- `casashopping-migration-reviewer`

Hooks defensivos (em `.claude/settings.json`) emitem lembretes sobre
tamanho de arquivo, reuso de componentes, idempotencia de migrations e
sync de Prisma. O `pre-push-validate.js` e o unico bloqueante (push/
deploy com ciclo de Provider/TDZ).

## 2. Skills de conteudo — `AI_CONTEXT/skills/`

Skills que orientam **como executar tarefas especificas** (referencias
de tecnica/biblioteca). Use quando o tipo de tarefa casar. Adicione
conforme o projeto precisar.

### Template para nova skill de conteudo
- Objetivo
- Quando usar
- Entradas necessarias
- Passo a passo
- Exemplos
- Restricoes
