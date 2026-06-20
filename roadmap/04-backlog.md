# Backlog — Itens da reunião (a priorizar)

> ⚠️ **PROMOVIDO (2026-06-20):** os itens B1–B4 viraram a **[Frente 7](07-melhorias-camadas.md)**,
> com estado verificado contra o código, ordem definida (B1→B3→B2→B4) e planos de
> execução. **Siga o `07`** — este arquivo fica como registro histórico da reunião.
> Correções relevantes que o `07` aplica: a trava de 5 fotos (B1) **já estava
> pronta**; o molde do B4 é o **builder da newsletter (Frente 6)**, não o export antigo.

> Capturado da reunião de 2026-06-17 ("O que devemos fazer").
> Estimativas **preliminares** (dias úteis com IA) — a confirmar ao detalhar cada item.
> Ainda **sem ordem definida** dentro do backlog; entram após as Frentes 1–3.

## Alinhamento com o roadmap atual

- A **"Implementação Principal"** da reunião (seção **Páginas de Campanha**: + Criar →
  título + capa desktop + capa mobile + seleção de produtos → URL sugerida editável →
  layout fixo menu+banner+título+vitrine) **já é a [Frente 2](02-paginas-de-campanha.md)**
  e bate item a item. Nada novo a fazer aqui além do que já está planejado.

Os itens abaixo (bloco **"Outros"**) são **novos** e não estavam nas Frentes 1–3.

---

## B1 — Limites/validação de campos do produto

**Esforço prelim.:** ~0,5–1 dia · **Risco:** baixo

- Limite de **descrição até X caracteres** (definir X com o cliente).
- Limite de **até 5 fotos** por produto.

**Reaproveita:** form de produto e DTOs existentes. É validação no DTO
(`packages/dtos`) + feedback no form do admin + contador de caracteres.
**Novo:** definir o valor de X; aplicar trava no upload de imagens (hoje o modal já
faz swiper de N imagens — falta o teto no cadastro).

---

## B2 — Página pública por lojista (loja)

**Esforço prelim.:** ~2–3 dias · **Risco:** médio

Página do site com os produtos de uma loja: **banner + lista de produtos separada
por categoria + contato**. Ideia de design: **banner com a logo + contato
sobreposto** → *definir design antes de codar*.

**Reaproveita:** dados de loja já existem (logo, endereço, telefone, site, redes,
whatsapp — ver `StoreDetailsCard.tsx`); grid/vitrine de produtos
(`ProductShowcase`); padrão de rota pública.
**Novo:** rota pública por loja (ex.: `/loja/[slug]`), agrupamento de produtos
**por categoria**, banner do lojista (upload + design da sobreposição logo+contato).
**A definir:** design do banner; haverá upload de banner próprio da loja?

---

## B3 — Botão compartilhar no modal do produto

**Esforço prelim.:** ~0,5–1 dia · **Risco:** baixo

Botão de compartilhar no modal do produto que envia o **link do produto**.
Ao clicar: abrir popup escolhendo o meio (WhatsApp, etc.) **ou** acionar o
**compartilhamento nativo do aparelho** (Web Share API) e deixar o usuário escolher.

**Reaproveita:** modal já tem sistema de popup (`usePopup`/`showPopup`) e botão de
WhatsApp (`ProductDetailsCard.tsx`) — encaixa na barra de ações existente.
**Novo:** `navigator.share` com fallback para popup de opções (desktop/navegadores
sem suporte).

> ⚠️ **Dependência confirmada (2026-06-17):** **não existe URL direta do produto
> hoje** — o produto abre num **modal**, não há rota própria. Sem link, não há o
> que compartilhar. Então o B3 **inclui criar o deep-link do produto** primeiro:
> rota tipo `/produto/[id|slug]` (ou parâmetro `?produto=<id>` que abre o modal ao
> carregar). Isso **aumenta o escopo** do item para ~1–1,5 dia e o liga à
> existência de uma página/rota de produto. **Decidir:** rota dedicada (melhor p/
> SEO/preview) vs. query param que reabre o modal (mais barato).

---

## B4 — Cadastro de POPUPs no site (configurável)

**Esforço prelim.:** ~2–3 dias · **Risco:** médio

Área no admin pra cadastrar popups exibidos no site, com formato configurável:
**duração, botão, imagem** e visual personalizável.

### Abordagem definida (2026-06-17): portar a mecânica de "Personalização do Site"

Referência: `EXPORT_PERSONALIZACAO_NEWSLETTER.md` (spec da mecânica do RPG Worlds).
É um **mini-CMS caseiro**: tabela KV `system_config` (key → JSON) + **GET público**
(site lê) + **PATCH admin** (grava) + **upload via presigned URL**. O popup encaixa
direto nos padrões já descritos lá:
- **`AlphaNotice`** = modal de 1º acesso **versionado** (trocar `version` re-exibe
  pra quem já fechou; controle via `localStorage`).
- **`NewsletterAutoOpen`** = abre um modal na home após ~250ms.
- **`SystemNotifications`** = janela `startsAt`/`endsAt`, `repeatEveryHours`,
  `autoDismissSeconds` — modelo pronto pras regras de exibição/duração.

