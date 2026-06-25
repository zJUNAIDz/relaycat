import { z } from "zod/v4";

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export const dmCursorSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("before"),
    limit: z.coerce.number().min(1).max(100).default(20),
    before: z.string(),
  }),
  z.object({
    type: z.literal("after"),
    limit: z.coerce.number().min(1).max(100).default(20),
    after: z.string(),
  }),
]);
export type DmCursor = z.infer<typeof dmCursorSchema>;
