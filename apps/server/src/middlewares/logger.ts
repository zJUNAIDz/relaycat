import { logger } from "@/lib/logger";
import { AppContext } from "@/types";
import { randomUUIDv7 } from "bun";
import { Context, MiddlewareHandler } from "hono";

// Explicitly typing it as a Hono MiddlewareHandler ensures type safety for AppContext
export const loggerMiddleware: MiddlewareHandler<AppContext> = async (ctx, next) => {
  const requestId = randomUUIDv7();
  const user = ctx.get("user"); // Assumes 'user' is already populated by an auth middleware upstream

  const reqLogger = logger.child({
    requestId,
    userId: user?.id || "anonymous",
    route: ctx.req.path,
    method: ctx.req.method,
  });

  // Inject the logger into the context for downstream handlers to use
  ctx.set("logger", reqLogger);

  const startTime = performance.now();

  try {
    // Process the request
    await next();

    // Log successful completion with duration and status code
    const duration = (performance.now() - startTime).toFixed(2);
    reqLogger.info({
      msg: `Request processed`,
      status: ctx.res.status,
      durationMs: parseFloat(duration),
    });

  } catch (error) {
    // Catch downstream errors so you don't lose the logging context
    const duration = (performance.now() - startTime).toFixed(2);
    reqLogger.error({
      msg: `Request failed`,
      error: error instanceof Error ? error.message : String(error),
      durationMs: parseFloat(duration),
    });
    
    // Re-throw so Hono's global error handler can still catch it and return a 500
    throw error;
  }
};  