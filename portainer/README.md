# Deploy via Portainer (GHCR) — guia da TI

> **Este pipeline é NOVO e isolado.** Ele **não** altera, substitui ou
> interfere no deploy atual (Docker Hub `joaovvv/*` + Watchtower + Oracle).
> Os dois podem coexistir. Enquanto ninguém criar a stack no Portainer e
> apontar para o GHCR, **nada** é implantado por aqui.

## ⚠️ Fragilidade: dois modos de deploy em paralelo

Hoje o projeto mantém **dois caminhos de deploy ao mesmo tempo**:

1. **Legado (manual):** `deploy.sh`/`deployNoCache.sh` → Docker Hub
   (`joaovvv/casashopping-*:latest`) → Watchtower auto-atualiza o servidor.
2. **Novo (Portainer):** GitHub Actions → GHCR (`:dev`/`:prod`) → redeploy
   manual na UI do Portainer.

Isso é uma **fragilidade conhecida e temporária**. Enquanto os dois modos
coexistem é preciso ter atenção redobrada:

- **Duas fontes de imagem** (Docker Hub e GHCR) e dois conjuntos de tags
  (`:latest` vs `:dev`/`:prod`) — não confundir qual alimenta qual ambiente.
- Mudanças nos Dockerfiles/serviços afetam **os dois** pipelines; testar em
  ambos antes de confiar.
- Risco de **divergência** entre o que roda via Watchtower e o que roda via
  Portainer se só um lado for atualizado.

O objetivo é **consolidar em um único modo** assim que o ambiente do
Portainer estiver validado, eliminando essa duplicação.

## Como funciona (visão geral)

```
push em `dev-deploy`  ──> GitHub Actions (deploy-dev.yml)  ──> GHCR :dev
push em `main`        ──> GitHub Actions (deploy-prod.yml) ──> GHCR :prod
                                                               │
                       (manual, no Portainer: "Pull and redeploy")
                                                               ▼
                                                     stack rodando no host
```

- Os **workflows só buildam e publicam imagens** no GitHub Container
  Registry (`ghcr.io/joao-19/casashopping-<serviço>`). Eles **não** acessam
  nenhum servidor nem disparam redeploy.
- O **redeploy é manual** no Portainer (botão **Pull and redeploy**).

### Esquema de tags (para o Portainer não se perder)

Cada serviço recebe **duas** tags por publicação:

| Canal | Branch | Compose | Tag flutuante | Tag imutável (rollback) |
|-------|--------|---------|---------------|--------------------------|
| dev | `dev-deploy` | `docker-compose.dev.yml` | `:dev` | `:dev-AAAAMMDD-HHMM-<sha7>` |
| prod | `main` | `docker-compose.prod.yml` | `:prod` | `:prod-AAAAMMDD-HHMM-<sha7>` |

- A **flutuante** (`:dev` / `:prod`) é o que cada stack puxa, com
  `pull_policy: always`. Cada compose já tem o default do seu canal — a stack
  de dev nunca puxa imagem de prod e vice-versa.
- A **imutável** (com data+sha) nunca é sobrescrita — serve para fixar/voltar
  a uma versão específica (ver **Rollback**).

Serviços: `api-gateway, auth, users, stores, products, storage, migration, web, admin`.

## Topologia: atrás de um nginx central

As stacks rodam atrás de um **nginx central** (reverse proxy externo) e **não
têm nginx próprio nem publicam portas** no host. Quem faz a borda (80/443 +
SSL) é esse nginx central, que alcança os serviços pela rede `web-proxy`:

```
/        -> casashopping-web:3001
/api     -> casashopping-gateway:3000
/admin   -> casashopping-admin:3002
/minio/  -> casashopping-storage:9000   (leitura pública de imagens)
```

Esse roteamento precisa existir na config do nginx central (fora deste repo).
Os arquivos `default.conf` e `manutencao.html` desta pasta são **referência** —
não são montados por estas stacks.

## Página de manutenção (opcional, recomendada)

Esta pasta traz uma **página de manutenção pronta** e estilizada com a marca
do guia — bem mais profissional que o erro padrão do Portainer/nginx quando a
stack está fora do ar:

- `portainer/manutencao.html` — página standalone (CSS inline, `noindex`).
- `portainer/magnific_cinematic-wideangle-photo_YVPyuJiWeC.png` — imagem de
  fundo referenciada pelo HTML (precisa ficar **na mesma pasta** que o HTML).

A página é **autocontida** (só depende do PNG ao lado) e tem fallback de
gradiente azul da marca caso a imagem não carregue.

### Como ligar no nginx central

A ideia: o nginx serve a página de manutenção (HTTP **503**) enquanto existir
um **arquivo-flag**, e volta a fazer proxy normal quando o flag some — sem
precisar editar/recarregar config para entrar e sair de manutenção.

