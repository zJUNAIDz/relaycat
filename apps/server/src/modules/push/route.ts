import { vapidPublicKey } from "@/lib/web-push";
import { ProtectedAppContext } from "@/types";
import { Hono } from "hono";
import z from "zod/v4";
import { pushService } from "./service";

const pushRoute = new Hono<ProtectedAppContext>();

const SubscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

// The VAPID public key the browser needs to create a subscription bound to this
// server. `null` here means push is disabled server-side (no VAPID keys set).
pushRoute.get("/public-key", (c) => c.json({ publicKey: vapidPublicKey }));

// Register (or refresh) this device's push subscription.
pushRoute.post("/subscribe", async (c) => {
  const parsed = SubscribeSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Invalid subscription" }, 400);

  await pushService.save(
    c.get("user").id,
    parsed.data,
    c.req.header("user-agent") ?? null,
  );
  return c.json({ ok: true });
});

// Drop this device's subscription.
pushRoute.post("/unsubscribe", async (c) => {
  const parsed = z
    .object({ endpoint: z.string().url() })
    .safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Invalid endpoint" }, 400);

  await pushService.remove(parsed.data.endpoint);
  return c.json({ ok: true });
});

export default pushRoute;
