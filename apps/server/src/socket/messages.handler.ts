import { Namespace } from "socket.io"

export function registerMessagesHandler(messagesNs: Namespace) {
  messagesNs.on("connection", (socket) => {
    console.log(socket.id + "connected to /messages")
    const { messageId, channelId } = socket.handshake.query;
    socket.on("message:update", (message) => {
      console.log("[message] ", message)
    })
  })
} 