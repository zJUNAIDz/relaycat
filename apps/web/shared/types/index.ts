import { User as AuthUser } from "@/shared/lib/auth-client";

export * from "@repo/types";

// Override the shared model User type with the next-auth client-specific User type
export type User = AuthUser;
