# CasaShopping Guide - Painel Administrativo

Painel de gestão desenvolvido em **Next.js 14** para lojistas e administradores do CasaShopping Guide.

## 🚀 Funcionalidades

- **Dashboard**: Visão geral das métricas e atalhos.
- **Gestão de Lojas**:
  - Edição de perfil da loja.
  - Configuração de links de redes sociais (Instagram, Facebook, YouTube).
  - Atualização de logo e imagem de capa.
- **Gestão de Produtos**:
  - Listagem completa de produtos.
  - Criação e edição de produtos com upload de imagens.
  - Definição de destaques e status (Ativo/Inativo).
  - Controle de preços (incluindo "Preço Sob Consulta").

## 🛠 Tech Stack

- **Framework**: Next.js 14
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + Shadcn/ui
- **Estado**: TanStack Query
- **Validação**: Zod

## 📦 Como Rodar

Este projeto faz parte de um monorepo. Para rodá-lo isoladamente:

1. Certifique-se de que os serviços de backend e o API Gateway estejam rodando.
2. Configure as variáveis de ambiente em `.env` (copie de `.env.example`).
3. Execute:

```bash
pnpm dev
```

A aplicação estará disponível em [http://localhost:3002](http://localhost:3002).

## 🔐 Acesso

O acesso é restrito a usuários com permissões administrativas ou contas de lojista.
