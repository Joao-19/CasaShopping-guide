# Frente 11 — Ajustes do cliente (junho/2026)

> Pacote de 5 ajustes solicitados pelo cliente após as entregas da semana.
> Data base: **2026-06-26**. Estimativas em **dias úteis com dev assistido
> por IA** (mesmo critério das frentes anteriores).
>
> Item **4 (preço em texto livre) é PRIORITÁRIO** — o cliente precisa dele
> para subir os produtos em massa já com os valores.

## Visão geral

| # | Item | Estado atual | É demanda nova? | Esforço | Risco |
|---|------|--------------|-----------------|---------|-------|
| 4 | **Preço em texto livre (de/por)** ⭐ | ✅ **CONCLUÍDO + deployado dev-deploy (2026-06-30)** — Q1–Q6 fechadas | **Sim** — mudou contrato do campo | ~2 dias | médio (migration + cross-stack) |
| 1 | **Lojas em destaque só com produto** | Topo lista TODAS as lojas, sem filtro | **Sim** | ~1 dia | baixo |
| 2 | **Banner: trocar fallback 2025 → vídeo do template** | Fallback hardcoded É a liquidação 2025 (`MudaTudo`); título fixo "Liquidação muda tudo" | **Sim** | ~0,5 dia | baixo (mas depende de asset) |
| 3 | **Exclusão de produtos em massa** | Só exclusão 1 a 1 | **Sim** | ~1,5 dia | baixo |
| 5 | **Import em massa de lojas + logos** (feature, igual produtos) | Não existe feature; só CRUD 1 a 1. O script `update-logos.mjs` foi favor pontual, **não** é a entrega | **Sim** — feature de dev | ~2–2,5 dias | médio |

> **Total novo de dev:** ~7 dias úteis (cabe em 1 sprint).
> Ver `../DEMANDA-NOVA-AJUSTES-JUNHO.md` (raiz) para a classificação
> demanda-nova × retrabalho × já-entregue que vai pro cliente.

---

## Item 4 — Preço em texto livre (de/por) ⭐ PRIORITÁRIO

**Pedido:** campo de **texto livre** no cadastro de produto, que aceite
exatamente o que for digitado, **sem máscara nem validação de formato**, e
exiba **igual** no site. Precisa cobrir tanto preço único quanto promocional
"de/por":
- `R$ 7.847`
- `R$ 7.847 por R$ 4.708,20`

Contemplar o **mesmo campo na importação/cadastro em lote**. Sugestão
(não-obrigatória): quando o texto casar o padrão `X por Y`, aplicar
**destaque visual** — riscar o cheio, realçar o promocional. Se vier só um
preço, exibe normal.

**Estado atual (o que muda):**
- `packages/database/prisma/schema.prisma:82` — `price PriceTier` (enum).
- `packages/dtos/src/Products/product.dto.ts:22-27,50-51` — enum + `@IsEnum`.
- `apps/admin/.../CreateProductForm.tsx:260-276` — `<select>` Baixo/Médio/Alto.
- `apps/web/.../HighlightsSection.tsx:210`, `HeroSection.tsx:222-230` — render via `formatPriceTier()` (badge colorido).
- Import em lote: `apps/admin/.../importar/-lib/priceMapping.ts` (texto → enum) e `buildRows.ts:68`.

**Plano (cross-stack — área sensível, schema + dtos + apps):**
1. **Schema/migration** — adicionar campo de texto `priceText String?`
   (manter `PriceTier` por ora para não quebrar dados existentes; decidir
   depreciação depois). Migration idempotente (`ADD COLUMN IF NOT EXISTS`).
2. **DTO** — `priceText?: string` opcional, `@IsString` sem validação de
   formato; afrouxar obrigatoriedade do enum (`@IsOptional`).
3. **Admin form** — substituir o `<select>` por `<input type="text">` livre.
4. **Import em lote** — `priceMapping` passa a gravar o texto cru em
   `priceText` (sem converter pra enum); manter retrocompat.
5. **Web** — novo util `renderPrice(priceText)`: detecta `^(.*?)\s+por\s+(.*)$`
   (case-insensitive) → renderiza `<s>cheio</s> **promo**`; senão, texto puro.
   Fallback pro enum antigo quando `priceText` vazio (transição).
