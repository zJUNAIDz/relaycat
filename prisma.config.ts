import "dotenv/config";
import * as path from "node:path";
import type { PrismaConfig } from "prisma";

export default {
  schema: path.join("./src/prisma", "schema.prisma"),
  migrations: {
    path: path.join("./src/prisma", "migrations"),
  },
  views: {
    path: path.join("./src/prisma", "views"),
  },
  typedSql: {
    path: path.join("./src/prisma", "queries"),
  }
} satisfies PrismaConfig;