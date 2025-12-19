FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Stage 1: Pruner - Isolate the app and its specific dependencies
FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=api-gateway --docker

# Stage 2: Installer & Builder - Install deps and build
FROM base AS builder
RUN apt-get update -y && apt-get install -y openssl python3 make g++
WORKDIR /app

# Install dependencies based on the pruned lockfile
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN npm install -g pnpm
RUN pnpm install

# Copy source code and build
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

# Generate Prisma Client
RUN pnpm --filter @repo/database exec prisma generate

# Build the application
RUN pnpm --filter=api-gateway build

# Stage 3: Runner - Minimal runtime image
FROM base AS runner
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

# Copy the built application from the builder stage
COPY --from=builder --chown=nestjs:nodejs /app .

EXPOSE 3000

# Run the compiled application directly
CMD ["node", "apps/api-gateway/dist/main"]
