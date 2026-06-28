import Redis from "ioredis";
import { logger } from "./logger";

/**
 * Redis is optional. When `REDIS_URL` is set we get a shared, multi-instance
 * presence backbone (and the Socket.IO Redis adapter); when it's absent the
 * app still boots and presence falls back to an in-process store — handy for
 * local dev without extra infra. See `socket/presence/store.ts`.
 */
export const REDIS_URL = process.env.REDIS_URL;

/** Create a fresh ioredis connection, or `null` when Redis isn't configured. */
export function createRedis(): Redis | null {
  if (!REDIS_URL) return null;
  // `maxRetriesPerRequest: null` keeps commands queued across reconnects
  // instead of failing — required by the Socket.IO adapter's pub/sub clients.
  const client = new Redis(REDIS_URL, { maxRetriesPerRequest: null });
  client.on("error", (error) => logger.error({ error }, "[redis] connection error"));
  return client;
}

/** Shared client used by the presence store for state reads/writes. */
export const redis = createRedis();

if (redis) {
  logger.info("[redis] presence backed by Redis");
} else {
  logger.warn("[redis] REDIS_URL not set — presence using in-memory store");
}
