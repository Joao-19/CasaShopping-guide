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
RUN apk add --no-cache openssl libc6-compat \
    && apk add --no-cache --repository=http://dl-cdn.alpinelinux.org/alpine/v3.17/main compat-openssl1.1
COPY --from=builder /app/apps/auth/dist ./apps/auth/dist
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/auth/package.json ./apps/auth/package.json
COPY --from=installer /app/apps/auth/node_modules ./apps/auth/node_modules
COPY --from=builder /app/packages ./packages
WORKDIR /app/apps/auth
CMD ["node", "dist/main"]
