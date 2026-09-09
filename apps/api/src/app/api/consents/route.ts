import { prisma } from "@respira/database";
import {
  CURRENT_CONSENT_VERSIONS,
  REQUIRED_CONSENT_TYPES,
  grantConsentSchema,
  revokeConsentSchema,
  type ConsentStatus,
  type ConsentRecordDto,
} from "@respira/shared-types";

import { HttpError, handle, parseBody } from "@/lib/http";
import { consume } from "@/lib/rate-limit";
import { requireDbUser } from "@/lib/user";

export const dynamic = "force-dynamic";

type ConsentRow = {
  id: string;
  consentType: string;
  textVersion: string;
  grantedAt: Date;
  revokedAt: Date | null;
};

const toDto = (r: ConsentRow): ConsentRecordDto => ({
  id: r.id,
  consentType: r.consentType as ConsentRecordDto["consentType"],
  textVersion: r.textVersion,
  grantedAt: r.grantedAt.toISOString(),
  revokedAt: r.revokedAt?.toISOString() ?? null,
});

/**
 * Onboarding kapısı: hangi zorunlu rızalar eksik veya eski sürümde?
 * Metin sürümü artırıldığında eski onay geçersiz sayılır (KVKK md. 6).
 */
export function GET(request: Request) {
  return handle<ConsentStatus>(async () => {
    const user = await requireDbUser(request);

    const records = await prisma.consentRecord.findMany({
      where: { userId: user.id },
      orderBy: { grantedAt: "desc" },
    });

    const missing = REQUIRED_CONSENT_TYPES.map((consentType) => {
      const requiredVersion = CURRENT_CONSENT_VERSIONS[consentType];
      // Geri alınmamış, en güncel onay kaydı.
      const active = records.find((r) => r.consentType === consentType && r.revokedAt === null);

      if (active?.textVersion === requiredVersion) return null;
      return {
        consentType,
        requiredVersion,
        grantedVersion: active?.textVersion ?? null,
      };
    }).filter((x): x is NonNullable<typeof x> => x !== null);

    return { missing, records: records.map(toDto) };
  });
}

/** Açık rıza verme. Her onay ayrı bir satır — ispat zinciri korunur. */
export function POST(request: Request) {
  return handle<ConsentRecordDto>(async () => {
    const user = await requireDbUser(request);
    consume(`consent:${user.id}`, { limit: 30, windowMs: 60_000 });

    const input = await parseBody(request, grantConsentSchema);

    // İstemcinin eski/uydurma bir sürüme onay kaydı açmasını engelle.
    const expected = CURRENT_CONSENT_VERSIONS[input.consentType as keyof typeof CURRENT_CONSENT_VERSIONS];
    if (expected && input.textVersion !== expected) {
      throw new HttpError(
        409,
        `Bu metnin güncel sürümü ${expected}. Uygulamayı güncelleyip tekrar dene.`,
        "STALE_CONSENT_VERSION"
      );
    }

    // Aynı türde açık bir onay varsa önce kapat — tek aktif kayıt kalsın.
    await prisma.consentRecord.updateMany({
      where: { userId: user.id, consentType: input.consentType, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    const created = await prisma.consentRecord.create({
      data: {
        userId: user.id,
        consentType: input.consentType,
        textVersion: input.textVersion,
      },
    });

    return toDto(created);
  });
}

/** Rızayı geri alma (KVKK md. 11). Kayıt silinmez, revokedAt işaretlenir. */
export function DELETE(request: Request) {
  return handle<{ revoked: number }>(async () => {
    const user = await requireDbUser(request);
    const input = await parseBody(request, revokeConsentSchema);

    const result = await prisma.consentRecord.updateMany({
      where: { userId: user.id, consentType: input.consentType, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { revoked: result.count };
  });
}