6. **Gates + e2e na UI** (Playwright): cadastrar produto com cada formato,
   conferir render idêntico no site; subir lote com preços e validar.

**Critério de aceite:** digito `R$ 7.847 por R$ 4.708,20` no admin (ou na
planilha de lote) → site mostra `R$ 7.847` riscado + `R$ 4.708,20` realçado;
digito `R$ 7.847` → site mostra exatamente isso; nenhum formato é rejeitado.

**Decisões do cliente (Q1–Q6) — TODAS fechadas (2026-06-29/30):**
1. **Q1 — Tiers $/$$/$$$ removidos.** Produtos atuais ficam **sem valor**
   ("Sob consulta"). Fallback do tier saiu de toda a UI (web + admin). ✅
2. **Q2 — Vazio → "Sob consulta" como CTA.** Produto sem `priceText` exibe
   "Sob consulta"; no **card de detalhe** virou **botão** que rola até os
   contatos da loja; na **listagem** o clique no card já abre o card de
   contato. Componente compartilhado `packages/ui/.../SobConsulta.tsx`. ✅
3. **Q3 — Auto-`R$`.** `withCurrency()` no `PriceText`: prefixa `R$ ` quando
   o trecho **começa com número** e ainda não tem R$; texto que começa com
   letra ("A partir de…") fica intacto. Aplica nos 2 lados do `por`. **Não
   reformata o número** (`7847` → `R$ 7847`, não `R$ 7.847`). ✅
4. **Q4 — Separador:** só `" por "`, ou valor direto. Texto livre (o cliente
   recusou por escrito a abordagem de campos estruturados). + **preview ao
   vivo no form do admin** mostrando como vai renderizar (mitiga erro de
   formato, já que o sistema não força o lojista). ✅
5. **Q5 — Cor do destaque:** `primary` do guia (`#003ba6`) nas telas claras;
   **branco** nas telas de fundo escuro (destaques/swiper) por legibilidade.
   (Cliente: "põe a primary, depois eu mudo se quiser".) ✅
6. **Q6 — Visibilidade do preço por produto: DESCARTADO.** A ideia era variar
   o que aparece por surface (ex.: home só o preço final, destaques o de/por).
   Cliente: **"morre por aqui"**. → de/por aparece **em todos os locais**
   (comportamento atual). **Não implementar.**

**Estado: ✅ implementado, validado e2e na UI e DEPLOYADO em `dev-deploy`
(GHCR) — 2026-06-30.** Validação: preview do admin (auto-R$ + de/por +
"✓ promoção"), `SobConsulta` botão no card de detalhe, listagem com o
componente. Gates: typecheck admin verde; web só com erro pré-existente
(websocket TS2742, build ignora); madge sem ciclo de Provider.

**Como a feature chegou no `dev`:** isolada da branch
`feat/frente11-item4-preco-texto-livre` via **cherry-pick** de 2 commits
(essa branch tem outras features **não pagas** — nunca pushar/mergear ela
inteira). Ajustes Q2–Q5 + auto-R$ feitos direto no `dev`.

**⚠️ Contradição do Excel do cliente (2026-06-30) — NÃO resolvida:**
o `.xlsx` que o cliente enviou para importar usa um **modelo estruturado**
(`Preço De` / `Preço Por` numéricos + `Unidade` m²/rolo/kit + `Forma de
Pagamento` + `Observações`) — ou seja, o **de/por estruturado** que ele
**recusou por escrito na Q4**, mais 2 conceitos novos (unidade, forma de
pagamento) que nenhuma resposta mencionou. **Decisão: seguir o combinado
(texto livre).** Consequências:
- Aquele `.xlsx` **não importa direto**: o import casaria a coluna `Preço`
  (tier "Baixo") como preço e **ignora** De/Por/Unidade/Forma de Pagamento.
- As **74 lojas** do arquivo **não batem** com os nomes cadastrados
  (`Avanti Tapetes`≠`Avanti`, `a.thebaldigaleria`≠`A Thebaldi Galeria`,
  `Abra Casa`≠`AbraCasa`…) → travariam no resolver.
