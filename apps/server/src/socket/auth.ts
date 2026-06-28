import { db } from "@/db";
import { session } from "@/db/schema/auth-schema";
import { logger } from "@/lib/logger";
import { eq } from "drizzle-orm";
import type { Server, Socket } from "socket.io";

/**
 * Resolve a Better Auth session token to its owning userId.
 *
 * The web client hands us `session.token` (the raw, unsigned token Better Auth
 * also stores in the `session` table) over the socket handshake. We look it up
 * directly and reject expired sessions — cheap, and avoids re-implementing
 * cookie signature verification on the socket transport.
 */
async function resolveUserId(token: string): Promise<string | null> {
  const [row] = await db
    .select({ userId: session.userId, expiresAt: session.expiresAt })
    .from(session)
    .where(eq(session.token, token))
    .limit(1);
  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) return null;
  return row.userId;
}

declare module "socket.io" {
  interface SocketData {
    userId: string;
  }
}

/**
 * Gate every socket connection on a valid session, stashing `userId` on
 * `socket.data` for downstream handlers. Unauthenticated sockets are rejected
 * during the handshake so they never reach the presence handler.
 */
export function registerSocketAuth(io: Server) {
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error("unauthorized"));

      const userId = await resolveUserId(token);
      if (!userId) return next(new Error("unauthorized"));

      socket.data.userId = userId;
      next();
    } catch (error) {
      logger.error({ error }, "[socket/auth] handshake failed");
      next(new Error("unauthorized"));
    }
  });
}
