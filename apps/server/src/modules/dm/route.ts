import { socketManager } from "@/lib/socket-manager";
import { ProtectedAppContext } from "@/types";
import { withResolvedMedia } from "@/utils/media";
import {
  CreateMessageDTO,
  EditMessageDTO,
  OpenDmDTO,
} from "@repo/types";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { dmService } from "./service";
import { dmCursorSchema } from "./types";

const dmRoute = new Hono<ProtectedAppContext>();

// List the current user's DM channels.
dmRoute.get("/", async (c) => {
  const res = await dmService.listChannels(c.get("user").id);
  if (!res.ok) return c.json({ error: res.error }, 400);
  return c.json({ channels: withResolvedMedia(res.data) });
});

// Open (get-or-create) a DM with another user.
dmRoute.post("/", zValidator("json", OpenDmDTO), async (c) => {
  const { userId } = c.req.valid("json");
  const res = await dmService.getOrCreate(c.get("user").id, userId);
  if (!res.ok) return c.json({ error: res.error }, 400);
  return c.json({ channel: withResolvedMedia(res.data) });
});

// A single DM channel.
dmRoute.get("/:channelId", async (c) => {
  const res = await dmService.getChannel(
    c.get("user").id,
    c.req.param("channelId"),
  );
  if (!res.ok) return c.json({ error: res.error }, 404);
  return c.json({ channel: withResolvedMedia(res.data) });
});

// Paginated messages for a DM channel.
dmRoute.get("/:channelId/messages", async (c) => {
  const cursor = dmCursorSchema.safeParse(c.req.query());
  const res = await dmService.getMessages(
    c.get("user").id,
    c.req.param("channelId"),
    cursor.success ? cursor.data : undefined,
  );
  if (!res.ok) return c.json({ error: res.error }, 400);
  return c.json(withResolvedMedia(res.data));
});

// Send a message in a DM channel.
dmRoute.post(
  "/:channelId/messages",
  zValidator("json", CreateMessageDTO),
  async (c) => {
    const channelId = c.req.param("channelId");
    const res = await dmService.sendMessage(
      c.get("user").id,
      channelId,
      c.req.valid("json"),
    );
    if (!res.ok) return c.json({ error: res.error }, 400);
    const payload = withResolvedMedia(res.data);
    socketManager.io.emit(`chat:${channelId}:messages`, payload);
    return c.json(payload);
  },
);

// Edit a DM message.
dmRoute.patch(
  "/:channelId/messages/:messageId",
  zValidator("json", EditMessageDTO),
  async (c) => {
    const { channelId, messageId } = c.req.param();
    const res = await dmService.editMessage(
      c.get("user").id,
      messageId,
      c.req.valid("json").content,
    );
    if (!res.ok) return c.json({ error: res.error }, 400);
    socketManager.io.emit(`chat:${channelId}:messages:update`, res.data);
    return c.json({ message: res.data });
  },
);

// Delete a DM message.
dmRoute.delete("/:channelId/messages/:messageId", async (c) => {
  const { channelId, messageId } = c.req.param();
  const res = await dmService.deleteMessage(c.get("user").id, messageId);
  if (!res.ok) return c.json({ error: res.error }, 400);
  socketManager.io.emit(`chat:${channelId}:messages:delete`, res.data);
  return c.json({ message: res.data });
});

export default dmRoute;
