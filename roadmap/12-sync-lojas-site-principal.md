# Frente 12 — Pedidos do cliente (jul/2026): cadastro + sync de lojas

> **Investigação/planejamento** (2026-07-02, modo Developer). Nenhum
> código escrito ainda. Reúne os 3 pedidos do cliente para finalizar a
> entrega do Guia. Itens 1 e 2 mexem no **cadastro** (`apps/web`); item
> 3 é a **sincronização de lojas** com `casashopping.com`.

## Mensagem do cliente (verbatim)

> Oi Felipe, por favor, precisamos finalizar junto ao cliente a entrega
> do guia.
>
> **1 - Política de privacidade:** Formulário de cadastro: incluir
> "aceite" de política de privacidade — *"Li e concordo com os termos
> descritos na Política de Privacidade do CasaShopping."* Linkado para
> https://www.casashopping.com/politicadeprivacidade/
>
> **2 - Cadastro:** Formulário de cadastro: incluir os campos — Cidade,
> Bairro e Data de Nascimento.
>
> **3 - Contato das lojas:** O padrão de contatos das lojas é o mesmo do
> site oficial. É possível deixar alinhado para os dois sites terem as
> mesmas infos de lojas?

---

## Item 1 — Aceite da Política de Privacidade no cadastro

**Pedido:** checkbox de aceite no form de cadastro, com o texto exato
*"Li e concordo com os termos descritos na Política de Privacidade do
CasaShopping."*, linkando "Política de Privacidade" para
`https://www.casashopping.com/politicadeprivacidade/` (abrir em nova
aba).

**Onde mexe:**
- `apps/web/app/(auth)/register/page.tsx` — o form. Adicionar checkbox
  `required` **antes** do botão "Criar conta"; bloquear submit se não
  marcado (via `useValidator`/`useFormField`, padrão que já está no
  arquivo).

**Decisão pendente (LGPD):** só a checkbox resolve a UI, mas para ter
**prova de consentimento** o ideal é gravar `privacyAcceptedAt`
(timestamp) no `User`. Isso é **migration** (área sensível — ver
ressalvas). Alternativa mínima sem migration: só validar no front e não
persistir. Recomendo persistir (LGPD), mas depende de aval.

**Esforço:** ~2h só front; ~0,5 dia se persistir (schema + dto + auth
service).

## Item 2 — Novos campos no cadastro (Cidade, Bairro, Data de Nascimento) + CEP automático

**Pedido:** adicionar Cidade, Bairro e Data de Nascimento ao cadastro.
Endereço/CEP: o cliente quer o **CEP preenchendo cidade/bairro
automaticamente** — precisamos de uma API gratuita de busca de CEP.

**API de CEP — recomendação: ViaCEP.**
- `https://viacep.com.br/ws/{cep}/json/` → retorna `logradouro`,
  `bairro`, `localidade` (cidade), `uf`. **Grátis, sem chave, sem auth.**
- Fluxo: usuário digita o CEP → ao completar 8 dígitos, chamada client-
  side → autofill de Cidade/Bairro (editáveis depois).
