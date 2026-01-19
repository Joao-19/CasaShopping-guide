# Requisitos de Infraestrutura (ECS) - Projeto Guia

Este documento detalha os recursos computacionais e requisitos de armazenamento para o deploy da aplicação no **AWS ECS**.

## 1. Tabela de Recursos por Serviço (Container)

| Serviço                       | vCPU (Recomendado) | RAM (Mínima) | RAM (Recomendada) | Notas Importantes                             |
| :---------------------------- | :----------------- | :----------- | :---------------- | :-------------------------------------------- |
| **Backend (Node.js/Nest)**    | 0.5 vCPU           | 512 MB       | 1 GB              | Stateless. Pode escalar horizontalmente.      |
| **Frontend (Next.js)**        | 0.25 vCPU          | 256 MB       | 512 MB            | Stateless. SSR consome RAM.                   |
| **Banco de Dados (Postgres)** | **1 vCPU**         | 1 GB         | **2 GB**          | **Stateful.** Crítico para performance.       |
| **Storage (MinIO)**           | 0.5 vCPU           | 512 MB       | **1 GB**          | **Stateful.** Consome RAM com muitos objetos. |

> **Total Estimado (Mínimo Confortável):** Cluster com ~2.5 vCPUs e ~5GB RAM disponíveis.

## 2. Requisitos Críticos de Persistência (ATENÇÃO ⚠️)

Como **não** estamos usando serviços gerenciados (RDS/S3), a persistência dos dados depende inteiramente da configuração dos volumes no ECS.

### A. Banco de Dados (PostgreSQL)

- **Volume:** O container do Postgres deve montar um volume persistente em `/var/lib/postgresql/data`.
- **Tecnologia:** Recomenda-se uso de **EFS (Elastic File System)** ou EBS Multi-Attach.
- **Risco:** Se o container reiniciar sem um volume externo montado, **TODOS OS DADOS SERÃO PERDIDOS** (tabelas, usuários, relacionamentos).

### B. Arquivos (MinIO)

- **Volume:** O container do MinIO deve montar um volume persistente em `/data`.
- **Tecnologia:** **EFS** é altamente recomendado se houver planos de escalar o MinIO para mais de uma réplica. EBS funciona para instância única.
- **Risco:** Se o volume for perdido, todas as imagens de produtos e usuários somem.

## 3. Variáveis de Ambiente de Produção

No Definition Task do ECS, certifique-se de definir:

- `INTERNAL_API_URL`: Deve apontar para o endereço interno do gateway (ex: `http://api-gateway:3000`).
- `NEXT_PUBLIC_API_URL`: Deve ser o endereço do Load Balancer público (ex: `https://api.meuprojeto.com.br`).
- `MINIO_PUBLIC_ENDPOINT`: Endereço público do S3/MinIO (ex: `https://storage.meuprojeto.com.br`).

## 4. Health Checks

Os serviços já possuem endpoints de saúde configurados para o Load Balancer monitorar:

- Backend: `/health` (HTTP 200)
- MinIO: `/minio/health/live` (HTTP 200)

## 5. Suporte à Implantação e Customizações

Estamos à total disposição para colaborar com a equipe de infraestrutura durante o deploy.

Caso sejam necessárias adaptações específicas para o ambiente produtivo, tais como:

- Configuração de **Proxies Reversos** para subdomínios (ex: `admin.casashopping.com.br` apontando para o app Admin);
- Ajustes de roteamento ou variáveis de ambiente adicionais;

Por favor, entrem em contato para que possamos realizar as alterações de forma ágil e alinhada com a infraestrutura.
