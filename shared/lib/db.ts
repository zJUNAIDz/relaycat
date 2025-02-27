import { PrismaClient } from '@prisma/client'
import { withOptimize } from '@prisma/extension-optimize'
import { getEnv } from '../utils/env';
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db =
  globalForPrisma.prisma || new PrismaClient().$extends(withOptimize({ apiKey: getEnv("OPTIMIZE_API_KEY"), enable: true }));

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;