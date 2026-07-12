import { Permission } from "@repo/types";
import { requirePermission, ServerIdResolver } from "@/middlewares/permission";
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

membersRoutes.get("/:memberId", async (c) => {
  const memberId = c.req.param("memberId");
  const member = await membersService.getMemberById(memberId);
  if (!member) {
    return c.json({ error: "Member not found" }, 404);
  }
  return c.json({ member });
});

membersRoutes.get("/user/:userId", async (c) => {
  const userId = c.req.param("userId");
  const member = await membersService.getMemberByUserId(userId);
  if (!member) return c.json({ error: "Member not found" }, 404);
  return c.json({ member });
});

membersRoutes.get("/server/:serverId", async (c) => {
  const serverId = c.req.param("serverId");
  const members = await membersService.getMembersByServerId(serverId);
  if (!members) return c.json({ error: "Members not found" }, 404);
  return c.json({ members });
});

// Kick a member — requires KICK_MEMBERS in the target member's server.
membersRoutes.delete(
  "/kick",
  requirePermission(Permission.KICK_MEMBERS, serverIdFromMemberQuery),
  async (c) => {
    const memberId = c.req.query("memberId");
    if (!memberId) {
      return c.json({ error: "Member ID is required" }, 400);
    }
    const { memberId: actingMemberId } = c.get("memberContext");
    const success = await membersService.kickMember(memberId, actingMemberId);
    if (!success) {
      return c.json({ error: "Unable to kick member" }, 400);
    }
    return c.body(null, 204);
  },
);

export default membersRoutes;
