import { PrismaClient } from "@/app/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "PrismaClient cannot be initialized: DATABASE_URL environment variable is not set."
    );
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  globalForPrisma.pool = pool;
  return new PrismaClient({ adapter });
}

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Use a Proxy so PrismaClient is only instantiated when a method is actually called.
// This prevents build-time errors when route modules are loaded but not executed.
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    if (prop === "then") return undefined;
    return getPrisma()[prop as keyof PrismaClient];
  },
});

export default prisma;
