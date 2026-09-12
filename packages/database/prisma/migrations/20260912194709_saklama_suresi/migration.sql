-- AlterTable
ALTER TABLE "users" ADD COLUMN     "dataRetentionDays" INTEGER NOT NULL DEFAULT 30;

-- ---------- Saklama temizliği (docs/02-VERI-MODELI-VE-GUVENLIK.md) ----------
-- Favoriye eklenmemiş öğünlerin HAM İÇERİĞİ (serbest metin + besin kalemi
-- detayı) saklama süresi dolunca siliniyor. Sayısal metrikler (kalori,
-- protein, karb, yağ, lif) KALIYOR — grafikler ve raporlar bunlara dayanıyor.
--
-- Süre kullanıcı başına: users.dataRetentionDays.
--
-- Fonksiyon olarak tanımlanıyor ki hem zamanlanmış iş hem de API rotası aynı
-- mantığı çağırsın; iki yerde ayrı SQL tutmak kaçınılmaz olarak birbirinden
-- ayrışır.
--
-- SECURITY DEFINER: fonksiyon tablo sahibinin yetkisiyle çalışır. Bu bilinçli —
-- temizlik tüm kullanıcıların satırlarına dokunmalı, tek bir kullanıcının
-- oturumuyla değil. Bu yüzden fonksiyon PUBLIC'e AÇILMIYOR (aşağıdaki REVOKE).
CREATE OR REPLACE FUNCTION public.purge_non_favorite_content()
RETURNS TABLE(purged_meals bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH updated AS (
    UPDATE meal_entries m
    SET "rawText" = NULL,
        "foodItemsDetail" = NULL
    FROM users u
    WHERE m."userId" = u.id
      AND m."isFavorite" = false
      -- Zaten temizlenmiş satırları tekrar tekrar güncellemeyelim.
      AND (m."rawText" IS NOT NULL OR m."foodItemsDetail" IS NOT NULL)
      AND m."createdAt" < now() - make_interval(days => u."dataRetentionDays")
    RETURNING m.id
  )
  SELECT count(*) FROM updated;
END;
$$;

-- Fonksiyon RLS'i bypass ettiği için PostgREST üzerinden çağrılabilir olmamalı.
REVOKE ALL ON FUNCTION public.purge_non_favorite_content() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.purge_non_favorite_content() FROM anon;
REVOKE ALL ON FUNCTION public.purge_non_favorite_content() FROM authenticated;
