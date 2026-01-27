import { auth } from "@/lib/auth";
import { socketManager } from "@/lib/socket-manager";
import { requireAuth, setAuthContext } from "@/middlewares/auth";
import { loggerMiddleware } from "@/middlewares/logger";
import channelsRoute from "@/modules/channels/route";
import serverRoutes from "@/modules/guilds/route";
import membersRoutes from "@/modules/members/route";
import profilesRoute from "@/routes/profiles.route";
import { publicRoute } from "@/routes/public.route";
import s3Routes from "@/routes/s3.route";
import { AppContext } from "@/types";
import { getEnv } from "@/utils/env";
import { errorhandler } from "@/utils/error-handler";
import "dotenv/config";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";

const app = new Hono<AppContext>();
const CLIENT_URL = getEnv("CLIENT_URL");
app.use(
  "*",
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));
app.use("*", setAuthContext);

//* STATIC FILES SERVING
app.use("/static/*", serveStatic({ root: "./" }));

//* PROTECTED ROUTES
const protectedApp = new Hono<AppContext>();
protectedApp.use("*", setAuthContext);
protectedApp.use("*", requireAuth);
protectedApp.use("*", loggerMiddleware);

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

app.route("/public", publicRoute);
app.route("/api", protectedApp);
app.onError(errorhandler);
export default {
  port: getEnv("HTTP_PORT") || 3001,
  fetch: app.fetch,
  server: socketManager.io,
};
