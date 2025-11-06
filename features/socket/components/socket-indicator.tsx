"use client"

import { Badge } from "@/shared/components/ui/badge";
import { useSocket } from "@/shared/providers/socket-provider";

export const SocketIndicator = () => {
  const { isConnected, socket } = useSocket();
  // socket?.emit("test")

  return (!isConnected)
    ? (
      <Badge variant="destructive" className="bg-yellow-600 text-white border-none">
        Offline
      </Badge>
    )
    :
    (
      <Badge variant="default" className="bg-green-600 text-white border-none">
        Online
        <div></div>
      </Badge>
    )
}