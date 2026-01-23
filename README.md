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

2. Copie os arquivos de ambiente de exemplo:

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

3. Instale as dependências:

   ```bash
   pnpm install
   ```

4. Suba o banco de dados e o MinIO:

   ```bash
   docker-compose up -d database storage
   ```

5. Execute as migrations do Prisma:

   ```bash
   pnpm --filter @repo/database db:migrate
   ```

6. Inicie todos os serviços em modo de desenvolvimento:
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

### Configuração do Ambiente

Antes de iniciar o deploy, é necessário configurar as variáveis de ambiente:

**1. Copie o arquivo de exemplo para criar seu arquivo de configuração:**

```bash
cp .env.example .env
```

**2. Edite o arquivo `.env` com os valores do seu ambiente:**

```bash
# Linux/macOS
nano .env

# Windows (PowerShell)
notepad .env
```

**3. Configure as variáveis conforme seu ambiente de deploy:**

| Grupo               | Variáveis                                                         | Descrição                                           |
| ------------------- | ----------------------------------------------------------------- | --------------------------------------------------- |
| **CORS/API**        | `CORS_ORIGIN`, `NEXT_PUBLIC_API_URL`                              | URLs permitidas e endpoint da API                   |
| **Banco de Dados**  | `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DATABASE_URL`               | Credenciais PostgreSQL                              |
| **Autenticação**    | `JWT_SECRET`, `REFRESH_TOKEN_SECRET`                              | Secrets para tokens (use valores únicos e seguros!) |
| **Admin Inicial**   | `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`                     | Credenciais do primeiro admin                       |
| **Storage (MinIO)** | `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `MINIO_PUBLIC_ENDPOINT` | Configuração de upload de imagens                   |
| **Base Paths**      | `WEB_BASE_PATH`, `ADMIN_BASE_PATH`                                | Caminhos de acesso (ex: `/casashopping`)            |

> [!WARNING]
> **Segurança**: Nunca utilize os valores padrão do `.env.example` em produção. Sempre gere secrets únicos para `JWT_SECRET` e `REFRESH_TOKEN_SECRET`, e altere todas as senhas!

<details>
<summary><strong>📋 Exemplo de configuração para Produção</strong></summary>

```env
# CORS - Use o IP/domínio do seu servidor
CORS_ORIGIN=http://SEU_IP_OU_DOMINIO/casashopping,http://SEU_IP_OU_DOMINIO/admin
NEXT_PUBLIC_API_URL=http://SEU_IP_OU_DOMINIO/api
INTERNAL_API_URL=http://api-gateway:3000

# Banco de Dados - Use senhas fortes!
DB_USER=casashopping_user
DB_PASSWORD=SuaSenhaForte123!
DB_NAME=casashopping
DATABASE_URL="postgresql://casashopping_user:SuaSenhaForte123!@database:5432/casashopping?schema=public"

# JWT - Gere secrets únicos (ex: openssl rand -base64 32)
JWT_SECRET="seu-secret-unico-aqui"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_SECRET="outro-secret-unico-aqui"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Admin Inicial
ADMIN_EMAIL=admin@seudominio.com
ADMIN_PASSWORD=SenhaAdminForte123!
ADMIN_NAME=Administrador

# MinIO
MINIO_ROOT_USER=minio_admin
MINIO_ROOT_PASSWORD=SenhaMinioForte123!
MINIO_BUCKET_NAME=casashopping
MINIO_PUBLIC_ENDPOINT=http://SEU_IP_OU_DOMINIO:9000
MINIO_INTERNAL_ENDPOINT=http://storage:9000

# Base Paths
WEB_BASE_PATH=/casashopping
ADMIN_BASE_PATH=/admin
```

</details>

### Iniciando os Containers

Após configurar o `.env`, execute:

```bash
docker-compose up -d --build
```

Isso irá criar e iniciar todos os containers (banco, storage, serviços e frontends).

> [!TIP]
> **Verificando o status**: Use `docker-compose ps` para verificar se todos os containers estão rodando corretamente.

> [!IMPORTANT]
> **Configuração do MinIO**:
> Para que o upload de imagens funcione corretamente, certifique-se de que:
>
> - A variável `MINIO_PUBLIC_ENDPOINT` aponte para o IP/domínio acessível pelo navegador do usuário
> - A porta 9000 esteja liberada no firewall
> - O CORS esteja configurado corretamente no bucket (para ambientes atrás de proxy)

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

Consulte os arquivos `.env.example` em cada diretório para ver as variáveis necessárias. As principais são:

| Variável                | Descrição                                       |
| ----------------------- | ----------------------------------------------- |
| `DATABASE_URL`          | String de conexão do PostgreSQL                 |
| `JWT_SECRET`            | Secret para assinatura de tokens JWT            |
| `MINIO_PUBLIC_ENDPOINT` | Endpoint público do MinIO/S3                    |
| `NEXT_PUBLIC_API_URL`   | URL do API Gateway para os frontends            |
| `WEB_BASE_PATH`         | Base path do frontend web (ex: `/casashopping`) |
| `ADMIN_BASE_PATH`       | Base path do painel admin (ex: `/admin`)        |
| `NEXT_PUBLIC_BASE_PATH` | Base path público para redirects no client-side |
| `CORS_ORIGIN`           | Origens permitidas para CORS                    |

---

## 🌐 Deploy com Nginx (Reverse Proxy)

O Nginx atua como porta de entrada para todas as requisições externas.

### Entendendo o Fluxo de Requisição (Client vs Server)

É crucial entender a diferença entre as variáveis de API para configuração correta:

1.  **Requisições do Navegador (Client-Side)**:
    - O usuário acessa o site pelo navegador.
    - O navegador faz requisições AJAX para `NEXT_PUBLIC_API_URL`.
    - **Portanto**: `NEXT_PUBLIC_API_URL` deve apontar para o **IP Público/Domínio** do Nginx (ex: `http://casashopping.com.br/api`), que fará o proxy reverso para o container `api-gateway`.

2.  **Requisições do Servidor (Server-Side / SSR)**:
    - O próprio container do Next.js precisa buscar dados antes de renderizar a página.
    - Ele usa `INTERNAL_API_URL` para falar diretamente com o container da API via rede interna do Docker.
    - **Valor Padrão**: `http://api-gateway:3000` (já configurado no Docker Compose, não precisa alterar).

### Configuração do Nginx

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