- **Ressalva ViaCEP:** bloqueia IP em "acesso massivo por script". Para
  uso real (1 request por cadastro) é tranquilo; **não** usar para
  varredura. Fallback: [BrasilAPI](https://brasilapi.com.br/api/cep/v2/{cep})
  ou o pacote `cep-promise` (tenta Correios/ViaCEP/BrasilAPI em cascata).
- **Não** precisa de backend nosso — chamada direta do browser.

**Onde mexe (cross-stack — área sensível):**
- `packages/database/prisma/schema.prisma` → `model User`: adicionar
  `city String?`, `neighborhood String?`, `birthDate DateTime?` (e
  `privacyAcceptedAt DateTime?` se decidido no item 1). **Migration**
  idempotente.
- `packages/dtos/**` → DTO de registro (campos opcionais/aditivos).
- `apps/auth/**` (serviço de registro) → aceitar e persistir os campos.
- `apps/web/composable/login/useRegister.ts` e
  `apps/web/Services/http/auth.http.ts` → enviar os novos campos.
- `apps/web/app/(auth)/register/page.tsx` → inputs de CEP (dispara
  ViaCEP), Cidade, Bairro, Data de Nascimento (`type="date"`).

> Hoje o `model User` só tem `name, email, phone, password,
> profileImage`. Todos os campos novos são **aditivos** (nullable) — não
> quebram dados nem cadastros existentes.

**Esforço:** ~1–1,5 dia (migration + dtos + auth service + api-client +
form + ViaCEP + teste e2e do cadastro).

## Item 3 — Contato/infos das lojas alinhadas com o site oficial

> Esta é a investigação de sincronização com `casashopping.com`. É o que
> o cliente chama de "deixar alinhado os dois sites".
>
> **Decisão atual: seguir de B (integração de verdade).** O scraper (A)
> fica desenhado como plano B técnico, **não implementado** até decisão.

### Não existe API pública/livre
`casashopping.com` é **ASP clássico, 100% server-rendered**. Não há API
REST/JSON, GraphQL, `__NEXT_DATA__` nem microdata por loja — o
"endpoint" é a própria página HTML. Não temos acesso ao banco nem
credencial deles. Logo: ou **raspar HTML** (gambiarra) ou **integração
negociada** (o certo).

### O HTML é previsível (se formos de scraper)
- **Listagem:** `GET /lojas/index.asp?pg=N&palavra=&ordenacao=&categoria=`
  — paginação por offset (`pg=0,20,40…`, 20/página); cada card traz
  **nome, categoria, bloco, telefone**.
- **Detalhe:** `GET /loja/?/{ID}/{slug}/` (ex.:
  `https://www.casashopping.com/loja/?/419/a.thebaldigaleria/`) —
  confirmado pelo cliente que traz **endereço, site e instagram** (+
  whatsapp, horário, bloco/loja). O **`{ID}` numérico deles é estável**
  → melhor chave de dedupe/idempotência.
- Processo é **lento** (1 request/loja no detalhe, ~74 lojas), mas dá
  pra atualizar tudo numa passada.

### Mapeamento com a nossa `Store`
(`packages/database/prisma/schema.prisma` → `model Store`)

| Nosso campo      | Fonte no site principal            | Status |
|------------------|------------------------------------|--------|
| `name`           | listagem                           | ✅ |
| `slug`           | do link `/loja/?/{ID}/{slug}/`     | ✅ |
| `address`        | detalhe                            | ✅ |
| `phone`          | listagem                           | ✅ |
| `whatsapp`       | detalhe                            | ✅ |
| `site`           | detalhe                            | ✅ |
| `instagramLink`  | detalhe (handle → montar URL)      | ⚠️ montar URL do @ |
| `facebookLink`   | —                                  | ❌ só a conta do shopping |
| `youtubeLink`    | —                                  | ❌ idem |
| `logoImage`      | —                                  | ❌ não confiável; via `update-logos.mjs` |
| `bannerImage`    | —                                  | ❌ não vem |
| categoria/bloco  | listagem/detalhe                   | ❌ **sem coluna** no schema hoje |

### Opções (item 3)
> **Em aberto:** o item 3 pode dar suporte a **um** desses caminhos ou a
> **mais de um** (ex.: Excel como operação manual do dia a dia +
> integração de verdade quando o cliente destravar). Definir com o
> cliente.

- **A — Scraper `dry-run`** (plano B): raspa listagem → detalhe por ID →
  casa com a nossa base por ID/nome normalizado → gera diff → aplica via
  gateway só após OK. Padrão dos scripts existentes
  (`update-precos.mjs`/`update-logos.mjs`). ~1–1,5 dia. **Não
  implementar sem decisão** — é dívida de manutenção contínua.
- **B — Integração de verdade (recomendado):** pedir ao cliente (b1)
  acesso de **leitura ao banco** deles ou (b2) **webhook/reflect no
  create/update** deles → nosso endpoint. Elimina fragilidade e joga a
  qualidade do dado pra origem.
- **C — Manter manual** até (B) destravar.
- **D — Import por Excel (upsert)** *(nova ideia — a avaliar):* o cliente
  sobe uma planilha de lojas; o que **não existe é criado**, o que **já
  existe é atualizado** (casando por ID/slug/nome normalizado). Reaproveita
  o padrão do **upload em massa** que já temos (`completos/01-upload-em-massa.md`).
  Vantagens: controle total do cliente sobre o dado, sem fragilidade de
  scraping, sem depender do banco/webhook deles. Custo: alguém precisa
  manter a planilha. Pode conviver com A ou B. Esforço estimado: ~1–1,5
  dia (parser de planilha + endpoint upsert + tela de upload/preview +
  dry-run). **A avaliar / não implementar sem decisão.**

---

## Ressalvas gerais (ler antes de implementar qualquer coisa)

1. **Migration = área sensível.** Itens 1 (se persistir consentimento) e
   2 tocam `schema.prisma` + `packages/dtos` + `apps/auth` — mudança
   cross-service. Rodar migration local antes de commitar, `IF NOT
   EXISTS`/campos nullable, e testar cadastro e2e.
2. **Item 3 é frágil por natureza** (scraping de ASP legado). Se um dia
   for de A: `--dry-run` obrigatório + revisão humana antes de escrever.
3. **Qualidade de dado da origem é duvidosa** (dev-deploy já mostrou
   "dados sujos"). Sync cego suja a nossa base — diffing por campo +
   aprovação, nunca sobrescrita automática. Não sobrescrever redes/logo
   que já temos com vazio.
4. **ViaCEP tem rate-limit anti-scraping** — ok para 1 request/cadastro,
   não para varredura.
5. **Números do item 3 vieram do resumidor do WebFetch** — para
   construir o parser de verdade, inspecionar o HTML cru (seletores).
6. **Legal/ToS** — raspar site de terceiro (mesmo do cliente) pede aval
   por escrito de que pode.

## Próximos passos

- **Itens 1 e 2:** implementáveis já (front + migration aditiva). Definir
  com o cliente/Felipe se grava `privacyAcceptedAt` (LGPD) e confirmar o
  texto/link exatos. Depois: schema → dtos → auth → api-client → form.
- **Item 3:** seguir de **B** — pauta com o cliente pedindo acesso de
  leitura ao banco **ou** webhook no cadastro deles. Em paralelo, avaliar
  **D (import por Excel, upsert)** como operação manual robusta que não
  depende do cliente — pode ser a entrega principal do item 3 ou conviver
  com A/B. Se B travar e ficar urgente, reavaliar **A** com as ressalvas.

**Fontes CEP:** [ViaCEP](https://viacep.com.br/) ·
[BrasilAPI](https://brasilapi.com.br/) ·
[cep-promise](https://github.com/BrasilAPI/cep-promise)
