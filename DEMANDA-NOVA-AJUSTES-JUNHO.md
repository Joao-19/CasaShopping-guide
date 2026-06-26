# Demanda nova — Ajustes do cliente (junho/2026)

> Recebemos 5 pedidos de ajuste após as entregas da semana. Este documento
> separa **o que é demanda nova** (escopo que não estava no sprint anterior)
> do que **já foi entregue** ou é só **operacional**. Plano técnico detalhado
> em `roadmap/11-ajustes-cliente-junho.md`.
>
> Sprint anterior cobriu: **Upload em massa (produtos)**, **Páginas de
> Campanha**, **Área de Dados**, **Newsletter V2**, **Melhorias em camadas**,
> **Infra/Portainer**. Referência: `roadmap/completos/` e `roadmap/README.md`.

---

## ✅ Entra como DEMANDA NOVA (não estava no sprint anterior)

### 4. Campo de preço em **texto livre** (de/por) — ⭐ PRIORITÁRIO
Hoje o produto tem só um **preço qualitativo** (Baixo / Médio / Alto / Sob
consulta — herança do upload em massa). O pedido é diferente: um campo de
**texto livre com o valor em reais**, aceitando exatamente o que for digitado
(`R$ 7.847`, `R$ 7.847 por R$ 4.708,20`), exibido igual no site, e o mesmo
campo na importação em lote. **É mudança de contrato do campo de preço** —
toca banco, API, admin, site e importação. Não é ajuste cosmético.

### 1. Lojas em destaque só com **produto cadastrado**
Hoje o topo do site lista **todas** as lojas. O pedido é condicionar o
destaque a ter ≥1 produto. **Comportamento novo** — não existia filtro.

### 2. Banner da home: **remover o fallback da liquidação 2025**
Hoje, sem banner configurado, o site cai no **banner antigo da liquidação
2025** (está hardcoded no template). O pedido é trocar esse fallback pelo
**vídeo padrão do template** (sala com sofá, da 1ª entrega). **Mudança de
comportamento nova.** ⚠️ Depende de recuperarmos o vídeo do template.

### 3. **Exclusão de produtos em massa**
Hoje só dá pra excluir produto a produto. O pedido é checkbox + "selecionar
todos" + excluir em lote com confirmação. **Funcionalidade nova** — o sprint
anterior fez o upload/criação em massa, **não** a exclusão em massa.

### 5. **Import em massa de lojas + logos** (igual ao de produtos)
O sprint anterior fez import em massa **de produtos**. O cliente quer o
**equivalente para lojas**: criar lojas em lote por planilha, **ou** subir só
os logos (imagem nomeada com o nome da loja, no padrão que ele já manda),
**ou** os dois juntos. **Feature nova de dev** — reusa o wizard de produtos,
mas não existe pra loja. *(O script `update-logos.mjs` foi um favor pontual
pra resolver a leva atual; não é a entrega.)*

---

## 🟡 Adjacente ao sprint anterior, mas com escopo novo

- **Item 4** reaproveita a tubulação de preço criada no **upload em massa**,
  porém **redefine** o que aquele campo significa (de tier qualitativo →
  texto monetário). Conta como demanda nova, mas é bom o cliente saber que
  parte do trabalho **revisita** algo do sprint anterior.
- **Item 3** é o "par" do upload em massa (criar em lote ↔ excluir em lote);
  novo, mas na mesma família.

---

## Resumo para o cliente

| # | Pedido | Classificação | Esforço |
|---|--------|---------------|---------|
| 4 | Preço em texto livre (de/por) ⭐ | **Demanda nova** (prioritária) | ~2 dias |
| 5 | Import em massa de lojas + logos | **Demanda nova** (feature) | ~2–2,5 dias |
| 3 | Exclusão em massa | **Demanda nova** | ~1,5 dia |
| 1 | Destaque só com produto | **Demanda nova** | ~1 dia |
| 2 | Banner sem fallback 2025 | **Demanda nova** (+ asset pendente) | ~0,5 dia |

**Total de dev novo: ~7 dias úteis** (cabe em 1 sprint). Os 5 itens são
desenvolvimento; o que entra como cortesia/extra é o **deploy** (por minha
conta).

---

## Pontos a confirmar com o cliente

1. **Item 2:** precisamos do **vídeo da sala com sofá** (template da 1ª
   entrega). Vocês têm o arquivo, ou recuperamos no nosso histórico?
2. **Item 4:** os indicadores $/$$/$$$ (Baixo/Médio/Alto) **somem** ou
   ficam como opção? Sugestão: o preço-texto manda; os tiers viram legado.
3. **Contrato:** você ofereceu mandar o contrato — manda, pra eu conferir
   se há algo além destes 5 itens antes de fechar o escopo da frente.
