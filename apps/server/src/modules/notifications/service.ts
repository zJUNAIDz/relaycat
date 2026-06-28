import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import {
  Notification as NotificationRow,
  notifications,
} from "@/db/schema/notification";
import { profiles } from "@/db/schema/profile";
import { logger } from "@/lib/logger";
import { resolveMediaUrl } from "@/utils/media";
import type {
  Notification,
  NotificationActor,
  NotificationType,
} from "@repo/types";
import { and, count, desc, eq, lt } from "drizzle-orm";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

/** What a caller supplies to raise a notification. */
export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  actorId?: string | null;
  channelId?: string | null;
  serverId?: string | null;
  messageId?: string | null;
};

const PAGE_SIZE = 30;

/** Columns needed to render a {@link NotificationActor}, from a user+profile join. */
const actorColumns = {
  id: user.id,
  name: user.name,
  displayName: profiles.displayName,
  avatar: profiles.avatar,
  image: user.image,
};

type ActorRow = {
  id: string;
  name: string;
  displayName: string | null;
  avatar: string | null;
  image: string | null;
};

function toActor(row: ActorRow | null): NotificationActor | null {
  if (!row) return null;
  return {
    id: row.id,
    name: row.displayName ?? row.name,
    avatar: resolveMediaUrl(row.avatar ?? row.image),
  };
}

function toDTO(row: NotificationRow, actor: NotificationActor | null): Notification {
  return {
    id: row.id,
    type: row.type as NotificationType,
    title: row.title,
    body: row.body,
    read: row.read,
    actor,
    channelId: row.channelId,
    serverId: row.serverId,
    messageId: row.messageId,
    createdAt: row.createdAt.toISOString(),
  };
}

class NotificationService {
  /** Persist a notification and return it (with actor resolved) + unread total. */
  async create(
    input: CreateNotificationInput,
  ): Promise<Result<{ notification: Notification; unread: number }>> {
    try {
      const [row] = await db
        .insert(notifications)
        .values({
          userId: input.userId,
          type: input.type,
          title: input.title,
          body: input.body ?? null,
          actorId: input.actorId ?? null,
          channelId: input.channelId ?? null,
          serverId: input.serverId ?? null,
          messageId: input.messageId ?? null,
        })
        .returning();

      let actor: NotificationActor | null = null;
      if (row.actorId) {
        const [a] = await db
          .select(actorColumns)
          .from(user)
          .leftJoin(profiles, eq(profiles.userId, user.id))
          .where(eq(user.id, row.actorId))
          .limit(1);
        actor = toActor(a ?? null);
      }

      const unread = await this.unreadCount(input.userId);
      return { ok: true, data: { notification: toDTO(row, actor), unread } };
    } catch (error) {
      logger.error({ error }, "[notifications/create]");
      return { ok: false, error: "Could not create notification" };
    }
  }

  /** A page of the user's notifications, newest first. */
  async list(
    userId: string,
    cursor?: { before?: string },
  ): Promise<Result<{ notifications: Notification[]; nextCursor: string | null }>> {
    try {
      const rows = await db
        .select({
          notification: notifications,
          actor: actorColumns,
        })
        .from(notifications)
        .leftJoin(user, eq(user.id, notifications.actorId))
        .leftJoin(profiles, eq(profiles.userId, notifications.actorId))
        .where(
          and(
            eq(notifications.userId, userId),
            cursor?.before ? lt(notifications.id, cursor.before) : undefined,
          ),
        )
        .orderBy(desc(notifications.id))
        .limit(PAGE_SIZE);

      const data = rows.map((r) =>
        toDTO(r.notification, toActor(r.actor.id ? (r.actor as ActorRow) : null)),
      );
      const nextCursor =
        data.length === PAGE_SIZE ? data[data.length - 1].id : null;

      return { ok: true, data: { notifications: data, nextCursor } };
    } catch (error) {
      logger.error({ error }, "[notifications/list]");
      return { ok: false, error: "Could not load notifications" };
    }
  }

  /** How many unread notifications the user has. */
  async unreadCount(userId: string): Promise<number> {
    const [row] = await db
      .select({ value: count() })
      .from(notifications)
      .where(
        and(eq(notifications.userId, userId), eq(notifications.read, false)),
      );
    return row?.value ?? 0;
  }

  /** Mark one notification read (scoped to the owner). Returns new unread total. */
  async markRead(userId: string, id: string): Promise<Result<{ unread: number }>> {
    try {
      await db
        .update(notifications)
        .set({ read: true })
        .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
      return { ok: true, data: { unread: await this.unreadCount(userId) } };
    } catch (error) {
      logger.error({ error }, "[notifications/markRead]");
      return { ok: false, error: "Could not update notification" };
    }
  }

  /** Mark every unread notification read for the user. */
  async markAllRead(userId: string): Promise<Result<{ unread: number }>> {
    try {
      await db
        .update(notifications)
        .set({ read: true })
        .where(
          and(eq(notifications.userId, userId), eq(notifications.read, false)),
        );
      return { ok: true, data: { unread: 0 } };
    } catch (error) {
      logger.error({ error }, "[notifications/markAllRead]");
      return { ok: false, error: "Could not update notifications" };
    }
  }
}

export const notificationService = new NotificationService();
