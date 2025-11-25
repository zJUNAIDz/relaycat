import { auth } from "@/lib/auth";
import { AppContext } from "@/types";
import { Context } from "hono";

//TODO: Refactor to better null value handling 
export const setAuthContext = async (
  c: Context<AppContext>,
  next: () => Promise<void>
) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    c.set("user", null as any);
    c.set("session", null as any);
    await next();
    return;
  }
  c.set("user", session.user);
  c.set("session", session.session);
  await next();
};

export const requireAuth = async (
  c: Context<AppContext>,
  next: () => Promise<void>
) => {
  const user = c.get("user");
  const session = c.get("session");
  if (!user || !session) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
};
