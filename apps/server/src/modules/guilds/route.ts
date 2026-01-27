import { Server, serverInsertSchema } from "@/db/schema/server";
import { logger } from "@/lib/logger";
import { serversService } from "@/modules/guilds/service";
import { AppContext } from "@/types";
import { randomUUIDv7 } from "bun";
import { Hono } from "hono";
const serverRoutes = new Hono<AppContext>();

// Get all servers for the current user
serverRoutes.get("/", async (c) => {
  const user = c.get("user");
  const servers = await serversService.getServersByUserId(user.id);
  if (!servers) {
    return c.json({ error: "No servers found" }, 404);
  }
  return c.json(servers);
});

// Create a new server
serverRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const log = c.get("logger") ?? logger;
  const serverData = serverInsertSchema.safeParse(body);
  if (serverData.error) {
    log.warn({ body, error: serverData.error }, "[NEW SERVER INVALID DATA]");
    return c.json({ error: serverData.error.message }, 400);
  }

  const user = c.get("user");
  const server = await serversService.createServer(user.id, serverData.data);
  if (!server) {
    log.error({ user, serverData }, "[NEW SERVER CREATION FAILED]");
    return c.json({ error: "Failed to create server" }, 500);
  }
  log.info(
    {
      server: {
        id: server.id,
        name: server.name,
      },
    },
    "[NEW SERVER CREATED]",
  );
  return c.json(server);
});

// Get a specific server by ID
serverRoutes.get("/:serverId", async (c) => {
  const serverId = c.req.param("serverId") as Server["id"];
  const user = c.get("user");
  const server = await serversService.getServer(serverId, user.id);
  if (!server) {
    return c.json({ error: "server not found" }, 404);
  }
  return c.json(server);
});

// Edit a server
serverRoutes.patch("/:serverId", async (c) => {
  const serverId = c.req.param("serverId") as Server["id"];
  const body = await c.req.json();
  const log = c.get("logger") ?? logger;
  const serverData = serverInsertSchema.safeParse(body);
  if (serverData.error) {
    return c.json({ error: serverData.error.message }, 400);
  }

  const server = await serversService.editServer(serverId, serverData.data);
  if (!server) {
    return c.json({ error: "Failed to edit server" }, 400);
  }
  log.info({ serverId }, "[SERVER PATCH EDITED]");
  return c.json(server);
});

// Delete a server
serverRoutes.delete("/:serverId", async (c) => {
  const serverId = c.req.param("serverId") as Server["id"];
  const user = c.get("user");
  const log = c.get("logger") ?? logger;
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
  const log = c.get("logger") ?? logger;
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
  const log = c.get("logger") ?? logger;
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
  const log = c.get("logger") ?? logger;
  if (!serverId) {
    log.warn({ user, serverId }, "[SERVER_UPDATE_INVITE_CODE_MISSING_ID]");
    return c.json({ error: "Server ID is required" }, 400);
  }

  const inviteCode = randomUUIDv7("hex");
  const success = await serversService.updateServerInviteCode(
    serverId,
    user.id,
    inviteCode,
  );
  if (!success) {
    log.warn({ user, serverId }, "[SERVER_UPDATE_INVITE_CODE_FAILED]");
    return c.json({ error: "Server not found" }, 404);
  }
  log.info({ userId: user.id, serverId }, "[SERVER_UPDATE_INVITE_CODE]");
  return c.json({ success });
});

export default serverRoutes;
