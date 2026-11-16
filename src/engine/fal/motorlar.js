// Diğer falların hesap motorları. Saf fonksiyonlar; rastgelelik dışarıdan verilir
// (tarayıcıda crypto, testlerde tohumlu), böylece hepsi test edilebilir.

/* ---------- Rastgelelik ---------- */

/** Kriptografik 0 <= x < n tamsayı (sapmasız). */
export function kriptoTam(n) {
  const max = Math.floor(0x100000000 / n) * n;
  const buf = new Uint32Array(1);
  let x;
  do { crypto.getRandomValues(buf); x = buf[0]; } while (x >= max);
  return x % n;
}

/** Fisher-Yates karıştırma. rnd(n) -> [0, n) tamsayı. */
export function karistir(dizi, rnd = kriptoTam) {
  const a = dizi.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Desteden n kart çeker; tersOlasiligi 0 ise hiç ters çıkmaz. */
export function kartCek(kartlar, n, { tersOlasiligi = 0, rnd = kriptoTam } = {}) {
  return karistir(kartlar, rnd).slice(0, n).map((k) => ({ ...k, ters: tersOlasiligi > 0 && rnd(1000) < tersOlasiligi * 1000 }));
}

/* ---------- I Ching ---------- */

// Üçlüler alttan üste çizgi (1 yang, 0 yin)
export const UCLULER = {
  qian: { bit: [1, 1, 1], ad: 'Gök', sembol: '☰' },
  dui: { bit: [1, 1, 0], ad: 'Göl', sembol: '☱' },
  li: { bit: [1, 0, 1], ad: 'Ateş', sembol: '☲' },
  zhen: { bit: [1, 0, 0], ad: 'Gök gürültüsü', sembol: '☳' },
  xun: { bit: [0, 1, 1], ad: 'Rüzgâr', sembol: '☴' },
  kan: { bit: [0, 1, 0], ad: 'Su', sembol: '☵' },
  gen: { bit: [0, 0, 1], ad: 'Dağ', sembol: '☶' },
  kun: { bit: [0, 0, 0], ad: 'Yer', sembol: '☷' },
};
const KW_SIRA = ['qian', 'zhen', 'kan', 'gen', 'kun', 'xun', 'li', 'dui'];
// King Wen tablosu: satır üst üçlü, sütun alt üçlü (KW_SIRA sırasıyla)
const KING_WEN = [
  [1, 25, 6, 33, 12, 44, 13, 10],
  [34, 51, 40, 62, 16, 32, 55, 54],
  [5, 3, 29, 39, 8, 48, 63, 60],
  [26, 27, 4, 52, 23, 18, 22, 41],
  [11, 24, 7, 15, 2, 46, 36, 19],
  [9, 42, 59, 53, 20, 57, 37, 61],
  [14, 21, 64, 56, 35, 50, 30, 38],
  [43, 17, 47, 31, 45, 28, 49, 58],
];
function ucluBul(bits) {
  return Object.keys(UCLULER).find((k) => UCLULER[k].bit.every((b, i) => b === bits[i]));
}
/** Altı çizgiden (alttan üste, 1/0) heksagram numarası. */
export function heksagram(cizgiler) {
  const alt = ucluBul(cizgiler.slice(0, 3));
  const ust = ucluBul(cizgiler.slice(3, 6));
  return { no: KING_WEN[KW_SIRA.indexOf(ust)][KW_SIRA.indexOf(alt)], alt, ust };
}
/**
 * Çizgi atışı. Değerler: 6 değişen yin, 7 sabit yang, 8 sabit yin, 9 değişen yang.
 * para: üç para (1/8, 3/8, 3/8, 1/8). civanpercemi: geleneksel olasılıklar (1/16, 5/16, 7/16, 3/16).
 */
export function cizgiAt(yontem = 'para', rnd = kriptoTam) {
  if (yontem === 'civanpercemi') {
    const r = rnd(16);
    return r < 1 ? 6 : r < 6 ? 7 : r < 13 ? 8 : 9;
  }
  let t = 0;
  for (let i = 0; i < 3; i++) t += rnd(2) ? 3 : 2;
  return t;
}
/** Altı değerden birincil ve dönüşen heksagram. */
export function ichingOku(degerler) {
  const birincil = degerler.map((v) => (v === 7 || v === 9 ? 1 : 0));
  const degisen = degerler.map((v, i) => (v === 6 || v === 9 ? i + 1 : 0)).filter(Boolean);
  const donusen = degerler.map((v) => (v === 6 ? 1 : v === 9 ? 0 : v === 7 ? 1 : 0));
  return {
    degerler, degisen,
    birincil: { ...heksagram(birincil), cizgiler: birincil },
    donusen: degisen.length ? { ...heksagram(donusen), cizgiler: donusen } : null,
  };
}

/* ---------- Numeroloji (Pisagor) ---------- */

const HARF = { a: 1, b: 2, c: 3, ç: 3, d: 4, e: 5, f: 6, g: 7, ğ: 7, h: 8, ı: 9, i: 9, j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, ö: 6, p: 7, q: 8, r: 9, s: 1, ş: 1, t: 2, u: 3, ü: 3, v: 4, w: 5, x: 6, y: 7, z: 8 };
const SESLI = new Set(['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü']);
const USTAT = new Set([11, 22, 33]);

/** Sayıyı tek haneye indirir; 11, 22, 33 usta sayılar korunur. */
export function indirge(n, ustaKoru = true) {
  while (n > 9 && !(ustaKoru && USTAT.has(n))) n = String(n).split('').reduce((a, b) => a + Number(b), 0);
  return n;
}
function harfler(ad) {
  return [...ad.toLocaleLowerCase('tr-TR')].filter((h) => HARF[h]);
}
export function numeroloji(adSoyad, { yil, ay, gun }, bugun = new Date()) {
  const h = harfler(adSoyad);
  const toplam = (f) => indirge(h.filter(f).reduce((a, x) => a + HARF[x], 0));
  const yasamYolu = indirge(indirge(gun) + indirge(ay) + indirge(yil));
  const kisiselYil = indirge(indirge(gun, false) + indirge(ay, false) + indirge(bugun.getFullYear(), false), false);
  const kisiselAy = indirge(kisiselYil + bugun.getMonth() + 1, false);
  const kisiselGun = indirge(kisiselAy + bugun.getDate(), false);
  return {
    yasamYolu,
    ifade: h.length ? toplam(() => true) : null,
    ruh: h.length ? toplam((x) => SESLI.has(x)) : null,
    kisilik: h.length ? toplam((x) => !SESLI.has(x)) : null,
    dogumGunu: indirge(gun),
    kisiselYil, kisiselAy, kisiselGun,
  };
}

/* ---------- Yıldızname (ebced) ---------- */

// Latin harfli Türkçe isimler için kullanılan eşleme (Arap alfabesindeki karşılık harfin ebced değeri).
// Arap harfli yazımda değerler farklılaşabilir; arayüzde bu açıkça belirtilir.
export const EBCED = {
  a: 1, b: 2, p: 2, c: 3, ç: 3, j: 3, d: 4, e: 5, v: 6, o: 6, ö: 6, u: 6, ü: 6, z: 7, h: 8,
  ı: 10, i: 10, y: 10, k: 20, l: 30, m: 40, n: 50, s: 60, f: 80, r: 200, ş: 300, t: 400, g: 1000, ğ: 1000,
};
const YILDIZ_SIRA = ['koc', 'boga', 'ikizler', 'yengec', 'aslan', 'basak', 'terazi', 'akrep', 'yay', 'oglak', 'kova', 'balik'];
export function ebced(metin) {
  return [...metin.toLocaleLowerCase('tr-TR')].reduce((a, h) => a + (EBCED[h] ?? 0), 0);
}
/** Kendi adı + anne adı toplamının 12'ye bölümünden kalan: 1 Koç ... 12 (kalan 0) Balık. */
export function yildizname(ad, anneAdi) {
  const toplam = ebced(ad) + ebced(anneAdi);
  const kalan = toplam % 12;
  return { toplam, kalan, yildiz: YILDIZ_SIRA[(kalan === 0 ? 12 : kalan) - 1] };
}

/* ---------- Çin burcu ---------- */

export const HAYVANLAR = ['fare', 'okuz', 'kaplan', 'tavsan', 'ejderha', 'yilan', 'at', 'keci', 'maymun', 'horoz', 'kopek', 'domuz'];
const ELEMENTLER = ['metal', 'metal', 'su', 'su', 'agac', 'agac', 'ates', 'ates', 'toprak', 'toprak'];
/** Ay takvimine göre Çin yılı (tarayıcının yerleşik Çin takvimi). */
export function cinYili(tarih) {
  const parts = new Intl.DateTimeFormat('zh-u-ca-chinese', { year: 'numeric' }).formatToParts(tarih);
  return Number(parts.find((p) => p.type === 'relatedYear').value);
}
export function cinBurcu(tarih) {
  const yil = cinYili(tarih);
  const hayvan = HAYVANLAR[(((yil - 4) % 12) + 12) % 12];
  const element = ELEMENTLER[((yil % 10) + 10) % 10];
  return { yil, hayvan, element, yinYang: yil % 2 === 0 ? 'yang' : 'yin', miladiFarkli: yil !== tarih.getUTCFullYear() };
}
/** Uyum: aynı üçgen grubundakiler uyumlu, karşıdaki (6 uzak) zıt. */
export function cinUyum(a, b) {
  const i = HAYVANLAR.indexOf(a), j = HAYVANLAR.indexOf(b);
  if (i === j) return 'ayni';
  if ((i - j + 12) % 4 === 0) return 'uyumlu';
  if ((i - j + 12) % 12 === 6) return 'zit';
  return 'notr';
}
