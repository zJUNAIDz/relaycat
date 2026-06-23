import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import { instrument } from "@socket.io/admin-ui";
import { getEnv } from "@/utils/env";
class SocketManager {
  private static instance: SocketManager;
  public io: SocketIOServer;
  private httpServer: ReturnType<typeof createServer>;

  private constructor() {
    // Browser origins allowed to open a socket. Driven by env so the same
    // code works locally (localhost) and in production (rc* subdomains).
    const allowedOrigins = (
      process.env.AUTH_TRUSTED_ORIGINS ||
      process.env.CLIENT_URL ||
      "http://localhost:3000"
    )
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
    // The hosted Socket.IO admin dashboard.
    allowedOrigins.push("https://admin.socket.io");

    this.httpServer = createServer();
    this.io = new SocketIOServer(this.httpServer, {
      path: "/",
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
    });
    const port = getEnv("WS_PORT") || 4001;
    this.httpServer.listen(port, () => {
      console.log(`Socket.IO server listening on ${port}`);
    });
    this.initializeSocket();
  }
  private initializeSocket() {
    this.io.on("connection", (socket) => {
      console.log(`User connected (${socket.id})`);
      socket.on("disconnect", () => {
        console.log(`User disconnected (${socket.id})`);
      });
    });
    instrument(this.io, {
      auth: false,
      mode: process.env.NODE_ENV === "production" ? "production" : "development",
    });
  }

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }
}
export const socketManager = SocketManager.getInstance();
