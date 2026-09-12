-- CreateEnum
CREATE TYPE "WorkStyle" AS ENUM ('SEDENTARY', 'STANDING_ACTIVE', 'MIXED');

-- CreateEnum
CREATE TYPE "WorkIntensity" AS ENUM ('LIGHT', 'MODERATE', 'HEAVY');

-- CreateEnum
CREATE TYPE "BreakStatus" AS ENUM ('COMPLETED', 'SKIPPED', 'MISSED');

-- CreateTable
CREATE TABLE "posture_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workStyle" "WorkStyle" NOT NULL,
    "workIntensity" "WorkIntensity" NOT NULL,
    "screenHoursPerDay" INTEGER,
    "occupationType" TEXT NOT NULL,
    "minutesPerHourAvailable" INTEGER NOT NULL,
    "workHoursStart" TEXT,
    "workHoursEnd" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posture_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posture_break_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "BreakStatus" NOT NULL,
    "exerciseSetId" TEXT,

    CONSTRAINT "posture_break_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "posture_profiles_userId_key" ON "posture_profiles"("userId");

-- CreateIndex
CREATE INDEX "posture_break_logs_userId_triggeredAt_idx" ON "posture_break_logs"("userId", "triggeredAt");

-- CreateIndex
CREATE UNIQUE INDEX "posture_break_logs_userId_triggeredAt_key" ON "posture_break_logs"("userId", "triggeredAt");

-- AddForeignKey
ALTER TABLE "posture_profiles" ADD CONSTRAINT "posture_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posture_break_logs" ADD CONSTRAINT "posture_break_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------- RLS (docs/02) ----------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    CREATE SCHEMA auth;
    EXECUTE 'CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $f$ SELECT NULL::uuid $f$';
  END IF;
END $$;

ALTER TABLE "posture_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "posture_break_logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posture_profiles_sahibi" ON "posture_profiles"
  FOR ALL TO authenticated
  USING ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text))
  WITH CHECK ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text));

CREATE POLICY "posture_break_logs_sahibi" ON "posture_break_logs"
  FOR ALL TO authenticated
  USING ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text))
  WITH CHECK ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text));
