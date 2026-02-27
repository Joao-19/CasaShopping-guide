# CasaShopping Guide (Guia de Compras)

Plataforma digital de **Catálogo de Produtos** e **Gestão Administrativa** desenvolvida para o CasaShopping. O projeto adota uma **Arquitetura de Microsserviços**, focando em escalabilidade, manutenibilidade e deploy independente de cada componente.

---

## 🚀 Visão Geral do Projeto

O sistema é composto por múltiplos módulos integrados em uma estrutura **Monorepo (Turborepo)**:

| Módulo             | Descrição                                    | Porta |
| ------------------ | -------------------------------------------- | ----- |
| `web`              | Storefront público (catálogo de produtos)    | 3001  |
| `admin`            | Painel administrativo para gestão            | 3002  |
| `api-gateway`      | Proxy unificado para todos os microsserviços | 3000  |
| `auth-service`     | Autenticação e gestão de sessões (JWT)       | 3003  |
| `users-service`    | Gestão de usuários e perfis                  | 3004  |
| `stores-service`   | Gestão de lojas                              | 3005  |
| `products-service` | Gestão de produtos, categorias e favoritos   | 3006  |
| `storage-service`  | Upload de imagens (S3/MinIO)                 | 3007  |

## ✨ Principais Funcionalidades

### Storefront (Web)

- **Modo Visitante (Guest Mode)**: Navegação completa por produtos e lojas sem necessidade de login.
- **Vitrine Virtual**: Destaques, carrosséis de categorias e busca avançada.
- **Favoritos**: Usuários logados podem salvar produtos.
- **Preço Sob Consulta**: Suporte a produtos sem preço exibido publicamente.

### Painel Administrativo

- **Gestão de Lojas**: Cadastro e edição de informações de lojas.
- **Catálogo de Produtos**: Criação, edição e inativação de produtos.
- **Upload de Mídia**: Integração com Storage Service para imagens de produtos e logos.

### Diagrama de Arquitetura

```mermaid
graph TD
    User((Usuário)) --> Gateway[API Gateway :3000]
    Gateway --> Auth[Auth Service :3003]
    Gateway --> Users[Users Service :3004]
    Gateway --> Stores[Stores Service :3005]
    Gateway --> Products[Products Service :3006]
    Gateway --> Storage[Storage Service :3007]

    Auth & Users & Stores & Products --> DB[(PostgreSQL)]
    Storage -.-> S3[(MinIO / S3)]
```

---

## 🛠 Tech Stack

| Camada               | Tecnologia                                 |
| -------------------- | ------------------------------------------ |
| **Frontend**         | Next.js 14 (App Router), React, TypeScript |
| **Estilização**      | Tailwind CSS, shadcn/ui                    |
| **Backend**          | NestJS, Node.js 20                         |
| **Banco de Dados**   | PostgreSQL 15                              |
| **ORM**              | Prisma                                     |
| **Storage**          | MinIO (dev) / AWS S3 (prod)                |
| **Infraestrutura**   | Docker, Docker Compose, Turborepo          |
| **Validação**        | Zod, class-validator                       |
| **State Management** | TanStack Query (React Query), Zustand      |

---

## 📦 Como Rodar Localmente

### Pré-requisitos

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker & Docker Compose

### Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/Joao-19/CasaShopping-guide.git
   cd casashopping-guide
   ```

## Deployment

To deploy the application:

1. Ensure `.env` is configured locally.
2. Run `./deploy.sh`.

### Updating Environment Variables

To update environment variables:

1. Edit the `.env` file **on the server**.
2. Wait for the next deployment OR trigger a restart.
   - If using Watchtower, the next time it updates the image, it will restart the container.
   - Since the `.env` file is **mounted** into the container, the new values will be read at startup.

**Note:** Changes to `.env` will **NOT** take effect immediately. The container must restart to read the file again. You can trigger a deploy from local (`./deploy.sh`) to force an update/restart.

3. Copie os arquivos de ambiente de exemplo:

   ```bash
   cp .env.example .env
   cp apps/web/.env.example apps/web/.env
   cp apps/admin/.env.example apps/admin/.env
   cp apps/api-gateway/.env.example apps/api-gateway/.env
   cp apps/auth/.env.example apps/auth/.env
   cp apps/users/.env.example apps/users/.env
   cp apps/stores/.env.example apps/stores/.env
   cp apps/products/.env.example apps/products/.env
   cp apps/storage/.env.example apps/storage/.env
   ```

4. Instale as dependências:

   ```bash
   pnpm install
   ```

5. Suba o banco de dados e o MinIO:

   ```bash
   docker-compose up -d database storage
   ```

6. Execute as migrations do Prisma:

   ```bash
   pnpm --filter @repo/database db:migrate
   ```

7. Inicie todos os serviços em modo de desenvolvimento:
   ```bash
   pnpm dev
   ```

### Acessando os Serviços

| Serviço       | URL                   |
| ------------- | --------------------- |
| Web App       | http://localhost:3001 |
| Admin Panel   | http://localhost:3002 |
| API Gateway   | http://localhost:3000 |
| MinIO Console | http://localhost:9001 |

---

## 🐳 Deploy com Docker

Para subir todo o ambiente com Docker Compose:

```bash
docker-compose up -d --build
```

Isso irá criar e iniciar todos os containers (banco, storage, serviços e frontends).

> [!IMPORTANT]
> **Configuração do MinIO (Local/Dev)**:
> Para que o upload de imagens funcione corretamente localmente, pode ser necessário configurar o CORS no bucket do MinIO. Certifique-se de que a variável `MINIO_PUBLIC_ENDPOINT` esteja apontando para o IP/domínio correto acessível pelo navegador, não apenas `localhost` se estiver testando em rede ou mobile.

---

## 📁 Estrutura do Projeto

```
casashopping-guide/
├── apps/
│   ├── admin/          # Painel Administrativo (Next.js)
│   ├── api-gateway/    # API Gateway (NestJS)
│   ├── auth/           # Auth Service (NestJS)
│   ├── products/       # Products Service (NestJS)
│   ├── storage/        # Storage Service (NestJS)
│   ├── stores/         # Stores Service (NestJS)
│   ├── users/          # Users Service (NestJS)
│   └── web/            # Storefront Público (Next.js)
├── packages/
│   ├── database/       # Prisma Schema e Client compartilhado
│   ├── dtos/           # DTOs e Types compartilhados
│   ├── ui/             # Componentes UI compartilhados
│   └── auth-guard/     # Módulo de autenticação compartilhado
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

---

## 🔐 Variáveis de Ambiente

O arquivo `.env` é fundamental para a configuração dos serviços. Abaixo está a descrição detalhada de cada variável presente no `.env.example`:

### 🌐 Configuração de Rede e CORS

| Variável              | Descrição                                                               | Exemplo                                       |
| :-------------------- | :---------------------------------------------------------------------- | :-------------------------------------------- |
| `CORS_ORIGIN`         | Lista de origens permitidas para acessar a API (separadas por vírgula). | `http://localhost:3000,http://localhost:3001` |
| `NEXT_PUBLIC_API_URL` | URL pública do API Gateway usada pelos frontends (Web e Admin).         | `http://localhost:3000`                       |
| `NEXT_PUBLIC_WEB_URL` | URL pública da aplicação Web (Storefront).                              | `http://localhost:3001`                       |
| `INTERNAL_API_URL`    | URL interna para comunicação entre containers Docker.                   | `http://api-gateway:3000`                     |

### 🐳 Configuração do Banco de Dados (Docker)

| Variável           | Descrição                                | Exemplo        |
| :----------------- | :--------------------------------------- | :------------- |
| `DB_USER`          | Usuário do PostgreSQL criado via Docker. | `admin`        |
| `DB_PASSWORD`      | Senha do PostgreSQL.                     | `admin123`     |
| `DB_NAME`          | Nome do banco de dados principal.        | `casashopping` |
| `STORAGE_USER`     | (Reservado para uso futuro).             | `admin`        |
| `STORAGE_PASSWORD` | (Reservado para uso futuro).             | `password123`  |

### 🗄️ Prisma / Banco de Dados

| Variável       | Descrição                                     | Exemplo                                         |
| :------------- | :-------------------------------------------- | :---------------------------------------------- |
| `DATABASE_URL` | String de conexão completa para o Prisma ORM. | `postgresql://admin:admin123@localhost:5432...` |

### 🔑 Autenticação (JWT)

| Variável                   | Descrição                                                         | Exemplo                   |
| :------------------------- | :---------------------------------------------------------------- | :------------------------ |
| `JWT_SECRET`               | Chave secreta para assinar Access Tokens. **Altere em produção.** | `changeme_secret`         |
| `JWT_EXPIRES_IN`           | Tempo de expiração do Access Token.                               | `15m`                     |
| `REFRESH_TOKEN_SECRET`     | Chave secreta para assinar Refresh Tokens.                        | `changeme_refresh_secret` |
| `REFRESH_TOKEN_EXPIRES_IN` | Tempo de expiração do Refresh Token.                              | `7d`                      |

