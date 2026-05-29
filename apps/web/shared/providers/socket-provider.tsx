"use client"
import React from "react";
import { Socket } from "socket.io-client";
import { useAuth } from "./auth-provider";
import { clientSocketManager } from "@/shared/lib/socket-manager";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  isLoading: boolean;
}

const SocketContext = React.createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  isLoading: true,
});

export const useSocket = () => React.useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading: isAuthLoading } = useAuth();
  const [isConnected, setIsConnected] = React.useState(false);

  // 1. Handle actual connection completely outside of state cycles
  React.useEffect(() => {
    if (isAuthLoading) return;

    if (session?.token) {
      clientSocketManager.connect(session.token);
    } else {
      clientSocketManager.disconnect();
    }
  }, [session?.token, isAuthLoading]);

  // 2. Synchronize the connection state flag safely
  React.useEffect(() => {
    const unsubscribe = clientSocketManager.subscribeToStatus((status) => {
      setIsConnected(status);
    });
    return () => unsubscribe();
  }, []);

  return (
    <SocketContext.Provider 
      value={{ 
        socket: clientSocketManager.socket, 
        isConnected, 
        isLoading: isAuthLoading 
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};