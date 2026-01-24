import { logger } from "@/lib/logger";
import { AppContext } from "@/types";
import { randomUUIDv7 } from "bun";
import { Context } from "hono";

export const loggerMiddleware = async (
  ctx: Context<AppContext>,
  next: () => Promise<void>,
) => {
  const requestId = randomUUIDv7();
  const user = ctx.get("user");
  
  const reqLogger = logger.child({
    requestId,
    userId: user?.id || "anonymous",
    route: ctx.req.path,
    method: ctx.req.method,
    url: ctx.req.url,
  });
  ctx.set("logger", reqLogger);
  await next();
};
