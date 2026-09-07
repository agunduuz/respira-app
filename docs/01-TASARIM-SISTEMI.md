# 01 — Tasarım Sistemi

## Referans Kaynaklar

Bu projede iki tasarım kaynağı birlikte kullanılacak. İkisi farklı işler görüyor, birbirinin yerine geçmiyor:

| Kaynak | Ne işe yarar | Nasıl kurulur |
|---|---|---|
| **Anthropic `frontend-design` skill** | *İlke* kaynağı — "genel/şablon görünmeyen, kasıtlı tasarım kararları nasıl alınır" sorusuna cevap verir. Palet, tipografi, motion, restraint konusunda bir düşünme çerçevesi sunar. | Claude Code'da zaten yerleşik olarak mevcut (`/mnt/skills/public/frontend-design`) veya `github.com/anthropics/claude-code` reposundaki plugin olarak eklenebilir. |
| **`ui-ux-pro-max-skill` (nextlevelbuilder)** | *Malzeme* kaynağı — 161 renk paleti, 57 font eşleşmesi, React Native dahil 10 stack için component/desen önerileri, 99 UX kuralı, 25 grafik tipi barındıran aranabilir bir veritabanı. | `npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max` |

**Nasıl birlikte çalışırlar:** `ui-ux-pro-max-skill`'den somut bir palet/tipografi/component önerisi al, sonra `frontend-design` ilkeleriyle bunu bu projenin kendine özgü hale getir (jenerik "sağlık uygulaması yeşili" yerine, bu uygulamanın kendi imzasını taşıyan bir seçim yap).

## Tasarım Yönü (Brief)

- **Konu:** Kişisel sağlık/wellness takip uygulaması — göz, beslenme, duruş, su, stres.
- **Hedef kitle:** Başlangıçta tek kullanıcı (sen), ileride yoğun ekran başında çalışan, stresli iş temposu olan bilgi işçileri (yazılımcılar, ofis çalışanları).
- **Sayfanın/uygulamanın tek işi:** Günün akışına sessizce eşlik eden, rahatsız etmeyen ama görmezden de gelinemeyen bir "beden farkındalığı" katmanı olmak.
- **Kaçınılacak jenerik varsayılan:** Tipik "wellness app" görünümü — pastel yeşil/turkuaz + yuvarlak hatlı ikonlar + generic "sağlık" fotoğrafları. Bunun yerine daha az klişe, daha kişisel bir görsel dil hedefleniyor.

## Renk Paleti (İlk Öneri — token sistemi)

Bu bir başlangıç noktası; Claude Code, `ui-ux-pro-max-skill`'den somut paletleri tarayıp bunun yerini alacak veya bunu geliştirecek şekilde kullanılmalı.

| Token | Hex | Kullanım |
|---|---|---|
| `--color-base` | `#0F1712` | Koyu tema arka planı — göz yorucu mavi ışıktan kaçınmak için sıcak, neredeyse-siyah yeşilimsi ton |
| `--color-surface` | `#1A2620` | Kart/panel yüzeyleri |
| `--color-accent-primary` | `#7CE0B8` | Ana aksiyon rengi — canlı ama yumuşak bir mint, "nefes al" hissi veriyor |
| `--color-accent-warm` | `#E8A15C` | İkincil aksan — enerji/uyarı gerektiren yerler (bildirim, streak) |
| `--color-text-primary` | `#F3F6F4` | Ana metin |
| `--color-text-muted` | `#8FA396` | İkincil metin |

Açık tema karşılıkları Claude Code tarafından bu paletten türetilmeli (ters kontrast, aynı ton ailesi).

## Tipografi

- **Display/başlık:** Karakterli, biraz sıkı aralıklı bir sans-serif (ör. *Space Grotesk* veya *General Sans*) — sayaçlar ve büyük rakamlar (örn. su litresi, kalan dakika) bu yazı tipiyle gösterilecek çünkü uygulamanın en sık bakılan öğeleri bunlar.
- **Gövde metni:** Okunabilirliği yüksek, nötr bir sans-serif (ör. *Inter*).
- **Veri/etiket:** Tabular rakamlarla bir mono/utility font (ör. *IBM Plex Mono*) — grafiklerdeki sayılar hizalı dursun diye.

## Animasyon Stratejisi (3 katman)

Kullanıcının "3D ve animasyon efektleri" isteği doğrultusunda üç katmanlı bir yaklaşım öneriyoruz — hepsini her yerde kullanmak yerine, doğru araç doğru yerde:

1. **Mikro-etkileşimler (Reanimated):** Buton basma, sayfa geçişi, kart açılma/kapanma. Her ekranda var.
2. **Özel görselleştirmeler (Skia):** Su bardağı dolma animasyonu, nefes egzersizi genişleyen/daralan daire, günlük ilerleme halkaları (ring). Bunlar uygulamanın "imza" görselleri — özenle tasarlanmalı.
3. **3D (React Three Fiber, opsiyonel):** Sadece gerçekten katma değer sağlayan **tek bir** an için — örneğin stres modülündeki nefes egzersizinde yumuşak hareket eden 3D bir "orb" (küre). Her ekrana 3D koymak performans ve pil tüketimini bozar; `frontend-design` ilkesi burada net: *"cesaretini tek bir yerde harca"*.

> `frontend-design` skill'inin uyarısı burada özellikle geçerli: Aşırı animasyon, tasarımın "yapay zeka üretimi" hissi vermesine yol açabilir. Az sayıda, iyi düşünülmüş hareket; çok sayıda dağınık efektten daha güçlü durur.

## Erişilebilirlik ve Kalite Tabanı

- Tüm interaktif öğeler minimum 44x44pt dokunma alanına sahip olmalı.
- `prefers-reduced-motion` / sistem "hareketi azalt" ayarına saygı gösterilmeli — Skia/Reanimated animasyonları bu durumda basit fade'e düşmeli.
- Renk kontrastı WCAG AA seviyesinde tutulmalı (özellikle koyu temada metin/arka plan kontrastı).
- Karanlık mod varsayılan, açık mod ikinci seçenek olarak desteklenmeli.

## Sırada Ne Var?

`02-VERI-MODELI-VE-GUVENLIK.md` ile veritabanı şemasına ve güvenlik kurallarına geç.
