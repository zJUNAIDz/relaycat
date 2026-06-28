import { ProtectedAppContext } from "@/types";
import { Hono } from "hono";
import z from "zod/v4";
import { notificationService } from "./service";

const notificationsRoute = new Hono<ProtectedAppContext>();

// The current user's notifications, newest first (cursor-paginated).
notificationsRoute.get("/", async (c) => {
  const before = z.string().optional().safeParse(c.req.query("before"));
  const res = await notificationService.list(c.get("user").id, {
    before: before.success ? before.data : undefined,
  });
  if (!res.ok) return c.json({ error: res.error }, 400);
  return c.json(res.data);
});

// Unread count (cheap; for the badge on first paint).
notificationsRoute.get("/unread-count", async (c) => {
  const unread = await notificationService.unreadCount(c.get("user").id);
  return c.json({ unread });
});

// Mark all notifications read.
notificationsRoute.post("/read-all", async (c) => {
  const res = await notificationService.markAllRead(c.get("user").id);
  if (!res.ok) return c.json({ error: res.error }, 400);
  return c.json(res.data);
});

// Mark a single notification read.
notificationsRoute.post("/:id/read", async (c) => {
  const res = await notificationService.markRead(
    c.get("user").id,
    c.req.param("id"),
  );
  if (!res.ok) return c.json({ error: res.error }, 400);
  return c.json(res.data);
});

export default notificationsRoute;
