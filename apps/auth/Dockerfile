FROM node:20-alpine

WORKDIR /app

# Instalar dependências do sistema (OpenSSL)
RUN apk add --no-cache openssl

RUN npm install -g pnpm turbo

COPY pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY package.json ./

COPY . .

RUN pnpm install

# Gerar o Prisma Client
RUN pnpm --filter @repo/database exec prisma generate

EXPOSE 3003

CMD ["pnpm", "--filter", "auth-service", "dev"]
