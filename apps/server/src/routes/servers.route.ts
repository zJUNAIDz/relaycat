import { Server, serverInsertSchema } from "@/db/schema/server";
import { serversService } from "@/services/servers.service";
import { AppContext } from "@/types";
import { randomUUIDv7 } from "bun";
import { Hono } from "hono";
const serverRoutes = new Hono<AppContext>();

serverRoutes.get("/", async (c) => {
  const user = c.get("user");
  const servers = await serversService.getServersByUserId(user.id);
  if (!servers) {
    return c.json({ error: "No servers found" }, 404);
  }
  return c.json({ servers });
});

serverRoutes.get("/:serverId", async (c) => {
  const serverId = c.req.param("serverId") as Server["id"];
  const user = c.get("user");
  const server = await serversService.getServer(serverId, user.id);
  if (!server) {
    return c.json({ error: "server not found" }, 404);
  }
  return c.json(server);
});

serverRoutes.patch("/:serverId", async (c) => {
  const serverId = c.req.param("serverId") as Server["id"];
  const body = await c.req.json();
  const serverData = serverInsertSchema.safeParse(body);
  if (serverData.error) return c.json({ error: serverData.error.message }, 400);

  const { server, error } = await serversService.editServer(
    serverId,
    serverData.data
  );
  if (error) {
    return c.json({ error }, 400);
  }
  return c.json(server);
});

serverRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const serverData = serverInsertSchema.safeParse(body);
    if (serverData.error)
      return c.json({ error: serverData.error.message }, 400);

    const user = c.get("user");
    const server = await serversService.createServer(user.id, serverData.data);
    if (!server) {
      return c.json({ error: "Failed to create server" }, 500);
    }
    return c.json(server);
  } catch (err) {
    console.error("[SERVER_POST] ", err);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

serverRoutes.patch("/join/invite/:code", async (c) => {
  try {
    const inviteCode = c.req.param("code");
    const user = c.get("user");
    const success = await serversService.joinServerFromInviteCode(
      user.id,
      inviteCode
    );
    if (!success) {
      return c.json({ error: "Invalid invite code" }, 400);
    }
    return c.json({ success: true });
  } catch (err) {
    console.error("[SERVER_ADD_INVITE] ", err);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

serverRoutes.patch("/leave", async (c) => {
  try {
    const serverId = c.req.query("serverId");
    if (!serverId) {
      return c.json({ error: "Server ID is required" }, 400);
    }
    const user = c.get("user");
    const server = await serversService.leaveServer(serverId, user.id);
    if (!server) return c.json({ error: "server not found" });
    return c.json({ server });
  } catch (err) {
    console.error("[SERVER_LEAVE] ", err);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

serverRoutes.delete("/delete", async (c) => {
  try {
    const serverId = c.req.query("serverId");

    if (!serverId) {
      return c.json({ error: "Server ID is required" }, 400);
    }

    const user = c.get("user");
    const success = await serversService.deleteServer(serverId, user.id);
    if (!success) {
      return c.json({ error: "Failed to delete server" }, 500);
    }
    return c.json({ message: "server deleted successfully" });
  } catch (err) {
    console.error("[SERVER_DELETE] ", err);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

serverRoutes.patch("/:id/invite-code", async (c) => {
  const serverId = c.req.param("id");
  const user = c.get("user");
  if (!serverId) {
    return c.json({ error: "Server ID is required" }, 400);
  }

  const inviteCode = randomUUIDv7("hex");
  const success = await serversService.updateServerInviteCode(
    serverId,
    user.id,
    inviteCode
  );
  if (!success) {
    return c.json({ error: "Server not found" }, 404);
  }
  return c.json({ success });
});

serverRoutes.put("/:inviteCode/join", async (c) => {
  const inviteCode = c.req.param("inviteCode");
  const user = c.get("user");
  const success = await serversService.joinServerFromInviteCode(
    user.id,
    inviteCode
  );
  if (!success) {
    return c.json({ error: "Server not found" }, 404);
  }
  return c.json({
    success,
  });
});

export default serverRoutes;