- Para usar: reformatar o arquivo pro modelo **texto livre** (compor
  `"R$ 1.900 o m² por R$ 760 o m²"` na coluna Preço) — referência:
  `teste-importacao-preco.xlsx` (raiz). Ou revisitar o modelo estruturado
  como evolução (Opção 1: schema+migration+dtos+backends+admin+~10 telas).
- **Molde de import (`template.ts`)** já foi atualizado pro texto livre
  (exemplos de/por + aba Opções) nesta frente.

**Pendência adjacente (fora do escopo do item 4):** o **picker de campanhas**
(`CampaignProductPicker`) ainda roda no tier legado — filtro `$/$$/$$$` e
exibe "Sem Valor" pros produtos novos (que não têm tier). Só o type-error
foi corrigido (price nullable). Migrar o picker pro `priceText` é decisão de
produto à parte (texto livre não dá pra filtrar por faixa).

---

## Item 1 — Lojas em destaque só com produto cadastrado

**Pedido:** no destaque do topo (logo redondo + nome), exibir **apenas
lojas com ≥1 produto** cadastrado. Lojas sem produto somem do destaque, mas
**continuam cadastradas** no sistema com seus logos.

**Estado atual:** `apps/web/components/StoresSection.tsx:26` chama
`storeService.list({ page, limit: 20 })` — traz todas; sem filtro nem
contagem de produtos. Modelo `Store` não tem flag de destaque.

**Plano:**
1. Backend (`apps/stores` + gateway): param de filtro
   `?hasProducts=true` no `GET /stores` → `where: { products: { some: {} } }`
   (ou `_count.products > 0`). Área sensível (backend) — aviso e sigo.
2. Web: `StoresSection` passa o filtro. Nada some do admin/CRUD.

**Critério de aceite:** loja sem produto não aparece no carrossel do topo;
ao cadastrar o 1º produto, ela passa a aparecer; admin segue listando todas.

---

## Item 2 — Banner: remover fallback 2025, usar vídeo do template

**Pedido:** quando **não houver banner** configurado (desktop e/ou mobile),
**parar** de puxar o banner antigo da liquidação 2025 e exibir o **vídeo
padrão do template** (o vídeo da sala com sofá da 1ª entrega). Regra:
banner cadastrado → banner; sem banner → vídeo do template (nunca 2025).

**Estado atual:** o fallback hardcoded **É** a liquidação 2025 —
`HeroSection.tsx:14-17` aponta pra `MudaTudoCamapnhaWEB/MOBILE.mp4` +
`FUNDO.jpg`; e o título está fixo em `"Liquidação muda tudo"` (linha 51).
O vídeo da sala com sofá **não está mais** em
`apps/web/public/backgroundsHome/` (só sobraram os arquivos MudaTudo).

**⚠️ Dependência:** preciso recuperar o **vídeo da sala com sofá** da 1ª
entrega (asset original do template). Sem ele, não há o que colocar como
novo default. Pedir ao cliente/buscar no histórico da 1ª entrega.

**Plano:**
1. Adicionar o vídeo do template em `public/backgroundsHome/`.
2. Trocar `defaultDesktopVideo/defaultMobileVideo` para o vídeo do template.
3. Remover/limpar o título hardcoded "Liquidação muda tudo" (linha 51) —
   usar `homeTitleBold/Normal` das settings (já existem).
4. Decidir se removemos os arquivos `MudaTudo*` do repo.

**Critério de aceite:** sem banner nas settings → home exibe o vídeo do
template (sala/sofá); com banner → exibe o banner; nunca aparece o MudaTudo
2025 como fallback.

---

## Item 3 — Exclusão de produtos em massa

**Pedido:** na listagem de produtos do admin, **checkbox** por item +
**"selecionar todos"** + ação única de excluir selecionados, com
**confirmação** ("Você tem certeza que deseja excluir X produtos?").

**Estado atual:** `apps/admin/.../produtos/page.tsx` exclui 1 a 1 via
`deleteProduct(id)` + `ConfirmationCard`. Endpoint só `DELETE /:id`
(`apps/products/.../product.controller.ts:77-82`). Não há bulk delete.

**Plano:**
1. Backend (`apps/products` + gateway): `POST /products/bulk-delete`
   recebendo `{ ids: string[] }`; apagar imagens no storage junto (espelhar
   o delete individual). Área sensível (backend + storage) — aviso e sigo.
   DTO em `packages/dtos`.