### 👤 Credenciais do Admin Inicial

| Variável         | Descrição                                              | Exemplo                   |
| :--------------- | :----------------------------------------------------- | :------------------------ |
| `ADMIN_EMAIL`    | Email do primeiro administrador criado ao rodar seeds. | `admin@casashopping.com`  |
| `ADMIN_PASSWORD` | Senha inicial do administrador.                        | `changeme_admin_password` |
| `ADMIN_NAME`     | Nome de exibição do administrador.                     | `Admin`                   |

### ☁️ Armazenamento (MinIO / S3)

| Variável                  | Descrição                                     | Exemplo                              |
| :------------------------ | :-------------------------------------------- | :----------------------------------- |
| `MINIO_ROOT_USER`         | Usuário raiz do servidor MinIO.               | `admin`                              |
| `MINIO_ROOT_PASSWORD`     | Senha raiz do servidor MinIO.                 | `password123`                        |
| `MINIO_BUCKET_NAME`       | Nome do bucket S3 onde arquivos serão salvos. | `casashopping`                       |
| `MINIO_PUBLIC_ENDPOINT`   | URL acessível publicamente (navegador).       | `http://localhost:9000`              |
| `MINIO_INTERNAL_ENDPOINT` | URL interna (Docker) para upload via backend. | `http://localhost:9000`              |
| `STORAGE_URL`             | URL base para construir links de imagens.     | `http://localhost:9000/casashopping` |

### 🛣️ Caminhos e Rotas

| Variável                | Descrição                                        | Exemplo                 |
| :---------------------- | :----------------------------------------------- | :---------------------- |
| `WEB_BASE_PATH`         | Prefixo da URL para o aplicativo Web (Loja).     | `/casashopping`         |
| `ADMIN_BASE_PATH`       | Prefixo da URL para o Painel Administrativo.     | `/admin`                |
| `NEXT_PUBLIC_BASE_PATH` | Base path público para redirects no client-side. | `""` (vazio) ou `/base` |
| `NEXT_PUBLIC_ADMIN_URL` | URL pública do Admin (usada no Web App).         | `http://localhost:3002` |

### 📈 Analytics & Marketing

| Variável             | Descrição                              | Exemplo       |
| :------------------- | :------------------------------------- | :------------ |
| `NEXT_PUBLIC_GTM_ID` | ID do Container do Google Tag Manager. | `GTM-XXXXXXX` |
| `NEXT_PUBLIC_GA4_ID` | ID do Google Analytics 4.               | `G-XXXXXXXX`  |

---

## 🌐 Deploy com Nginx (Reverse Proxy)

Quando usando Nginx como reverse proxy, configure as locations para cada serviço:

```nginx
server {
    listen 80;
    server_name seu-ip-ou-dominio;
    resolver 127.0.0.11 valid=10s;

    # Rota padrão (opcional - pode apontar para outro serviço ou retornar 404)
    location / {
        return 404;
    }

    # API Gateway - IMPORTANTE: NÃO usar variáveis no proxy_pass para /api/
    # Isso evita problemas de URI rewriting
    location /api/ {
        proxy_pass http://casashopping-gateway:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend Web (Catálogo)
    location /casashopping/ {
        set $upstream_web casashopping-web;
        proxy_pass http://$upstream_web:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Painel Administrativo
    location /admin/ {
        set $upstream_admin casashopping-admin;
        proxy_pass http://$upstream_admin:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

> [!IMPORTANT]
>
> - O Nginx deve estar na mesma rede Docker que os containers (`web-proxy`)
> - Configure `NEXT_PUBLIC_API_URL` para usar o proxy (ex: `http://seu-ip/api`) para evitar CORS
> - O `resolver 127.0.0.11` é necessário quando usando variáveis no `proxy_pass` dentro do Docker
> - Para `/api/`, **não use variáveis** no `proxy_pass` para evitar problemas de URI rewriting

## 📄 Documentação Adicional

- **Requisitos de Infraestrutura (AWS):** [REQUISITOS_INFRA.md](./REQUISITOS_INFRA.md)

---

## 📝 Licença

Este projeto é privado e de uso exclusivo do CasaShopping.
