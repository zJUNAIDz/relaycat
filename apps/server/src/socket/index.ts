import type { Server } from "socket.io";
import { registerSocketAuth } from "./auth";
import { registerPresenceHandler } from "./presence.handler";

/**
 * Wire all realtime behaviour onto the root Socket.IO namespace (the one the
 * web client connects to, and the one HTTP routes emit chat events on).
 *
 * Order matters: auth runs as connection middleware first so every handler can
 * trust `socket.data.userId`.
 */
export function registerSocketHandlers(io: Server) {
  registerSocketAuth(io);
  registerPresenceHandler(io);
}
