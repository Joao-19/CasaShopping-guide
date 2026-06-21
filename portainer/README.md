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

## Topologia: atrás do nginx central

As stacks rodam no **mesmo servidor que o WePlanner** e **não têm nginx
próprio nem publicam portas** no host. Quem faz a borda (80/443 + SSL) é o
**nginx central** (WePlanner-Infra), que alcança os serviços pela rede
`web-proxy`:

```
/        -> casashopping-web:3001
/api     -> casashopping-gateway:3000
/admin   -> casashopping-admin:3002
/minio/  -> casashopping-storage:9000   (leitura pública de imagens)
```

Esse roteamento precisa existir na config do nginx central (repo
WePlanner-Infra). Os arquivos `default.conf` e `manutencao.html` desta pasta
são **referência** — não são montados por estas stacks.

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
2. **Redes externas** (já devem existir na sua infra): a stack usa **duas**
   redes externas, compartilhadas com o WePlanner:
   - `web-proxy` — rede do **nginx central**; por ela o nginx alcança
     `web`/`admin`/`gateway`/`storage` por nome.
   - a rede do **banco**, definida em `DB_NETWORK_NAME` (padrão
     `infra-network`) — onde o container `postgres` já roda.
   Confirme os nomes com `docker network ls`.
3. **Banco de dados:** a stack **não sobe postgres** — ela reutiliza o seu
   banco existente. Preencha `DATABASE_URL` (e `DIRECT_URL`) apontando para o
   host `postgres` (ex.: `postgres://user:pass@postgres:5432/meubanco`). Os
   serviços alcançam o `postgres` pela rede `DB_NETWORK_NAME`.
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
config do nginx central (WePlanner-Infra).

## O que este pipeline NÃO toca

- `docker-compose.yml` / `docker-compose dev.yml` da raiz (deploy atual).
- `.github/workflows/deploy.yml` (workflow antigo, dispara em `main1`).
- `deploy.sh` / `deployNoCache.sh`, Watchtower, Docker Hub `joaovvv/*`.
- Servidor Oracle atual (`172.245.190.165`).