1. **Montar os arquivos** no container do nginx central, ex. em
   `/usr/share/nginx/maintenance/` (volume read-only):

   ```yaml
   # serviço nginx central (externo), trecho de volumes:
   volumes:
     - ./casashopping/manutencao.html:/usr/share/nginx/maintenance/manutencao.html:ro
     - ./casashopping/magnific_cinematic-wideangle-photo_YVPyuJiWeC.png:/usr/share/nginx/maintenance/magnific_cinematic-wideangle-photo_YVPyuJiWeC.png:ro
   ```

2. **No `server` do nginx central**, ativar via flag e interceptar as rotas do
   guia (`/`, `/admin`, `/api`):

   ```nginx
   # Liga a manutenção se o arquivo-flag existir (criar/remover sem reload)
   set $maintenance 0;
   if (-f /usr/share/nginx/maintenance/on) { set $maintenance 1; }

   # Em cada location do casashopping ( / , /admin , /api ), no topo:
   #   if ($maintenance) { return 503; }

   error_page 503 @maintenance;
   location @maintenance {
       root /usr/share/nginx/maintenance;
       rewrite ^.*$ /manutencao.html break;
       # serve o PNG e demais assets da mesma pasta
       add_header Cache-Control "no-store";
   }
   ```

3. **Entrar em manutenção:** `touch /usr/share/nginx/maintenance/on` no
   container do nginx. **Sair:** `rm` o mesmo arquivo. Não precisa
   `nginx -s reload` — o `if (-f ...)` é avaliado por request.

> Alternativa simples (sem flag): apontar `error_page 502 503 504 @maintenance;`
> para que, sempre que a stack do guia estiver fora do ar, o usuário veja a
> página da marca em vez do erro cru do nginx.

## Pré-requisitos no GitHub

Nenhum secret a configurar — os workflows usam o `GITHUB_TOKEN` automático
(permite publicar em `packages: write`). Após o primeiro build, os pacotes
aparecem em **GitHub > repo > Packages**.

> **Visibilidade dos pacotes:** por padrão os pacotes do GHCR nascem
> **privados**. Para o Portainer puxar, escolha um:
> - **Tornar públicos:** Package > Package settings > Change visibility > Public; ou
> - **Manter privados** e cadastrar no Portainer um *Registry* `ghcr.io`
>   com um PAT (classic) com escopo `read:packages`.

## Checklist de pré-voo (antes do primeiro deploy)

Confirme estes pontos **uma vez** por ambiente. Se os quatro estiverem OK, o
restante é só *Pull and redeploy*:

- [ ] **Arquitetura do host bate com a imagem.** Workflows buildam
  `linux/amd64` por padrão. Rode `uname -m` no host: `x86_64` → OK; `aarch64`
  → edite `PLATFORMS: linux/arm64` nos workflows e rebuilde (ver
  **Arquitetura das imagens**). Imagem de arquitetura errada não sobe.
- [ ] **Pacotes do GHCR acessíveis pelo Portainer** — públicos **ou** com um
  *Registry* `ghcr.io` cadastrado (PAT `read:packages`). Ver **Pré-requisitos
  no GitHub**.
- [ ] **Redes externas existem** no host: `web-proxy` e a do banco
  (`DB_NETWORK_NAME`, padrão `infra-network`). Confira com `docker network ls`.
- [ ] **Variáveis da stack preenchidas** conforme `portainer/.env.example`
  (com `DATABASE_URL`/`DIRECT_URL` apontando o banco existente +
  `?schema=casashopping`).

## Setup no Portainer (uma vez por ambiente)

1. **Registries** (só se os pacotes forem privados): Registries > Add
   registry > Custom > URL `ghcr.io`, usuário = seu login GitHub, senha =
   PAT com `read:packages`.
2. **Redes externas** (já devem existir na sua infra): a stack usa **duas**
   redes externas já presentes no host:
   - `web-proxy` — rede do **nginx central**; por ela o nginx alcança
     `web`/`admin`/`gateway`/`storage` por nome.
   - a rede do **banco**, definida em `DB_NETWORK_NAME` (padrão
     `infra-network`) — onde o container `postgres` já roda.
   Confirme os nomes com `docker network ls`.
3. **Banco de dados (sem SQL manual):** a stack **não sobe postgres** — ela
   reutiliza o banco que **já existe** na infra usando um **schema próprio**.
   Aponte `DATABASE_URL`/`DIRECT_URL` para o banco existente + `?schema=casashopping`,
   ex.: `postgres://user:pass@postgres:5432/<db-existente>?schema=casashopping`
   (use o nome do `POSTGRES_DB` da infra, **não** um banco novo). O
   `prisma migrate deploy` cria o schema `casashopping` automaticamente — não
   precisa rodar `CREATE DATABASE`/`CREATE SCHEMA`. Usando um schema próprio,
   não colide com outras aplicações que compartilhem o mesmo banco.
