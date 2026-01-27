import {
  possibleMemberRoles
} from "@/db/schema/member";
import { membersService } from "@/modules/members/service";
import { AppContext } from "@/types";
import { Hono } from "hono";
import z from "zod";

const membersRoutes = new Hono<AppContext>();

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

membersRoutes.patch("/changeRole", async (c) => {
  const parsedBody = z
    .object({
      role: z.enum(possibleMemberRoles),
      memberId: z.string(),
    })
    .safeParse(await c.req.json());
  if (!parsedBody.success) {
    return c.json(
      { error: "Invalid request body", details: parsedBody.error.errors },
      400,
    );
  }
  const { role, memberId } = parsedBody.data;
  const member = await membersService.changeMemberRole(
    memberId,
    c.get("user").id,
    role,
  );
  if (!member) {
    return c.json({ error: "Unable to change member role" }, 403);
  }
  return c.json(member);
});

membersRoutes.delete("/kick", async (c) => {
  const memberId = c.req.query("memberId");
  if (!memberId) {
    return c.json({ error: "Member ID is required" }, 400);
  }
  const currentUserId = c.get("user").id;
  const success = await membersService.deleteMemberById(
    memberId,
    currentUserId,
  );
  if (!success) {
    return c.json({ error: "Unable to kick member" }, 403);
  }
  return c.status(204);
});

export default membersRoutes;
