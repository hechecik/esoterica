// Yerel saat <-> UTC dönüşümü, IANA saat dilimleriyle.
// Tarayıcının kendi saat dilimi veritabanı (Intl) kullanılır; sabit +3 asla varsayılmaz.
// Türkiye 1927-2016 arası kış UTC+2, yaz UTC+3 kullandı; 7 Eylül 2016'dan beri kalıcı UTC+3.

const fmtCache = new Map();
function fmt(tz) {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23',
      year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric',
      era: 'short',
    });
    fmtCache.set(tz, f);
  }
  return f;
}

/** Verilen UTC anında saat diliminin UTC'den farkı (milisaniye). */
export function offsetAt(utcMs, tz) {
  const parts = {};
  for (const p of fmt(tz).formatToParts(new Date(utcMs))) parts[p.type] = p.value;
  let y = Number(parts.year);
  if (parts.era === 'BC' || parts.era === 'B') y = 1 - y;
  const asUtc = Date.UTC(y, Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second));
  // Date.UTC iki haneli yılları 1900'e kaydırır; dört haneli yıllar etkilenmez.
  const ms = new Date(utcMs).getUTCMilliseconds();
  return asUtc - (utcMs - ms);
}

/**
 * Yerel tarih-saati UTC'ye çevirir.
 * @returns {{ utcMs:number, offsetMin:number, durum:'tamam'|'belirsiz'|'yok', alternatif?:{utcMs:number, offsetMin:number} }}
 *   belirsiz: saat geri alındığı için bu yerel saat iki kez yaşandı (erken olan döner, alternatif verilir)
 *   yok: saat ileri alındığı için bu yerel saat hiç yaşanmadı (geçişten önceki farkla hesaplanır)
 */
export function yereldenUtc({ yil, ay, gun, saat = 12, dakika = 0 }, tz) {
  const guess = Date.UTC(yil, ay - 1, gun, saat, dakika);
  // Tarihi 0-99 yılları için düzelt (Date.UTC kaydırması)
  const base = yil < 100 ? new Date(guess).setUTCFullYear(yil) : guess;
  const adaylar = new Set([offsetAt(base - 36e5 * 14, tz), offsetAt(base, tz), offsetAt(base + 36e5 * 14, tz)]);
  const gecerli = [];
  for (const off of adaylar) {
    const t = base - off;
    if (offsetAt(t, tz) === off) gecerli.push({ utcMs: t, offsetMin: off / 6e4 });
  }
  gecerli.sort((a, b) => a.utcMs - b.utcMs);
  if (gecerli.length === 1) return { ...gecerli[0], durum: 'tamam' };
  if (gecerli.length >= 2) return { ...gecerli[0], durum: 'belirsiz', alternatif: gecerli[gecerli.length - 1] };
  // Boşluk: geçişten önceki fark (en küçük UTC farkı değil, 14 saat önceki fark) kullanılır
  const once = offsetAt(base - 36e5 * 14, tz);
  return { utcMs: base - once, offsetMin: once / 6e4, durum: 'yok' };
}

/** "UTC+3", "UTC+1:56" gibi okunur fark. */
export function farkYazi(offsetMin) {
  const sign = offsetMin < 0 ? '−' : '+';
  const a = Math.abs(offsetMin);
  const h = Math.floor(a / 60);
  const m = Math.round(a % 60);
  return `UTC${sign}${h}${m ? ':' + String(m).padStart(2, '0') : ''}`;
}

/** Türkiye için yaz/kış saati açıklaması (kullanıcıya gösterilir). */
export function farkAciklama(offsetMin, tz) {
  const y = farkYazi(offsetMin);
  if (tz === 'Europe/Istanbul') {
    if (offsetMin === 120) return `${y} (o dönem Türkiye'de kış saati)`;
    if (offsetMin === 180) return `${y}`;
    if (offsetMin === 240) return `${y} (o dönem uygulanan çift yaz saati)`;
    if (offsetMin > 110 && offsetMin < 120) return `${y} (1910 öncesi İstanbul yerel ortalama saati)`;
  }
  return y;
}
