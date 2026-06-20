# Frente 1 — Upload em Massa de Produtos

**Esforço:** ~3 dias úteis (com IA) · **Risco:** médio
**Status: ✅ CONCLUÍDA** (sessão 2026-06-18, branch `dev`) — falta só
teste de volume real (~70) com a planilha do cliente, e push/PR do `dev`.

## Status (sessão 2026-06-18) — branch `dev`

Implementado v1 completo (mapeamento + fuzzy + repair + foto). Decisões:
fluxo = planilha `.xlsx` + zip de imagens (nomes batem com a coluna de
imagem); loja/categoria inexistente **só reporta** (não cria).

- ✅ Backend: `POST /products/bulk` com falha parcial (retorno por
  linha) — `CreateProductsBulkDto`/`BulkCreateResult` em `@repo/dtos`,
  `ProductService.createBulk`, proxy no api-gateway. (`8d4ec5e`)
- ✅ Núcleo "autônomo" (lib pura, `apps/admin/.../importar/-lib/`):
  parse xlsx, mapeamento fuzzy de colunas (fuse.js), preço texto→enum,
  resolução de loja (API) e categoria (lista fixa) por limiar de
  confiança, extração do zip + casamento foto↔linha. (`9a8d8f9`)
- ✅ Wizard admin (upload → mapping → preview/repair → result) com
  semáforo por linha e reparo inline. (`244974d`)
- ✅ Fix do bloqueio pré-existente `CreateStoreForm.tsx:275`
  (`uploadImage(file, { storeId })`) — `check-types` do admin verde. (`784dc80`)
- ✅ **E2E validado via Playwright** (3 produtos, stack real): auto-mapeamento
  100%, loja exata + fuzzy "Loja Tste"→sugestão→reparo inline, categoria
  sem acento "Escritorio"→Escritório, multi-categoria "Cozinha; Sala",
  preço texto→enum ($/$$/$$$), zip→webp no MinIO, bulk 3 criados/0 falhas,
  produtos persistidos com imagem.
- ✅ Modelo .xlsx: botão "Baixar modelo" no wizard + pasta `exemplos/`
  (planilha de 10 produtos + LEIA-ME pro lojista). (`259a400`, `60a8987`)
- ✅ Ajuste fino de loja: resolução por nome de origem (nome X→loja W),
  além de "aplicar a todos". (`a5f9590`)
- ✅ Import em **segundo plano** (Nível 2): ImportJobProvider no layout +
  widget flutuante com lista por item, aviso vermelho de F5/fechar +
  beforeunload. Sobrevive à navegação client-side; NÃO a F5/fechar aba
  (upload é client-side — job no backend seria Nível 3, fora de escopo).
  (`a257a92`)
- ✅ **Imagens órfãs resolvidas**: linha que falha no bulk tem as fotos
  já subidas deletadas via `POST /storage/delete`; o widget reporta
  "N órfã(s) removida(s)". (`a257a92`)
- ✅ Modelo .xlsx completo (2 abas: Produtos com exemplos de todas as
  opções + Opções com valores aceitos) e botão **Ajuda** (modal com
  passo a passo + dicas) no wizard. (`e427843`)
- ⬜ Falta (não-bloqueante): teste de volume real (~70 itens) com a
  planilha do cliente; push/PR do `dev`.

## Commits da frente (branch `dev`, em ordem)

`8d4ec5e` backend bulk · `9a8d8f9` núcleo fuzzy · `244974d` wizard ·
`784dc80` fix CreateStoreForm · `259a400` resiliência+modelo ·
`b50b395` loja em massa/preço/sem-foto · `a5f9590` loja por nome ·
`a257a92` segundo plano + órfãs · `60a8987` exemplos/ · `e427843`
modelo completo + Ajuda.

## Pendente para próximas sessões

- **Frente 02 (Páginas de Campanha)** — será tocada em **outro chat**.
  Consome os produtos que esta frente cadastra. Ver `02-paginas-de-campanha.md`.
- Teste de volume real (~70 itens) com a planilha do cliente.
- Decidir push/PR do `dev` (10 commits locais não enviados).
- Possível Nível 3 (job no backend, sobrevive F5/fechar) — só se houver
  necessidade real; hoje fora de escopo.

