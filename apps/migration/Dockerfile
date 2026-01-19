FROM node:20-slim

WORKDIR /app

# Instalar OpenSSL para o Prisma
RUN apt-get update -y && apt-get install -y openssl

# Copiar schema e arquivos necessários
COPY packages/database/prisma ./prisma

# Instalar apenas o prisma CLIENT e CLI
RUN npm install prisma@5.22.0

# Script de entrada
COPY apps/migration/init-db.sh .
RUN chmod +x init-db.sh

ENTRYPOINT ["./init-db.sh"]
