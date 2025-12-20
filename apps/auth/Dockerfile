FROM node:20-alpine AS turbo-builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=auth-service --docker

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
RUN turbo run build --filter=auth-service

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/auth/dist ./apps/auth/dist
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/auth/package.json ./apps/auth/package.json
# Copy nested node_modules if they exist (will fail if not exists, so careful)
# A safer bet is to rely on bubbling up to root node_modules for dependencies.
# The entry point should be run from the app directory or with correct paths.
WORKDIR /app/apps/auth
CMD ["node", "dist/main"]
