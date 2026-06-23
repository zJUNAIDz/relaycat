# syntax=docker/dockerfile:1
# RelayCat API server — Bun runs the TypeScript source directly (no build step).
# Build context is the MONOREPO ROOT (for bun.lock + workspace packages).
FROM oven/bun:1.2.23 AS base
WORKDIR /repo

# --- install dependencies (cached on manifest changes) ---
FROM base AS deps
COPY package.json bun.lock turbo.json ./
COPY packages/types/package.json packages/types/
COPY packages/typescript-config/package.json packages/typescript-config/
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
RUN bun install --frozen-lockfile

# --- runtime ---
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=deps /repo/node_modules ./node_modules
COPY package.json bun.lock turbo.json ./
COPY packages ./packages
COPY apps/server ./apps/server
WORKDIR /repo/apps/server
# Hono HTTP (HTTP_PORT) + Socket.IO (WS_PORT)
EXPOSE 8080 4001
CMD ["bun", "run", "src/index.ts"]
