FROM node:20-alpine AS turbo-builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=admin --docker

FROM node:20-alpine AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=turbo-builder /app/out/json/ .
COPY --from=turbo-builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN corepack enable
RUN pnpm install --no-frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=turbo-builder /app/out/full/ .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=APP_NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_HOST
ENV NEXT_PUBLIC_API_HOST=APP_NEXT_PUBLIC_API_HOST
ARG BASE_PATH
ENV BASE_PATH=$BASE_PATH
ARG NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_BASE_PATH=APP_NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_WEB_URL
ENV NEXT_PUBLIC_WEB_URL=APP_NEXT_PUBLIC_WEB_URL
ENV NEXT_PUBLIC_GTM_ID=APP_NEXT_PUBLIC_GTM_ID
ENV NEXT_PUBLIC_GA4_ID=APP_NEXT_PUBLIC_GA4_ID

RUN corepack enable
RUN npm install -g turbo
RUN turbo run build --filter=admin

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/public ./apps/admin/public

# Copy entrypoint script
COPY --chown=nextjs:nodejs apps/admin/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "apps/admin/server.js"]
