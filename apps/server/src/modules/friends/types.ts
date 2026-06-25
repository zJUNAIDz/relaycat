import type { FriendUser } from "@repo/types";

export type { FriendRequest, FriendUser } from "@repo/types";

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/** Columns selected to build a {@link FriendUser} projection. */
export type FriendUserRow = {
  userId: string;
  name: string;
  username: string | null;
  displayName: string | null;
  avatar: string | null;
};

export const toFriendUser = (row: FriendUserRow): FriendUser => ({
  userId: row.userId,
  username: row.username,
  displayName: row.displayName,
  name: row.name,
  avatar: row.avatar,
});
