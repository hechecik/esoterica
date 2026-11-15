// Remil (ilm-i remil, geomancy) şekilleri.
// Her şekil yukarıdan aşağı dört satırdır: baş, boyun, gövde, ayak.
// 1 = tek nokta (•), 2 = çift nokta (• •).
// Anahtar (key) Latince addır; İngilizce yazımı uluslararası kaynaklarla
// eşleşir. "tr" alanı Osmanlı/Arap geleneğindeki addır.

export const FIGURES = Object.freeze({
  via: {
    key: 'via', rows: [1, 1, 1, 1], tr: 'Tarîk', latin: 'Via', ar: 'Tarîq',
    meaning: 'Yol', element: 'su', planet: 'ay', sign: 'yengeç',
    quality: 'notr', mobile: true, points: 4,
  },
  populus: {
    key: 'populus', rows: [2, 2, 2, 2], tr: 'Cemaat', latin: 'Populus', ar: 'Cemâa',
    meaning: 'Topluluk', element: 'su', planet: 'ay', sign: 'yengeç',
    quality: 'notr', mobile: false, points: 8,
  },
  fortunaMajor: {
    key: 'fortunaMajor', rows: [2, 2, 1, 1], tr: "Nusretü'd-dâhil", latin: 'Fortuna Major', ar: 'Nusretü’d-dâhile',
    meaning: 'Büyük talih', element: 'toprak', planet: 'güneş', sign: 'aslan',
    quality: 'iyi', mobile: false, points: 6,
  },
  fortunaMinor: {
    key: 'fortunaMinor', rows: [1, 1, 2, 2], tr: "Nusretü'l-hâric", latin: 'Fortuna Minor', ar: 'Nusretü’l-hârice',
    meaning: 'Küçük talih', element: 'ateş', planet: 'güneş', sign: 'aslan',
    quality: 'iyi', mobile: true, points: 6,
  },
  acquisitio: {
    key: 'acquisitio', rows: [2, 1, 2, 1], tr: 'Kabz-ı dâhil', latin: 'Acquisitio', ar: 'Kabdu’d-dâhil',
    meaning: 'Kazanç', element: 'hava', planet: 'jüpiter', sign: 'yay',
    quality: 'iyi', mobile: false, points: 6,
  },
  amissio: {
    key: 'amissio', rows: [1, 2, 1, 2], tr: 'Kabz-ı hâric', latin: 'Amissio', ar: 'Kabdu’l-hâric',
    meaning: 'Kayıp', element: 'ateş', planet: 'venüs', sign: 'boğa',
    quality: 'kotu', mobile: true, points: 6,
  },
  laetitia: {
    key: 'laetitia', rows: [1, 2, 2, 2], tr: 'Lihyan', latin: 'Laetitia', ar: 'Lihyân',
    meaning: 'Sevinç', element: 'hava', planet: 'jüpiter', sign: 'balık',
    quality: 'iyi', mobile: true, points: 7,
  },
  tristitia: {
    key: 'tristitia', rows: [2, 2, 2, 1], tr: 'İnkîs', latin: 'Tristitia', ar: 'İnkîs',
    meaning: 'Keder', element: 'toprak', planet: 'satürn', sign: 'kova',
    quality: 'kotu', mobile: false, points: 7,
  },
  puella: {
    key: 'puella', rows: [1, 2, 1, 1], tr: "Nakiyyü'l-hadd", latin: 'Puella', ar: 'Nakiyyü’l-hadd',
    meaning: 'Kız', element: 'su', planet: 'venüs', sign: 'terazi',
    quality: 'iyi', mobile: false, points: 5,
  },
  puer: {
    key: 'puer', rows: [1, 1, 2, 1], tr: 'Cevdele', latin: 'Puer', ar: 'Cevdele',
    meaning: 'Oğlan', element: 'ateş', planet: 'mars', sign: 'koç',
    quality: 'kotu', mobile: true, points: 5,
  },
  albus: {
    key: 'albus', rows: [2, 2, 1, 2], tr: 'Beyâz', latin: 'Albus', ar: 'Beyâd',
    meaning: 'Beyaz', element: 'su', planet: 'merkür', sign: 'ikizler',
    quality: 'iyi', mobile: false, points: 7,
  },
  rubeus: {
    key: 'rubeus', rows: [2, 1, 2, 2], tr: 'Humre', latin: 'Rubeus', ar: 'Humre',
    meaning: 'Kırmızı', element: 'ateş', planet: 'mars', sign: 'akrep',
    quality: 'kotu', mobile: true, points: 7,
  },
  conjunctio: {
    key: 'conjunctio', rows: [2, 1, 1, 2], tr: 'İçtimâ', latin: 'Conjunctio', ar: 'İctimâ',
    meaning: 'Birleşme', element: 'hava', planet: 'merkür', sign: 'başak',
    quality: 'notr', mobile: true, points: 6,
  },
  carcer: {
    key: 'carcer', rows: [1, 2, 2, 1], tr: 'Ukle', latin: 'Carcer', ar: 'Ukle',
    meaning: 'Hapis', element: 'toprak', planet: 'satürn', sign: 'oğlak',
    quality: 'kotu', mobile: false, points: 6,
  },
  caputDraconis: {
    key: 'caputDraconis', rows: [2, 1, 1, 1], tr: 'Atebe-i dâhil', latin: 'Caput Draconis', ar: 'Atebetü’d-dâhile',
    meaning: 'Ejderha başı', element: 'toprak', planet: 'kuzey düğüm', sign: 'başak',
    quality: 'iyi', mobile: false, points: 5,
  },
  caudaDraconis: {
    key: 'caudaDraconis', rows: [1, 1, 1, 2], tr: 'Atebe-i hâric', latin: 'Cauda Draconis', ar: 'Atebetü’l-hârice',
    meaning: 'Ejderha kuyruğu', element: 'ateş', planet: 'güney düğüm', sign: 'yay',
    quality: 'kotu', mobile: true, points: 5,
  },
});

export const FIGURE_KEYS = Object.freeze(Object.keys(FIGURES));

/** Dört satırlık diziden şekil anahtarını döndürür. */
const BY_ROWS = new Map(FIGURE_KEYS.map((k) => [FIGURES[k].rows.join(''), k]));

export function figureFromRows(rows) {
  if (!Array.isArray(rows) || rows.length !== 4) throw new Error('Şekil 4 satırdan oluşur');
  const key = BY_ROWS.get(rows.map((r) => (r === 1 ? 1 : 2)).join(''));
  if (!key) throw new Error(`Geçersiz satırlar: ${rows.join(',')}`);
  return key;
}

/** İki şekli satır satır toplar (tek+tek=çift, tek+çift=tek). */
export function addFigures(a, b) {
  const ra = FIGURES[a].rows;
  const rb = FIGURES[b].rows;
  return figureFromRows(ra.map((v, i) => ((v + rb[i]) % 2 === 1 ? 1 : 2)));
}

/** Satır sayısının tek mi çift mi olduğuna göre 1 ya da 2 döndürür. */
export function parity(n) {
  if (!Number.isInteger(n) || n < 1) throw new Error(`Satır sayısı pozitif tam sayı olmalı: ${n}`);
  return n % 2 === 1 ? 1 : 2;
}

/** Şeklin ters çevrilmiş halı (aynı eksen üzerinde baş-ayak takası). */
export function invertedFigure(key) {
  return figureFromRows([...FIGURES[key].rows].reverse());
}

/** Zıt şekil: tekler çift, çiftler tek olur. */
export function contraryFigure(key) {
  return figureFromRows(FIGURES[key].rows.map((v) => (v === 1 ? 2 : 1)));
}
