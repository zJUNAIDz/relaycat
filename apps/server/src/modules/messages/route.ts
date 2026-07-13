import { CreateMessageDTO, EditMessageDTO, Permission } from "@repo/types";
import { notify } from "@/lib/notifier";
import { socketManager } from "@/lib/socket-manager";
import { channelService } from "@/modules/channels/service";
import { messageService } from "@/modules/messages/service";
import { requirePermission, ServerIdResolver } from "@/middlewares/permission";
import { withResolvedMedia } from "@/utils/media";
import { ProtectedAppContext, cursorSchema } from "@/types";
import { Hono } from "hono";
import z from "zod/v4";
import { zValidator } from "@hono/zod-validator";

// Mounted at /channels/:channelId/messages — the server is derived from the
// channel in the path, so every handler below is authorized against it.
const messageRoute = new Hono<ProtectedAppContext>();

const serverIdFromChannel: ServerIdResolver = (c) =>
  channelService.getServerIdForChannel(c.req.param("channelId"));

messageRoute.get(
  "/",
  requirePermission(Permission.VIEW_SERVER, serverIdFromChannel),
  async (c) => {
    const channelId = z
      .string({ error: "channelId param is missing" })
      .safeParse(c.req.param("channelId"));
    if (channelId.success === false) {
      return c.json({ error: channelId.error.message }, 400);
    }

    const cursor = cursorSchema.safeParse(c.req.query());

    const res = await messageService.getMessagesByChannelId(
      channelId.data,
      cursor?.data,
    );
    if (res.ok === false) {
      return c.json({ error: res.error }, 400);
    }

    return c.json(withResolvedMedia(res.data));
  },
);

messageRoute.post(
  "/",
  requirePermission(Permission.SEND_MESSAGES, serverIdFromChannel),
  zValidator("json", CreateMessageDTO),
  async (c) => {
    const messageInput = c.req.valid("json");

    const channelId = z.string().safeParse(c.req.param("channelId"));
    if (channelId.success === false) {
      return c.json({ error: channelId.error.message }, 400);
    }

    const user = c.get("user");
    const ctx = c.get("memberContext");

    const res = await messageService.createMessage(
      messageInput,
      channelId.data,
      ctx,
    );
    if (res.ok === false) {
      return c.json({ error: res.error }, 400);
    }

    // Resolve media (overlaid profile avatar key → URL) once for both the live
    // broadcast and the HTTP response so history and realtime stay identical.
    const payload = withResolvedMedia(res.data);
    socketManager.io.emit(`chat:${channelId.data}:messages`, payload);

    // Notify @-mentioned users (notifier drops the author if self-mentioned).
    const mentions = res.data.message.mentions ?? [];
    if (mentions.length) {
      const preview = res.data.message.content?.slice(0, 140) ?? null;
      void Promise.all(
        mentions.map((mentionedId) =>
          notify({
            userId: mentionedId,
            type: "MENTION",
            title: `${res.data.user.name} mentioned you`,
            body: preview,
            actorId: user.id,
            channelId: channelId.data,
            serverId: res.data.member.serverId,
            messageId: res.data.message.id,
          }),
        ),
      ).catch(() => {});
    }

    return c.json(payload);
  },
);

// Editing is always author-only: MANAGE_MESSAGES lets you remove someone else's
// message, never rewrite it in their name.
messageRoute.patch(
  "/:messageId",
  requirePermission(Permission.SEND_MESSAGES, serverIdFromChannel),
  zValidator("json", EditMessageDTO),
  async (c) => {
    const params = z
      .object({ messageId: z.string(), channelId: z.string() })
      .safeParse(c.req.param());
    if (!params.success) {
      return c.json({ error: params.error.message }, 400);
    }
    const messageInput = c.req.valid("json");
    const ctx = c.get("memberContext");

    const res = await messageService.updateMessage(
      params.data.messageId,
      params.data.channelId,
      ctx,
      messageInput,
    );
    if (res.ok === false) {
      return c.json({ error: res.error }, 403);
    }
    socketManager.io.emit(
      `chat:${params.data.channelId}:messages:update`,
      res.data,
    );
    return c.json(res.data);
  },
);

// Deleting is allowed for the author, or for anyone holding MANAGE_MESSAGES
// (checked inside the service against the resolved member context).
messageRoute.delete(
  "/:messageId",
  requirePermission(Permission.VIEW_SERVER, serverIdFromChannel),
  async (c) => {
    const params = z
      .object({
        messageId: z.string(),
        channelId: z.string(),
      })
      .safeParse(c.req.param());
    if (!params.success) {
      return c.json({ error: params.error.message }, 400);
    }
    const ctx = c.get("memberContext");

    const res = await messageService.softDeleteMessage(
      params.data.messageId,
      params.data.channelId,
      ctx,
    );
    if (res.ok === false) {
      return c.json({ error: res.error }, 403);
    }
    socketManager.io.emit(
      `chat:${params.data.channelId}:messages:delete`,
      res.data,
    );
    return c.json(res.data);
  },
);
export default messageRoute;