**Estado deste projeto (verificado):** já existe `personalizacao/page.tsx` com
**Tabs + `BannerUpload` + `useImageUpload` (presigned MinIO)** — mas sobre um
modelo **fixo** (`useSettings`), **não** o KV genérico `system_config` do export.
Ou seja: os blocos de UI existem; falta a mecânica KV (ou estender o Settings fixo).

**Decisão de arquitetura a tomar:**
- [ ] **Portar o KV `system_config`** (flexível: lista de popups via CRUD/JSON, sem
      migration por campo novo — recomendado pela spec) **OU**
- [ ] **Estender o `Settings` fixo atual** (mais simples, mas cada campo novo = migration).

**Novo (independe da rota acima):** aba/seção "Popups" no admin; renderização
condicional no site com controle de frequência; aplicar **Zod** no read/write
(melhoria recomendada na §7 do export sobre a sanitização manual do original).

### "Duração" e disparo — resolvido pelo modelo do export

- **Duração:** o export cobre os dois sentidos — `intervalMs`/`autoDismissSeconds`
  (tempo na tela) e `startsAt`/`endsAt` (janela de campanha por datas). Adotar
  **ambos** no schema do popup.
- **Disparo/frequência:** seguir o padrão `AlphaNotice` (1x por versão via
  `localStorage`) + `repeatEveryHours` do `SystemNotifications` para "não repetir
  na mesma sessão / repetir a cada X horas".

---

## Revisão completa da ata (2026-06-20) — itens que o resumo inicial não pegou

> Releitura da transcrição inteira (`reuniao-2026-06-17.pdf`, 31min). O núcleo
> (B1–B4 + upload em massa + área de dados) está coberto. Abaixo, o que apareceu
> na reunião e **não** estava nas frentes — gaps e itens deferidos.

### B5 — Redesign do bloco da loja no modal do produto (tem Figma)
**Risco:** baixo · **Não planejado.**
Na reunião (00:09–00:10): ao clicar no produto → ver a loja, o bloco "ligar/loja"
"tá pobre" e "estranho"; pediram **visual novo** e disseram ter **um bloco pronto
no Figma** de como deve se comportar. É o `StoreDetailsCard` (web) — **distinto da
B2** (página da loja). Precisa do print/Figma do Felipe para fidelidade.

### B6 — Responsividade do card/modal do produto + "ler mais"
**Risco:** baixo · **Parcial (B1 fez só o limite).**
Item de abertura (00:03): **descrição e imagem cortadas**, "tornar responsivo",
e talvez um **"ler mais"**. A B1 resolveu o limite de caracteres; falta revisar o
corte da imagem/descrição no modal e avaliar "ler mais".

### B7 — Preview rico no WhatsApp (Open Graph) do link compartilhado
**Risco:** médio · **Parcial (B3 fez o link, não o preview).**
Na reunião (00:12–00:13) o pedido explícito do compartilhar inclui **"aquele
cardzinho com previewzinho"** no WhatsApp. A B3 entrega o deep-link, mas a página
`/produto/[id]` é client-side e **não gera Open Graph** (og:title/og:image) — o
WhatsApp mostra link "pelado". Exige metadata server-side (`generateMetadata` em
server component, ou rota/SSR dedicada).

### B8 — Banners / peças de campanha em mais lugares do guia
**Risco:** baixo · **Parcial.**
Na reunião (00:14–00:15): "ter mais lugares para banners e peças de campanha",
estilo e-commerce (banners de chamada entre as seções/colunas do guia). Hoje só
existe o banner de "Publicidades" (Settings). Falta os pontos extras no layout.

### B9 — Mapa do shopping (2D, posições editáveis no admin) — DEFERIDO
**Risco:** alto · **Deferido na própria reunião** (00:10–00:12, 00:28–00:29).
Mapa 2D pra chegar até a loja; posições das lojas **editáveis no admin**
(obrigatório, loja muda de lugar). Decisão: **fora do escopo agora** (prazo).
Registrado pra não se perder.

### B10 — Revista/PDF do guia para download — DEFERIDO/EXTERNO
**Risco:** médio · **Deferido** (00:18–00:24).
Landing "acesse o guia online ou baixe a revista (PDF)"; gerar PDF estilizado
puxando o conteúdo atual (modelo wePlanner). Conclusão: provavelmente **fora do
guia** (site do Casa Shopping / TI), com toggle de ativar no admin. Futuro.

### Observações
- **B4 (popup):** o dono fechou como **atendido pela Newsletter (Frente 6)**.
  A reunião pedia também **agendar por data** e **redirecionar p/ guias
  específicos** (ex.: guia da Copa) — a newsletter não tem janela por data; só
  promover se necessário.
- **Prazo da reunião:** entregar o grosso até **24/06/2026** (4 dias após hoje).
- **Bug de dado:** loja sem logo aparecia "vazia" no modal — é preenchimento de
  cadastro, não dev.

## Próximo passo

Núcleo (B1–B3) entregue e validado; B4 atendido pela newsletter. **Decidir** se
B5 (redesign loja, tem Figma), B6 (responsividade produto) e B7 (OG no WhatsApp)
entram já — são baratos e foram pedidos com ênfase. B8 baixo custo. B9/B10 ficam
deferidos como combinado na reunião.
