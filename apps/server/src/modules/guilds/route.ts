import { Server } from "@/db/schema/server";
import { CreateServerDTO, EditServerDTO } from "@repo/types";
import { serversService } from "@/modules/guilds/service";
import { ProtectedAppContext } from "@/types";
import { withResolvedMedia } from "@/utils/media";
import { randomUUIDv7 } from "bun";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

const serverRoutes = new Hono<ProtectedAppContext>();

serverRoutes.get("/public",async (c) => {
  const servers = await serversService.getPublicServers();
  return c.json(withResolvedMedia(servers));
})

// Get all servers for the current user
serverRoutes.get("/", async (c) => {
  const user = c.get("user");
  const servers = await serversService.getServersByUserId(user.id);
  return c.json(withResolvedMedia(servers));
});

// Create a new server
serverRoutes.post("/", zValidator("json", CreateServerDTO), async (c) => {
  const log = c.get("logger");
  const serverData = c.req.valid("json");

  const user = c.get("user");
  const server = await serversService.createServer(user.id, serverData);
  if (!server) {
    log.error({ user, serverData }, "[NEW SERVER CREATION FAILED]");
    return c.json({ error: "Failed to create server" }, 500);
  }
  log.info({ server }, "[NEW SERVER CREATED]");
  return c.json(withResolvedMedia(server));
});

// Get a specific server by ID
serverRoutes.get("/:serverId", async (c) => {
  const serverId = c.req.param("serverId") as Server["id"];
  const user = c.get("user");
  const server = await serversService.getServer(serverId, user.id);
  if (!server) {
    return c.json({ error: "server not found" }, 404);
  }
  return c.json(withResolvedMedia(server));
});

// Edit a server
serverRoutes.patch("/:serverId", zValidator("json", EditServerDTO), async (c) => {
  const serverId = c.req.param("serverId") as Server["id"];
  const log = c.get("logger");
  const serverData = c.req.valid("json");
  const user = c.get("user");
  const server = await serversService.editServer(user.id, serverId, serverData);
  if (!server) {
    return c.json({ error: "Failed to edit server" }, 400);
  }
  log.info({ serverId }, "[SERVER PATCH EDITED]");
  return c.json(withResolvedMedia(server));
});

// Delete a server
serverRoutes.delete("/:serverId", async (c) => {
  const serverId = c.req.param("serverId") as Server["id"];
  const user = c.get("user");
  const log = c.get("logger");
  const success = await serversService.deleteServer(serverId, user.id);
  if (!success) {
    log.warn({ user, serverId }, "[SERVER DELETE FAILED]");
    return c.json({ error: "Failed to delete server" }, 500);
  }
  log.info({ userId: user.id, serverId }, "[SERVER DELETE SUCCESS]");
  return c.json({ message: "server deleted successfully" });
});

// Join a server via invite code
serverRoutes.patch("/join/:inviteCode", async (c) => {
  const inviteCode = c.req.param("inviteCode");
  const user = c.get("user");
  const log = c.get("logger");
  const success = await serversService.joinServerFromInviteCode(
    user.id,
    inviteCode,
  );
  if (!success) {
    return c.json({ error: "Invalid invite code" }, 400);
  }
  log.info({ userId: user.id, inviteCode }, "[SERVER JOINED FROM INVITE]");
  return c.json({ success: true });
});

// Leave a server by server ID
serverRoutes.delete("/:serverId/members/me", async (c) => {
  const serverId = c.req.param("serverId") as Server["id"];
  const user = c.get("user");
  const log = c.get("logger");
  const server = await serversService.leaveServer(serverId, user.id);
  if (!server) {
    log.warn({ user, serverId }, "[SERVER LEAVE NOT FOUND]");
    return c.json({ error: "server not found" }, 404);
  }
  log.info({ userId: user.id, serverId }, "[SERVER LEAVE SUCCESS]");
  return c.json({ server });
});

// Regenerate server invite code
serverRoutes.patch("/:serverId/invite-code", async (c) => {
  const serverId = c.req.param("serverId") as Server["id"];
  const user = c.get("user");
  const log = c.get("logger");
  if (!serverId) {
    log.warn({ user, serverId }, "[SERVER_UPDATE_INVITE_CODE_MISSING_ID]");
    return c.json({ error: "Server ID is required" }, 400);
  }

  const inviteCode = randomUUIDv7("hex");
  const server = await serversService.updateServerInviteCode(
    serverId,
    user.id,
    inviteCode,
  );
  if (!server) {
    log.warn({ user, serverId }, "[SERVER_UPDATE_INVITE_CODE_FAILED]");
    return c.json({ error: "Server not found" }, 404);
  }
  log.info({ userId: user.id, serverId }, "[SERVER_UPDATE_INVITE_CODE]");
  return c.json({ server });
});


export default serverRoutes;
