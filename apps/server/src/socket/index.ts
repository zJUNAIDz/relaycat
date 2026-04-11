import { Server } from "socket.io";
import { registerPresenceHandler } from "./presence.handler";
import { registerMessagesHandler } from "./messages.handler";

export function registerSocketNamespaces(io: Server) {
  registerPresenceHandler(io.of("/presence"))
  registerMessagesHandler(io.of("/messages"))
}