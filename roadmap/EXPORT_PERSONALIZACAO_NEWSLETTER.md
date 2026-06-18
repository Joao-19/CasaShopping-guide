# Mecânica de "Personalização do Site" (Admin sem deploy) — Especificação técnica para porte

> ## ✅ STATUS NO CASASHOPPING (branch `feat/newsletter-carousel`, 2026-06-17)
> Carrossel de Newsletter **implementado**, adaptado ao padrão do projeto
> (não usa o KV+JSON do doc):
> - **Dados:** model relacional `NewsletterSlide` (uma linha = um slide,
>   `order` = ordem) + flags globais no `Settings` singleton
>   (`newsletterEnabled/Autoplay/IntervalMs`). Migration idempotente em
>   `20260617120000_add_newsletter_carousel`.
> - **Backend (api-gateway):** `GET /newsletter` (público) + `PUT /newsletter`
>   (admin, estratégia replace dos slides), reusa extractKey/transformToUrl do
>   storage e o `useImageUpload`/presigned existentes.
> - **Admin:** aba "Newsletter" em `/DashBoard/personalizacao`
>   (`NewsletterManager` + `SlideEditor`).
> - **Web:** `NewsletterCarouselModal` — **modal auto-open na home** (Embla,
>   1x por sessão), em vez de seção inline.
> - **Pendências:** (1) aplicar a migration no banco (requer OK); (2) escritas
>   de admin (settings/newsletter/storage) seguem sem auth-guard — follow-up de
>   segurança; (3) `NewsletterSection.tsx` (signup de e-mail) é outra feature,
>   não confundir.


> Documento de transferência. Descreve como funciona o painel
> `/admin/DashBoard/personalizacao/` do RPG Worlds para que outra IA (Opus)
> reimplemente a **mesma mecânica** em outro site (não-jogo).
>
> A ideia central é independente de domínio: **um admin edita conteúdo/config
> do site público (textos, imagens, banners, carrossel de "newsletter",
> avisos, notificações) e o resultado aparece no site sem precisar de deploy**.
> Tudo é guardado como JSON num único Key/Value e lido por um endpoint público.

---

## 1. Visão geral da mecânica

| Camada | Papel |
|---|---|
| **Store (DB)** | Uma tabela Key/Value (`system_config`): `key` (PK string) + `value` (JSON stringificado em `TEXT`). Cada "seção" do painel é uma key. |
| **Backend** | Um serviço que faz `upsert`/`read` por key, com *defaults* e *sanitização* na leitura. Um controller expõe: **GET público** (site lê) + **PATCH protegido** (admin grava). |
| **Storage** | Upload de imagens/vídeos via **presigned URL** (S3-compatível: Cloudflare R2 em prod, MinIO em dev). O browser sobe direto para o storage; o backend só assina a URL. Salva-se a *key* (path), não o binário. |
| **Admin (frontend)** | Página com abas. Cada aba é um "Manager" que edita uma seção. Hook único (`useSystemConfig`) faz fetch/mutate via React Query + upload. |
| **Site público (frontend)** | Lê o mesmo GET público e renderiza (ex.: carrossel da home, modal de aviso, toasts de notificação). |

**Por que é poderoso:** marketing/produto muda banner, copy, slides do carrossel,
avisos e regras **na hora**, sem PR/deploy. É um mini-CMS caseiro, sem custo de
um CMS externo, acoplado ao próprio stack.

Fluxo de escrita (admin) e leitura (site):

```
[Admin UI] --(PATCH /system-config/public, JSON)--> [Backend upsert por key] --> [DB system_config]
[Admin UI] --(POST /storage/upload-url)--> [Backend assina presigned PUT] --> [Browser PUT direto no R2/MinIO]
                                                                                   |
[Site público] --(GET /system-config/public)--> [Backend lê+normaliza+default] <--/ (key salva no JSON)
```

---

## 2. Modelo de dados (a peça mais importante)

Não há tabela por feature. **Tudo é um KV genérico.** No projeto, Prisma:

```prisma
model SystemConfig {
  key   String @id @unique
  value String @db.Text   // JSON stringificado
  updatedAt DateTime @updatedAt
  @@map("system_config")
}
```

Cada seção do painel é uma key fixa:

