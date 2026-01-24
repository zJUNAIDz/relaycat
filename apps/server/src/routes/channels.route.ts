import { ChannelInsertSchema } from "@/db/schema/channel";
import { AppContext } from "@/types";
import { Hono } from "hono";
import { channelService } from "../services/channels.service";
import { serversService } from "@/services/servers.service";

const channelsRoute = new Hono<AppContext>();

channelsRoute.get("/", async (c) => {
  try {
    const { serverId } = c.req.query();
    const user = c.get("user");
    const channels = await channelService.getChannelsByServerId(
      serverId,
      user.id,
    );
    if (!channels) {
      return c.json({ error: "Channels not found or access denied" }, 400);
    }
    return c.json({ channels });
  } catch (err) {
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

channelsRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const channelData = ChannelInsertSchema.safeParse(body);
    if (channelData.error) {
      return c.json({ error: channelData.error.message }, 400);
    }
    const user = c.get("user");
    // check if user is a member of server and is mod or admin
    const server = await serversService.getServer(
      channelData.data.serverId,
      user.id,
    );
    if (!server) {
      return c.json({ error: "Server not found or access denied" }, 404);
    }
    if (
      server.members.some(
        (member) =>
          member.userId === user.id &&
          (member.role === "ADMIN" || member.role === "MODERATOR"),
      )
    ) {
      return c.json(
        { error: "Insufficient permissions to create channel" },
        403,
      );
    }

    const newChannel = await channelService.createChannel(channelData.data);
    return c.json({ newChannel });
  } catch (err) {
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

channelsRoute.get("/:channelId", async (c) => {
  try {
    const channelId = c.req.param("channelId");
    if (!channelId) {
      return c.json({ error: "channelId is required" }, 400);
    }
    const user = c.get("user");
    const channel = await channelService.getChannelById(channelId, user.id);
    if (!channel)
      return c.json({ error: "Channel not found or access denied" }, 400);
    return c.json({ channel });
  } catch (err) {
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

channelsRoute.patch("/:channelId", async (c) => {
  try {
    const body = await c.req.json();
    const channelData = ChannelInsertSchema.safeParse(body);
    if (channelData.error) {
      return c.json({ error: channelData.error.message }, 400);
    }
    const { channelId } = c.req.param();
    const user = c.get("user");
    // console.table({ name, type, channelId, userId });
    const channel = await channelService.editChannel(
      channelData.data,
      channelId,
      user.id,
    );
    if (!channel) {
      return c.json({ error: "channel not found or access denied" }, 404);
    }
    return c.json({ channel });
  } catch (err) {
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

channelsRoute.delete("/:channelId", async (c) => {
  try {
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
  } catch (err) {
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export default channelsRoute;
