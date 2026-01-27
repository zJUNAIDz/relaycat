import { auth } from "@/lib/auth";
import "dotenv/config";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { db } from "@/db";
import { socketManager } from "@/lib/socket-manager";
import { requireAuth, setAuthContext } from "@/middlewares/auth";
import profilesRoute from "@/routes/profiles.route";
import s3Routes from "@/routes/s3.route";
import { AppContext } from "@/types";
import { getEnv } from "@/utils/env";
import { errorhandler } from "@/utils/error-handler";
import { loggerMiddleware } from "@/middlewares/logger";
import serverRoutes from "@/modules/guilds/route";
import membersRoutes from "@/modules/members/route";
import channelsRoute from "@/modules/channels/route";

const app = new Hono<AppContext>();
const clientUrl = getEnv("CLIENT_URL");
app.use(
  "*",
  cors({
    origin: clientUrl,
    credentials: true,
  }),
);
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));
app.use("*", setAuthContext);

//* PUBLIC ROUTES
const publicApp = new Hono<AppContext>();
publicApp.get("/health", async (c) => {
  //CHECK DB CONNECTION
  let dbConnected = true;
  await db.execute(`SELECT 1`).catch(() => {
    dbConnected = false;
  });
  return c.json({
    endpoint: "ok",
    dbConnected,
    user: c.get("user") || null,
    session: c.get("session") || null,
  });
});
app.use("/static/*", serveStatic({ root: "./" }));

const protectedApp = new Hono<AppContext>();
protectedApp.use("*", setAuthContext);
protectedApp.use("*", requireAuth);
protectedApp.use("*", loggerMiddleware); 

//* PROTECTED ROUTES

protectedApp.route("/s3", s3Routes);
protectedApp.route("/profiles", profilesRoute);
protectedApp.route("/servers", serverRoutes);
protectedApp.route("/members", membersRoutes);
protectedApp.route("/channels", channelsRoute);
// protectedApp.route("/conversations", conversationsRoute);
// protectedApp.route("/messages", messagesRoute);
protectedApp.get("/", (c) => {
  return c.html(`<h1>禁止</h1>`);
});

app.route("/public", publicApp);
app.route("/api", protectedApp);
app.onError(errorhandler);
export default {
  port: 3001,
  fetch: app.fetch,
  server: socketManager.io,
};