```
PUNISHMENT_RULES      -> regras (específico do jogo; ignore no porte)
HOME_SETTINGS         -> textos/banners/logo da home + fundos de login
ADS_SETTINGS          -> banners de publicidade on/off + URLs
LANDING_SETTINGS      -> assets da landing deslogada
NEWSLETTER_SETTINGS   -> carrossel (FOCO do pedido)
ALPHA_NOTICE_SETTINGS -> modal de primeiro acesso
SYSTEM_NOTIFICATIONS  -> avisos/manutenção/novidades (toasts/drawer)
```

> **Decisão de design:** KV + JSON evita migrations toda vez que se cria um
> campo novo. O *shape* vive no código (TypeScript), não no schema do banco.
> O risco (JSON inválido / campo faltando) é coberto por **sanitização na
> leitura** com defaults (ver §3.2). Em ambiente sem essa disciplina, valide
> com Zod ao ler/gravar.

---

## 3. Backend

### 3.1 Controller (endpoints)

```
GET   /system-config/public          (PÚBLICO)     -> site lê tudo
PATCH /system-config/public          (ADMIN auth)  -> admin grava 1+ seções
POST  /storage/upload-url            (idealmente auth) -> assina presigned PUT
POST  /storage/delete                              -> remove objeto do storage
```

- `GET /public` é **aberto** (sem auth) — é o que o site público consome em SSR/CSR.
- `PATCH /public` é protegido por **JWT + RolesGuard** (`SUPER_ADMIN` | `EDITOR`).
- O `PATCH` recebe um body com **seções opcionais** e só grava as presentes:

```ts
// body do PATCH /system-config/public
{
  home?: HomeSettings;
  ads?: AdsSettings;
  landing?: LandingSettings;
  newsletter?: NewsletterSettings;   // <- o carrossel
  alphaNotice?: AlphaNoticeSettings;
  systemNotifications?: SystemNotificationsSettings;
}
```

### 3.2 Service (padrão de read/write)

**Write** = `upsert` por key, serializando JSON:

```ts
prisma.systemConfig.upsert({
  where:  { key: NEWSLETTER_KEY },
  update: { value: JSON.stringify(data.newsletter) },
  create: { key: NEWSLETTER_KEY, value: JSON.stringify(data.newsletter) },
});
// Só faz upsert das seções presentes no body. Roda em Promise.all.
```

**Read** = busca todas as keys em paralelo, faz `JSON.parse` com `try/catch`,
e **sanitiza campo a campo aplicando defaults**. Esse passo é o que torna o
KV+JSON seguro. Exemplo (newsletter):

```ts
const slides = Array.isArray(parsed.slides)
  ? parsed.slides
      .filter((s) => s && typeof s.id === "string")
      .map((s) => ({
        id: s.id,
        imageUrl: normalizeMediaUrl(s.imageUrl),     // resolve path -> URL
        title: s.title || "",
        subtitle: s.subtitle || "",
        ctaText: s.ctaText || "",
        ctaHref: s.ctaHref || "",
        textPosition: s.textPosition || "bottom-left",
        textBgEnabled: s.textBgEnabled !== undefined ? !!s.textBgEnabled : true,
        textBgColor: s.textBgColor || "#000000",
        textBgOpacity: typeof s.textBgOpacity === "number" ? s.textBgOpacity : 50,
      }))
  : [];
return {
  enabled: !!parsed.enabled,
  autoplay: parsed.autoplay !== undefined ? !!parsed.autoplay : true,
  intervalMs: (typeof parsed.intervalMs === "number" && parsed.intervalMs >= 1500)
    ? parsed.intervalMs : 6000,
  slides,
};
```

**`normalizeMediaUrl`** — converte a *key* salva (ex.: `newsletter/abc.webp`)
na URL pública final. Resolve o storage conforme ambiente:
- R2 + `R2_PUBLIC_BASE_URL` definido → `${base}/${key}`.
- Senão → `${STORAGE_URL}/${key}` (MinIO atrás de Nginx).
- Se já for URL absoluta `http(s)://`, mantém (com uma migração de origin
  legada — reescreve host antigo para o `STORAGE_URL` atual).

> **Truque de segregação:** o `adminLoginBackgroundUrl` é gravado dentro de
> `HOME_SETTINGS`, mas o `GET /public` **omite explicitamente** esse campo
> (whitelist de campos no parse) e há um GET separado `/admin-login` para ele.
> Lição: ao reaproveitar uma key, escolha a dedo o que vaza no endpoint público.

