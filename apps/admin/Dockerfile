# syntax=docker/dockerfile:1.4
FROM node:20-alpine AS turbo-builder
RUN apk add --no-cache libc6-compat
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
RUN turbo prune --scope=admin --docker

FROM node:20-alpine AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy pruned output
COPY --from=turbo-builder /app/out/json/ .
COPY --from=turbo-builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies with cache mount for pnpm store
RUN corepack enable
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=installer /app/ .

# Copy turbo.json and source code
COPY turbo.json ./
COPY apps/admin ./apps/admin
COPY packages ./packages

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_HOST
ENV NEXT_PUBLIC_API_HOST=$NEXT_PUBLIC_API_HOST
ARG BASE_PATH
ENV BASE_PATH=$BASE_PATH
ARG NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH

# Build with turbo
RUN corepack enable && npm install -g turbo && turbo run build --filter=admin

FROM node:20-alpine AS runner
WORKDIR /app

# Create user in single layer
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/public ./apps/admin/public

CMD ["node", "apps/admin/server.js"]
