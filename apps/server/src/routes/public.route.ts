import { db } from "@/db";
import { AppContext } from "@/types";
import { Hono } from "hono";

export const publicRoute = new Hono<AppContext>();

publicRoute.get("/health", async (c) => {
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