### 3.3 Storage — upload via presigned URL

O backend **não recebe o binário**. Fluxo:

1. Front chama `POST /storage/upload-url` com `{ filename, contentType, contentLength, folder }`.
2. Backend valida tamanho (limites por tipo: imagem 5MB, vídeo 50MB, modelo 3D 50MB; configuráveis por env) e **assina um PUT** S3-compatível com TTL (R2: 5min; MinIO: 15min). Retorna `{ url, key, bucket }`.
3. Browser faz `PUT url` com o arquivo (`Content-Type` igual ao assinado).
4. Front guarda a **`key`** (ex.: `newsletter/foo.webp`) no JSON da seção.

Provider é abstraído (`"r2" | "minio"`), decidido por env (`R2_ENABLED=true` +
credenciais → R2; senão MinIO). Gotchas reais já resolvidos no código (úteis no porte):
- AWS SDK v3 (>=3.729) injeta checksum CRC32 que **quebra presigned PUT no R2/MinIO** → setar `requestChecksumCalculation: "WHEN_REQUIRED"` e `responseChecksumValidation: "WHEN_REQUIRED"`.
- MinIO atrás de Nginx com prefixo de path (ex.: `/minio`): assina-se só com host (`/bucket/key`) e **injeta-se o prefixo na URL depois**, porque o Nginx tira o prefixo antes de repassar — senão dá 403 de assinatura.
- Bucket precisa de **CORS** (GET/PUT/POST/DELETE, `AllowedOrigin *`, expor `ETag`) e **policy public-read** para o site servir as imagens.

---

## 4. Admin frontend

### 4.1 Hook único: `useSystemConfig`

Concentra tudo (React Query + upload). Expõe:

```ts
const {
  rules, updateRules, loadingRules,                       // (específico jogo)
  publicSettings, updatePublicSettings, loadingPublicSettings,
  adminLoginSettings, loadingAdminSettings,
  uploadFile,                                             // (file, folder) => Promise<key>
} = useSystemConfig();
```

- `publicSettings` ← `useQuery(["public-settings"], getPublicSettings)`.
- `updatePublicSettings` ← `useMutation` que faz PATCH e **invalida** `["public-settings"]` (e `["admin-login-settings"]`) no sucesso + toast.
- **`uploadFile(file, folder)`**:
  1. **Comprime imagem** client-side com `browser-image-compression` para **WebP ≤0.5MB / 1600px** (SVG fica de fora — vetor). Isso salva o LCP do site público.
  2. Pega presigned URL (`POST storage/upload-url`).
  3. `fetch(url, { method:'PUT', body:file, headers:{'Content-Type':file.type} })`.
  4. Retorna a **`key`** para gravar no JSON.

### 4.2 Página com abas

`page.tsx` é só um shell: `<PermissionGuard permission="personalizacao.all">` →
`<Tabs>` (implementadas localmente via Context, nada exótico) com uma aba por
seção. Cada aba renderiza um **Manager** isolado:

```
Home          -> textos + logo + banners + "fade" (overlay) da home
Autenticação  -> fundos de login/registro/admin
Publicidades  -> banners ad on/off
Landing       -> <LandingDiceManager/>
Newsletter    -> <NewsletterManager/>      <-- foco
Aviso Alpha   -> <AlphaNoticeManager/>     (modal 1º acesso, versionado)
Notificações  -> <SystemNotificationsManager/>
Usuários      -> regras de punição (específico jogo)
```

Componente reutilizável-chave: **`BannerUpload`** — dropzone que aceita imagem
ou vídeo, mostra preview (img/`<video autoPlay muted loop>`), botão de remover,
respeita aspect-ratio (`video`/`square`/`banner`). Recebe `currentUrl`,
`onFileSelect(file)`, `onRemove()`. O estado guarda `string | File`: string =
já salvo, File = novo (sobe no Save).

Padrão de cada Manager (vale como receita):
- `useEffect` popula state local a partir de `publicSettings.<seção>` quando carrega.
- Edição é local (useState). Arquivos novos ficam "pendentes" (`File`) até o Save.
- **Save**: para cada `File` pendente → `uploadFile` → troca por `key`; monta o
  objeto final; chama `updatePublicSettings({ <seção>: data })`.

