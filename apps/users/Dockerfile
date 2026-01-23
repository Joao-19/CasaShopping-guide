# syntax=docker/dockerfile:1.4
FROM node:20-slim AS turbo-builder
WORKDIR /app

# Install turbo once
RUN npm install -g turbo

# Copy ONLY package.json files for turbo prune (minimal context)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy only package.json from each app/package (NOT the full source)
COPY apps/web/package.json ./apps/web/package.json
COPY apps/admin/package.json ./apps/admin/package.json
COPY apps/api-gateway/package.json ./apps/api-gateway/package.json
COPY apps/auth/package.json ./apps/auth/package.json
COPY apps/users/package.json ./apps/users/package.json
COPY apps/stores/package.json ./apps/stores/package.json
COPY apps/products/package.json ./apps/products/package.json
COPY apps/storage/package.json ./apps/storage/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/dtos/package.json ./packages/dtos/package.json
COPY packages/api-client/package.json ./packages/api-client/package.json
COPY packages/auth-guard/package.json ./packages/auth-guard/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json

# Now run turbo prune (fast because only package.json files exist)
RUN turbo prune --scope=users-service --docker

FROM node:20-slim AS installer
WORKDIR /app

# Copy pruned output
COPY --from=turbo-builder /app/out/json/ .
COPY --from=turbo-builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies with cache mount for pnpm store
RUN corepack enable
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=installer /app/ .

# Copy turbo.json and source code
COPY turbo.json ./
COPY apps/users ./apps/users
COPY packages ./packages

# Install openssl and build in single layer
RUN apt-get update && apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/* && \
    corepack enable && \
    npm install -g turbo && \
    cd packages/database && npx prisma generate && cd ../.. && \
    turbo run build --filter=users-service

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

FROM node:20-slim AS runner
WORKDIR /app

# Install openssl in single optimized layer
RUN apt-get update && apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/apps/users/dist ./apps/users/dist
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/users/package.json ./apps/users/package.json
COPY --from=installer /app/apps/users/node_modules ./apps/users/node_modules
COPY --from=builder /app/packages ./packages

WORKDIR /app/apps/users
CMD ["node", "dist/main"]
