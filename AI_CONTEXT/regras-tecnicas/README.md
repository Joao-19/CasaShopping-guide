# Regras Tecnicas de Implementacao

Estas regras definem o padrao minimo de engenharia para robustez,
escalabilidade, qualidade e seguranca.

## 1. Ciclo de desenvolvimento
1. Definir teste por contrato (Red).
2. Implementar minimo necessario (Green).
3. Refatorar sem alterar comportamento (Refactor).

## 2. Gates obrigatorios antes de concluir
- Lint sem erros (`pnpm lint` ou `pnpm --filter <pkg> lint`).
- Typecheck sem erros (`pnpm check-types`).
- Testes relevantes do escopo passando.
- Quando aplicavel, smoke do fluxo principal da feature.
- **Apos `git pull`/`merge`/`checkout` que toque
  `packages/database/prisma/migrations/`:** rodar
  `pnpm --filter @repo/database exec prisma migrate status`.
  Se aparecer migration "have not yet been applied", aplicar via
  `prisma migrate deploy` (nao-interativo) antes de subir os servicos.
  **`prisma generate` so regenera tipos TS — nao cria tabelas**;
  typecheck fica verde mesmo com schema desatualizado, mas o runtime
  quebra com `relation "..." does not exist`. O hook
  `post-git-sync-check.js` ja lembra disso automaticamente.

## 3. Qualidade de arquitetura
- Separar regra de negocio de camada de interface/transporte.
- Preferir funcoes/coisas coesas e baixo acoplamento.
- **Tamanho de arquivo (two-tier):**
  - **Alvo: ~300 linhas** por componente/modulo. Entre 300 e 600 linhas,
    considerar decompor quando puder, sem bloquear mudancas pequenas.
  - **Teto: ~600 linhas.** Acima disso, **decompor antes de continuar**.
    Arquivos grandes desperdicam contexto de IA e dificultam manutencao.
- Ao criar/modificar arquivo que ultrapassa 600 linhas, a IA **deve**
  propor um plano de decomposicao antes de prosseguir.

## 3.1 Estrategia de componentizacao (monorepo)
- **`packages/ui`** — componentes reutilizaveis, agnosticos de dominio
  (BaseText, BaseInput, Badge, Avatar, Switch, etc.). Se nao depende de
  regra de negocio especifica e serve a qualquer app, pertence aqui.
- **`apps/web` / `apps/admin/components`** — componentes especificos do
  produto que dependem de contexto de negocio (api-client, tipos do
  dominio, estado da pagina).
- **Regra pratica:** se precisa importar de `@/` (estado/services do
  app) ou tipos especificos do produto, o componente e do app. Se so
  precisa de props genericas (label, variant, size, onChange), e
  candidato a `packages/ui`.
- Antes de criar componente visual generico no app, verificar se ja
  existe equivalente em `packages/ui/src/`.

## 3.2 Contratos compartilhados (microservicos)
- DTOs/contratos entre servicos vivem em `packages/dtos`. Mudanca de
  contrato e cross-service: o gateway e os consumidores precisam estar
  alinhados no mesmo ciclo.
- Autenticacao/autorizacao usa `packages/auth-guard`. Nao reimplementar
  verificacao de token na mao em cada servico — reusar o guard.
- Chamadas do frontend usam `packages/api-client`. Nao montar fetch
  cru espalhado.

## 4. Tratamento de erros e observabilidade
- Erros devem ser previsiveis, com mensagem segura e sem vazamento
  sensivel.
- Fluxos criticos devem ter logs/eventos suficientes para diagnostico.
- Nada de `.catch(() => {})` silencioso engolindo erro sem log.

## 5. Seguranca minima por entrega
- Validar autorizacao no nivel do recurso (anti-IDOR).
- Validar input em fronteiras do sistema (todo endpoint Express).
- Nao expor segredo em codigo, log ou resposta.
- Adicionar teste negativo para acesso indevido quando houver
  endpoint/acao sensivel.

## 6. Definition of Done tecnica
- Contrato atendido.
- Testes e gates verdes.
- Sem regressao funcional evidente no fluxo impactado.
- Contexto/documentacao atualizados quando necessario.
- **Para tarefas visuais:** componentes alterados conferidos contra o
  equivalente de `packages/ui` e contra o guia visual de `docs/` (se
  existir).

## 7. Cuidado com TDZ em apps Next (web/admin)
Os apps Next sao buildados em modo standalone para Docker/deploy. Um
ciclo de dependencia de **valor** envolvendo `*Provider.tsx` /
`*Context.tsx` compila feliz em dev mas quebra em runtime no standalone
com `Cannot access 'X' before initialization`.

- Ao tocar provider/context/layout root/barrel de package/next.config,
  antes de declarar pronto rodar
  `npx madge --circular --extensions ts,tsx apps/web` (e `apps/admin`).
- Se aparecer ciclo de valor envolvendo Provider, aplicar o padrao P1
  de [tdz-patterns.md](./tdz-patterns.md) (extrair Context + hooks para
  arquivo `*Context.ts` separado).
- O hook `pre-push-validate.js` bloqueia push/deploy quando detecta esse
  padrao em arquivo sensivel alterado.
