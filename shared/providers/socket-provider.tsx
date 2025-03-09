"use client"
import React from "react";
import { io as ClientIO, Socket } from "socket.io-client";
import { SOCKET_URL } from "../lib/constants";
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
  const { authToken } = useAuth();
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const prevAuthToken = React.useRef<string | null>(null);

  React.useEffect(() => {
    // Only connect if we have a NEW valid token
    if (!authToken || authToken === prevAuthToken.current) return;

    prevAuthToken.current = authToken;

    console.log("Initializing socket connection...");

    const newSocket = ClientIO(SOCKET_URL, {
      path: "/",
      transports: ["websocket"],
      extraHeaders: {
        Authorization: `Bearer ${authToken}`
      }
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

    setSocket(prev => {
      // Disconnect previous socket if exists
      prev?.disconnect();
      return newSocket;
    });

    return () => {
      console.log("Cleaning up socket...");
      newSocket.off("connect", connectionHandler);
      newSocket.off("disconnect", disconnectHandler);
      newSocket.disconnect();
    };
  }, [authToken]); // Only reconnect when authToken changes

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;