FROM node:20-alpine AS turbo-builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=api-gateway --docker

FROM node:20-alpine AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=turbo-builder /app/out/json/ .
COPY --from=turbo-builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN corepack enable
RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=turbo-builder /app/out/full/ .
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable
RUN npm install -g turbo
RUN cd packages/database && npx prisma generate
RUN turbo run build --filter=api-gateway

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
COPY --from=builder /app/apps/api-gateway/dist ./apps/api-gateway/dist
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/api-gateway/package.json ./apps/api-gateway/package.json
COPY --from=installer /app/apps/api-gateway/node_modules ./apps/api-gateway/node_modules
COPY --from=builder /app/packages ./packages
WORKDIR /app/apps/api-gateway
CMD ["node", "dist/main"]
