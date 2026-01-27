import { z } from "zod/v4";

export const cursorSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("before"),
    limit: z.coerce.number().min(1).max(100),
    before: z.string(),
  }),
  z.object({
    type: z.literal("after"),
    limit: z.coerce.number().min(1).max(100),
    after: z.string(),
  }),
]);

export type Result<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: unknown;
    };
