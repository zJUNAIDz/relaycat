# syntax=docker/dockerfile:1
# RelayCat web (Next.js, standalone output).
# Build context is the MONOREPO ROOT (for bun.lock + workspace packages).
# Must match `packageManager` in the root package.json: bun.lock is written in
# the 1.3 format ("configVersion"), and an older bun reads it as out-of-sync,
# so --frozen-lockfile re-resolves the whole tree against the registry instead
# of installing from the lockfile.
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

# --- build (NEXT_PUBLIC_* are inlined here from .env.prod) ---
FROM base AS build
ENV NODE_ENV=production
# Bun installs per-workspace, so the root node_modules holds almost nothing: the
# `next` binary and every web dependency live in apps/web/node_modules. Copying
# only the root leaves `next: command not found`. These land before the source
# copy so a source edit doesn't invalidate them (COPY merges into a directory,
# it doesn't clear it, so the later `COPY apps/web` leaves them intact).
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /repo/packages/types/node_modules ./packages/types/node_modules
COPY package.json bun.lock turbo.json ./
COPY packages ./packages
COPY apps/web ./apps/web
# Next.js loads .env.production at build time -> bakes the NEXT_PUBLIC_* values.
RUN cp apps/web/.env.prod apps/web/.env.production
WORKDIR /repo/apps/web
RUN bun run build

# --- runner (Node serves the self-contained standalone output) ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# standalone bundle mirrors the monorepo layout under apps/web/
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /repo/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
