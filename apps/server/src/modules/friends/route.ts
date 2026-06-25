import { socketManager } from "@/lib/socket-manager";
import { ProtectedAppContext } from "@/types";
import { withResolvedMedia } from "@/utils/media";
import { SearchUsersDTO, SendFriendRequestDTO } from "@repo/types";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { friendsService } from "./service";

const friendsRoute = new Hono<ProtectedAppContext>();

/** Tell a user their friends/requests changed so the client can refetch. */
const notifyFriendsChanged = (userId: string) =>
  socketManager.io.emit(`user:${userId}:friends`, { changed: true });

// Accepted friends list.
friendsRoute.get("/", async (c) => {
  const res = await friendsService.listFriends(c.get("user").id);
  if (!res.ok) return c.json({ error: res.error }, 400);
  return c.json({ friends: withResolvedMedia(res.data) });
});

// Pending requests (incoming + outgoing).
friendsRoute.get("/requests", async (c) => {
  const res = await friendsService.listPending(c.get("user").id);
  if (!res.ok) return c.json({ error: res.error }, 400);
  return c.json({ requests: withResolvedMedia(res.data) });
});

// Search users by username to add as friends.
friendsRoute.get("/search", zValidator("query", SearchUsersDTO), async (c) => {
  const { q } = c.req.valid("query");
  const res = await friendsService.searchUsers(c.get("user").id, q);
  if (!res.ok) return c.json({ error: res.error }, 400);
  return c.json({ users: withResolvedMedia(res.data) });
});

// Send a friend request by username.
friendsRoute.post(
  "/requests",
  zValidator("json", SendFriendRequestDTO),
  async (c) => {
    const { username } = c.req.valid("json");
    const me = c.get("user").id;
    const res = await friendsService.sendRequestByUsername(me, username);
    if (!res.ok) return c.json({ error: res.error }, 400);
    notifyFriendsChanged(me);
    notifyFriendsChanged(res.data.addresseeId);
    return c.json({ friendship: res.data });
  },
);

// Send a friend request to a user by id (used by profile popups).
friendsRoute.post("/:userId/request", async (c) => {
  const me = c.get("user").id;
  const otherUserId = c.req.param("userId");
  const res = await friendsService.sendRequestByUserId(me, otherUserId);
  if (!res.ok) return c.json({ error: res.error }, 400);
  notifyFriendsChanged(me);
  notifyFriendsChanged(res.data.addresseeId);
  return c.json({ friendship: res.data });
});

// Accept a pending incoming request.
friendsRoute.post("/requests/:id/accept", async (c) => {
  const me = c.get("user").id;
  const res = await friendsService.respondToRequest(
    me,
    c.req.param("id"),
    true,
  );
  if (!res.ok) return c.json({ error: res.error }, 400);
  notifyFriendsChanged(me);
  notifyFriendsChanged(res.data.requesterId);
  return c.json({ friendship: res.data });
});

// Decline a pending incoming request.
friendsRoute.post("/requests/:id/decline", async (c) => {
  const me = c.get("user").id;
  const res = await friendsService.respondToRequest(
    me,
    c.req.param("id"),
    false,
  );
  if (!res.ok) return c.json({ error: res.error }, 400);
  notifyFriendsChanged(me);
  notifyFriendsChanged(res.data.requesterId);
  return c.json({ ok: true });
});

// Remove a friend or cancel an outgoing request.
friendsRoute.delete("/:userId", async (c) => {
  const me = c.get("user").id;
  const otherUserId = c.req.param("userId");
  const res = await friendsService.removeFriend(me, otherUserId);
  if (!res.ok) return c.json({ error: res.error }, 400);
  notifyFriendsChanged(me);
  notifyFriendsChanged(otherUserId);
  return c.json({ ok: true });
});

// Block a user.
friendsRoute.post("/:userId/block", async (c) => {
  const me = c.get("user").id;
  const otherUserId = c.req.param("userId");
  const res = await friendsService.blockUser(me, otherUserId);
  if (!res.ok) return c.json({ error: res.error }, 400);
  notifyFriendsChanged(me);
  notifyFriendsChanged(otherUserId);
  return c.json({ friendship: res.data });
});

export default friendsRoute;
