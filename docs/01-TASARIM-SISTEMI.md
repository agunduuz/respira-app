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

## Görsel Dil: Lavanta Blok (UI-009…013)

Kaynak tasarım: `Respira B - Lavanta Blok.dc.html` (Claude Design, yaklaşım 2/3). Bu bölüm önceki mint/koyu palet ve özellik-başına-aksan sisteminin **yerine geçer**.

### Renk: tek ana renk, 15 ton
- **Tek kaynak hue (0–360°).** Varsayılan 290 (mor). Kullanıcı Profil > **Tema rengi**'nden 8 hazır renkten (Mor, İndigo, Mavi, Turkuaz, Yeşil, Kehribar, Mercan, Pembe) ya da serbest renk çubuğundan seçer; seçim cihazda kalıcıdır (`theme/hue-store.ts`, AsyncStorage) ve tüm uygulama anında yeniden boyanır.
- **Ton ölçeği** (`theme/tones.ts`, tasarımdaki `TONES` ile birebir): `t25 t50 t100 t200 t300 t400 t500 t600 t700 t800 t900` + `mut`, `mutL` (ikincil metin) + `line`, `line2` (ayraç). Hepsi OKLCH açıklık/kroma basamağı; RN `oklch()` okumadığı için `lib/oklch.ts` sRGB'ye çevirir (gamut dışı renk kırpılmaz, kroma düşürülür; testli).
- **Nasıl uygulanır:** `components/ThemeRoot.tsx` hue'dan üretilen CSS değişkenlerini kökte `vars()` ile verir; Tailwind renkleri bu değişkenlere bağlıdır (`bg-t300`, `text-mut`, `border-line`). Ekranlarda ham hex yok. JS tarafı (SVG, navigasyon) `usePalette()` okur. `global.css` yalnızca ilk kare için varsayılan (mor) değerleri tutar.
- **Eski semantik token'lar** (`bg`, `surface`, `text`, `text-muted`, `accent`, `border`, `danger`) tonlara eşlenir: bg=t25, surface=beyaz, text=t900, muted=mut, accent=t900. Tehlike rengi hue'dan bağımsız kırmızıdır.
- **Modül rengi yok, modül bloğu var:** Her modül kendi ana rengini değil, aynı ölçekten kendi ton bloğunu alır — Göz t200 · Su t100 · Postür t400 · Nefes t300 · Beslenme t200/t50 · koyu vurgu t900.
- **Koyu tema:** tasarımda yok; şimdilik yalnızca açık tema (`useIsDark()` her zaman false). Koyu tema tasarıma girerse ton ölçeği ters çevrilerek eklenir.

### Bileşen dili
- **Bloklar:** büyük blok 28–30, küçük kart/karo 22–26, sayfa başlık bloğunun alt köşeleri 40, etiketler 11–14, düğme/çubuk tam kapsül (`theme/tokens.ts` → `radius`). Çizgi yerine renk bloğu sınırı çizer; beyaz kart + 1.5px `line` yalnızca liste satırlarında.
- **Kapsül düğme** 58px, t900 zemin + beyaz metin; ikincil beyaz + 1.5px çizgi. **Yuvarlak ikon düğmesi** 46px. **Hap etiket** yarı saydam beyaz. **Anahtar** 52×30, açıkken t900. Basma geri bildirimi `active:scale-*` (NativeWind `active:`; `Pressable` style-fonksiyonu className ile birlikte çalışmaz).
- **Halkalar** (`components/Rings.tsx`): react-native-svg, iç içe, 12 yönünden başlar, yuvarlak uç, .5s akarak dolar; Skia gerektirmez.
- **İkonlar:** Material Symbols Rounded (`components/ui/Icon`, ligatür adıyla: `home`, `water_drop`…). Lucide yalnızca eski `FeatureIntro`/`Button` ikon prop'unda kalır.
- **Gezinme:** siyah kapsül çubuk (`components/CapsuleTabBar.tsx`) — `home · grid_view · bar_chart · person`; aktif sekme beyaz hap (92×62). İçerik altta ~130px pay bırakır (`TabScroll`).

## Tipografi

- **Tek aile: Urbanist** (500–900). Gövde 500, vurgu 600/700, başlık 800, büyük rakam ve ekran başlığı 900 + hafif negatif harf aralığı. Sayaçlar ve büyük rakamlar (su 50, göz 80, saat 44) bu yazı tipiyle; `data` rakamları tabular.
- Eski Fraunces/Inter/IBM Plex Mono kaldırıldı. Font adları `theme/tokens.ts` → `fontFamily` (eski takma adlar — `display`, `body`, `data` — korunur).

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
| **Anasayfa** `home` | Lavanta Blok "Bugün": üç halka (göz · su · kalori), hafta şeridi, günün planı blokları; altında günün önerileri, günün notu ve "Keşfet" şeridi (`lib/discover.ts`). |
| **Modüller** `grid_view` | Göz, Su, Duruş, Nefes, Beslenme, Kan tahlili blokları: durum + en sık eylem (`components/ModuleTile`). Karta dokunmak modülün kendi ekranını açar. |
| **Beslenme** `bar_chart` | Makro halkaları, öğün blokları, öneri, favoriler, raporlar ve kan tahlili hatırlatması. |
| **Profil** `person` | Koyu başlık bloğu, **Tema rengi**, bildirim anahtarları, gizlilik; altında aylık özet ve aktivite takvimi. Dişli **Ayarlar**'ı açar (`/settings`). |

- **Ayarlar içeriği (UI-005):** Gruplu satır listesi (`components/settings/`): Görünüm (Tema rengi → Profil) · Hatırlatmalar (modül başına anahtar) · Alışkanlıklar (süre, hedef, profil) · Günün önerileri (Anasayfa'da hangi modüller) · Yardım · Gizlilik ve veri · Hesap.
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
