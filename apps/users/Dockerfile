FROM node:20-alpine AS base

FROM base AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=users-service --docker

FROM base AS builder
RUN apk add --no-cache libc6-compat openssl python3 make g++
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN npm install -g pnpm
RUN pnpm install

COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

RUN pnpm --filter @repo/database exec prisma generate

RUN pnpm --filter=users-service build

FROM base AS runner
WORKDIR /app
RUN apk add --no-cache openssl
RUN npm install -g pnpm

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

COPY --from=builder --chown=nestjs:nodejs /app .

EXPOSE 3004

# users-service package.json defines start as "node dist/index.js"
CMD ["node", "apps/users/dist/main.js"]
