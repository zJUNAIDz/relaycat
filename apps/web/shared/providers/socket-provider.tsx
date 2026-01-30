"use client"
import React from "react";
import { io as ClientIO, Socket } from "socket.io-client";
import { CONFIG } from "@/shared/lib/config";
import { useAuth } from "./auth-provider";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = React.createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => React.useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const { session } = useAuth()

  React.useEffect(() => {

    if (!session) {
      throw new Error("no user found for socket")
    }
    console.log("Initializing socket connection...");

    const newSocket = ClientIO(CONFIG.SOCKET_URL, {
      path: "/",
      transports: ["websocket"],
      auth: {
        token: session.token,
      },
    });

    const connectionHandler = () => {
      console.log("WS Connected ID:", newSocket.id);
      setIsConnected(true);
    };

    const disconnectHandler = () => {
      console.log("WS Disconnected: ", newSocket.id);
      setIsConnected(false);
    };

    newSocket.on("connect", connectionHandler);
    newSocket.on("disconnect", disconnectHandler);

    setSocket((prev) => {
      prev?.disconnect();
      return newSocket;
    });

    return () => {
      console.log("Cleaning up socket...");
      newSocket.off("connect", connectionHandler);
      newSocket.off("disconnect", disconnectHandler);
      newSocket.disconnect();
    };
  }, [session]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;