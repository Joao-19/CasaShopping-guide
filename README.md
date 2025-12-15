# CasaShopping Guide (Guia de Compras)

Plataforma digital de **Catálogo de Produtos** e **Gestão Administrativa** desenvolvida para o CasaShopping. O projeto adota uma **Arquitetura Evolutiva**, focando em agilidade de entrega (MVP) com bases sólidas para escalabilidade futura via Containerização e Microsserviços.

## 🚀 Visão Geral do Projeto

O sistema é composto por dois módulos integrados em uma estrutura Monorepo:

1.  **Storefront (Guia Público):** Interface focada na experiência do usuário, performance visual e responsividade móvel.
2.  **Back-office (Painel Admin):** Dashboard de gestão para lojistas e administradores controlarem produtos, categorias e lojas.

## 🛠 Tech Stack & Arquitetura

O projeto utiliza tecnologias modernas focadas em **Type Safety** e **Performance**:

- **Core:** Next.js 14 (App Router) + React
- **Linguagem:** TypeScript (Strict Mode)
- **Estilização:** Tailwind CSS + shadcn/ui
- **State Management:** TanStack Query (React Query)
- **Banco de Dados:** PostgreSQL
- **ORM:** Prisma
- **Infraestrutura:** Docker & Docker Compose
- **Validação:** Zod + React Hook Form

## 🏗 Destaques da Implementação

- **Arquitetura Híbrida (SSR/CSR):** Estratégia de renderização flexível, priorizando CSR para agilidade do MVP, mas tecnicamente preparada para Server-Side Rendering (SSR) e SEO futuro.
- **Containerização:** Ambiente de desenvolvimento padronizado via Docker, garantindo paridade entre Dev e Prod.
- **API Documentation:** Documentação automática de endpoints via Swagger/OpenAPI.
- **Type Safety:** Tipagem ponta-a-ponta (do Banco de Dados ao Front-end) garantida pelo Prisma e TypeScript.

## 📦 Como rodar localmente

### Pré-requisitos

- Node.js 20+
- Docker & Docker Compose

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/Joao-19/casashopping-guide.git
   ```
