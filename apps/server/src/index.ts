import "dotenv/config";
// Database (Drizzle)
import "@/lib/db";
// WebSocket server (Socket.IO singleton)
import "@/lib/socket-manager";

// HTTP server and routes (Hono)
import server from "./routes";

export default server;
