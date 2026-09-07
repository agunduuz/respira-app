-- Row Level Security — docs/02-VERI-MODELI-VE-GUVENLIK.md → "Yetkilendirme"
--
-- Supabase, public şemasındaki tabloları PostgREST üzerinden otomatik yayınlar.
-- Publishable/anon anahtar mobil uygulama paketine gömülü olduğu için, RLS
-- olmadan o anahtara sahip herkes tüm kullanıcıların sağlık verisini okuyabilir.
--
-- NOT: FORCE ROW LEVEL SECURITY bilinçli olarak KAPALI. Prisma veritabanına
-- tablo sahibi rolüyle bağlanıyor ve sahip rolü RLS'i bypass eder — backend
-- kendi userId kontrolünü yapıyor (defense in depth). Bu politikalar doğrudan
-- PostgREST erişimini (anon / authenticated rolleri) kısıtlar.

-- Prisma, migration'ları doğrularken boş bir "shadow database" üzerinde
-- tekrar oynatır. O veritabanında Supabase'in auth şeması yoktur, bu yüzden
-- auth.uid() çözümlenemez. Aşağıdaki blok yalnızca auth şeması YOKSA bir stub
-- oluşturur — gerçek Supabase veritabanında hiçbir şey yapmaz.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    CREATE SCHEMA auth;
    EXECUTE 'CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $f$ SELECT NULL::uuid $f$';
  END IF;
END $$;

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "consent_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notification_preferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "daily_reports" ENABLE ROW LEVEL SECURITY;

-- Prisma'nın migration geçmişi de public şemada ve PostgREST'e açık.
-- Politika tanımlamıyoruz: RLS açık + politika yok = herkese kapalı.
-- Koşullu: bu tablo shadow database'de bulunmaz.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = '_prisma_migrations'
  ) THEN
    EXECUTE 'ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- ---------- users ----------
-- Kullanıcı yalnızca kendi satırını görebilir. authId, Supabase auth.users.id.
CREATE POLICY "users_kendi_satirini_okur" ON "users"
  FOR SELECT TO authenticated
  USING (auth.uid()::text = "authId");

CREATE POLICY "users_kendi_satirini_gunceller" ON "users"
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = "authId")
  WITH CHECK (auth.uid()::text = "authId");

-- INSERT/DELETE bilinçli olarak yok: kullanıcı kaydı ve hesap silme akışları
-- backend üzerinden yürür (KVKK md. 11 silme hakkı dahil).

-- ---------- alt tablolar ----------
-- userId → users.id; sahiplik users.authId üzerinden auth.uid()'e bağlanır.

CREATE POLICY "consent_records_sahibi" ON "consent_records"
  FOR ALL TO authenticated
  USING ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text))
  WITH CHECK ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text));

CREATE POLICY "notification_preferences_sahibi" ON "notification_preferences"
  FOR ALL TO authenticated
  USING ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text))
  WITH CHECK ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text));

CREATE POLICY "daily_reports_sahibi" ON "daily_reports"
  FOR ALL TO authenticated
  USING ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text))
  WITH CHECK ("userId" IN (SELECT "id" FROM "users" WHERE "authId" = auth.uid()::text));
