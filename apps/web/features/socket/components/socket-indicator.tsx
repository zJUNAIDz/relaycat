"use client"

import { Badge } from "@/shared/components/ui/badge";
import { useSocket } from "@/shared/providers/socket-provider";

export const SocketIndicator = () => {
  const { isConnected, socket } = useSocket();
  // socket?.emit("test")

  return (!isConnected)
    ? (
      <Badge variant="destructive" className="bg-warning text-warning-foreground border-none">
        Offline
      </Badge>
    )
    :
    (
      <Badge variant="default" className="bg-success text-success-foreground border-none">
        Online
        <div></div>
      </Badge>
    )
}