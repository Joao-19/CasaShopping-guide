# Regras Operacionais para IA

Estas regras complementam `docs/`/`roadmap/` e sao obrigatorias para
execucao.

## Regra 1 - Fonte de verdade
- Nao inventar regra de negocio fora de `docs/`/`roadmap/`.
- Se houver conflito entre implementacao e documentacao, registrar gap
  e seguir o comportamento documentado ate alinhamento.

## Regra 2 - Contrato antes de codigo
- Toda mudanca deve iniciar com criterio de aceite testavel.
- Sem criterio testavel, nao iniciar implementacao.

## Regra 3 - Escopo controlado
- Implementar apenas o necessario para passar os testes do contrato.
- Evitar expansao de escopo por inferencia.

## Regra 4 - Registro de assuncoes
- Quando o contrato for incompleto, declarar assuncao explicitamente em
  comentario de entrega.
- Assuncao nao vira regra permanente sem documentacao.

## Regra 5 - Entrega incremental
- Priorizar lotes pequenos, revisaveis e com baixo risco de regressao.
- Evitar reescrita ampla quando uma evolucao incremental resolver.

## Regra 6 - Atualizacao de contexto
- Mudou comportamento de negocio, fluxo, dados ou autorizacao: atualizar
  `docs/` e/ou `roadmap/` no mesmo ciclo.

## Regra 7 - Fidelidade de componentes / design
- **Fonte da verdade de componentes:** `packages/ui/src/`.
- Antes de criar componente novo em `apps/web` ou `apps/admin`, buscar
  equivalente em `packages/ui/src/` por nome. Se existir, reusar/portar
  1:1 em vez de reimplementar.
- Se houver guia visual em `docs/`, seus tokens sao a fonte de verdade
  visual — nao usar valores proprios, CSS variables genericas ou cores
  de outros design systems.
- Nao inventar cores, border-radius ou padroes visuais fora do que o
  projeto ja estabelece.

## Regra 8 - Tamanho e organizacao de arquivos
- **Two-tier:** alvo ~300 linhas; teto ~600 linhas. Entre 300 e 600 =
  considerar decompor quando puder; acima de 600 = decompor antes de
  continuar com novas mudancas no arquivo.
- Componentes visuais genericos (textos, inputs, badges, avatares,
  switches) devem estar em `packages/ui`, nao duplicados dentro de
  `apps/web` ou `apps/admin`.
- Antes de criar componente novo, verificar `packages/ui/src/` por
  equivalente existente.
