import { auth } from "@/lib/auth";

export type AppContext = {
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
    logger: typeof import("../lib/logger").logger | null;
  };
};
