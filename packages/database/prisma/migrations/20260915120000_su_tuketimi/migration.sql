-- CreateTable
CREATE TABLE "water_goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyTargetMl" INTEGER NOT NULL,
    "isCustomized" BOOLEAN NOT NULL DEFAULT false,
    "wakeTime" TEXT NOT NULL DEFAULT '08:00',
    "sleepTime" TEXT NOT NULL DEFAULT '23:00',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "water_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "water_intake_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountMl" INTEGER NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "water_intake_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "water_goals_userId_key" ON "water_goals"("userId");

-- CreateIndex
CREATE INDEX "water_intake_logs_userId_loggedAt_idx" ON "water_intake_logs"("userId", "loggedAt");

-- AddForeignKey
ALTER TABLE "water_goals" ADD CONSTRAINT "water_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "water_intake_logs" ADD CONSTRAINT "water_intake_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------- RLS (docs/02) ----------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    CREATE SCHEMA auth;
    EXECUTE 'CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $f$ SELECT NULL::uuid $f$';
  END IF;
END $$;

ALTER TABLE "water_goals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "water_intake_logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "water_goals_sahibi" ON "water_goals"
  FOR ALL TO authenticated
  USING ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text))
  WITH CHECK ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text));

CREATE POLICY "water_intake_logs_sahibi" ON "water_intake_logs"
  FOR ALL TO authenticated
  USING ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text))
  WITH CHECK ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text));
