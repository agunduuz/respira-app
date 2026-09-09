-- CreateEnum
CREATE TYPE "EyeStrainStatus" AS ENUM ('COMPLETED', 'SKIPPED', 'MISSED');

-- CreateTable
CREATE TABLE "eye_strain_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "intervalMinutes" INTEGER NOT NULL DEFAULT 20,
    "breakSeconds" INTEGER NOT NULL DEFAULT 20,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eye_strain_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eye_strain_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "EyeStrainStatus" NOT NULL,

    CONSTRAINT "eye_strain_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "eye_strain_settings_userId_key" ON "eye_strain_settings"("userId");

-- CreateIndex
CREATE INDEX "eye_strain_sessions_userId_triggeredAt_idx" ON "eye_strain_sessions"("userId", "triggeredAt");

-- AddForeignKey
ALTER TABLE "eye_strain_settings" ADD CONSTRAINT "eye_strain_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eye_strain_sessions" ADD CONSTRAINT "eye_strain_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------- RLS (docs/02-VERI-MODELI-VE-GUVENLIK.md) ----------
-- Yeni tablolar da public şemada, yani PostgREST'e otomatik açık. Politika
-- kurulmazsa publishable anahtara sahip herkes bu satırları okuyabilir.
-- Bu blok, çekirdek tablolardaki desenin birebir aynısı.

-- Shadow database'de Supabase'in auth şeması yok; oradaki tekrar oynatma için stub.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    CREATE SCHEMA auth;
    EXECUTE 'CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $f$ SELECT NULL::uuid $f$';
  END IF;
END $$;

ALTER TABLE "eye_strain_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "eye_strain_sessions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "eye_strain_settings_sahibi" ON "eye_strain_settings"
  FOR ALL TO authenticated
  USING ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text))
  WITH CHECK ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text));

CREATE POLICY "eye_strain_sessions_sahibi" ON "eye_strain_sessions"
  FOR ALL TO authenticated
  USING ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text))
  WITH CHECK ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text));
