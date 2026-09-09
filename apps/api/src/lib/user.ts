import { prisma } from "@respira/database";

import { requireUser } from "./auth";

/**
 * Doğrulanmış Supabase kimliğini yerel User satırına bağlar.
 *
 * Upsert kullanıyoruz: satır yoksa oluşturulur. Böylece istemcinin bootstrap
 * çağrısını yapmayı unutması ya da iki isteğin yarışması bir hataya dönüşmez.
 */
export async function requireDbUser(request: Request) {
  const { authId, email } = await requireUser(request);

  return prisma.user.upsert({
    where: { authId },
    create: { authId, email },
    // E-posta Supabase tarafında değişmiş olabilir; her istekte hizalıyoruz.
    update: { email },
  });
}
