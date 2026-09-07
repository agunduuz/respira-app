# Respira

Göz yorgunluğu, beslenme/kan şekeri, postür, su tüketimi ve stres yönetimini tek
yerde toplayan sağlık takip uygulaması.

Planlama dosyaları `docs/` klasöründedir. Bir özelliğe başlamadan önce ilgili
`docs/XX-*.md` dosyasını oku. `00-KURULUM-VE-STACK.md` ve
`02-VERI-MODELI-VE-GUVENLIK.md` her zaman geçerlidir.

## Yapı

```
respira-app/
├── apps/
│   ├── mobile/          # Expo (React Native) uygulaması — Expo Router
│   └── api/             # Next.js API (backend), port 3001
├── packages/
│   ├── database/        # Prisma şeması + paylaşılan PrismaClient
│   └── shared-types/    # Zod şemaları (mobile + api ortak)
└── docs/                # Planlama dosyaları
```

## Kurulum

Ön gereksinimler: Node 20+, `pnpm`, `eas-cli`.

```bash
pnpm install
```

Ortam değişkenlerini doldur (her `.env.example` yanına bir `.env`):

| Dosya | İçerik |
|---|---|
| `apps/api/.env` | Supabase bağlantı string'leri + service role key |
| `apps/mobile/.env` | API URL + Supabase **anon** key (asla service role değil) |
| `packages/database/.env` | Prisma CLI için `DATABASE_URL` / `DIRECT_URL` |

Supabase projesi oluşturduktan sonra şemayı veritabanına uygula:

```bash
pnpm db:generate     # Prisma Client üret
pnpm db:migrate      # migration oluştur + uygula
pnpm db:studio       # verileri görsel incele
```

## Geliştirme

```bash
pnpm dev:api         # http://localhost:3001  (sağlık: /api/health)
pnpm dev:mobile      # Metro → Expo Go veya simülatör
pnpm typecheck       # tüm paketlerde tsc
```

> API 3000 yerine **3001**'de çalışır — 3000 başka bir yerel projede kullanımda.
> Değiştirirsen `apps/mobile/.env` içindeki `EXPO_PUBLIC_API_URL`'i de güncelle.

## Yayın (EAS)

```bash
eas login
cd apps/mobile && eas init      # projeyi Expo hesabına bağlar
pnpm --filter mobile build:preview
pnpm --filter mobile build:prod
pnpm --filter mobile submit
```

## Notlar

- **pnpm hoisted linker** — `pnpm-workspace.yaml` içinde `nodeLinker: hoisted`.
  Metro, pnpm'in sembolik-link tabanlı varsayılan yapısını çözemiyor. Bu ayarı
  kaldırma.
- **Gizli anahtarlar** — `EXPO_PUBLIC_*` değişkenleri uygulama paketine gömülür.
  `SUPABASE_SERVICE_ROLE_KEY` sadece `apps/api/.env` içinde kalır.
  Detay: `docs/02-VERI-MODELI-VE-GUVENLIK.md`.
