-- Ağ tekrarı aynı molayı iki kez yazmasın diye tekillik kısıtı.
-- İki gerçek mola aynı milisaniyede tetiklenemez; bu kısıt seans gönderimini
-- idempotent yapıyor (createMany + skipDuplicates ancak bununla işe yarar).
CREATE UNIQUE INDEX "eye_strain_sessions_userId_triggeredAt_key" ON "eye_strain_sessions"("userId", "triggeredAt");
