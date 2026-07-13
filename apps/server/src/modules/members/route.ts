import { Permission } from "@repo/types";
import {
  requireMembership,
  requirePermission,
  ServerIdResolver,
} from "@/middlewares/permission";
import { membersService } from "@/modules/members/service";
import { ProtectedAppContext } from "@/types";
import { Hono } from "hono";

const membersRoutes = new Hono<ProtectedAppContext>();

// Resolve the server from the ?memberId= query param (the member being kicked).
const serverIdFromMemberQuery: ServerIdResolver = async (c) => {
  const memberId = c.req.query("memberId");
  if (!memberId) return undefined;
  const member = await membersService.getMemberById(memberId);
  return member?.serverId;
};

// Resolve the server from the :memberId path param (single-member lookup).
const serverIdFromMemberParam: ServerIdResolver = async (c) => {
  const memberId = c.req.param("memberId");
  if (!memberId) return undefined;
  const member = await membersService.getMemberById(memberId);
  return member?.serverId;
};

// Kick a member — requires KICK_MEMBERS in the target member's server.
// Registered before /:memberId so "kick" can't be matched as a member id.
membersRoutes.delete(
  "/kick",
  requirePermission(Permission.KICK_MEMBERS, serverIdFromMemberQuery),
  async (c) => {
    const memberId = c.req.query("memberId");
    if (!memberId) {
      return c.json({ error: "Member ID is required" }, 400);
    }
    const ctx = c.get("memberContext");
    const success = await membersService.kickMember(memberId, ctx);
    if (!success) {
      return c.json({ error: "Unable to kick member" }, 400);
    }
    return c.body(null, 204);
  },
);

/**
 * The caller's own member row within a server. Server-scoped on purpose: a user
 * can belong to many servers, so "my member id" is only meaningful alongside a
 * serverId — this is what the chat UI uses for message-ownership checks.
 */
membersRoutes.get("/server/:serverId/me", requireMembership(), async (c) => {
  const ctx = c.get("memberContext");
  const member = await membersService.getMemberById(ctx.memberId);
  if (!member) return c.json({ error: "Member not found" }, 404);
  return c.json({ member: { ...member, roles: ctx.roles } });
});

// The server roster — members only, so a server's membership can't be
// enumerated by any logged-in stranger.
membersRoutes.get("/server/:serverId", requireMembership(), async (c) => {
  const serverId = c.req.param("serverId")!;
  const members = await membersService.getMembersByServerId(serverId);
  if (!members) return c.json({ error: "Members not found" }, 404);
  return c.json({ members });
});

// A single member — readable only by fellow members of that member's server.
membersRoutes.get(
  "/:memberId",
  requireMembership(serverIdFromMemberParam),
  async (c) => {
    const memberId = c.req.param("memberId")!;
    const member = await membersService.getMemberById(memberId);
    if (!member) {
      return c.json({ error: "Member not found" }, 404);
    }
    return c.json({ member });
  },
);

export default membersRoutes;
