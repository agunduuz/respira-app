import { PrismaClient } from "@prisma/client";

// Next.js dev modunda hot-reload her istekte modülü yeniden yüklediği için
// PrismaClient'i global'de saklıyoruz — aksi halde bağlantı havuzu tükenir.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export * from "@prisma/client";
