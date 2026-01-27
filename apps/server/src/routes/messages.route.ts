import { MessageCreateSchema } from "@/db/schema/message";
import { socketManager } from "@/lib/socket-manager";
import { messageService } from "@/services/message.service";
import { AppContext, cursorSchema } from "@/types";
import { Hono } from "hono";
import z from "zod/v4";

const messageRoute = new Hono<AppContext>();

messageRoute.get("/", async (c) => {
  const channelId = z
    .string({ error: "channelId param is missing" })
    .safeParse(c.req.query("channelId"));
  if (channelId.success === false) {
    return c.json({ error: channelId.error.message }, 400);
  }

  const cursor = cursorSchema.safeParse(c.req.query());
  if (!cursor.success) {
    return c.json({ error: cursor.error.message }, 400);
  }

  const res = await messageService.getMessagesByChannelId(
    channelId.data,
    c.get("user").id,
    cursor.data,
  );
  if (res.ok === false) {
    return c.json({ error: res.error }, 400);
  }

  return c.json(res.data);
});

messageRoute.post("/", async (c) => {
  const messageInput = MessageCreateSchema.safeParse(await c.req.json());
  if (!messageInput.success) {
    return c.json(
      { error: messageInput.error, message: "no message input found" },
      400,
    );
  }

  const channelId = z.string().safeParse(c.req.param("channelId"));
  if (channelId.success === false) {
    return c.json({ error: channelId.error.message }, 400);
  }

  const user = c.get("user");

  const res = await messageService.createMessage(
    messageInput.data,
    channelId.data,
    user.id,
  );
  if (res.ok === false) {
    return c.json({ error: res.error }, 400);
  }

  socketManager.io.emit(`chat:${channelId.data}:messages`, res.data);

  return c.json(res.data);
});

messageRoute.patch("/:messageId", async (c) => {
  const messageId = z.string().safeParse(c.req.param("messageId"));
  if (messageId.success === false) {
    return c.json({ error: messageId.error.message }, 400);
  }
  const channelId = z.string().safeParse(c.req.query("channelId"));
  if (channelId.success === false) {
    return c.json({ error: channelId.error.message }, 400);
  }
  const messageInput = MessageCreateSchema.safeParse(await c.req.json());
  if (!messageInput.success) {
    return c.json(
      { error: messageInput.error, message: "no message input found" },
      400,
    );
  }
  const user = c.get("user")!;
  if (!messageInput.data.content || messageInput.data.content.trim() === "") {
    return c.json({ error: "Content is required" }, 400);
  }
  const message = await messageService.updateMessage(
    messageId.data,
    user.id,
    messageInput.data,
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
