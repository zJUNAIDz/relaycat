import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import { instrument } from "@socket.io/admin-ui";
import { createAdapter } from "@socket.io/redis-adapter";
import { getEnv } from "@/utils/env";
import { createRedis } from "@/lib/redis";
import { registerSocketHandlers } from "@/socket";
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
    // Multi-instance fan-out: when Redis is configured, broadcasts (presence,
    // chat) propagate across every server instance. No-op without REDIS_URL.
    const pubClient = createRedis();
    const subClient = createRedis();
    if (pubClient && subClient) {
      this.io.adapter(createAdapter(pubClient, subClient));
    }

    // Auth middleware + presence/chat handlers. Must run before any socket
    // connects so the handshake gate and `socket.data.userId` are in place.
    registerSocketHandlers(this.io);

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
