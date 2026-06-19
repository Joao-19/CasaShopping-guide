# Boas Praticas para Colaboracao com IA

## 1. Leitura eficiente de contexto
- Carregar primeiro somente o minimo obrigatorio (`roadmap`/`docs` +
  regras locais).
- Expandir leitura por escopo, nao por volume.

## 2. Comunicacao de entrega
- Sempre informar: objetivo, alteracoes, validacoes executadas e riscos
  residuais.
- Quando faltar dado, explicitar assuncao e impacto.

## 3. Padrao de mudanca
- Pequenas mudancas com verificacao frequente.
- Evitar misturar refatoracao ampla com alteracao funcional critica no
  mesmo lote.

## 4. Revisao de qualidade
- Conferir regressao funcional, seguranca e manutencao antes de fechar.
- Priorizar correcoes de alto risco primeiro.

## 5. Higiene de contexto
- Nao duplicar regra que ja existe em `docs`/`roadmap`.
- Referenciar fonte original ao complementar regra.

## 6. Eficiencia de contexto (custo de IA)
- Arquivos grandes consomem tokens desnecessarios em cada leitura.
  Two-tier: alvo ~300 linhas, teto ~600 linhas. Acima de 600 e
  prioridade decompor antes de evoluir o arquivo.
- Ao ler arquivos, usar offset/limit para ler apenas o trecho necessario
  — evitar carregar o arquivo inteiro quando so precisa de uma secao.
- Preferir decomposicao em subcomponentes menores a manter tudo num
  arquivo monolitico.
- Componentes reutilizaveis devem estar em `packages/ui` (lidos uma vez,
  usados em todo o monorepo) em vez de duplicados em cada app.

## 7. Memoria entre sessoes (`roadmap/`)
- `roadmap/` e a memoria externa do projeto. Sem ela a IA recomeca do
  zero a cada conversa.
- Registrar ali: mudancas em areas sensiveis, features medias/grandes,
  decisoes arquiteturais e debt deixada conscientemente.
- Nao registrar ajuste visual local ou bugfix cirurgico de 1-2 linhas.
