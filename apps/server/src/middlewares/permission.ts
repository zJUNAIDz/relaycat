import { permissionService } from "@/services/permission.service";
import { ProtectedAppContext } from "@/types";
import { BadRequestError, ForbiddenError } from "@/utils/errors";
import { hasPermission } from "@repo/types";
import type { Context } from "hono";

/**
 * Resolves the serverId a request is scoped to. Defaults to the `:serverId`
 * route param; pass a custom resolver for routes that carry it elsewhere
 * (query, body, or derived from a channel/member id).
 */
export type ServerIdResolver = (
  c: Context<ProtectedAppContext>,
) => string | undefined | Promise<string | undefined>;

const defaultResolver: ServerIdResolver = (c) => c.req.param("serverId");

/**
 * Central authorization boundary. Resolves the caller's effective permissions
 * for the target server, enforces `required`, and stashes the resolved
 * `memberContext` so downstream services don't re-check membership/roles.
 *
 * Owners and ADMINISTRATOR-holders bypass the specific flag (handled inside
 * `permissionService.can`). A non-member yields a 404 (NotFoundError) rather
 * than leaking the server's existence.
 */
export function requirePermission(
  required: bigint,
  resolveServerId: ServerIdResolver = defaultResolver,
) {
  return async (c: Context<ProtectedAppContext>, next: () => Promise<void>) => {
    const serverId = await resolveServerId(c);
    if (!serverId) {
      throw new BadRequestError("Missing server id");
    }

    const user = c.get("user");
    const ctx = await permissionService.getContext(user.id, serverId);

    if (!ctx.isOwner && !hasPermission(ctx.permissions, required)) {
      throw new ForbiddenError();
    }

    c.set("memberContext", ctx);
    await next();
  };
}

/**
 * Like {@link requirePermission} but only resolves & stashes the context
 * (membership required, no specific capability). Use on read routes that need
 * the member context but not a particular permission.
 */
export function requireMembership(
  resolveServerId: ServerIdResolver = defaultResolver,
) {
  return async (c: Context<ProtectedAppContext>, next: () => Promise<void>) => {
    const serverId = await resolveServerId(c);
    if (!serverId) {
      throw new BadRequestError("Missing server id");
    }
    const user = c.get("user");
    const ctx = await permissionService.getContext(user.id, serverId);
    c.set("memberContext", ctx);
    await next();
  };
}

/**
 * Restricts a route to the server owner (e.g. delete server, transfer
 * ownership). ADMINISTRATOR is deliberately not enough for these.
 */
export function requireOwner(
  resolveServerId: ServerIdResolver = defaultResolver,
) {
  return async (c: Context<ProtectedAppContext>, next: () => Promise<void>) => {
    const serverId = await resolveServerId(c);
    if (!serverId) {
      throw new BadRequestError("Missing server id");
    }
    const user = c.get("user");
    const ctx = await permissionService.getContext(user.id, serverId);
    if (!ctx.isOwner) {
      throw new ForbiddenError("Only the server owner can do this");
    }
    c.set("memberContext", ctx);
    await next();
  };
}
