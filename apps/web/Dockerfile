FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=web --docker

FROM base AS builder
RUN apt-get update -y && apt-get install -y openssl python3 make g++
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

RUN pnpm --filter @repo/database exec prisma generate

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Use pnpm --filter to run build directly, bypassing turbo CLI in builder
RUN pnpm --filter=web build

FROM base AS runner
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

COPY --from=builder --chown=nestjs:nodejs /app .

EXPOSE 3001

ENV HOME=/app

CMD ["pnpm", "--filter", "web", "start"]
