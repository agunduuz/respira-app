import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace paketleri ham TypeScript export ediyor — Next.js'in onları
  // kendi derleyicisinden geçirmesi gerekiyor.
  transpilePackages: ["@respira/database", "@respira/shared-types"],
  // Prisma engine'i sunucu bundle'ına dahil edilmemeli, dosya olarak kalmalı.
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
};

export default nextConfig;
