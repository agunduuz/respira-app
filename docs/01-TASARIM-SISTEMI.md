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

Açık tema karşılıkları bu paletten türetildi (ters kontrast, aynı ton ailesi).

### Özellik Başına Aksan (UI-004)

Taban renkler (zemin, yüzey, kenarlık, metin) **her modülde aynı** kalır; yalnızca aksan değişir. Böylece her modülün kendi kimliği olur ama uygulama dağınık bir pastel koleksiyonuna dönüşmez.

| Modül | Açık tema | Koyu tema | Neden |
|---|---|---|---|
| Anasayfa / Bugün / Ayarlar | `#0B6B49` | `#7CE0B8` | Markanın mint yeşili — kurumsal palet |
| Göz | `#7A4A21` | `#DDB892` | Kahve/ela; ekran ışığının karşısında sıcak ve yumuşak |
| Beslenme | `#8A5B12` | `#E8C07A` | Kavrulmuş amber |
| Su | `#12608F` | `#86C7EC` | Mavi |
| Duruş | `#9C4221` | `#F0A98C` | Kil/terrakota — harekete çağıran toprak tonu |
| Nefes | `#4C4F9F` | `#B9BDF2` | Sakin indigo; diğerlerinden serin ve sofistike |

- **Tanım:** `theme/tokens.ts` → `featureAccents`. Hepsi WCAG AA (açık temada beyaz kart üstünde ≥5.36:1, koyuda yüzey üstünde ≥8.02:1).
- **Uygulama:** `theme/feature-theme.tsx`. Aktif rota `RouteFeatureTint` ile modülü belirler; aksan hem CSS değişkeni (`bg-accent`, `text-accent` gibi tüm sınıflar) hem JS tarafı (`usePalette()`) için aynı anda değişir. Ekranlar tek tek işaretlenmez.
- **Karma listelerde:** Anasayfa ve Bugün kurumsal palette kalır; yalnızca modül satırları/slaytları `FeatureTint` ile kendi rengini alır.

## Tipografi

