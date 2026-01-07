# CasaShopping Guide - Storefront (Web)

Aplicação web pública desenvolvida em **Next.js 14** (App Router) que serve como a vitrine digital do CasaShopping.

## 🚀 Funcionalidades

- **Vitrine de Produtos**: Exibição de produtos com suporte a destaques e categorias.
- **Busca e Filtros**: Pesquisa de produtos por nome e navegação por categorias.
- **Detalhes do Produto**: Página rica com fotos, descrição e informações da loja (telefone, redes sociais).
- **Modo Visitante**: Acesso irrestrito ao catálogo sem necessidade de conta.
- **Autenticação**: Login para funcionalidades avançadas como "Favoritos" e edição de perfil.
- **Design Responsivo**: Layout otimizado para desktop e mobile, com componentes touch-friendly (carrosséis).

## 🛠 Tech Stack

- **Framework**: Next.js 14
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + Shadcn/ui
- **Estado**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod

## 📦 Como Rodar

Este projeto faz parte de um monorepo. Para rodá-lo isoladamente:

1. Certifique-se de que os serviços de backend e o API Gateway estejam rodando.
2. Configure as variáveis de ambiente em `.env` (copie de `.env.example`).
3. Execute:

```bash
pnpm dev
```

A aplicação estará disponível em [http://localhost:3001](http://localhost:3001).

## 📁 Estrutura Chave

- `app/`: Rotas e páginas (App Router).
- `components/`: Componentes React reutilizáveis.
- `hooks/`: Custom hooks (ex: `useAuth`, `useCart`).
- `services/`: Camada de integração com a API.
