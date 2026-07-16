# Frente 14 — Sessão em httpOnly (fechar exfiltração por XSS)

**Esforço:** ~4–6 dias úteis (com IA) · **Risco:** alto
**Criada:** 2026-07-15 · **Estado:** planejada, não iniciada
**Pré-requisito de:** qualquer integração de API com terceiro (ver
`15-*` / conversa do dashboard Lovable, se vier a existir)

## Objetivo

Tirar os tokens de sessão do alcance do JavaScript, migrando a
autenticação de **Bearer header lido de storage client-side** para
**cookie `httpOnly`**.

## Por que agora

Dois fatos novos de 2026-07-15 subiram a prioridade de uma dívida antiga:

1. O admin passou a ser **embedado em iframe** no dashboard externo
   (Lovable) — ver commit `cfecb1d`. O painel agora vive dentro de uma
   página de terceiro.
2. Existe pedido em cima da mesa pra **abrir a API** pro dashboard
   deles. Isso não fica confortável com a sessão no formato atual (ver
   "Interação com CORS" abaixo).

## O ganho concreto (o que muda no dia do incidente)

**Hoje:** os tokens são legíveis por JS. Um XSS no painel faz
`document.cookie`, exfiltra o `refreshToken` (7 dias de validade), e o
atacante roda o ciclo de refresh **indefinidamente** — cada refresh
devolve um `refreshToken` novo (`gateway.controller.ts:116-121`). Logout
da vítima não invalida nada: o token dele é independente. Não há como
detectar nem revogar sem rotacionar o `JWT_SECRET`, o que derruba todos
os usuários.

> Resultado: **um XSS = chave de admin permanente, na máquina do
> atacante, silenciosa.**

**Depois:** o JS não lê o cookie. O XSS continua existindo e ainda
consegue fazer requisições *dentro do navegador da vítima, enquanto a
aba está aberta* — mas não consegue **extrair credencial nenhuma**.
Fechou a aba, acabou.

> Resultado: **sequestro temporário de sessão em vez de cópia permanente
> da chave.** É a diferença entre um incidente que termina sozinho e um
> que você nunca descobre.

Ganho secundário: mata os **dois sistemas paralelos de token** que
existem hoje (ver mapa), incluindo a coincidência de nomenclatura que
hoje protege o `/auth/refresh` **por acidente** (ver Gotcha 3).

## Mapa do estado atual (verificado em 2026-07-15)

Existem hoje **três** esquemas de token convivendo:

| Onde | Como guarda | Quem lê | httpOnly? |
|---|---|---|---|
| **admin** | js-cookie: `token`, `accessToken`, `refreshToken`, `tokens` | `Services/http/index.ts:52-54` → Bearer | ❌ não |
| **web** | localStorage: `accessToken`, `refreshToken` | `apps/web/Services/http/index.ts` → Bearer | ❌ n/a |
| **gateway** | cookie httpOnly: `access_token`, `refresh_token` | **quase ninguém** | ✅ sim |

Arquivos-chave:

- `apps/admin/composable/login/useLogin.ts:29-35` — grava no login.
- `apps/admin/Services/http/index.ts:36-48` (`persistTokens`) — grava no
  refresh.
- `apps/admin/Services/http/cookie-options.ts` — atributos (`SameSite=None`
  sob HTTPS). **Criado na Frente do iframe; ler o comentário dele antes
  de mexer.**
- `apps/admin/composable/auth/useSessionRefresh.ts:23-35,68` — decodifica
  o JWT **no client** pra agendar refresh 60s antes do `exp`.
- `apps/admin/middleware.ts:28-31` — lê `token`/`accessToken` (server-side).
- `apps/web/composable/login/useLogin.ts:16-19` — grava em localStorage.
- `apps/web/store/auth.store.ts:61,74,80-85` — limpa localStorage + tenta
  limpar `access_token`.
- `packages/api-client/src/client.ts:52-63` — o interceptor que injeta
  `Authorization: Bearer` a partir do `getToken()`.
- `packages/auth-guard/src/jwt.strategy.ts:10` — **só aceita Bearer**
  (`ExtractJwt.fromAuthHeaderAsBearerToken()`), sem fallback de cookie.
- `apps/api-gateway/src/controllers/gateway.controller.ts:34-46,61-76,109-121`
  — já grava os cookies httpOnly (hoje praticamente inertes).

## Design alvo

1. **Transporte da sessão = cookie httpOnly**, gravado pelo gateway (que
   já faz isso). O client para de tocar em token.
2. **`jwt.strategy.ts` passa a extrair de cookie**, com fallback pro
   Bearer durante a transição (`ExtractJwt.fromExtractors([...])`).
3. **`/auth/refresh` para de devolver token no body** — vira só
   `Set-Cookie` + dados do usuário. Ver Gotcha 3.
4. **`api-client` para de injetar Bearer** para os apps migrados;
   `withCredentials: true` (já está) passa a ser o mecanismo.
