import { logger } from "@/lib/logger";
import { AppError } from "@/utils/errors";
import { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export const errorhandler = (err: Error, c: Context) => {
  const log = c.get("logger") ?? logger;

  // Typed application errors carry their own HTTP status and a safe message.
  if (err instanceof AppError) {
    log.warn({ err }, "[ROUTE_ERROR_HANDLER]");
    return c.json({ error: err.message }, err.status as ContentfulStatusCode);
  }

  console.error("[error handler]: ", err);
  log.error({ err }, "[ROUTE_ERROR_HANDLER]");
  return c.json(
    {
      error:
        process.env.NODE_ENV === "prod"
          ? "Server Error. check logs for details."
          : err.message,
    },
    err.name === "ValidationError" ? 400 : 500,
  );
};
export const generateErrorMessage = (
  err: unknown,
  defaultMessage: string,
  prefix?: string,
) => {
  let errMessage = defaultMessage;
  if (err instanceof Error) {
    errMessage = err.message;
  } else if (typeof err === "string") {
    errMessage = err;
  } else if (err && typeof err === "object") {
    errMessage = JSON.stringify(err);
  }
  console.error(`${prefix} ${errMessage}`);
  return `${prefix} ${errMessage}`;
};