- **Display/başlık:** *Fraunces* — karakterli, editoryal bir serif (optical-size ve soft/wonk eksenleri sayesinde büyük boyutlarda kişilikli, jenerik "startup sans-serif" hissinden uzak). Sayaçlar ve büyük rakamlar (örn. su litresi, kalan dakika) bu yazı tipiyle gösterilecek çünkü uygulamanın en sık bakılan öğeleri bunlar. (Önceki seçim *Space Grotesk* idi — 2026-09-19'da daha karakteristik bir seçim için değiştirildi.)
- **Gövde metni:** Okunabilirliği yüksek, nötr bir sans-serif (*Inter*).
- **Veri/etiket:** Tabular rakamlarla bir mono/utility font (*IBM Plex Mono*) — grafiklerdeki sayılar hizalı dursun diye. Bu, görünen tipografi "sesini" ikiye indirme (Fraunces + Inter) hedefiyle çelişmiyor; salt hizalama için teknik bir yardımcı font.

## Animasyon Stratejisi (3 katman)

Kullanıcının "3D ve animasyon efektleri" isteği doğrultusunda üç katmanlı bir yaklaşım öneriyoruz — hepsini her yerde kullanmak yerine, doğru araç doğru yerde:

1. **Mikro-etkileşimler (Reanimated):** Buton basma, sayfa geçişi, kart açılma/kapanma. Her ekranda var.
2. **Özel görselleştirmeler (Skia):** Su bardağı dolma animasyonu, nefes egzersizi genişleyen/daralan daire, günlük ilerleme halkaları (ring). Bunlar uygulamanın "imza" görselleri — özenle tasarlanmalı.
3. **3D (React Three Fiber, opsiyonel):** Sadece gerçekten katma değer sağlayan **tek bir** an için — örneğin stres modülündeki nefes egzersizinde yumuşak hareket eden 3D bir "orb" (küre). Her ekrana 3D koymak performans ve pil tüketimini bozar; `frontend-design` ilkesi burada net: *"cesaretini tek bir yerde harca"*.

> `frontend-design` skill'inin uyarısı burada özellikle geçerli: Aşırı animasyon, tasarımın "yapay zeka üretimi" hissi vermesine yol açabilir. Az sayıda, iyi düşünülmüş hareket; çok sayıda dağınık efektten daha güçlü durur.

## Arayüz Temelleri (Apple HIG + Linear)

Bileşen seviyesindeki kararlar **Apple Human Interface Guidelines** ve **Linear** tasarım ilkelerine göre alınır: hiyerarşi büyük harfle değil boyut/kalınlıkla kurulur, yüzeyler sade ve düşük kontrastlıdır, vurgu tek bir renkte toplanır.

- **Tema erişimi:** Renk gereken her yer (ikon, Skia, tab bar) `usePalette()` + `rgb()` kullanır (`theme/use-palette.ts`); ekranlarda palet seçimi kopyalanmaz.
- **Form etiketleri:** Normal yazım, `subhead` (15pt, orta kalınlık) — `components/nutrition/FieldLabel`. Opsiyonel alanlar yanında soluk "opsiyonel" ibaresiyle işaretlenir.
- **Giriş metni:** Inter, gövde boyutu (16pt). Mono font yalnızca hizalanması gereken rakamlar (grafik, sayaç, saat hücreleri) içindir.
- **Butonlar:** Metin `button` (16pt, yarı kalın), en az 48pt yükseklik.
- **Seçim çipleri:** Hap biçimli; seçili değilken kenarlıksız nötr zemin (`bg-text/5`), seçiliyken aksan tonlu zemin + aksan kenarlık + aksan metin (`bg-accent/10`). Dolu aksan dolgusu yalnızca birincil butonda kullanılır.
- **İkon rozetleri / vurgu kutuları:** `bg-accent/10` — iki temada da görünür (`bg-elevated` açık temada kart ile aynı beyaz olduğu için kullanılmaz).
- **Keşfe açık ekranlar:** Eylem odaklı ekranlar (Göz, Su, Duruş) ana eylemin altında `components/InfoTip` ("Biliyor muydun?") gösterir; metinler `lib/tips.ts`'te, günlük dönüşümlü, sağlık iddiası içermez.
- **Boşluk:** Ekran kenarı ve kart iç boşluğu 20pt (`p-5`).

## Gezinme (Alt Bar)

Apple HIG alt barda 3-5 öğe öneriyor ve sekmelerin *eylem* değil *bölüm* olmasını istiyor. Respira'da dört sekme var:

| Sekme | İçerik |
|---|---|
| **Anasayfa** | Selamlama, günün notu ve yatay kaydırmalı "Keşfet" şeridi (`lib/discover.ts`). Bilinçli olarak tek bir eyleme zorlamaz; göz atılacak bir alan bırakır. |
| **Bugün** | Göz, Su, Duruş ve Nefes'in tek satırlık durumu + en sık yapılan eylem (`components/TodayCard`). Karta dokunmak modülün kendi ekranını açar (`/eye`, `/water`, `/posture`, `/stress`). |
| **Beslenme** | Öğün girişi, makro takibi ve raporlar — veri yoğunluğu nedeniyle kendi bölümü. |
| **Profil** | Kişisel bilgiler, aylık istatistikler ve aktivite takvimi. Sağ üstteki dişli ayrı bir **Ayarlar** ekranı açar (`/settings`). |

- **Ayarlar içeriği (UI-005):** Gruplu satır listesi (`components/settings/`): Görünüm (tema: Açık/Koyu/Sistem, kalıcı) · Hatırlatmalar (modül başına anahtar) · Alışkanlıklar (süre, hedef, profil) · Günün önerileri (Anasayfa'da hangi modüller) · Yardım · Gizlilik ve veri · Hesap.
- **Hatırlatmalar tek kaynaktan:** Durum bileşen state'inden değil planlı bildirimlerden okunur (`lib/use-reminders.ts`). Ayarlar'daki anahtar ile her modülün kendi ekranındaki "Hatırlatmaları aç/kapat" butonu aynı şeyi gösterir ve aynı şeyi değiştirir. İzin reddedilmişse `PermissionHint` cihaz ayarlarına yönlendirir.
- **Profil ≠ Ayarlar:** Veri indirme, rıza yönetimi, hesap silme gibi teknik/hesap işlemleri Profil'de değil, Ayarlar ekranındadır.

- **Neden Nefes sekme değil:** Bir yere gitmek değil, bir eylem başlatmak — bu yüzden Bugün'de bir satır.
- **Keşif içeriği uydurulmaz:** Keşfet kartları uygulamanın kendi bilgisinden beslenir (nefes teknikleri, ipuçları); sağlık iddiası içermez.
- **Ekrandan bağımsız çalışan mantık:** Göz sayacının faz geçişi ve kaçırılan mola uzlaştırması `components/EyeTimerEngine` ile kök layout'ta çalışır; kullanıcı Göz ekranında olmasa da mola tetiklenir.

## Çok Adımlı Akışlar (Kurulum / Karşılama)

Uzun soru-cevap zincirleri kullanıcıyı uygulamayı kapatmaya itiyor. Bu yüzden tüm kurulum akışları aynı kısa kalıbı paylaşır:

- **Kabuk:** `components/flow/StepFlow` — üstte sabit ilerleme çubuğu, ortada kaydırılabilir adım içeriği, altta sabit Geri/Devam. Beslenme anketi, Duruş profili ve Su hedefi bunu kullanır.
- **İlerleme çubuğu:** `components/flow/FlowProgress` — ince, segmentli; her adım bir segment. Karşılama akışında layout seviyesinde durur ki ekranlar arası geçişte kesintisiz dolsun.
- **Kısa tut:** Bir akış en fazla 4 adım; her adım tek bir soru grubu. Segment sayısı arttıkça akış uzun görünür — yeni bir adım eklemeden önce mevcut bir adıma sığıp sığmadığına bak.
- **Zorunlu alan yoksa adımı kilitleme:** "Devam" yalnızca o adımda zorunlu bir alan boşsa devre dışı kalır; kayıt hatası ilgili adıma geri götürür.
- Tek ekranlık tanıtımlarda (ör. `FeatureIntro`, Nefes) ilerleme çubuğu kullanılmaz — tek adımlık bir "akış" göstermek gereksiz gürültü.

## Erişilebilirlik ve Kalite Tabanı

- Tüm interaktif öğeler minimum 44x44pt dokunma alanına sahip olmalı.
- `prefers-reduced-motion` / sistem "hareketi azalt" ayarına saygı gösterilmeli — Skia/Reanimated animasyonları bu durumda basit fade'e düşmeli.
- Renk kontrastı WCAG AA seviyesinde tutulmalı (özellikle koyu temada metin/arka plan kontrastı).
- Açık mod varsayılan, karanlık mod ikinci seçenek olarak desteklenmeli. (İlk girişte koyu tema karamsarlık hissi yaratabildiği için wellness bağlamında açık mod tercih edildi.)

## Sırada Ne Var?

`02-VERI-MODELI-VE-GUVENLIK.md` ile veritabanı şemasına ve güvenlik kurallarına geç.
