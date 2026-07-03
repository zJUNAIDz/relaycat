import {
  AssignRoleDTO,
  CreateRoleDTO,
  Permission,
  UpdateRoleDTO,
} from "@repo/types";
import {
  requireMembership,
  requirePermission,
} from "@/middlewares/permission";
import { rolesService } from "@/modules/roles/service";
import { ProtectedAppContext } from "@/types";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

// Mounted at /servers/:serverId/roles — every handler is server-scoped.
const rolesRoute = new Hono<ProtectedAppContext>();

// List roles — any member may read them.
rolesRoute.get("/", requireMembership(), async (c) => {
  const serverId = c.req.param("serverId")!;
  const roles = await rolesService.listRoles(serverId);
  return c.json({ roles });
});

// Create a role.
rolesRoute.post(
  "/",
  requirePermission(Permission.MANAGE_ROLES),
  zValidator("json", CreateRoleDTO),
  async (c) => {
    const serverId = c.req.param("serverId")!;
    const ctx = c.get("memberContext");
    const role = await rolesService.createRole(
      serverId,
      ctx,
      c.req.valid("json"),
    );
    return c.json({ role }, 201);
  },
);

// Update a role.
rolesRoute.patch(
  "/:roleId",
  requirePermission(Permission.MANAGE_ROLES),
  zValidator("json", UpdateRoleDTO),
  async (c) => {
    const serverId = c.req.param("serverId")!;
    const roleId = c.req.param("roleId")!;
    const ctx = c.get("memberContext");
    const role = await rolesService.updateRole(
      serverId,
      roleId,
      ctx,
      c.req.valid("json"),
    );
    return c.json({ role });
  },
);

// Delete a role.
rolesRoute.delete(
  "/:roleId",
  requirePermission(Permission.MANAGE_ROLES),
  async (c) => {
    const serverId = c.req.param("serverId")!;
    const roleId = c.req.param("roleId")!;
    const ctx = c.get("memberContext");
    await rolesService.deleteRole(serverId, roleId, ctx);
    return c.json({ success: true });
  },
);

// Assign a role to a member.
rolesRoute.post(
  "/assign",
  requirePermission(Permission.MANAGE_ROLES),
  zValidator("json", AssignRoleDTO),
  async (c) => {
    const serverId = c.req.param("serverId")!;
    const ctx = c.get("memberContext");
    const { memberId, roleId } = c.req.valid("json");
    await rolesService.assignRole(serverId, ctx, memberId, roleId);
    return c.json({ success: true });
  },
);

// Remove a role from a member.
rolesRoute.post(
  "/unassign",
  requirePermission(Permission.MANAGE_ROLES),
  zValidator("json", AssignRoleDTO),
  async (c) => {
    const serverId = c.req.param("serverId")!;
    const ctx = c.get("memberContext");
    const { memberId, roleId } = c.req.valid("json");
    await rolesService.unassignRole(serverId, ctx, memberId, roleId);
    return c.json({ success: true });
  },
);

export default rolesRoute;
