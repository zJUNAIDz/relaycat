import type { PresenceSettableStatus } from "@repo/types";
import type Redis from "ioredis";
import { redis } from "@/lib/redis";

/**
 * Persistence layer for presence. Tracks, per user:
 *   - the set of live socket ids (so multi-tab/multi-device counts correctly),
 *   - the user's chosen status (online/idle/dnd/invisible),
 *   - the last time they went fully offline.
 *
 * Two interchangeable implementations back this interface: Redis (shared across
 * server instances, self-healing via TTL) and an in-process Map (single
 * instance, zero infra). The {@link PresenceService} only talks to this.
 */
export interface PresenceStore {
  /** Register a live socket. Returns whether this is the user's first one. */
  addConnection(userId: string, socketId: string): Promise<{ firstConnection: boolean }>;
  /** Remove a socket. Returns whether the user has now gone fully offline. */
  removeConnection(userId: string, socketId: string): Promise<{ lastConnection: boolean }>;
  /** Refresh the TTL on a user's connection set (heartbeat). */
  touch(userId: string): Promise<void>;
  /** True if the user currently has at least one live connection. */
  isConnected(userId: string): Promise<boolean>;
  setStatus(userId: string, status: PresenceSettableStatus): Promise<void>;
  getStatus(userId: string): Promise<PresenceSettableStatus | null>;
  setLastSeen(userId: string, iso: string): Promise<void>;
  getLastSeen(userId: string): Promise<string | null>;
  /**
   * Reconcile crash-stale state: users marked online whose connections have
   * expired (e.g. an instance died without firing `disconnect`). Returns those
   * userIds after flipping them offline so callers can broadcast.
   */
  reapStale(): Promise<string[]>;
}

// TTL (seconds) on a user's connection set. Refreshed on connect + heartbeat;
// must comfortably exceed the client heartbeat interval so a live user is never
// reaped, while a crashed instance's users expire within ~this window.
const CONN_TTL = 70;
const STATUS_TTL = 60 * 60 * 24 * 7; // remember chosen status for a week
const LASTSEEN_TTL = 60 * 60 * 24 * 30;

const connKey = (userId: string) => `presence:conns:${userId}`;
const statusKey = (userId: string) => `presence:status:${userId}`;
const lastSeenKey = (userId: string) => `presence:lastseen:${userId}`;
const ONLINE_SET = "presence:online";

class RedisPresenceStore implements PresenceStore {
  constructor(private readonly client: Redis) {}

  async addConnection(userId: string, socketId: string) {
    await this.client.sadd(connKey(userId), socketId);
    await this.client.expire(connKey(userId), CONN_TTL);
    const size = await this.client.scard(connKey(userId));
    await this.client.sadd(ONLINE_SET, userId);
    return { firstConnection: size === 1 };
  }

  async removeConnection(userId: string, socketId: string) {
    await this.client.srem(connKey(userId), socketId);
    const size = await this.client.scard(connKey(userId));
    if (size === 0) {
      await this.client.del(connKey(userId));
      await this.client.srem(ONLINE_SET, userId);
      return { lastConnection: true };
    }
    return { lastConnection: false };
  }

  async touch(userId: string) {
    await this.client.expire(connKey(userId), CONN_TTL);
  }

  async isConnected(userId: string) {
    return (await this.client.exists(connKey(userId))) === 1;
  }

  async setStatus(userId: string, status: PresenceSettableStatus) {
    await this.client.set(statusKey(userId), status, "EX", STATUS_TTL);
  }

  async getStatus(userId: string) {
    return (await this.client.get(statusKey(userId))) as PresenceSettableStatus | null;
  }

  async setLastSeen(userId: string, iso: string) {
    await this.client.set(lastSeenKey(userId), iso, "EX", LASTSEEN_TTL);
  }

  async getLastSeen(userId: string) {
    return this.client.get(lastSeenKey(userId));
  }

  async reapStale() {
    const online = await this.client.smembers(ONLINE_SET);
    const stale: string[] = [];
    for (const userId of online) {
      if ((await this.client.exists(connKey(userId))) === 0) {
        await this.client.srem(ONLINE_SET, userId);
        await this.setLastSeen(userId, new Date().toISOString());
        stale.push(userId);
      }
    }
    return stale;
  }
}

class MemoryPresenceStore implements PresenceStore {
  private conns = new Map<string, Set<string>>();
  private statuses = new Map<string, PresenceSettableStatus>();
  private lastSeen = new Map<string, string>();

  async addConnection(userId: string, socketId: string) {
    let set = this.conns.get(userId);
    const firstConnection = !set || set.size === 0;
    if (!set) {
      set = new Set();
      this.conns.set(userId, set);
    }
    set.add(socketId);
    return { firstConnection };
  }

  async removeConnection(userId: string, socketId: string) {
    const set = this.conns.get(userId);
    if (!set) return { lastConnection: false };
    set.delete(socketId);
    if (set.size === 0) {
      this.conns.delete(userId);
      return { lastConnection: true };
    }
    return { lastConnection: false };
  }

  async touch() {
    /* no-op: in-memory connections never expire on their own */
  }

  async isConnected(userId: string) {
    return (this.conns.get(userId)?.size ?? 0) > 0;
  }

  async setStatus(userId: string, status: PresenceSettableStatus) {
    this.statuses.set(userId, status);
  }

  async getStatus(userId: string) {
    return this.statuses.get(userId) ?? null;
  }

  async setLastSeen(userId: string, iso: string) {
    this.lastSeen.set(userId, iso);
  }

  async getLastSeen(userId: string) {
    return this.lastSeen.get(userId) ?? null;
  }

  async reapStale() {
    // Single-instance: `disconnect` always fires, so nothing goes stale.
    return [];
  }
}

export const presenceStore: PresenceStore = redis
  ? new RedisPresenceStore(redis)
  : new MemoryPresenceStore();
