# Pendências — bloqueadas por decisão/estudo (nós + cliente)

> Itens levantados na reunião de 2026-06-17 (ver `04-backlog.md`) que **dependem
> de decisão ou estudo** da nossa parte e/ou do cliente. **Ficam fora do escopo
> de execução até acertarmos** — não são "a fazer" ainda. Quando destravados,
> promover a frente própria com plano.
> Criado em 2026-06-20.

| # | Item | Bloqueio (quem) | O que falta decidir/estudar |
|---|------|-----------------|------------------------------|
| B8 | Banners/peças de campanha em mais lugares do guia | nós (design) + cliente | onde e quantos slots no layout; padrão visual |
| B9 | Mapa do shopping (2D, posições editáveis no admin) | nós (estudo) + cliente (dados) | 2D simples vs 3D; planta/posições das lojas; editor no admin |
| B10 | Revista/PDF do guia para download | cliente (decisão) | dentro do guia vs site/TI; escopo do gerador |

---

## B8 — Banners / peças de campanha em mais lugares do guia

**Origem:** ata 00:14–00:15 — "ter mais lugares para banners e peças de campanha",
estilo e-commerce (chamadas entre as seções/colunas do guia).

**Estado atual:** existe só o banner de "Publicidades" (Settings, em
`personalizacao`). Não há slots extras no layout do guia.

**Bloqueio:** precisa **definir o design** e **onde** entram os banners (entre
linhas de produto? topo de seção? quantos?) — decisão de produto/cliente antes de
codar. Sem isso, codar agora gera retrabalho.

---

## B9 — Mapa do shopping (2D, posições editáveis no admin)

**Origem:** ata 00:10–00:12 e 00:28–00:29. Mapa para o usuário chegar até a loja;
posições das lojas **editáveis no admin** (obrigatório — loja muda de lugar).

**Estado atual:** não existe.

**Bloqueio / estudo:** decisão **2D simples vs 3D**; o cliente precisa fornecer a
**planta/posições** das lojas; e exige um **editor de posições no admin**. Foi
**explicitamente deferido na reunião** por prazo ("vamos deixar à parte, não vai
dar tempo"). Risco alto / estudo isolado.

---

## B10 — Revista/PDF do guia para download

**Origem:** ata 00:18–00:24. Landing "acesse o guia online ou baixe a revista
(PDF)"; PDF estilizado puxando o conteúdo atual (modelo de referência interno).

**Estado atual:** o Casa Shopping **já tem** a revista/PDF do lado deles.

**Bloqueio / decisão:** indecisão se isso fica **dentro do guia** ou **fora (site
do Casa Shopping / TI)** — Danilo inclinou-se a deixar fora, com um toggle de
ativar no admin apenas para apresentar. Definir antes de qualquer dev.

---

> **Não-pendências (a fazer agora):** B6 (responsividade do produto + "ler mais")
> e B7 (preview Open Graph no WhatsApp) estão no roadmap ativo `07-melhorias-camadas.md`.
> B5 (redesign do bloco da loja no modal) também fica no `07` — não é decisão,
> só aguarda o **Felipe entregar o visual novo (Figma)**.
