FROM node:20-slim AS turbo-builder
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=products-service --docker

FROM node:20-slim AS installer
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=turbo-builder /app/out/json/ .
COPY --from=turbo-builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN corepack enable
RUN pnpm install --no-frozen-lockfile

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=turbo-builder /app/out/full/ .
RUN apt-get update && apt-get install -y openssl
RUN corepack enable
RUN npm install -g turbo
RUN cd packages/database && npx prisma generate
RUN turbo run build --filter=products-service

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

FROM node:20-slim AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/apps/products/dist ./apps/products/dist
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/products/package.json ./apps/products/package.json
COPY --from=installer /app/apps/products/node_modules ./apps/products/node_modules
COPY --from=builder /app/packages ./packages
WORKDIR /app/apps/products
CMD ["node", "dist/main"]
