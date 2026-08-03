import { Prisma, PrismaClient } from "@prisma/client";

const TRANSIENT_CODES = new Set(["P1001", "P1002", "P1008", "P1017", "P2024"]);

function isTransient(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return TRANSIENT_CODES.has(error.code);
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }
  if (error instanceof Error) {
    return /Can't reach database|Timed out fetching|Connection reset|ECONNRESET|ETIMEDOUT|Server has closed the connection|Connection refused|too many clients|Prepared statement/i.test(
      error.message
    );
  }
  return false;
}

// ponytail: 3 attempts covers Vercel↔Supabase cold TCP; escalate to Accelerate if still flaky
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  const waits = [0, 300, 900];
  let last: unknown;
  for (let i = 0; i < waits.length; i++) {
    if (waits[i] > 0) {
      await new Promise((r) => setTimeout(r, waits[i]));
    }
    try {
      return await fn();
    } catch (error) {
      last = error;
      if (!isTransient(error) || i === waits.length - 1) throw error;
    }
  }
  throw last;
}

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  return client.$extends({
    query: {
      $allOperations({ args, query }) {
        return withRetry(() => query(args));
      },
    },
  });
}

type PrismaClientSingleton = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientSingleton };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;
