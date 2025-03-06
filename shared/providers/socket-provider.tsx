"use client"
import React from "react";
import { io as ClientIO, Socket } from "socket.io-client";
import { SOCKET_URL } from "../lib/constants";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  // connect: () => void;
}

const SocketContext = React.createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => React.useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    console.log("yoo")
    const newSocket = ClientIO(SOCKET_URL, {
      // path: `${API_URL}`,
      transports: ["websocket"],
    });
    newSocket.on("connect", () => {
      console.log("connected!!!")
      setIsConnected(true);
    })
    newSocket.on("disconnect", () => {
      console.log("disconnected")
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.disconnect();
    };
  }, []);
  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

export default SocketProvider;