#!/usr/bin/env python3
"""TürKomp + doğrulanmış TR yemek verisini src/food-table-data.ts'e derler.

Kullanım:  python3 scripts/gen-food-table.py
Kaynak JSON'ları yoksa indirir; üretilen dosya repoya commit'lenir, uygulama
çalışırken hiçbir yere çağrı yapmaz.
"""
import json, os, re, sys, urllib.request, collections

SOURCE_BASE = "https://raw.githubusercontent.com/erensmsek/formda-data/HEAD/foods"
SOURCES = ("turkomp_v1.json", "popular_tr_foods_v1.json")

WORDNUM = {"yarım": 0.5, "çeyrek": 0.25}
PIECE_PRIMARY = ("tane", "adet", "orta boy")
PIECE_FALLBACK = ("dilim", "fileto", "but", "köfte", "şiş", "dürüm", "tost",
                  "somun", "parça", "kare", "bar", "ekmek", "krep")


def leading_count(name: str) -> float:
    """'2 tane (110 g)' -> 2 ; 'yarım tane' -> 0.5 ; '1/2 somun' -> 0.5"""
    m = re.match(r"^\s*(\d+)\s*/\s*(\d+)", name)
    if m:
        return int(m.group(1)) / int(m.group(2))
    m = re.match(r"^\s*(\d+(?:[.,]\d+)?)", name)
    if m:
        return float(m.group(1).replace(",", "."))
    for word, val in WORDNUM.items():
        if name.lower().startswith(word):
            return val
    return 1.0


def grams_per_piece(servings):
    for keys in (PIECE_PRIMARY, PIECE_FALLBACK):
        for s in servings:
            name, grams = s["name"], s.get("grams")
            if not grams:
                continue
            # Parantez içindeki birim 'g' olmalı; '(200 ml)' bir adet ölçüsü değil.
            if re.search(r"\(\s*[\d.,]+\s*ml\s*\)", name):
                continue
            head = name.split("(")[0].lower()
            if any(k in head for k in keys):
                c = leading_count(name)
                if c > 0:
                    return grams / c
    return None


def grams_per_ml(servings):
    for s in servings:
        name, grams = s["name"], s.get("grams")
        if not grams:
            continue
        m = re.search(r"([\d.,]+)\s*ml", name)
        if not m:
            continue
        ml = float(m.group(1).replace(",", "."))
        c = leading_count(name)
        if ml > 0 and c > 0:
            d = grams / (ml * c)
            if 0.5 <= d <= 2.0:  # fiziksel olarak makul yoğunluk
                return d
    return None


def fmt(v):
    if v is None:
        return ""
    r = round(v, 2)
    if r == int(r):
        return str(int(r))
    return f"{r:g}"


def load(name: str):
    cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cache", name)
    if not os.path.exists(cache):
        os.makedirs(os.path.dirname(cache), exist_ok=True)
        print(f"indiriliyor: {name}", file=sys.stderr)
        urllib.request.urlretrieve(f"{SOURCE_BASE}/{name}", cache)
    with open(cache, encoding="utf-8") as f:
        return json.load(f)


def main():
    rows, skipped = [], collections.Counter()
    for path in SOURCES:
        for x in load(path):
            if x.get("verification", {}).get("status") != "verified":
                skipped["unverified"] += 1
                continue
            g = x["per_100g"]
            name = " ".join(x["name_tr"].split())
            # Kaynakta birkaç ad küçük harfle başlıyor; liste tutarlı görünsün.
            name = ("İ" if name[0] == "i" else name[0].upper()) + name[1:]
            if "|" in name or "|" in x["id"]:
                skipped["pipe_in_name"] += 1
                continue
            if g.get("calories_kcal") is None:
                skipped["no_kcal"] += 1
                continue
            servings = x.get("common_servings") or []

            # TürKomp derlemesinde porsiyon ölçüleri gıda GRUBU başına atanmış:
            # zeytinyağı zeytinin "5 tane (20 g)" ölçüsünü, piliç göğsü "1 but
            # (90 g)" ölçüsünü almış, yumurta sarısı bütün yumurtanın 55 g'ını.
            # Adet ağırlığı besine özgü bir değer olduğu için bu grup
            # varsayılanları kullanılamaz — yalnızca besin başına doğrulanmış
            # (curated) kayıtlardan adet ağırlığı alıyoruz.
            piece = grams_per_piece(servings) if x["source"] != "turkomp" else None

            # Yoğunluk grup varsayılanından zarar görmüyor: ml ölçüsü olan her
            # şey zaten sıvı ve sıvıların yoğunluğu 1 g/ml civarında.
            rows.append("|".join([
                x["id"], name,
                fmt(g["calories_kcal"]), fmt(g.get("protein_g")),
                fmt(g.get("carbs_g")), fmt(g.get("fat_g")), fmt(g.get("fiber_g")),
                fmt(piece), fmt(grams_per_ml(servings)),
            ]))

    piece = sum(1 for r in rows if r.split("|")[7])
    ml = sum(1 for r in rows if r.split("|")[8])
    fiber = sum(1 for r in rows if r.split("|")[6])
    print(f"rows={len(rows)} skipped={dict(skipped)}", file=sys.stderr)
    print(f"gramsPerPiece={piece} gramsPerMl={ml} fiber={fiber}", file=sys.stderr)

    body = "\n".join(rows)
    ts = f'''/**
 * OTOMATİK ÜRETİLDİ — elle düzenlemeyin.
 *
 * Kaynaklar (bkz. FOOD_TABLE_SOURCES, food-table.ts):
 *  - TürKomp, Ulusal Gıda Kompozisyon Veritabanı (laboratuvar analizli)
 *  - Doğrulanmış Türk yemekleri tablosu (malzeme bazlı hesap)
 *
 * Satır biçimi (boru ile ayrık, boş alan = bilinmiyor):
 *   id|ad|kcal|protein|karbonhidrat|yağ|lif|gramPerAdet|gramPerMl
 *
 * Neden nesne dizisi değil de tek bir metin? {len(rows)} kayıt nesne olarak
 * yazıldığında mobil paket ~2 kat büyüyor ve her açılışta o kadar JS ayrıştırılıyor.
 * Tek metni bir kez `split` etmek hem küçük hem hızlı.
 */

export const FOOD_ROWS = `{body}`;
'''
    with open("food-table-data.ts", "w", encoding="utf-8") as f:
        f.write(ts)
    print(f"food-table-data.ts written ({len(ts)} bytes)", file=sys.stderr)


main()