5. **CSRF ganha defesa explícita** — ver Gotcha 2.

## Decisões que precisam ser tomadas ANTES de codar

> ⚠️ **Não comece sem resolver estas quatro.** Cada uma muda o desenho.

### D1 — Escopo: admin só, ou admin + web?

O admin é o privilegiado (é a chave do reino) e é o que está embedado.
O web tem o mesmo furo, mas o dano de um token de usuário final é bem
menor.

- **Recomendação:** fazer **admin primeiro** e web numa segunda rodada.
  Reduz o raio de explosão e permite validar o desenho no menor dos dois.
- Consequência: `api-client` precisa suportar **os dois modos**
  simultaneamente durante a transição (o `getToken` opcional já permite
  isso — basta o admin parar de passar `getToken`).

### D2 — Colisão de cookie entre web e admin

Ambos rodam em `guiadecompras.casashopping.com` e o gateway grava cookie
em `path="/"`. Se os dois usarem `access_token`, **um sobrescreve o
outro** — uma pessoa logada no site e no painel no mesmo browser derruba
a própria sessão.

Hoje isso não acontece só porque os cookies do gateway estão inertes.
**Migrar os desperta.**

- Opções: (a) nomes distintos (`admin_access_token` × `access_token`) com
  o gateway/strategy escolhendo por rota; (b) domínios separados pro
  admin; (c) aceitar sessão única compartilhada.
- **Recomendação:** (a). Path scoping **não** resolve — a API vive em
  `/api` e precisa receber o cookie dos dois.

### D3 — `SameSite` dos cookies do gateway

O iframe **exige** `SameSite=None`. Os cookies do gateway hoje são
`sameSite: "lax"` (`gateway.controller.ts:37`).

- Se o admin migrar pros cookies do gateway, eles **precisam** virar
  `None` — senão o embed quebra e a Frente do iframe é desfeita.
- Mas `None` no cookie do **web** é degradação sem ganho (o web não é
  embedado). Reforça a D2 (nomes distintos → atributos distintos).

### D4 — Como agendar o refresh sem ler o JWT

`useSessionRefresh` decodifica o `exp` no client. Com `httpOnly` isso
morre.

- Opções: (a) cookie **não-sensível** só com o timestamp de expiração
  (não é credencial, pode ser legível); (b) refresh reativo no 401 (o
  interceptor já faz — mas navegação pura não dispara XHR, que foi
  exatamente o bug que o `useSessionRefresh` nasceu pra corrigir — ler o
  comentário dele em `useSessionRefresh.ts:7-18`); (c) endpoint
  `/auth/me` que devolve validade.
- **Recomendação:** (a). É o menor delta e preserva o motivo original do
  hook.

## Plano de execução

### Fase 0 — Decisões (0,5 dia)
Fechar D1–D4. Registrar as respostas **neste arquivo** antes de abrir
código.

### Fase 1 — Backend aceita cookie (1 dia) · ÁREA SENSÍVEL
- `jwt.strategy.ts`: `ExtractJwt.fromExtractors([cookieExtractor,
  fromAuthHeaderAsBearerToken()])`. Bearer continua valendo → **nada
  quebra**, é aditivo.
- `gateway.controller.ts`: aplicar os atributos decididos em D2/D3.
- Gateway precisa de `cookie-parser` — **verificar se já está**
  (`refresh` usa `req.cookies` em `gateway.controller.ts:96`, então
  provavelmente sim).
- ✅ **Gate:** com Bearer ainda funcionando, admin e web seguem
  operando sem nenhuma mudança de front. Deployável sozinho.

### Fase 2 — Admin migra para cookie (1,5 dia)
- `useLogin.ts` + `persistTokens`: parar de gravar token; o gateway já
  manda `Set-Cookie`.
- `Services/http/index.ts`: remover `getToken`/`getRefreshToken`
  (o `api-client` só injeta Bearer se `getToken` existir —
  `client.ts:52`, então remover basta).
- `middleware.ts`: ler o novo nome de cookie (server-side lê httpOnly
  normalmente — **não precisa de workaround**).
- `useSessionRefresh`: aplicar a decisão D4.
- Apagar `cookie-options.ts` **só quando** nada mais gravar cookie no
  client.

### Fase 3 — CSRF (1 dia) · ver Gotcha 2
Implementar a defesa escolhida. **Não pular** — sem isso a Fase 2 é uma
troca de um problema por outro.

### Fase 4 — `/auth/refresh` para de vazar token no body (0,5 dia)
Ver Gotcha 3. Só depois que nada mais consumir o token do body.

### Fase 5 — Web (1–2 dias, opcional / segunda rodada)
Mesmo desenho, saindo do localStorage.

## Gotchas (leia antes de codar)

