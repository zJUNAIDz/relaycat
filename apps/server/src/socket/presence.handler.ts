import { PRESENCE_EVENTS } from "@repo/types";
import type { Server } from "socket.io";
import { logger } from "@/lib/logger";
import { PresenceService } from "./presence/service";

/**
 * Wire the presence protocol onto the (already authenticated) root namespace.
 * `socket.data.userId` is guaranteed by the auth middleware.
 */
export function registerPresenceHandler(io: Server) {
  const presence = new PresenceService(io);
  presence.start();

  io.on("connection", (socket) => {
    void presence.handleConnect(socket).catch((error) =>
      logger.error({ error, userId: socket.data.userId }, "[presence] connect failed"),
    );

    socket.on(PRESENCE_EVENTS.subscribe, (ids) =>
      void presence.handleSubscribe(socket, ids),
    );
    socket.on(PRESENCE_EVENTS.unsubscribe, (ids) =>
      presence.handleUnsubscribe(socket, ids),
    );
    socket.on(PRESENCE_EVENTS.set, (status) =>
      void presence.handleSetStatus(socket, status),
    );
    socket.on(PRESENCE_EVENTS.heartbeat, () =>
      void presence.handleHeartbeat(socket),
    );

    socket.on("disconnect", () => {
      void presence.handleDisconnect(socket).catch((error) =>
        logger.error(
          { error, userId: socket.data.userId },
          "[presence] disconnect failed",
        ),
      );
    });
  });
}
