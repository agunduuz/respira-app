/**
 * ⚠️ HUKUKİ UYARI
 * Aşağıdaki metinler docs/02-VERI-MODELI-VE-GUVENLIK.md'deki teknik akışı
 * kurmak için yazılmış TASLAKLARDIR, hukuki tavsiye değildir. Store'a
 * yayınlamadan önce gerçek Aydınlatma Metni ve Açık Rıza Metni bir avukata
 * hazırlatılmalı/kontrol ettirilmelidir.
 *
 * Metin değişirse packages/shared-types içindeki CURRENT_CONSENT_VERSIONS
 * sürümü de artırılmalı — aksi halde kullanıcıdan yeniden onay istenmez.
 */

export const AYDINLATMA_METNI = `Respira, ekran başında geçen günü daha sağlıklı geçirmene yardımcı olmak için tasarlanmış kişisel bir takip uygulamasıdır.

Hangi verileri işliyoruz?
• Hesap bilgin: e-posta adresin.
• Sağlık ve yaşam verilerin: göz molası kayıtların, su tüketimin, öğün ve beslenme bilgilerin, duruş molaların, nefes/stres seansların ve bunlardan üretilen günlük özetler.

Bu veriler neden işleniyor?
Yalnızca sana hatırlatma göstermek, ilerlemeni özetlemek ve geçmişini görüntülemeni sağlamak için. Reklam, profilleme veya pazarlama amacıyla kullanılmaz.

Kimlerle paylaşılıyor?
Hiç kimseyle. Verilerin üçüncü kişilere satılmaz veya devredilmez. Veriler, uygulamanın çalışması için kullandığımız barındırma sağlayıcısının (Supabase) sunucularında saklanır.

Ne kadar süre saklanıyor?
Hesabın açık kaldığı sürece. Favorilemediğin günlerin serbest metin ve fotoğraf gibi ham içerikleri belirli bir süre sonra otomatik silinir; yalnızca sayısal özetler (kalori, mililitre gibi) kalır. Hesabını sildiğinde tüm verilerin geri dönüşsüz olarak silinir.

Haklarınız (KVKK md. 11)
Verilerine erişebilir, dışa aktarabilir, düzeltilmesini veya silinmesini isteyebilirsin. Bu işlemleri Ayarlar ekranından kendin yapabilirsin.

Önemli
Respira bir sağlık hizmeti sağlamaz. Tanı koymaz, tedavi önermez. İçerdiği öneriler doktor, diyetisyen veya başka bir uzmanın desteğinin yerine geçmez.`;

export const ACIK_RIZA_METNI = `Beslenme, kan şekeri durumu, stres seviyesi ve benzeri verilerin, 6698 sayılı KVKK'nın 6. maddesi kapsamında "özel nitelikli kişisel veri" sayılır. Bu tür verilerin işlenebilmesi için ayrıca açık rızan gerekir.

Aşağıdaki kutuyu işaretleyerek, Aydınlatma Metni'nde açıklanan sağlık verilerinin yalnızca orada belirtilen amaçlarla Respira tarafından işlenmesini kabul etmiş olursun.

Bu rızayı dilediğin zaman Ayarlar ekranından geri alabilirsin. Rızanı geri aldığında ilgili özellikleri kullanamazsın, ancak hesabın açık kalır.`;

export const ACIK_RIZA_ONAY_IFADESI =
  "Sağlık verilerimin bu uygulama tarafından işlenmesini kabul ediyorum.";