> Primeira frente da ordem de produção: destrava o cadastro dos ~70 produtos que
> alimentam as campanhas (Frente 2) e os dados (Frente 3).

## Objetivo

Substituir o cadastro manual (gargalo: ~70 produtos novos) por importação via
**planilha + fotos**, com preview/validação antes de gravar.

## Estado atual

| Item | Estado |
|------|--------|
| Criar 1 produto (form + endpoint `POST /products`) | ✅ existe |
| Upload de imagem (`useImageUpload`, presigned MinIO, compressão) | ✅ existe |
| Lookup de loja por nome (`GET /stores?search=`) | ✅ existe |
| Listar categorias (`GET /categories`) | ✅ existe (sem busca por nome) |
| Endpoint bulk (`POST /products/bulk`) | ❌ não existe |
| Parsing de planilha (xlsx/csv) | ❌ nenhuma lib instalada |

## Campos do produto (alvo da planilha)

`name`, `description`, `price` (enum LOW/MEDIUM/HIGH/ON_REQUEST), `categories[]`
(nomes), `tags`, `storeId` (resolvido do nome da loja), `isFeatured`, imagens (até 5).

## O que reaproveita

- `useImageUpload` (compressão + presigned URL + MinIO) — upload das fotos.
- `POST /products` / `ProductService.create` — molde da criação e validações.
- `GET /stores?search=` — resolver **nome da loja → storeId**.
- `GET /categories` — montar map **nome → id** no front.

## O que é novo (onde está o custo real)

1. **Parsing de planilha** — instalar `xlsx`, ler linhas → array tipado.
2. **Casamento foto ↔ produto** — convenção de nome de arquivo (ex.: `nome-do-produto_1.jpg`)
   ou UI de associação. **Parte mais trabalhosa.**
3. **Resolução nome→id** de loja e categoria + erro "loja/categoria não encontrada".
4. **Mapeamento de preço** (texto "Baixo/Médio/Alto/Sob consulta" → enum).
5. **Tela de preview/validação** — mostra linhas válidas/invalidas antes de gravar.
6. **Endpoint bulk** `POST /products/bulk` com tratamento de **falha parcial**
   (relatar quais linhas falharam sem perder as que deram certo).

## Plano de execução

### Dia 1 — Backend + parsing
- [ ] Instalar `xlsx` no admin
- [ ] `CreateProductsBulkDto` em `packages/dtos`
- [ ] `ProductService.createBulk()` + `POST /products/bulk` com retorno por linha (sucesso/erro)
- [ ] Parser planilha → array de produtos no front
- [ ] Map de preço (texto → enum) + resolução de categorias (map nome→id)

### Dia 2 — Fotos + resolução de loja
- [ ] Upload múltiplo de fotos + convenção de nome para casar com produto
- [ ] Resolver nome da loja → storeId via `GET /stores?search=`
- [ ] Upload paralelo das imagens reusando `useImageUpload`

### Dia 3 — Preview, validação e refino
- [ ] Tela de preview: tabela com linhas válidas/inválidas e mensagens de erro
- [ ] Confirmar importação → chamada bulk → relatório final (X criados, Y falharam)
- [ ] Modelo de planilha (template .xlsx para download) + testes com ~70 itens

## Critérios de aceite

- [ ] Importar uma planilha de ~70 produtos com fotos em uma operação.
- [ ] Loja e categorias resolvidas por nome; nome inexistente é reportado, não quebra tudo.
- [ ] Preço em texto é mapeado para o enum correto.
- [ ] Preview mostra erros antes de gravar; importação relata sucessos e falhas por linha.
- [ ] Falha parcial não perde os produtos válidos.

## Fora de escopo

- Edição em massa de produtos já existentes (só criação).
- Atualização incremental/sincronização (re-importar e atualizar) — pode virar incremento.
- Deduplicação de imagens idênticas.

## Riscos

- **Casamento foto↔produto** é a maior fonte de fricção — definir a convenção de
  nome com o cliente logo no início evita retrabalho.
- Planilha "suja" (nomes de loja/categoria fora do padrão) — mitigar com o preview.
