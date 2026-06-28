import {
  PRESENCE_EVENTS,
  SETTABLE_PRESENCE_STATUSES,
  type PresenceSettableStatus,
  type PresenceStatus,
  type PresenceUpdate,
} from "@repo/types";
import type { Server, Socket } from "socket.io";
import { logger } from "@/lib/logger";
import { presenceStore, type PresenceStore } from "./store";

/** Room a socket joins to receive presence for a given target user. */
const watchRoom = (userId: string) => `presence:${userId}`;

const isSettableStatus = (v: unknown): v is PresenceSettableStatus =>
  typeof v === "string" &&
  (SETTABLE_PRESENCE_STATUSES as readonly string[]).includes(v);

const MAX_WATCH = 500;
const REAP_INTERVAL = 30_000;

/**
 * Owns the presence protocol: turns raw socket lifecycle + client events into
 * presence state (via {@link PresenceStore}) and fan-out broadcasts.
 *
 * Fan-out is pull-based: a socket calls `subscribe(userIds)` for the people it
 * renders and joins their watch rooms; a user's change is emitted only to
 * `watchRoom(userId)`. This keeps broadcasts targeted (no global firehose) and
 * naturally scopes who learns about whom.
 */
export class PresenceService {
  constructor(
    private readonly io: Server,
    private readonly store: PresenceStore = presenceStore,
  ) {}

  /** Start the periodic reconciliation sweep (crash recovery). */
  start() {
    setInterval(() => {
      void this.reap();
    }, REAP_INTERVAL).unref?.();
  }

  async handleConnect(socket: Socket) {
    const userId = socket.data.userId;
    const { firstConnection } = await this.store.addConnection(userId, socket.id);
    // Echo the user's own chosen status back so the UI's picker is accurate.
    const own = (await this.store.getStatus(userId)) ?? "online";
    socket.emit(PRESENCE_EVENTS.self, { status: own });
    if (firstConnection) await this.broadcast(userId);
  }

  async handleDisconnect(socket: Socket) {
    const userId = socket.data.userId;
    const { lastConnection } = await this.store.removeConnection(userId, socket.id);
    if (lastConnection) {
      await this.store.setLastSeen(userId, new Date().toISOString());
      await this.broadcast(userId);
    }
  }

  async handleHeartbeat(socket: Socket) {
    await this.store.touch(socket.data.userId);
  }

  async handleSetStatus(socket: Socket, raw: unknown) {
    if (!isSettableStatus(raw)) return;
    const userId = socket.data.userId;
    await this.store.setStatus(userId, raw);
    socket.emit(PRESENCE_EVENTS.self, { status: raw });
    await this.broadcast(userId);
  }

  async handleSubscribe(socket: Socket, raw: unknown) {
    const ids = this.normalizeIds(raw);
    if (!ids.length) return;
    for (const id of ids) socket.join(watchRoom(id));
    socket.emit(PRESENCE_EVENTS.sync, await this.snapshot(ids));
  }

  handleUnsubscribe(socket: Socket, raw: unknown) {
    for (const id of this.normalizeIds(raw)) socket.leave(watchRoom(id));
  }

  /** Public presence (other people's view) for a single user. */
  private async resolve(userId: string): Promise<PresenceUpdate> {
    const connected = await this.store.isConnected(userId);
    const chosen = await this.store.getStatus(userId);
    let status: PresenceStatus;
    if (!connected || chosen === "invisible") status = "offline";
    else status = (chosen as PresenceStatus | null) ?? "online";
    const lastSeen =
      status === "offline" ? await this.store.getLastSeen(userId) : null;
    return { userId, status, lastSeen };
  }

  private async snapshot(userIds: string[]): Promise<PresenceUpdate[]> {
    return Promise.all(userIds.map((id) => this.resolve(id)));
  }

  private async broadcast(userId: string) {
    const update = await this.resolve(userId);
    this.io.to(watchRoom(userId)).emit(PRESENCE_EVENTS.update, update);
  }

  private async reap() {
    try {
      const stale = await this.store.reapStale();
      for (const userId of stale) await this.broadcast(userId);
    } catch (error) {
      logger.error({ error }, "[presence] reconciliation sweep failed");
    }
  }

  private normalizeIds(raw: unknown): string[] {
    if (!Array.isArray(raw)) return [];
    return Array.from(
      new Set(raw.filter((v): v is string => typeof v === "string")),
    ).slice(0, MAX_WATCH);
  }
}