---

## 5. Newsletter (carrossel) — o foco do pedido

### 5.1 Contrato de dados

```ts
type NewsletterTextPosition =
  | "top-left" | "top-center" | "top-right"
  | "center-left" | "center" | "center-right"
  | "bottom-left" | "bottom-center" | "bottom-right";

interface NewsletterSlide {
  id: string;                 // gerado no client: `slide_${ts}_${rand}`
  imageUrl?: string;          // key do storage OU URL absoluta
  title?: string;
  subtitle?: string;
  ctaText?: string;           // texto do botão
  ctaHref?: string;           // "/rota" interna ou "https://" externa
  textPosition?: NewsletterTextPosition;  // onde o bloco de texto ancora
  textBgEnabled?: boolean;    // caixa atrás do texto
  textBgColor?: string;       // hex
  textBgOpacity?: number;     // 0-100
}

interface NewsletterSettings {
  enabled: boolean;           // liga/desliga o carrossel no site
  autoplay: boolean;
  intervalMs: number;         // >= 1500
  slides: NewsletterSlide[];  // ordem = ordem de exibição
}
```

### 5.2 Editor (`NewsletterManager`)

- Config global: checkbox `enabled`, checkbox `autoplay`, input `intervalMs` (mín. 1500).
- Lista de slides com **adicionar / remover / mover ↑↓** (reordenar = ordem do array).
- Cada `SlideEditor`:
  - **Preview ao vivo** em aspect `21/9` com a imagem + o bloco de texto posicionado e o fundo rgba calculado de `textBgColor`+`textBgOpacity`.
  - Upload de imagem (aceita jpg/png/webp) → vira `File` pendente.
  - Inputs: título, subtítulo, texto do CTA, link do CTA.
  - **Grid 3×3** para escolher `textPosition` (setas ↖↑↗←•→↙↓↘).
  - Bloco "fundo atrás do texto": toggle + color picker + slider de opacidade.
- **Save**: sobe os `File` pendentes, troca por `key`, monta `NewsletterSettings`,
  `updatePublicSettings({ newsletter })`.

### 5.3 Consumo no site público

Dois componentes:

**`NewsletterCarousel`** (a vitrine):
- Lê `publicSettings.newsletter`. `enabled = !!newsletter.enabled && slides.length>0`. Se off → `return null`.
- Autoplay via `setTimeout` reciclado por `intervalMs`; **pausa no hover/focus**;
  respeita `prefers-reduced-motion` (não anima). Setas prev/next + bullets.
- Cada slide: `<img>` de fundo + camada de texto posicionada (mesma matemática
  de `justify/align/textAlign` derivada de `textPosition`) + caixa rgba.
- CTA: se `ctaHref` externo (`^https?://`) → `<a target="_blank" rel="noopener noreferrer">`; senão link interno.
- Acessível: `role` de carousel, bullets como `role="tab"` com `aria-selected`.

**`NewsletterAutoOpen`** (opcional): num `useEffect` na home logada, se
`enabled` e há slides, abre um **modal** com o carrossel após ~250ms (deixa a
home pintar antes). Usa um store simples (`openNewsletterModal()`).

---

## 6. Outras seções (reaproveitáveis no porte)

- **HOME_SETTINGS**: `titleBold`, `titleNormal`, `desktopBannerUrl`, `mobileBannerUrl` (imagem **ou vídeo** mp4/webm), `logoUrl`/`logoWhiteUrl` (2 logos p/ fundo claro/escuro), e um efeito de **fade/overlay** no rodapé do banner (`fadeEnabled`, `fadeColor`, `fadeIntensity` 10-100%, `fadeOpacity` 0-100%). Útil para qualquer hero editável.
- **ADS_SETTINGS**: `showDesktop`/`showMobile` + `desktopAdUrl`/`mobileAdUrl` (faixas 32:9). Banner publicitário ligável.
- **ALPHA_NOTICE_SETTINGS**: modal de 1º acesso com `version` — trocar a versão **re-exibe para todos** que já fecharam (controle via localStorage no client comparando a versão).
- **SYSTEM_NOTIFICATIONS**: array de avisos tipados (`aviso|manutencao|atualizacao|evento|novidade`) com janela `startsAt`/`endsAt`, `repeatEveryHours`, `autoDismissSeconds`, cores de gradiente. Vira toasts/drawer no site. Ótimo para "barra de aviso" de qualquer site.

