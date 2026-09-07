# 00 — Kurulum ve Teknoloji Stack'i

## Bağlam

Anıl bir full-stack web geliştiricisi (Next.js, React, PHP, Prisma, PostgreSQL) ve bu ilk mobil uygulama projesi. Stack seçimlerinde iki şeyi önceliklendirdik: (1) mevcut React/Next.js bilgisini maksimum yeniden kullanmak, (2) 3D/animasyon ihtiyaçlarını ve "uygulama kapalıyken bildirim" gereksinimini karşılayabilecek olgun bir ekosistem.

## Teknoloji Seçimleri ve Gerekçeleri

| Katman | Seçim | Neden |
|---|---|---|
| Mobil framework | **React Native + Expo (Expo Router)** | React bilgin doğrudan geçerli. Expo Router, Next.js'in App Router'ına neredeyse birebir benzer (dosya tabanlı routing) — öğrenme eğrisi çok düşük. |
| Dil | **TypeScript** | Zaten kullandığın teknolojilerle (Next.js/Prisma) tutarlı, tip güvenliği sağlık verisi gibi hassas alanlarda hataları erken yakalar. |
| Backend | **Next.js (App Router) API routes** | Sıfırdan yeni bir backend dili/frameworkü öğrenmene gerek kalmıyor — bildiğin stack'i mobil uygulamanın arkasına koyuyoruz. |
| Veritabanı + Auth | **Supabase (PostgreSQL)** | PostgreSQL olduğu için Prisma ile doğrudan uyumlu. Auth, dosya depolama (Storage) ve Row Level Security hazır geliyor — sıfırdan auth sistemi kurmak yerine bu enerjiyi ürüne harcarsın. |
| ORM | **Prisma** | Zaten bildiğin araç. Supabase'in Postgres bağlantı string'i ile doğrudan çalışır. |
| Mobil state/veri çekme | **TanStack Query (React Query)** | `lead-gen-ai-tool` projende TanStack Start kullanıyorsun — aynı ekosistem, tutarlı zihinsel model. |
| Global UI state | **Zustand** | Redux'a göre çok daha az boilerplate, React Native'de yaygın ve hafif. |
| Stil | **NativeWind (Tailwind for RN)** | `ui-ux-pro-max-skill` ve `frontend-design` skill'leri Tailwind/utility-first düşünceyle uyumlu çalışıyor; web tarafında Tailwind'e aşinaysan bire bir geçiş. |
| Temel animasyon | **react-native-reanimated + react-native-gesture-handler** | Endüstri standardı, 60fps native thread animasyon. |
| Özel çizim/animasyon | **@shopify/react-native-skia** | Su bardağı dolma animasyonu, nefes egzersizi dairesi, ilerleme halkaları gibi özel grafikler için. Canvas tabanlı, GPU hızlandırmalı. |
| Hazır animasyonlar | **lottie-react-native** | Kutlama/başarı animasyonları gibi tasarımcı tarafından hazırlanmış After Effects animasyonları için. |
| 3D (opsiyonel katman) | **expo-gl + expo-three + @react-three/fiber** | Sadece gerçekten 3D gerektiren yerlerde (ör. nefes egzersizinde 3D "orb", ileride vücut tipi görselleştirmesi). İlk versiyonda zorunlu değil — Skia ile başlayıp ihtiyaç oldukça eklenir. |
| Grafikler/Raporlar | **Victory Native (XL)** | Günlük/haftalık/aylık analiz raporları için Skia tabanlı, performanslı grafik kütüphanesi. |
| Bildirimler | **expo-notifications** | Zamanlanmış local bildirimler — uygulama kapalı/arka planda olsa bile işletim sistemi tarafından teslim edilir. Detay: `08-BILDIRIM-MIMARISI.md`. |
| Güvenli depolama | **expo-secure-store** | Token ve hassas ayarlar cihazda şifreli saklanır. |
| Form validasyonu | **Zod + react-hook-form** | Hem mobilde hem Next.js API tarafında aynı şemayı paylaşabilirsin (tip güvenliği uçtan uca). |
| Build/Yayın | **EAS Build + EAS Submit** | App Store ve Play Store'a otomatik build/yayın. |