2. Admin: estado de seleção na listagem (checkbox por linha + master
   "selecionar todos"), barra de ação com contador, `ConfirmationCard`
   reaproveitado com a contagem.

**Critério de aceite:** seleciono N produtos (ou todos), confirmo a
contagem, e some todos em uma ação; cancelar não apaga nada.

---

## Item 5 — Import em massa de lojas + logos (feature, igual produtos)

**Pedido:** uma subida em massa de **lojas**, nos mesmos moldes da de
**produtos** que já existe. Três cenários, na palavra do cliente — "injetar
lojas, ou logos, ou os 2 juntos":
- **Criar lojas em lote** (planilha de lojas → cadastra todas).
- **Só logos:** subir apenas as imagens no **padrão que ele já manda** —
  imagem nomeada com o **nome correto da loja** — e o sistema casa cada
  imagem à loja existente.
- **Os dois juntos:** criar as lojas e já anexar seus logos.

**Estado atual:**
- **Não existe** essa feature. Lojas hoje só por CRUD 1 a 1
  (`apps/admin/.../lojas/CreateStoreForm.tsx`).
- O `scripts/update-logos.mjs` foi **favor pontual** (não é a entrega) —
  mas **prova** a lógica de casar imagem↔loja por nome normalizado. Vira
  base/risco-reduzido pro modo "só logos".
- Já existe todo o **wizard de import de produtos** pra espelhar:
  `apps/admin/.../produtos/importar/` (MappingStep, PreviewStep,
  StoreResolutionPanel, ImagePickerPanel, ImportJobWidget, BulkStoreToolbar)
  + endpoint `POST /products/bulk`.
- Campos da loja (`schema.prisma:54-75`): `name, slug, address, phone, site,
  logoImage, bannerImage, facebook/instagram/youtube, whatsapp`.

**Plano (feature cross-stack — reusa muito do import de produtos):**
1. Backend (`apps/stores` + gateway): `POST /stores/bulk` (criar em lote) +
   fluxo de presigned URL pra logos (já existe no storage). DTO em
   `packages/dtos`. Área sensível (backend + storage) — aviso e sigo.
2. Admin: rota `lojas/importar` espelhando `produtos/importar` —
   parsing xlsx, mapping de colunas pros campos da loja, preview com
   semáforo, casamento imagem↔loja por nome (reusa a normalização do
   script), modo **"só imagens"** (sem planilha), job em background.
3. Reaproveitar componentes do import de produtos onde der (não duplicar).
4. Gates + e2e na UI (Playwright): testar os 3 modos (lojas / só logos /
   ambos).

**Critério de aceite:** consigo (a) subir uma planilha e criar várias lojas
de uma vez; (b) subir só uma pasta de imagens nomeadas pelo nome da loja e
ver cada logo casado à loja certa; (c) fazer os dois numa tacada. Casos sem
match aparecem no preview pra resolver/ignorar.

**Decisão pendente (cliente/nós):** definir as **colunas da planilha de
lojas** e o **padrão exato de nome de arquivo** do logo (mesma normalização
do script: sem acento, case-insensitive). Ver perguntas abaixo.

---

## Ordem sugerida de execução

1. **Item 4** (prioritário — destrava o recadastro em massa com preços).
2. **Item 5** (maior depois do 4; reusa o wizard de produtos — destrava o
   cadastro em massa de lojas/logos junto do recadastro).
3. **Item 1** + **Item 3** (frontends + endpoints, baixo risco).
4. **Item 2** (assim que o asset do vídeo do template estiver em mãos).

## Bloqueios / dependências

- **Item 2:** vídeo da sala com sofá (template, 1ª entrega) — **pendente
  de recuperar**.
- ~~**Item 4:** decisão sobre aposentar tiers~~ — ✅ resolvido (removidos).
- **Item 4 / import:** o `.xlsx` do cliente está em modelo estruturado
  (incompatível com o combinado texto livre) e com nomes de loja que não
  batem — precisa reformatar o arquivo OU revisitar o modelo estruturado.
- **Contrato:** cliente ofereceu enviar o contrato — conferir se há item
  fora destes 5 antes de fechar o escopo da frente.
