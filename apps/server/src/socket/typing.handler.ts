import { TYPING_EVENTS, type TypingUpdate } from "@repo/types";
import type { Server, Socket } from "socket.io";

/** The room every viewer of a chat joins to receive its typing updates. */
const typingRoom = (chatId: string) => `typing:${chatId}`;

/**
 * Relay-only typing indicators. There is no state to keep: a viewer joins a
 * chat's room (`subscribe`), and a typer's `start`/`stop` is forwarded as an
 * `update` to everyone else in that room (`socket.to` excludes the sender).
 *
 * Cross-instance fan-out is handled transparently by the Redis adapter when
 * configured. `socket.data.userId` is guaranteed by the auth middleware.
 */
export function registerTypingHandler(io: Server) {
  io.on("connection", (socket: Socket) => {
    const relay = (chatId: unknown, name: unknown, typing: boolean) => {
      if (typeof chatId !== "string" || !chatId) return;
      const update: TypingUpdate = {
        chatId,
        userId: socket.data.userId,
        name: typeof name === "string" && name ? name : "Someone",
        typing,
      };
      socket.to(typingRoom(chatId)).emit(TYPING_EVENTS.update, update);
    };

    socket.on(TYPING_EVENTS.subscribe, (chatId: unknown) => {
      if (typeof chatId === "string" && chatId) socket.join(typingRoom(chatId));
    });
    socket.on(TYPING_EVENTS.unsubscribe, (chatId: unknown) => {
      if (typeof chatId === "string" && chatId) socket.leave(typingRoom(chatId));
    });

    socket.on(TYPING_EVENTS.start, (p: { chatId?: string; name?: string }) =>
      relay(p?.chatId, p?.name, true),
    );
    socket.on(TYPING_EVENTS.stop, (p: { chatId?: string }) =>
      relay(p?.chatId, undefined, false),
    );
  });
}
