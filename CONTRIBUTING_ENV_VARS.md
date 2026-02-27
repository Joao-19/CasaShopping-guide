# Protocolo para Adição de Variáveis de Ambiente (NEXT_PUBLIC)

Este projeto utiliza uma estratégia de **Runtime Environment Substitution** em containers Docker para permitir que variáveis `NEXT_PUBLIC_` do Next.js sejam alteradas sem necessidade de um novo build. 

Ao adicionar uma nova variável `NEXT_PUBLIC_XXXX`, você **DEVE** atualizar os seguintes locais, ou a variável aparecerá como um "placeholder" no navegador.

## Checklist de Implementação

### 1. Arquivos de Ambiente
- [ ] Adicionar ao `.env` local.
- [ ] Adicionar ao `.env.example` para documentação.
- [ ] Adicionar ao `README.md` na seção de Variáveis de Ambiente.

### 2. Docker Cloud Native Build (Dockerfiles)
- [ ] No `apps/web/Dockerfile` e `apps/admin/Dockerfile`, adicione o placeholder:
  ```dockerfile
  ENV NEXT_PUBLIC_XXXX=APP_NEXT_PUBLIC_XXXX
  ```
  Isso "carimba" o código compilado com um texto que será substituído no boot do container.

### 3. Script de Deploy (`deploy.sh`)
- [ ] Você **DEVE** exportar a variável no script de deploy para que ela seja injetada durante o build e no `docker-compose.yml`:
  ```bash
  export NEXT_PUBLIC_XXXX="${NEXT_PUBLIC_XXXX:-}"
  ```
- [ ] Passe a variável para o comando de build:
  ```bash
  NEXT_PUBLIC_XXXX="${NEXT_PUBLIC_XXXX}" docker compose build
  ```

### 4. Orquestração (`docker-compose.yml`)
- [ ] Mapeie a variável do host para o container nos serviços `web` e `admin`:
  ```yaml
  environment:
    - NEXT_PUBLIC_XXXX=${NEXT_PUBLIC_XXXX}
  ```

### 5. Substituição no Boot (`entrypoint.sh`)
- [ ] Garanta que o script de entrypoint (`apps/web/entrypoint.sh` e `apps/admin/entrypoint.sh`) processa a variável. O script usa um loop dinâmico, mas é boa prática garantir que ela esteja no escopo.

---

> [!IMPORTANT]
> **Ponto de Falha Comum**: Esquecer de atualizar o `deploy.sh`. Se a variável não for exportada no bash ANTES do `docker compose build`, o placeholder `APP_NEXT_PUBLIC_XXXX` não será substituído corretamente no servidor, pois o container não terá conhecimento do valor real da variável de ambiente no boot.
