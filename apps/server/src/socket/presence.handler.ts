import { Namespace } from "socket.io";

export function registerPresenceHandler(presenceNamespace: Namespace) {
  presenceNamespace.on("connect", (socket) => {

    console.log("ITS CONNECTED!!!")
    socket.on("presence:test", () => {
      console.log("presence:test worksss")
    })
  })
}