FROM node:20-alpine AS turbo-builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=users-service --docker

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
RUN turbo run build --filter=users-service

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/users/dist ./dist
COPY --from=installer /app/node_modules ./node_modules
CMD ["node", "dist/main"]