### Gotcha 1 — Não quebrar o iframe
A Frente do iframe (commit `cfecb1d`) depende de `SameSite=None; Secure`
e do `frame-ancestors` em `apps/admin/next.config.js`. Qualquer mudança
de cookie **precisa** rodar o teste de embed cross-site de novo (ver
"Como validar"). Se o cookie voltar a `Lax`, o login "some" dentro do
iframe — que foi exatamente o bug que a Frente resolveu.

### Gotcha 2 — CSRF volta pra mesa
Hoje o Bearer protege de CSRF **de graça**: uma requisição forjada de
outro site não carrega o header. Cookie httpOnly é anexado
**automaticamente** pelo browser — ainda mais com `SameSite=None`.

Sem defesa, migrar para cookie **troca XSS-exfiltração por CSRF**. Não é
um bom negócio sozinho. Opções: token CSRF (double-submit), header
custom obrigatório (força preflight CORS), ou apoiar-se no allowlist de
CORS — mas **avaliar de verdade**, não presumir.

### Gotcha 3 — A proteção atual do `/auth/refresh` é ACIDENTAL
`POST /auth/refresh` (`gateway.controller.ts:96`) lê
`cookies["refresh_token"]` e devolve `accessToken`/`refreshToken` **no
corpo da resposta**.

Hoje isso não é explorável cross-site por uma coincidência: o cookie
`refresh_token` (snake, do gateway) é `Lax`, e o `refreshToken` (camel,
do js-cookie) — que é `None` e viaja — tem **nome diferente**, então o
endpoint não o encontra.

**Isso não é uma fronteira desenhada. É sorte.** No minuto em que o
cookie do gateway virar `None` (D3), o endpoint passa a ser alcançável
cross-site. Se o CORS permitir a origem, é **takeover de admin**: a
página chama `/auth/refresh` com `credentials:'include'` e lê o token do
body.

→ Por isso a Fase 4 existe. Quando o cookie é o transporte, **o body não
deve conter token nenhum**.

### Gotcha 4 — `api-client` e `auth-guard` são contrato compartilhado
`packages/api-client` serve web + admin; `packages/auth-guard` serve
todos os microserviços. Mudança ali é cross-service — rodar os gates dos
dois apps e de todos os serviços.

### Gotcha 5 — Interação com CORS
`enableCors({ credentials: true })` já é global
(`apps/api-gateway/src/main.ts:47-58`), com allowlist por `CORS_ORIGIN`.
Depois desta frente, o allowlist vira ainda mais crítico — é o que
decide quem consegue *usar* o cookie. **Não** adicionar origem externa
lá sem token de serviço escopado. Ver memória `cors-origin-iframe-lovable`.

## Critérios de aceite

1. `document.cookie` no console do admin logado **não** mostra
   `token`/`accessToken`/`refreshToken`.
2. Nenhum `localStorage` com token no admin.
3. Login, navegação, refresh automático (passar dos 15min de TTL do
   access) e logout funcionam.
4. **Iframe cross-site continua funcionando** — login gruda, navegação
   pra rota protegida não cai no `/login`.
5. Origem não autorizada continua bloqueada pelo `frame-ancestors`.
6. `/auth/refresh` não devolve token no body.
7. Requisição cross-site forjada (sem o mecanismo CSRF) é **rejeitada**.
8. Site público segue funcionando (se web não migrou, o Bearer dele
   continua válido via fallback da Fase 1).

## Como validar

Não confiar em gate verde — **testar na UI**, incluindo o cenário
cross-site. Receita que funcionou em 2026-07-15 (Playwright,
`browser_run_code_unsafe`):

```js
// Serve uma pagina falsa NA ORIGEM da Lovable via page.route() e embeda
// o admin num iframe. O browser avalia frame-ancestors/SameSite contra a
// origem real do documento pai — testa o header de verdade, sem precisar
// da Lovable.
await page.route('https://casashopping-dashboard.lovable.app/**', r =>
  r.fulfill({ contentType: 'text/html', body:
    `<iframe src="https://<host>/admin/login/" width="1100" height="700"></iframe>` }));
await page.goto('https://casashopping-dashboard.lovable.app/dash');
// login dentro do iframe -> navegar pra /admin/DashBoard/lojas/ -> nao pode cair no /login
// depois: page.context().cookies() para conferir sameSite/secure/httpOnly
```

Ambiente: **dev-deploy (loopera)** — precisa de HTTPS, porque o ramo
`SameSite=None` só executa sob HTTPS (em `http://localhost` o fallback é
`Lax` e o teste passa por engano). Credenciais em `dev-deploy-loopera`.

## Notas

- **Nenhuma migration.** Nada disso toca schema.
- Áreas sensíveis tocadas: `apps/api-gateway/**`, `packages/auth-guard/**`,
  `packages/api-client/**` — avisar impacto e seguir (modo Developer).
- Estimativa revisada de 2–3 → **4–6 dias** ao descobrir que (a) o
  backend não aceita cookie de jeito nenhum hoje
  (`jwt.strategy.ts:10`), (b) web e admin usam esquemas diferentes, e (c)
  CSRF precisa de trabalho próprio.
