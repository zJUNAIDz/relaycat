import { CreateMessageDTO, EditMessageDTO } from "@repo/types";
import { notify } from "@/lib/notifier";
import { socketManager } from "@/lib/socket-manager";
import { messageService } from "@/modules/messages/service";
import { ProtectedAppContext, cursorSchema } from "@/types";
import { Hono } from "hono";
import z from "zod/v4";
import { zValidator } from "@hono/zod-validator";

const messageRoute = new Hono<ProtectedAppContext>();

messageRoute.get("/", async (c) => {  
  const channelId = z
    .string({ error: "channelId param is missing" })
    .safeParse(c.req.param("channelId"));
  if (channelId.success === false) {
    return c.json({ error: channelId.error.message }, 400);
  }
  
  const cursor = cursorSchema.safeParse(c.req.query());

  const res = await messageService.getMessagesByChannelId(
    channelId.data,
    c.get("user").id,
    cursor?.data,
  );
  if (res.ok === false) {
    return c.json({ error: res.error }, 400);
  }

  return c.json(res.data);
});

messageRoute.post("/", zValidator("json", CreateMessageDTO), async (c) => {
  const messageInput = c.req.valid("json");

  const channelId = z.string().safeParse(c.req.param("channelId"));
  if (channelId.success === false) {
    return c.json({ error: channelId.error.message }, 400);
  }

  const user = c.get("user");

  const res = await messageService.createMessage(
    messageInput,
    channelId.data,
    user.id,
  );
  if (res.ok === false) {
    return c.json({ error: res.error }, 400);
  }

  socketManager.io.emit(`chat:${channelId.data}:messages`, res.data);

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

  return c.json(res.data);
});

messageRoute.patch("/:messageId", zValidator("json", EditMessageDTO), async (c) => {
  const messageId = z.string().safeParse(c.req.param("messageId"));
  if (messageId.success === false) {
    return c.json({ error: messageId.error.message }, 400);
  }
  const channelId = z.string().safeParse(c.req.query("channelId"));
  if (channelId.success === false) {
    return c.json({ error: channelId.error.message }, 400);
  }
  const messageInput = c.req.valid("json");
  const user = c.get("user")!;
  const message = await messageService.updateMessage(
    messageId.data,
    user.id,
    messageInput,
  );
  socketManager.io.emit(`chat:${channelId.data}:messages:update`, message);
  return c.json(message);
});

messageRoute.delete("/:messageId", async (c) => {
  const params = z
    .object({
      messageId: z.string(),
      channelId: z.string(),
    })
    .safeParse(c.req.param());
  if (!params.success) {
    return c.json({ error: params.error.message }, 400);
  }
  const user = c.get("user")!;
  const message = await messageService.softDeleteMessage(
    params.data.messageId,
    user.id,
  );
  socketManager.io.emit(
    `chat:${params.data.channelId}:messages:delete`,
    message,
  );
  return c.json(message);
});
export default messageRoute;