**Neden Flutter değil?** Flutter/Dart öğrenmek ek bir dil demek. React Native seçimi, mevcut becerini sıfırdan bir dile değil doğrudan mobile taşımanı sağlıyor — bu senin için en hızlı yol.

**Neden ayrı bir Node/Express backend değil?** Next.js API routes zaten bildiğin bir yapı ve Vercel'e tek parça deploy edilebiliyor. İleride yük artarsa ayrı bir servise bölünebilir, ama V1 için gereksiz karmaşıklık.

## Proje Yapısı (Monorepo)

```
respira/
├── apps/
│   ├── mobile/              # Expo (React Native) uygulaması
│   └── api/                 # Next.js API (backend)
├── packages/
│   ├── database/            # Prisma schema + client (hem api hem gerekirse mobile tarafından import edilir)
│   └── shared-types/        # Zod şemaları, TypeScript tipleri (mobile + api ortak)
├── docs/                    # Bu planlama dosyaları
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

**Neden monorepo?** Prisma şemasını ve Zod validasyon şemalarını hem backend hem mobil tarafında tekrar yazmadan paylaşman gerekiyor. Turborepo + pnpm workspaces bunu native olarak destekliyor.

## Kurulum Adımları

### 1. Ön Gereksinimler
```bash
node -v        # 20+ olmalı
npm install -g pnpm eas-cli
```
- Bir Expo hesabı oluştur: https://expo.dev
- Bir Supabase hesabı/projesi oluştur: https://supabase.com

### 2. Monorepo İskeleti
```bash
mkdir respira && cd respira
pnpm init
pnpm add -D turbo -w
mkdir -p apps packages docs
```

`pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 3. Mobil Uygulama
```bash
cd apps
npx create-expo-app@latest mobile --template tabs
cd mobile
npx expo install react-native-reanimated react-native-gesture-handler
npx expo install @shopify/react-native-skia
npx expo install expo-notifications expo-secure-store expo-gl
npm install nativewind tailwindcss zustand @tanstack/react-query zod react-hook-form lottie-react-native victory-native
```

### 4. Backend (Next.js API)
```bash
cd ../
npx create-next-app@latest api --typescript --app
cd api
npm install @prisma/client zod
npm install -D prisma
```

### 5. Paylaşılan Veritabanı Paketi
```bash
cd ../../packages
mkdir database && cd database
npm init -y
npm install prisma @prisma/client
npx prisma init
```
Prisma şema detayları için: `02-VERI-MODELI-VE-GUVENLIK.md`

### 6. Ortam Değişkenleri

`apps/api/.env`:
```
DATABASE_URL="postgresql://...supabase-connection-string..."
DIRECT_URL="postgresql://...supabase-direct-connection..."
SUPABASE_URL="https://xxxx.supabase.co"
SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."   # sadece backend'de, asla mobile'a gömülmez
JWT_SECRET="..."
```

`apps/mobile/.env`:
```
EXPO_PUBLIC_API_URL="http://localhost:3000"
EXPO_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="..."
```

> Güvenlik notu: `SERVICE_ROLE_KEY` gibi yüksek yetkili anahtarlar **asla** mobil uygulama koduna girmemeli — sadece backend'de kalır. Detay: `02-VERI-MODELI-VE-GUVENLIK.md`

### 7. Turborepo Script'leri

Kök `package.json`:
```json
{
  "scripts": {
    "dev:mobile": "turbo run dev --filter=mobile",
    "dev:api": "turbo run dev --filter=api",
    "db:migrate": "turbo run migrate --filter=database",
    "db:studio": "turbo run studio --filter=database"
  }
}
```

### 8. Doğrulama
```bash
pnpm dev:api      # http://localhost:3000 ayakta olmalı
pnpm dev:mobile   # Expo Go veya simülatör ile aç
```

## Sırada Ne Var?

Kurulum bittikten sonra sırayla:
1. `01-TASARIM-SISTEMI.md` — tasarım dilini ve referans skill'leri kur
2. `02-VERI-MODELI-VE-GUVENLIK.md` — tüm özelliklerin ortak veri modelini oluştur
3. Özellik dosyaları — istediğin sırayla