---

## 7. Como portar para outro site (checklist para o próximo Opus)

A mecânica é **agnóstica de framework**. Passos mínimos:

1. **Store**: criar tabela KV `site_config(key PK, value TEXT/jsonb, updated_at)`.
   Em Postgres pode usar `jsonb` direto (dispensa `JSON.stringify`). Uma linha por seção.
2. **Backend**:
   - `GET /site-config/public` (aberto) → lê todas as keys, `parse` com try/catch,
     **aplica defaults e sanitiza** (não confie no JSON cru), resolve paths de
     mídia para URL pública.
   - `PATCH /site-config/public` (auth de admin/editor) → upsert só das seções enviadas.
   - `POST /storage/upload-url` → presigned PUT (S3/R2/MinIO/Supabase Storage).
     Lembrar dos gotchas de checksum (§3.3) e CORS/public-read.
3. **Tipos compartilhados**: definir as interfaces das seções num pacote/arquivo
   comum entre admin e site (single source of truth do shape).
4. **Admin UI**:
   - Hook estilo `useSiteConfig` (React Query): `getPublicSettings`,
     `updatePublicSettings` (invalida cache + toast), `uploadFile(file, folder)`
     (comprime imagem → presigned → PUT → retorna key).
   - Página com abas; um "Manager" por seção; `BannerUpload` reutilizável.
   - Para o carrossel: copiar `NewsletterManager` (lista CRUD + reorder + preview).
5. **Site público**:
   - Ler `GET /public` (SSR de preferência, p/ SEO/LCP).
   - Renderizar o que precisar (carrossel, hero, barra de aviso). Respeitar
     `enabled`, `prefers-reduced-motion`, e externo vs interno em CTAs.
6. **Permissões**: proteger só o `PATCH` (e idealmente o upload). O `GET /public`
   pode ser anônimo, mas **nunca** exponha campos sensíveis numa key compartilhada
   (use whitelist de campos no parse, como o `adminLoginBackgroundUrl`).

### Diferenças recomendadas para um site sério (melhorias sobre o original)

- Validar com **Zod** no read e no write (o original confia em sanitização manual).
- Em Postgres, usar `jsonb` + índice por key (já é PK) — leitura é O(1) por seção.
- Adicionar **cache** (Redis/edge) no `GET /public` com invalidação no PATCH, se o site tiver tráfego alto.
- Versionar/auditar mudanças (quem editou, quando) — o original só tem `updatedAt`.
- Opcional: separar keys por `tenant`/site se for multi-site.

---

## 8. Mapa de arquivos de referência (no repo de origem)

| Arquivo | Papel |
|---|---|
| `packages/database/prisma/schema.prisma` (`model SystemConfig`) | Tabela KV |
| `packages/backend/users/src/services/system-config.service.ts` | Read/write + defaults + normalize + sanitização |
| `packages/backend/users/src/controllers/system-config.controller.ts` | Endpoints GET público / PATCH admin |
| `packages/backend/storage/src/services/storage.service.ts` | Presigned URL, R2/MinIO, CORS, limites |
| `packages/backend/storage/src/controllers/storage.controller.ts` | `POST /storage/upload-url`, `/delete` |
| `apps/admin/composable/system-config/useSystemConfig.ts` | Hook React Query + uploadFile + compressão WebP |
| `apps/admin/Services/http/system-config.http.ts` | Client HTTP + tipos |
| `apps/admin/app/DashBoard/personalizacao/page.tsx` | Shell com abas + `BannerUpload` |
| `apps/admin/app/DashBoard/personalizacao/components/NewsletterManager.tsx` | Editor do carrossel (foco) |
| `apps/Rpg-Gaming/src/components/home/dashboard/NewsletterCarousel.tsx` | Vitrine pública do carrossel |
| `apps/Rpg-Gaming/src/components/home/dashboard/NewsletterAutoOpen.tsx` | Auto-abre modal na home |

> Tudo gira em torno de **1 tabela KV + 1 GET público + 1 PATCH admin +
> presigned upload**. O resto é UI. Replicável em qualquer stack.
