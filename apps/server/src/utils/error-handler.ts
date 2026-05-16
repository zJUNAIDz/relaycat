import { logger } from "@/lib/logger";
import { Context } from "hono";

export const errorhandler = (err: Error, c: Context) => {
  console.error("[error handler]: ", err);
  const log = c.get("logger") ?? logger;
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
