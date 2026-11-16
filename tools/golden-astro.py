#!/usr/bin/env python3
"""
Doğum haritası için bağımsız "altın" test verisi üretir.
Hesap: pyswisseph (Moshier efemerisi, sitedeki WASM ile aynı mod).
Saat dilimi: Python zoneinfo (tarayıcının Intl'inden bağımsız uygulama).
Çıktı: tests/golden/astro.json

Kullanım: python3 tools/golden-astro.py [vaka_sayisi=220]
"""
import json, random, sys
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import swisseph as swe

N = int(sys.argv[1]) if len(sys.argv) > 1 else 220
random.seed(20261116)

SEHIRLER = [
    ("İstanbul", 41.01384, 28.94966, "Europe/Istanbul"),
    ("Ankara", 39.91987, 32.85427, "Europe/Istanbul"),
    ("İzmir", 38.41273, 27.13838, "Europe/Istanbul"),
    ("Diyarbakır", 37.91363, 40.21721, "Europe/Istanbul"),
    ("Trabzon", 41.005, 39.72694, "Europe/Istanbul"),
    ("Van", 38.49457, 43.38323, "Europe/Istanbul"),
    ("Edirne", 41.67719, 26.55597, "Europe/Istanbul"),
    ("Berlin", 52.52437, 13.41053, "Europe/Berlin"),
    ("Londra", 51.50853, -0.12574, "Europe/London"),
    ("New York", 40.71427, -74.00597, "America/New_York"),
    ("Los Angeles", 34.05223, -118.24368, "America/Los_Angeles"),
    ("Sidney", -33.86785, 151.20732, "Australia/Sydney"),
    ("Buenos Aires", -34.61315, -58.37723, "America/Argentina/Buenos_Aires"),
    ("Tokyo", 35.6895, 139.69171, "Asia/Tokyo"),
    ("Tahran", 35.69439, 51.42151, "Asia/Tehran"),
    ("Katmandu", 27.70169, 85.3206, "Asia/Kathmandu"),
    ("Reykjavik", 64.13548, -21.89541, "Atlantic/Reykjavik"),
    ("Tromsø", 69.6489, 18.95508, "Europe/Oslo"),
    ("Bakü", 40.37767, 49.89201, "Asia/Baku"),
    ("Lefkoşa", 35.17531, 33.3642, "Asia/Nicosia"),
]

PLANETS = [("gunes", 0), ("ay", 1), ("merkur", 2), ("venus", 3), ("mars", 4), ("jupiter", 5),
           ("saturn", 6), ("uranus", 7), ("neptun", 8), ("pluton", 9), ("dugum", 11), ("lilith", 12)]
FLAGS = swe.FLG_MOSEPH | swe.FLG_SPEED

def rastgele_an():
    y = random.randint(1930, 2025)
    m = random.randint(1, 12)
    d = random.randint(1, 28)
    return y, m, d, random.randint(0, 23), random.randint(0, 59)

def vaka(sehir, y, m, d, h, mi, etiket=""):
    ad, lat, lon, tz = sehir
    yerel = datetime(y, m, d, h, mi, tzinfo=ZoneInfo(tz))
    # Var olmayan (ileri alınan) saatleri ele: zoneinfo onları sessizce kaydırır
    geri = yerel.astimezone(ZoneInfo("UTC")).astimezone(ZoneInfo(tz))
    if (geri.hour, geri.minute) != (h, mi):
        return None
    # Belirsiz saatlerde (fold) erken olanı al: fold=0 zaten erken
    utc = yerel.astimezone(ZoneInfo("UTC"))
    off = yerel.utcoffset().total_seconds() / 60
    saat = utc.hour + utc.minute / 60 + utc.second / 3600
    jd = swe.julday(utc.year, utc.month, utc.day, saat)
    konum = {}
    for key, pid in PLANETS:
        r = swe.calc_ut(jd, pid, FLAGS)[0]
        konum[key] = [r[0], r[3]]
    sistem = b"P" if abs(lat) < 66 else b"W"
    cusps, ascmc = swe.houses_ex(jd, lat, lon, sistem, swe.FLG_MOSEPH)
    return {
        "etiket": etiket or f"{ad} {y}-{m:02d}-{d:02d} {h:02d}:{mi:02d}",
        "girdi": {"yil": y, "ay": m, "gun": d, "saat": h, "dakika": mi, "tz": tz, "enlem": lat, "boylam": lon},
        "beklenen": {
            "offsetMin": off,
            "utcMs": int(utc.timestamp() * 1000),
            "jd": jd,
            "konum": konum,
            "evSistemi": "placidus" if sistem == b"P" else "burc",
            "cusps": list(cusps[:12]),
            "asc": ascmc[0],
            "mc": ascmc[1],
        },
    }

vakalar = []
# Özel vakalar: Türkiye'nin yaz ve kış saati dönemleri, 2016 kalıcı UTC+3 geçişi, gece yarısı
ozel = [
    ("İstanbul", 1975, 7, 15, 14, 30), ("İstanbul", 1975, 1, 15, 14, 30),
    ("İstanbul", 1990, 6, 1, 0, 5), ("İstanbul", 1990, 12, 31, 23, 55),
    ("Ankara", 2016, 9, 6, 12, 0), ("Ankara", 2016, 12, 1, 12, 0), ("Ankara", 2017, 1, 1, 0, 0),
    ("İzmir", 1942, 8, 1, 9, 0), ("İzmir", 1960, 8, 1, 9, 0), ("Van", 1985, 4, 20, 3, 30),
    ("Trabzon", 2007, 10, 28, 3, 30), ("Tromsø", 1980, 6, 21, 12, 0), ("Tromsø", 1980, 12, 21, 12, 0),
    ("Katmandu", 1990, 3, 3, 3, 3), ("Tahran", 2001, 5, 5, 5, 5), ("Sidney", 1999, 12, 31, 23, 59),
]
by_name = {s[0]: s for s in SEHIRLER}
for (ad, y, m, d, h, mi) in ozel:
    v = vaka(by_name[ad], y, m, d, h, mi, etiket=f"ÖZEL {ad} {y}-{m:02d}-{d:02d} {h:02d}:{mi:02d}")
    if v: vakalar.append(v)

while len(vakalar) < N:
    s = random.choice(SEHIRLER)
    v = vaka(s, *rastgele_an())
    if v: vakalar.append(v)

with open("tests/golden/astro.json", "w", encoding="utf-8") as f:
    json.dump({"uretici": f"pyswisseph {swe.version} + zoneinfo", "vakalar": vakalar}, f, ensure_ascii=False)
print(f"{len(vakalar)} vaka yazıldı")
