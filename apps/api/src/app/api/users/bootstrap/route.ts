import type { UserProfile } from "@respira/shared-types";

import { handle } from "@/lib/http";
import { consume } from "@/lib/rate-limit";
import { requireDbUser } from "@/lib/user";

export const dynamic = "force-dynamic";

/**
 * Oturum açtıktan sonra istemcinin çağırdığı ilk endpoint.
 * Yerel User satırını oluşturur (veya döner) — tüm diğer veriler buna bağlanır.
 */
export function POST(request: Request) {
  return handle<UserProfile>(async () => {
    const user = await requireDbUser(request);
    consume(`bootstrap:${user.id}`, { limit: 20, windowMs: 60_000 });

    return {
      id: user.id,
      authId: user.authId,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  });
}
