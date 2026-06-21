# Deploy via Portainer (GHCR) — guia da TI

> **Este pipeline é NOVO e isolado.** Ele **não** altera, substitui ou
> interfere no deploy atual (Docker Hub `joaovvv/*` + Watchtower + Oracle).
> Os dois podem coexistir. Enquanto ninguém criar a stack no Portainer e
> apontar para o GHCR, **nada** é implantado por aqui.

## Como funciona (visão geral)

```
push em `dev-deploy`  ──> GitHub Actions (deploy-dev.yml)  ──> GHCR :dev
push em `main`        ──> GitHub Actions (deploy-prod.yml) ──> GHCR :stable
                                                               │
                       (manual, no Portainer: "Pull and redeploy")
                                                               ▼
                                                     stack rodando no host
```

- Os **workflows só buildam e publicam imagens** no GitHub Container
  Registry (`ghcr.io/joao-19/casashopping-<serviço>`). Eles **não** acessam
  nenhum servidor nem disparam redeploy.
- O **redeploy é manual** no Portainer (botão **Pull and redeploy**).

### Tags publicadas por serviço

| Canal | Branch | Tag flutuante | Tag imutável (rollback) |
|-------|--------|---------------|--------------------------|
| dev | `dev-deploy` | `:dev` | `:dev-AAAAMMDD-HHMM-<sha7>` |
| prod | `main` | `:stable` | `:stable-AAAAMMDD-HHMM-<sha7>` |

Serviços: `api-gateway, auth, users, stores, products, storage, migration, web, admin`.

## Pré-requisitos no GitHub

Nenhum secret a configurar — os workflows usam o `GITHUB_TOKEN` automático
(permite publicar em `packages: write`). Após o primeiro build, os pacotes
aparecem em **GitHub > repo > Packages**.

> **Visibilidade dos pacotes:** por padrão os pacotes do GHCR nascem
> **privados**. Para o Portainer puxar, escolha um:
> - **Tornar públicos:** Package > Package settings > Change visibility > Public; ou
> - **Manter privados** e cadastrar no Portainer um *Registry* `ghcr.io`
>   com um PAT (classic) com escopo `read:packages`.

## Setup no Portainer (uma vez por ambiente)

1. **Registries** (só se os pacotes forem privados): Registries > Add
   registry > Custom > URL `ghcr.io`, usuário = seu login GitHub, senha =
   PAT com `read:packages`.
2. **Rede externa** (uma vez por host): o stack usa a rede externa
   `web-proxy` (igual ao compose de produção). Crie-a antes:
   `docker network create web-proxy`
3. **Stacks > Add stack**:
   - **Build method:** *Repository* (Git) — aponte para este repo e o
     caminho `portainer/docker-compose.yml`. O método Git resolve o
     `./default.conf` ao lado pelo mount relativo.
     - Alternativa: *Web editor* colando o conteúdo do compose **+** subir
       o `default.conf` como arquivo/volume, ou usar um proxy próprio.
   - **Environment variables:** preencha conforme `portainer/.env.example`.
     A chave que escolhe a versão é **`TAG`** (`dev` ou `stable`).
4. **Deploy the stack.**

Crie **duas stacks** (uma com `TAG=dev`, outra com `TAG=stable`) se quiser
os dois ambientes no mesmo Portainer.

> **Fidelidade ao compose de produção:** o `portainer/docker-compose.yml` é
> espelho do `docker-compose.yml` da raiz (mesmos nomes de container, redes,
> `environment`, healthchecks e portas). As únicas diferenças são as 5
> listadas no cabeçalho do arquivo: imagens via GHCR `${TAG}`,
> `pull_policy: always`, sem `build:`, sem `watchtower` e sem mount `./.env`
> (o env vem das variáveis da stack).

## Atualizar para uma versão nova

Depois que um push em `main`/`dev-deploy` terminar o build (veja em
**Actions** no GitHub):

1. Portainer > a stack > **Pull and redeploy** (mantém `TAG` flutuante e
   re-puxa `:stable`/`:dev`).
2. O serviço `db-migration` roda as migrations automaticamente antes dos
   demais subirem (`prisma migrate deploy`).

## Rollback

1. Descubra a tag imutável desejada (no resumo do run em **Actions**, ou nos
   Packages do GHCR), ex.: `stable-20260620-1530-a1b2c3d`.
2. Na stack, mude `TAG` para essa tag imutável e **redeploy**.

## Arquitetura das imagens

Default dos workflows: **`linux/amd64`** (VPS comum). Se o host for ARM
(ex.: Oracle Ampere), edite `PLATFORMS: linux/arm64` no topo de
`.github/workflows/deploy-{dev,prod}.yml`.

## basePath (importante)

As imagens são agnósticas de ambiente (os `NEXT_PUBLIC_*` são resolvidos em
runtime). A **única** coisa assada no build é o `basePath` do Next:

- `web` é buildado na **raiz** (`BASE_PATH=`)
- `admin` é buildado em **`/admin`**

Isso casa com o `nginx.conf` desta pasta (`/` → web, `/admin` → admin). Se a
TI quiser outro roteamento, ajuste tanto o `buildArgs` no workflow quanto o
`nginx.conf`.

## O que este pipeline NÃO toca

- `docker-compose.yml` / `docker-compose dev.yml` da raiz (deploy atual).
- `.github/workflows/deploy.yml` (workflow antigo, dispara em `main1`).
- `deploy.sh` / `deployNoCache.sh`, Watchtower, Docker Hub `joaovvv/*`.
- Servidor Oracle atual (`172.245.190.165`).
