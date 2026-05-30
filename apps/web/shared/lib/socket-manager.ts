import { io as ClientIO, Socket } from "socket.io-client";
import { CONFIG } from "@/shared/lib/config";

class ClientSocketManager {
  private static instance: ClientSocketManager;
  public socket: Socket | null = null;
  private listeners: Set<(status: boolean) => void> = new Set();
  public isConnected = false;

  private constructor() {}

  public static getInstance(): ClientSocketManager {
    if (!ClientSocketManager.instance) {
      ClientSocketManager.instance = new ClientSocketManager();
    }
    return ClientSocketManager.instance;
  }

  // Connects only if there isn't an active connection
  public connect(token: string) {
    if (this.socket?.connected) return;

    // Clean up any dead/zombie sockets before recreating
    this.disconnect();

    this.socket = ClientIO(CONFIG.SOCKET_URL, {
      path: "",
      transports: ["websocket"],
      auth: { token },
    });

    this.socket.on("connect", () => {
      console.log(`Connected to Socket.IO server (${this.socket?.id})`);
      this.isConnected = true;
      this.notifyListeners(true);
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
      this.isConnected = false;
      this.notifyListeners(false);
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket.removeAllListeners();
      this.socket = null;
      this.isConnected = false;
      this.notifyListeners(false);
    }
  }

  // Allow React components to listen to connection status updates
  public subscribeToStatus(callback: (status: boolean) => void) {
    this.listeners.add(callback);
    callback(this.isConnected); // Send current status immediately
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(status: boolean) {
    this.listeners.forEach((callback) => callback(status));
  }
}

export const clientSocketManager = ClientSocketManager.getInstance();
