import { PrismaClient } from '@/generated/prisma/client';
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db =
  // globalForPrisma.prisma || new PrismaClient().$extends(withOptimize({ apiKey: getEnv("OPTIMIZE_API_KEY"), enable: true }));
  globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;