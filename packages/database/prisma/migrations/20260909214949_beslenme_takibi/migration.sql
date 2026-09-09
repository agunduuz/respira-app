-- CreateEnum
CREATE TYPE "BiologicalSex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "TrainingFrequency" AS ENUM ('NEVER', 'ONE_TO_TWO', 'TWO_TO_THREE', 'FOUR_TO_FIVE', 'DAILY');

-- CreateEnum
CREATE TYPE "BodyGoal" AS ENUM ('ATHLETIC', 'MUSCLE_GAIN', 'WEIGHT_LOSS', 'MAINTENANCE', 'FAT_LOSS');

-- CreateEnum
CREATE TYPE "MealMode" AS ENUM ('SIMPLE', 'DETAILED');

-- CreateTable
CREATE TABLE "nutrition_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mealsPerDay" INTEGER NOT NULL,
    "mealTimes" JSONB,
    "age" INTEGER NOT NULL,
    "heightCm" DOUBLE PRECISION NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "biologicalSex" "BiologicalSex",
    "trainingFrequency" "TrainingFrequency" NOT NULL,
    "trainingType" TEXT NOT NULL,
    "bodyGoal" "BodyGoal" NOT NULL,
    "bodyFatPercent" DOUBLE PRECISION,
    "measurements" JSONB,
    "targetCalories" INTEGER NOT NULL,
    "targetProteinG" DOUBLE PRECISION NOT NULL,
    "targetCarbsG" DOUBLE PRECISION NOT NULL,
    "targetFatG" DOUBLE PRECISION NOT NULL,
    "macrosCustomized" BOOLEAN NOT NULL DEFAULT false,
    "bloodType" TEXT,
    "sugarNeedRate" TEXT,
    "lastBloodTestDate" TIMESTAMP(3),
    "bloodTestReminderMonths" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "mealLabel" TEXT NOT NULL,
    "mode" "MealMode" NOT NULL,
    "rawText" TEXT,
    "foodItemsDetail" JSONB,
    "calories" INTEGER,
    "proteinG" DOUBLE PRECISION,
    "carbsG" DOUBLE PRECISION,
    "fatG" DOUBLE PRECISION,
    "fiberG" DOUBLE PRECISION,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_nutrition_summaries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalCalories" INTEGER NOT NULL,
    "totalProteinG" DOUBLE PRECISION NOT NULL,
    "totalCarbsG" DOUBLE PRECISION NOT NULL,
    "totalFatG" DOUBLE PRECISION NOT NULL,
    "totalFiberG" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "daily_nutrition_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nutrition_profiles_userId_key" ON "nutrition_profiles"("userId");

-- CreateIndex
CREATE INDEX "meal_entries_userId_date_idx" ON "meal_entries"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_nutrition_summaries_userId_date_key" ON "daily_nutrition_summaries"("userId", "date");

-- AddForeignKey
ALTER TABLE "nutrition_profiles" ADD CONSTRAINT "nutrition_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_entries" ADD CONSTRAINT "meal_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_nutrition_summaries" ADD CONSTRAINT "daily_nutrition_summaries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------- RLS (docs/02-VERI-MODELI-VE-GUVENLIK.md) ----------
-- Beslenme verisi KVKK md. 6 kapsamında özel nitelikli kişisel veri.
-- Politika kurulmazsa bu tablolar PostgREST üzerinden publishable anahtara
-- sahip herkese açık olur.

-- Shadow database'de Supabase auth şeması yok; oradaki tekrar oynatma için stub.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    CREATE SCHEMA auth;
    EXECUTE 'CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $f$ SELECT NULL::uuid $f$';
  END IF;
END $$;

ALTER TABLE "nutrition_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "meal_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "daily_nutrition_summaries" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nutrition_profiles_sahibi" ON "nutrition_profiles"
  FOR ALL TO authenticated
  USING ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text))
  WITH CHECK ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text));

CREATE POLICY "meal_entries_sahibi" ON "meal_entries"
  FOR ALL TO authenticated
  USING ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text))
  WITH CHECK ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text));

CREATE POLICY "daily_nutrition_summaries_sahibi" ON "daily_nutrition_summaries"
  FOR ALL TO authenticated
  USING ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text))
  WITH CHECK ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text));
