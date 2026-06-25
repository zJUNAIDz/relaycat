import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import {
  Friendship,
  FriendshipStatus,
  friendships,
} from "@/db/schema/friendship";
import { profiles } from "@/db/schema/profile";
import { logger } from "@/lib/logger";
import { and, eq, ilike, ne, or } from "drizzle-orm";
import type { FriendRequest, FriendUser } from "@repo/types";
import { FriendUserRow, Result, toFriendUser } from "./types";

/** Columns that make up a {@link FriendUser}, selectable from a user+profile join. */
const friendUserColumns = {
  userId: user.id,
  name: user.name,
  username: profiles.username,
  displayName: profiles.displayName,
  avatar: profiles.avatar,
};

class FriendsService {
  /** The single friendship row for an unordered pair, regardless of direction. */
  private async getEdge(
    a: string,
    b: string,
    tx = db,
  ): Promise<Friendship | null> {
    const [row] = await tx
      .select()
      .from(friendships)
      .where(
        or(
          and(
            eq(friendships.requesterId, a),
            eq(friendships.addresseeId, b),
          ),
          and(
            eq(friendships.requesterId, b),
            eq(friendships.addresseeId, a),
          ),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  /** True when the two users are accepted friends. Used to gate DM creation. */
  async areFriends(a: string, b: string): Promise<boolean> {
    const edge = await this.getEdge(a, b);
    return edge?.status === FriendshipStatus.ACCEPTED;
  }

  /** Search users by partial username, excluding self and blocked relations. */
  async searchUsers(
    currentUserId: string,
    q: string,
  ): Promise<Result<FriendUser[]>> {
    try {
      const rows = await db
        .select(friendUserColumns)
        .from(profiles)
        .innerJoin(user, eq(profiles.userId, user.id))
        .where(
          and(
            ilike(profiles.username, `%${q}%`),
            ne(user.id, currentUserId),
          ),
        )
        .limit(20);
      return { ok: true, data: rows.map(toFriendUser) };
    } catch (error) {
      logger.error({ error, q }, "[friendsService/searchUsers]");
      return { ok: false, error: "Search failed" };
    }
  }

  /** Send a friend request to the user owning `username`. */
  async sendRequestByUsername(
    currentUserId: string,
    username: string,
  ): Promise<Result<Friendship>> {
    const [target] = await db
      .select({ userId: profiles.userId })
      .from(profiles)
      .where(eq(profiles.username, username))
      .limit(1);
    if (!target) return { ok: false, error: "User not found" };
    return this.sendRequestByUserId(currentUserId, target.userId);
  }

  /** Send a friend request to a user by their id. */
  async sendRequestByUserId(
    currentUserId: string,
    targetUserId: string,
  ): Promise<Result<Friendship>> {
    try {
      if (targetUserId === currentUserId)
        return { ok: false, error: "You cannot add yourself" };

      const existing = await this.getEdge(currentUserId, targetUserId);
      if (existing) {
        if (existing.status === FriendshipStatus.ACCEPTED)
          return { ok: false, error: "Already friends" };
        if (existing.status === FriendshipStatus.BLOCKED)
          return { ok: false, error: "Unable to send request" };
        // A pending request already exists in one direction.
        if (existing.addresseeId === currentUserId) {
          // They already requested us — accept instead of duplicating.
          return this.respondToRequest(currentUserId, existing.id, true);
        }
        return { ok: false, error: "Request already sent" };
      }

      const [created] = await db
        .insert(friendships)
        .values({
          requesterId: currentUserId,
          addresseeId: targetUserId,
          status: FriendshipStatus.PENDING,
        })
        .returning();
      return { ok: true, data: created };
    } catch (error) {
      logger.error({ error, targetUserId }, "[friendsService/sendRequest]");
      return { ok: false, error: "Could not send request" };
    }
  }

  /** Accept (`accept=true`) or decline a pending incoming request. */
  async respondToRequest(
    currentUserId: string,
    friendshipId: string,
    accept: boolean,
  ): Promise<Result<Friendship>> {
    try {
      const [edge] = await db
        .select()
        .from(friendships)
        .where(eq(friendships.id, friendshipId))
        .limit(1);
      if (!edge) return { ok: false, error: "Request not found" };
      if (edge.addresseeId !== currentUserId)
        return { ok: false, error: "Not your request to answer" };
      if (edge.status !== FriendshipStatus.PENDING)
        return { ok: false, error: "Request is no longer pending" };

      if (!accept) {
        await db.delete(friendships).where(eq(friendships.id, friendshipId));
        return { ok: true, data: edge };
      }
      const [updated] = await db
        .update(friendships)
        .set({ status: FriendshipStatus.ACCEPTED })
        .where(eq(friendships.id, friendshipId))
        .returning();
      return { ok: true, data: updated };
    } catch (error) {
      logger.error({ error, friendshipId }, "[friendsService/respond]");
      return { ok: false, error: "Could not update request" };
    }
  }

  /** Remove a friend or cancel an outgoing request (deletes the edge). */
  async removeFriend(
    currentUserId: string,
    otherUserId: string,
  ): Promise<Result<true>> {
    try {
      const edge = await this.getEdge(currentUserId, otherUserId);
      if (!edge) return { ok: false, error: "No relationship to remove" };
      if (edge.status === FriendshipStatus.BLOCKED)
        return { ok: false, error: "Cannot remove a blocked relationship" };
      await db.delete(friendships).where(eq(friendships.id, edge.id));
      return { ok: true, data: true };
    } catch (error) {
      logger.error({ error, otherUserId }, "[friendsService/removeFriend]");
      return { ok: false, error: "Could not remove friend" };
    }
  }

  /** Block a user. The blocker becomes the requester so direction is unambiguous. */
  async blockUser(
    currentUserId: string,
    otherUserId: string,
  ): Promise<Result<Friendship>> {
    try {
      if (currentUserId === otherUserId)
        return { ok: false, error: "You cannot block yourself" };
      const result = await db.transaction(async (tx) => {
        const edge = await this.getEdge(currentUserId, otherUserId, tx);
        if (edge) {
          await tx.delete(friendships).where(eq(friendships.id, edge.id));
        }
        const [blocked] = await tx
          .insert(friendships)
          .values({
            requesterId: currentUserId,
            addresseeId: otherUserId,
            status: FriendshipStatus.BLOCKED,
          })
          .returning();
        return blocked;
      });
      return { ok: true, data: result };
    } catch (error) {
      logger.error({ error, otherUserId }, "[friendsService/blockUser]");
      return { ok: false, error: "Could not block user" };
    }
  }

  /** All accepted friends of the current user. */
  async listFriends(currentUserId: string): Promise<Result<FriendUser[]>> {
    try {
      const rows = await db
        .select({
          ...friendUserColumns,
          requesterId: friendships.requesterId,
          addresseeId: friendships.addresseeId,
        })
        .from(friendships)
        .innerJoin(
          user,
          or(
            and(
              eq(friendships.requesterId, currentUserId),
              eq(user.id, friendships.addresseeId),
            ),
            and(
              eq(friendships.addresseeId, currentUserId),
              eq(user.id, friendships.requesterId),
            ),
          ),
        )
        .leftJoin(profiles, eq(profiles.userId, user.id))
        .where(eq(friendships.status, FriendshipStatus.ACCEPTED));
      return { ok: true, data: rows.map(toFriendUser) };
    } catch (error) {
      logger.error({ error }, "[friendsService/listFriends]");
      return { ok: false, error: "Could not load friends" };
    }
  }

  /** Pending requests (both incoming and outgoing) for the current user. */
  async listPending(currentUserId: string): Promise<Result<FriendRequest[]>> {
    try {
      const rows = await db
        .select({
          friendshipId: friendships.id,
          requesterId: friendships.requesterId,
          addresseeId: friendships.addresseeId,
          createdAt: friendships.createdAt,
          ...friendUserColumns,
        })
        .from(friendships)
        .innerJoin(
          user,
          or(
            and(
              eq(friendships.requesterId, currentUserId),
              eq(user.id, friendships.addresseeId),
            ),
            and(
              eq(friendships.addresseeId, currentUserId),
              eq(user.id, friendships.requesterId),
            ),
          ),
        )
        .leftJoin(profiles, eq(profiles.userId, user.id))
        .where(
          and(
            eq(friendships.status, FriendshipStatus.PENDING),
            or(
              eq(friendships.requesterId, currentUserId),
              eq(friendships.addresseeId, currentUserId),
            ),
          ),
        );

      const data: FriendRequest[] = rows.map((r) => ({
        friendshipId: r.friendshipId,
        direction:
          r.requesterId === currentUserId ? "outgoing" : "incoming",
        createdAt: r.createdAt,
        user: toFriendUser(r as FriendUserRow),
      }));
      return { ok: true, data };
    } catch (error) {
      logger.error({ error }, "[friendsService/listPending]");
      return { ok: false, error: "Could not load requests" };
    }
  }
}

export const friendsService = new FriendsService();
