import { ChannelInsertSchema } from "@/db/schema/channel";
import { AppContext } from "@/types";
import { Hono } from "hono";
import { channelService } from "../services/channels.service";
import { serversService } from "@/services/servers.service";
import { logger } from "@/lib/logger";

const channelsRoute = new Hono<AppContext>();

channelsRoute.get("/", async (c) => {
  const { serverId } = c.req.query();
  const user = c.get("user");
  const channels = await channelService.getChannelsByServerId(
    serverId,
    user.id,
  );
  if (!channels) {
    return c.json({ error: "Channels not found or access denied" }, 400);
  }
  return c.json(channels);
});

channelsRoute.post("/", async (c) => {
  const body = await c.req.json();
  const log = c.get("logger") ?? logger;
  const channelData = ChannelInsertSchema.safeParse(body);
  if (channelData.error) {
    return c.json({ error: channelData.error.message }, 400);
  }
  const user = c.get("user");
  const newChannel = await channelService.createChannel(
    channelData.data,
    user.id,
  );
  if (!newChannel) {
    return c.json({ error: "Failed to create channel" }, 500);
  }
  log.info(
    {
      channel: {
        id: newChannel.id,
        name: newChannel.name,
      },
      userId: user.id,
    },
    "[NEW CHANNEL CREATED]",
  );
  return c.json(newChannel);
});

channelsRoute.get("/:channelId", async (c) => {
  const channelId = c.req.param("channelId");
  if (!channelId) {
    return c.json({ error: "channelId is required" }, 400);
  }
  const user = c.get("user");
  const channel = await channelService.getChannelById(channelId, user.id);
  if (!channel)
    return c.json({ error: "Channel not found or access denied" }, 400);
  return c.json(channel);
});

channelsRoute.patch("/:channelId", async (c) => {
  const body = await c.req.json();
  const channelData = ChannelInsertSchema.safeParse(body);
  if (channelData.error) {
    return c.json({ error: channelData.error.message }, 400);
  }
  const { channelId } = c.req.param();
  const user = c.get("user");
  const log = c.get("logger") ?? logger;
  // console.table({ name, type, channelId, userId });
  const channel = await channelService.editChannel(
    channelData.data,
    channelId,
    user.id,
  );
  if (!channel) {
    log.warn({ channelId, userId: user.id }, "[CHANNEL EDIT FAILED]");
    return c.json({ error: "channel not found or access denied" }, 404);
  }
  log.info({ channelId, userId: user.id }, "[CHANNEL EDIT SUCCESS]");
  return c.json({ channel });
});

channelsRoute.delete("/:channelId", async (c) => {
  const { channelId } = c.req.param();
  if (!channelId) {
    return c.json({ error: "id is required" }, 400);
  }
  const user = c.get("user");
  const channel = await channelService.deleteChannel(channelId, user.id);
  if (!channel) {
    return c.json({ error: "channel not found or access denied" }, 404);
  }
  return c.json({ channel });
});

export default channelsRoute;
