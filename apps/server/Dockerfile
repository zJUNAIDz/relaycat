# syntax=docker/dockerfile:1
# RelayCat API server — Bun runs the TypeScript source directly (no build step).
# Build context is the MONOREPO ROOT (for bun.lock + workspace packages).
# Must match `packageManager` in the root package.json — see apps/web/Dockerfile.
FROM oven/bun:1.3.14 AS base
WORKDIR /repo

# --- install dependencies (cached on manifest changes) ---
FROM base AS deps
COPY package.json bun.lock turbo.json ./
COPY packages/types/package.json packages/types/
COPY packages/typescript-config/package.json packages/typescript-config/
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# --- runtime ---
FROM base AS runtime
ENV NODE_ENV=production
# Bun installs per-workspace: hono, drizzle-orm, pg, socket.io et al. live in
# apps/server/node_modules, not the root. Copying only the root produces an image
# that builds fine and then dies on startup with unresolved imports.
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/server/node_modules ./apps/server/node_modules
COPY --from=deps /repo/packages/types/node_modules ./packages/types/node_modules
COPY package.json bun.lock turbo.json ./
COPY packages ./packages
COPY apps/server ./apps/server
WORKDIR /repo/apps/server
# Hono HTTP (HTTP_PORT) + Socket.IO (WS_PORT)
EXPOSE 8080 4001
CMD ["bun", "run", "src/index.ts"]
