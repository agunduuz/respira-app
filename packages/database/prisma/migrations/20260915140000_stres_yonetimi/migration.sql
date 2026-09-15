-- CreateEnum
CREATE TYPE "BreathingTechnique" AS ENUM ('BOX', 'FOUR_SEVEN_EIGHT', 'DIAPHRAGMATIC');

-- CreateTable
CREATE TABLE "stress_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "desiredSessionsPerDay" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stress_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breathing_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stressLevel" INTEGER,
    "technique" "BreathingTechnique" NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "status" "BreakStatus" NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "breathing_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stress_profiles_userId_key" ON "stress_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "breathing_sessions_userId_triggeredAt_key" ON "breathing_sessions"("userId", "triggeredAt");

-- CreateIndex
CREATE INDEX "breathing_sessions_userId_triggeredAt_idx" ON "breathing_sessions"("userId", "triggeredAt");

-- AddForeignKey
ALTER TABLE "stress_profiles" ADD CONSTRAINT "stress_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breathing_sessions" ADD CONSTRAINT "breathing_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------- RLS (docs/02) ----------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    CREATE SCHEMA auth;
    EXECUTE 'CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $f$ SELECT NULL::uuid $f$';
  END IF;
END $$;

ALTER TABLE "stress_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "breathing_sessions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stress_profiles_sahibi" ON "stress_profiles"
  FOR ALL TO authenticated
  USING ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text))
  WITH CHECK ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text));

CREATE POLICY "breathing_sessions_sahibi" ON "breathing_sessions"
  FOR ALL TO authenticated
  USING ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text))
  WITH CHECK ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text));