4. **Stacks > Add stack**:
   - **Build method:** *Repository* (Git) — aponte para este repo e o
     caminho do compose do ambiente:
     - DEV → `portainer/docker-compose.dev.yml`
     - PROD → `portainer/docker-compose.prod.yml`

     - Alternativa: *Web editor* colando o conteúdo do compose.

     Esta stack **não tem nginx próprio** — a borda é o nginx central. Não há
     `default.conf` a montar aqui.
   - **Environment variables:** preencha conforme `portainer/.env.example`.
     Não precisa setar `TAG` — cada compose já fixa o canal do seu ambiente
     (`dev` ou `prod`). Só use `TAG` para fixar uma imutável (rollback).
5. **Deploy the stack.**

Crie **duas stacks** — uma com `docker-compose.dev.yml` e outra com
`docker-compose.prod.yml` — se quiser os dois ambientes no mesmo Portainer.

> **Relação com o compose de produção:** os `portainer/docker-compose.*.yml`
> herdam do `docker-compose.yml` da raiz os mesmos nomes de container,
> `environment` e healthchecks. As diferenças (todas no cabeçalho de cada
> arquivo) adaptam a stack para rodar **atrás do nginx central** e com **banco
> externo**: imagens via GHCR `${TAG}`, `pull_policy: always`, sem `build:`,
> sem `watchtower`, sem mount `./.env`, **sem postgres embutido**, **sem nginx
> próprio** e **sem portas publicadas** no host.

## Atualizar para uma versão nova

Depois que um push em `main`/`dev-deploy` terminar o build (veja em
**Actions** no GitHub):

1. Portainer > a stack > **Pull and redeploy** (mantém a tag flutuante e
   re-puxa `:dev`/`:prod`).
2. O serviço `db-migration` roda as migrations automaticamente antes dos
   demais subirem (`prisma migrate deploy`).

## Rollback

1. Descubra a tag imutável desejada (no resumo do run em **Actions**, ou nos
   Packages do GHCR), ex.: `prod-20260621-1530-a1b2c3d`.
2. Na stack, defina a variável `TAG` para essa tag imutável e **redeploy**.

## Arquitetura das imagens

Default dos workflows: **`linux/amd64`** (VPS comum). Se o host for ARM
(ex.: Oracle Ampere), edite `PLATFORMS: linux/arm64` no topo de
`.github/workflows/deploy-{dev,prod}.yml`.

## basePath (importante)

As imagens são agnósticas de ambiente (os `NEXT_PUBLIC_*` são resolvidos em
runtime). A **única** coisa assada no build é o `basePath` do Next:

- `web` é buildado na **raiz** (`BASE_PATH=`)
- `admin` é buildado em **`/admin`**

Isso deve casar com o roteamento do **nginx central** (`/` → web, `/admin` →
admin). Para outro roteamento, ajuste tanto o `buildArgs` no workflow quanto a
config do nginx central (fora deste repo).

## Resolução de problemas

| Sintoma | Causa provável | O que fazer |
|---------|----------------|-------------|
| Portainer não puxa a imagem (`unauthorized` / `manifest unknown` / `denied`) | Pacote do GHCR privado e sem registry cadastrado | Torne os pacotes públicos **ou** cadastre o registry `ghcr.io` com PAT `read:packages` (ver **Pré-requisitos no GitHub**). |
| Containers em *restart loop* logo após subir (`exec format error` nos logs) | Imagem `amd64` rodando em host ARM (ou vice-versa) | Ajuste `PLATFORMS` no workflow para a arquitetura do host e rebuilde (ver **Checklist de pré-voo**). |
| Stack falha ao criar com erro de rede (`network web-proxy not found`) | Rede externa ainda não existe no host | Confirme com `docker network ls`; a rede do nginx central e a do banco precisam existir antes. |
| `db-migration` fica em erro e os demais não sobem | `DATABASE_URL`/`DIRECT_URL` ausente ou apontando banco/host errado | Revise as variáveis da stack; a URL deve alcançar o postgres da infra com `?schema=casashopping`. |
| Serviços `unhealthy` ou 502 no nginx central | App subiu antes do banco, ou env incompleta (ex.: `JWT_SECRET`) | Verifique os logs do serviço; confirme todas as variáveis de `.env.example`. Um novo *redeploy* refaz a ordem (`depends_on` espera a migration). |
| Atualizou e a versão antiga continua no ar | Redeploy sem re-pull da tag flutuante | Use **Pull and redeploy** (não só *Redeploy*); `pull_policy: always` exige o pull para trazer a build nova de `:dev`/`:prod`. |
| Precisa voltar para a versão anterior | — | Defina a variável `TAG` com a tag imutável desejada e redeploy (ver **Rollback**). |

## O que este pipeline NÃO toca

- `docker-compose.yml` / `docker-compose dev.yml` da raiz (deploy atual).
- `.github/workflows/deploy.yml` (workflow antigo, dispara em `main1`).
- `deploy.sh` / `deployNoCache.sh`, Watchtower, Docker Hub `joaovvv/*`.
- Servidor Oracle atual (`172.245.190.165`).
