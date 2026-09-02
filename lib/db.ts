import { PrismaClient } from '@prisma/client';
const holder = globalThis as unknown as { prisma?: PrismaClient };
export const db = holder.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') holder.prisma = db;
