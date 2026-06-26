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
| 4 | **Preço em texto livre (de/por)** ⭐ | Existe só enum qualitativo `PriceTier` (Baixo/Médio/Alto/Sob consulta) | **Sim** — muda contrato do campo | ~2 dias | médio (migration + cross-stack) |
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

**Decisões do cliente (2026-06-26) — fechadas:**
1. **Tiers $/$$/$$$ removidos.** Produtos atuais ficam **sem valor**. O
   fallback do tier saiu de toda a UI (web + admin).
2. **Vazio → "Sob consulta".** Produto sem `priceText` exibe "Sob consulta"
   (o card do produto já leva às formas de contato da loja). ✅ implementado.
3. **Separador:** só `por`, ou valor direto (sem de/por). ✅ é exatamente isso.

**Estado: ✅ implementado e validado e2e (admin cadastro/edição + 3
renders no site: de/por, único, "Sob consulta").** Falta só: import em lote
testado com `.xlsx` real (lógica pronta) e os 2 itens abaixo.

**Pendências menores (confirmar com cliente):**
- **Auto-`R$`** (resposta 3): se o texto não tiver `R$`, acrescentar
  automaticamente? Cliente "acha melhor se der; senão seguimos padrão de
  digitar". Opcional — baixo esforço, mas tem casos de borda ("a partir
  de…"). Decidir se vale.
- **Visibilidade do preço por produto** (resposta 6): opção de escolher se o
  preço aparece **na home** ou **só no card do produto**. Cliente: "temos que
  avaliar". → vira sub-item de config por produto (flag), fora do escopo
  imediato do item 4.

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
- **Item 4:** decisão sobre aposentar ou não os tiers $/$$/$$$.
- **Contrato:** cliente ofereceu enviar o contrato — conferir se há item
  fora destes 5 antes de fechar o escopo da frente.
