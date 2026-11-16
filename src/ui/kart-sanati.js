// Esoterica kart sanatı: tamamı özgün, çizgi gravür tarzı SVG.
// Telifli deste görseli kullanılmaz; her amblem basit geometrik öğelerden kurulmuştur.
// Koordinatlar: amblemler 0..100 kutusunda, takım işaretleri -10..10 kutusunda.

/* ---------- Tarot: 22 büyük arkana amblemi ---------- */

const yildiz = (cx, cy, r, n = 5, ic = 0.42) => {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI / n) * i - Math.PI / 2;
    const rr = i % 2 ? r * ic : r;
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }
  return d + 'Z';
};
const isinlar = (cx, cy, r1, r2, n, kaydir = 0) => {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n + kaydir;
    d += `M${(cx + Math.cos(a) * r1).toFixed(1)} ${(cy + Math.sin(a) * r1).toFixed(1)}L${(cx + Math.cos(a) * r2).toFixed(1)} ${(cy + Math.sin(a) * r2).toFixed(1)}`;
  }
  return d;
};
const p = (d, ek = '') => `<path d="${d}"${ek}/>`;
const c = (x, y, r, ek = '') => `<circle cx="${x}" cy="${y}" r="${r}"${ek}/>`;
const dolu = ' class="dolu"';
const ince = ' class="ince"';

export const BUYUK = {
  // 0 Deli: uçurum kenarı, doğan güneş, boşluğa uzanan adım izleri
  0: [c(76, 20, 9), p(isinlar(76, 20, 12, 17, 12)), p('M4 72 H58 L62 96'), p('M58 72 l6 -2 l4 4', ince), c(40, 30, 5), p('M40 35 V56 M40 56 L32 70 M40 56 L48 70 M40 42 L28 34 M40 42 L54 36 L62 26'), c(64, 23, 4, ince), p('M16 72 q2 -6 6 -2 q4 -4 6 2', ince)].join(''),
  // 1 Büyücü: sonsuzluk, dikey asa, dört element masası
  1: [p('M30 18 c0 -10 16 -10 20 0 c4 10 20 10 20 0 c0 -10 -16 -10 -20 0 c-4 10 -20 10 -20 0Z'), p('M50 30 V72'), c(50, 30, 3, dolu), p('M14 78 H86 M20 78 V94 M80 78 V94'), c(26, 72, 4), p('M42 66 h8 v8 h-8z'), p(yildiz(62, 70, 5)), p('M74 74 l4 -8 l4 8z')].join(''),
  // 2 Başrahibe: iki sütun, aralarında hilal ve perde
  2: [p('M20 14 V92 M32 14 V92 M68 14 V92 M80 14 V92'), p('M16 14 H36 M64 14 H84 M16 92 H36 M64 92 H84'), p('M32 30 Q50 44 68 30', ince), p('M58 44 a12 12 0 1 1 -10 -16 a9 9 0 1 0 10 16z'), p('M38 70 Q50 80 62 70', ince), p('M44 84 H56', ince)].join(''),
  // 3 İmparatoriçe: Venüs işareti, başak ve on iki yıldızlı taç
  3: [c(50, 46, 14), p('M50 60 V84 M40 74 H60'), ...Array.from({ length: 12 }, (_, i) => c((50 + Math.cos(Math.PI + (Math.PI * i) / 11) * 30).toFixed(1), (34 + Math.sin(Math.PI + (Math.PI * i) / 11) * 22).toFixed(1), 1.6, dolu)), p('M18 92 Q20 70 14 58 M18 80 l-5 -4 M17 72 l-5 -4 M82 92 Q80 70 86 58 M82 80 l5 -4 M83 72 l5 -4', ince)].join(''),
  // 4 İmparator: taht ve koç boynuzu sarmalları
  4: [p('M28 40 H72 V88 H28Z'), p('M36 40 V24 H64 V40'), p('M28 40 q-14 -2 -14 -14 q0 -10 10 -10 q8 0 8 8 q0 6 -6 6', ince), p('M72 40 q14 -2 14 -14 q0 -10 -10 -10 q-8 0 -8 8 q0 6 6 6', ince), p('M42 56 H58 M50 50 V70'), c(50, 76, 4)].join(''),
  // 5 Başrahip: üçlü haç ve çapraz iki anahtar
  5: [p('M50 8 V60 M40 18 H60 M36 28 H64 M32 38 H68'), p('M24 92 L56 64 M76 92 L44 64'), c(20, 95, 4), c(80, 95, 4), p('M54 66 l4 -2 M46 66 l-4 -2', ince)].join(''),
  // 6 Âşıklar: kesişen iki halka, üstte ışın saçan kanat
  6: [c(40, 64, 16), c(60, 64, 16), p('M50 52 V76', ince), c(50, 22, 8), p(isinlar(50, 22, 11, 16, 16)), p('M20 36 Q35 28 50 34 Q65 28 80 36', ince)].join(''),
  // 7 Savaş Arabası: gövde, iki tekerlek, yıldızlı tente
  7: [p('M26 46 H74 L68 74 H32Z'), c(30, 80, 10), c(70, 80, 10), p(isinlar(30, 80, 0, 10, 6)), p(isinlar(70, 80, 0, 10, 6)), p('M22 30 Q50 16 78 30 M26 30 V46 M74 30 V46'), p(yildiz(40, 26, 3), dolu), p(yildiz(50, 23, 3), dolu), p(yildiz(60, 26, 3), dolu)].join(''),
  // 8 Güç: aslan başı (yele ışınları) ve üstte sonsuzluk
  8: [c(50, 62, 16), p(isinlar(50, 62, 18, 28, 20)), p('M44 60 h2 M54 60 h2 M46 70 q4 3 8 0'), p('M36 18 c0 -8 12 -8 14 0 c2 8 14 8 14 0 c0 -8 -12 -8 -14 0 c-2 8 -14 8 -14 0Z')].join(''),
  // 9 Ermiş: fener (içinde altı köşeli yıldız) ve dağ
  9: [p('M40 18 H60 L64 26 V54 H36 V26Z'), p('M50 10 V18 M44 10 H56'), p(yildiz(50, 40, 8, 6, 0.55)), p('M6 92 L32 66 L46 80 L66 58 L94 92', ince)].join(''),
  // 10 Kader Çarkı: iç içe halkalar ve sekiz kollu çark
  10: [c(50, 52, 34), c(50, 52, 24), c(50, 52, 6), p(isinlar(50, 52, 6, 34, 8)), p(isinlar(50, 52, 34, 40, 8, Math.PI / 8), ince)].join(''),
  // 11 Adalet: dik kılıç ve terazi
  11: [p('M50 6 V92 M42 82 H58'), p('M18 30 H82'), p('M24 30 L14 56 H34Z M76 30 L66 56 H86Z', ince), p('M14 56 Q24 64 34 56 M66 56 Q76 64 86 56')].join(''),
  // 12 Asılan Adam: T ağacı, ters figür ve hale
  12: [p('M20 10 H80 M50 10 V30'), c(50, 76, 7), c(50, 76, 13, ince), p('M50 30 V66 M50 44 L40 54 M50 44 L60 54 M50 30 L40 36 M40 36 L50 42')].join(''),
  // 13 Ölüm (dönüşüm): iki kule arasında batan güneş ve beyaz gül
  13: [p('M10 92 V56 H22 V92 M78 92 V56 H90 V92'), p('M30 76 A20 20 0 0 1 70 76 M22 76 H78'), p(isinlar(50, 76, 24, 30, 9, Math.PI), ince), c(50, 34, 6), ...[0, 1, 2, 3, 4].map((i) => c((50 + Math.cos((i * 2 * Math.PI) / 5 - Math.PI / 2) * 9).toFixed(1), (34 + Math.sin((i * 2 * Math.PI) / 5 - Math.PI / 2) * 9).toFixed(1), 6, ince))].join(''),
  // 14 Denge: iki kupa arasında akan su, karenin içinde üçgen
  14: [p('M18 40 H38 L34 60 H22Z M62 60 H82 L78 80 H66Z'), p('M36 46 C52 46 54 66 66 66', ince), p('M40 50 C54 52 56 70 68 70', ince), p('M38 12 H62 V34 H38Z'), p('M50 15 L59 31 H41Z', ince), p('M28 92 Q50 84 72 92', ince)].join(''),
  // 15 Şeytan (bağ): gevşek zincir halkaları, biri açık
  15: [p('M28 14 Q34 30 50 30 Q66 30 72 14'), c(50, 38, 5), p('M46 42 L34 54 M54 42 L66 54', ince), `<ellipse cx="32" cy="58" rx="3.5" ry="5"/>`, `<ellipse cx="68" cy="58" rx="3.5" ry="5"/>`, p('M65 64 a3.5 5 0 1 0 6 -1', ince), c(30, 72, 4), p('M30 76 V92 M24 84 H36'), c(70, 72, 4), p('M70 76 V92 M64 84 H76'), p('M14 92 H86', ince)].join(''),
  // 16 Kule: kule, yıldırım, düşen taç
  16: [p('M36 92 V34 H64 V92 M32 34 H68 M36 34 V28 h6 v6 M58 28 h6 v6'), p('M44 50 h4 v8 h-4z M52 66 h4 v8 h-4z'), p('M80 6 L62 26 L72 26 L56 44', ' class="vurgu"'), p('M18 40 l4 -8 l4 6 l4 -8 l4 8 l2 -4 v8 h-18z', ince)].join(''),
  // 17 Yıldız: büyük sekiz köşeli yıldız, yedi küçük yıldız, dökülen su
  17: [p(yildiz(50, 30, 18, 8, 0.45)), ...[[18, 14], [82, 14], [16, 40], [84, 40], [26, 60], [74, 60], [50, 6]].map(([x, y]) => p(yildiz(x, y, 4), dolu)), p('M30 74 q10 -6 20 0 M50 74 q10 6 20 0 M24 86 q12 -6 26 0 q12 6 26 0', ince)].join(''),
  // 18 Ay: hilal, damlalar, iki kule ve kıvrılan yol
  18: [p('M60 14 a20 20 0 1 0 0 36 a16 16 0 1 1 0 -36z'), ...[[40, 56], [50, 60], [60, 56]].map(([x, y]) => p(`M${x} ${y} l-2 4 a2 2 0 0 0 4 0z`, dolu)), p('M10 92 V64 H20 V92 M80 92 V64 H90 V92'), p('M50 92 C40 84 60 78 50 70', ince)].join(''),
  // 19 Güneş: düz ve dalgalı ışınlar
  19: [c(50, 48, 18), c(50, 48, 12, ince), p(isinlar(50, 48, 22, 34, 12)), ...Array.from({ length: 12 }, (_, i) => { const a = (Math.PI * 2 * i) / 12 + Math.PI / 12; const x = 50 + Math.cos(a) * 22, y = 48 + Math.sin(a) * 22; const x2 = 50 + Math.cos(a) * 32, y2 = 48 + Math.sin(a) * 32; return p(`M${x.toFixed(1)} ${y.toFixed(1)} Q${(x + x2) / 2 + 3} ${(y + y2) / 2 + 3} ${x2.toFixed(1)} ${y2.toFixed(1)}`, ince); }), p('M20 92 Q50 84 80 92', ince)].join(''),
  // 20 Mahkeme: haç bayraklı boru ve yükselen yaylar
  20: [p('M22 40 L62 20 L64 26 L26 44Z'), p('M62 20 Q72 14 74 24 Q72 30 64 26'), p('M30 42 V14 H46 V24 H30 M38 14 V24', ince), p('M14 92 Q24 72 34 92 M40 92 Q50 66 60 92 M66 92 Q76 72 86 92', ince)].join(''),
  // 21 Dünya: defne çelengi ve köşelerde dört nokta
  21: [`<ellipse cx="50" cy="52" rx="24" ry="34"/>`, ...Array.from({ length: 16 }, (_, i) => { const a = (Math.PI * 2 * i) / 16; const x = 50 + Math.cos(a) * 26, y = 52 + Math.sin(a) * 37; return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="2.2" ry="4.4" transform="rotate(${((a * 180) / Math.PI + 90).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" class="ince"/>`; }), p(yildiz(50, 52, 8, 5)), c(12, 12, 4), c(88, 12, 4), c(12, 92, 4), c(88, 92, 4)].join(''),
};

/* ---------- Tarot: takım işaretleri (-10..10) ---------- */

export const TAKIM = {
  asa: [p('M0 -10 V10'), p('M0 -6 q4 -2 5 -5 M0 0 q-4 -2 -5 -5 M0 5 q4 -2 5 -5', ince), c(0, -10, 1.2, dolu)].join(''),
  kupa: [p('M-6 -8 H6 Q6 2 0 2 Q-6 2 -6 -8Z'), p('M0 2 V7 M-4 9 H4 M-3 7 H3')].join(''),
  kilic: [p('M0 -10 V6 M-5 4 H5 M0 6 V10'), p('M-1.5 -8 L0 -10 L1.5 -8', ince)].join(''),
  tilsim: [c(0, 0, 8), p(yildiz(0, 0, 6.5, 5, 0.4), ince)].join(''),
};
export const TAKIM_RENK = { asa: '#d39a52', kupa: '#6fb3b0', kilic: '#a9b8d4', tilsim: '#a9c27a' };

// Küçük arkana pip düzenleri (120×200 kart yüzünde, iç alan 22..98 × 40..160)
export const PIP = {
  1: [[60, 100]],
  2: [[60, 62], [60, 138]],
  3: [[60, 56], [60, 100], [60, 144]],
  4: [[40, 62], [80, 62], [40, 138], [80, 138]],
  5: [[40, 62], [80, 62], [60, 100], [40, 138], [80, 138]],
  6: [[40, 58], [80, 58], [40, 100], [80, 100], [40, 142], [80, 142]],
  7: [[40, 56], [80, 56], [60, 78], [40, 100], [80, 100], [40, 144], [80, 144]],
  8: [[40, 54], [80, 54], [60, 76], [40, 100], [80, 100], [60, 124], [40, 146], [80, 146]],
  9: [[40, 54], [80, 54], [40, 84], [80, 84], [60, 100], [40, 116], [80, 116], [40, 146], [80, 146]],
  10: [[40, 52], [80, 52], [60, 68], [40, 86], [80, 86], [40, 114], [80, 114], [60, 132], [40, 148], [80, 148]],
};

// Saray kartı işaretleri (0..100)
export const SARAY = {
  11: [p('M30 70 Q50 30 70 70'), p('M44 28 q6 -16 12 0', ince), p('M38 76 H62')].join(''), // uşak: tüy ve parşömen
  12: [p('M30 80 V50 Q30 26 50 24 Q70 26 70 50 V80Z'), p('M30 52 H70 M50 24 V14 M44 14 H56', ince)].join(''), // şövalye: miğfer
  13: [p('M26 66 L30 36 L40 52 L50 30 L60 52 L70 36 L74 66Z'), c(30, 34, 3, dolu), c(50, 28, 3, dolu), c(70, 34, 3, dolu), p('M26 72 H74', ince)].join(''), // kraliçe: taç
  14: [p('M24 66 L28 34 L40 50 L50 26 L60 50 L72 34 L76 66Z'), p('M50 26 V12 M44 18 H56'), p('M24 72 H76 M24 78 H76', ince)].join(''), // kral: haçlı taç
};

/* ---------- Lenormand: 36 ikon ve geleneksel iskambil köşesi ---------- */

export const LEN_KOSE = {
  1: ['9', '♥'], 2: ['6', '♦'], 3: ['10', '♠'], 4: ['K', '♥'], 5: ['7', '♥'], 6: ['K', '♣'], 7: ['Q', '♣'], 8: ['9', '♦'], 9: ['Q', '♠'],
  10: ['J', '♦'], 11: ['J', '♣'], 12: ['7', '♦'], 13: ['J', '♠'], 14: ['9', '♣'], 15: ['10', '♣'], 16: ['6', '♥'], 17: ['Q', '♥'], 18: ['10', '♥'],
  19: ['6', '♠'], 20: ['8', '♠'], 21: ['8', '♣'], 22: ['Q', '♦'], 23: ['7', '♣'], 24: ['J', '♥'], 25: ['A', '♣'], 26: ['10', '♦'], 27: ['7', '♠'],
  28: ['A', '♥'], 29: ['A', '♠'], 30: ['K', '♠'], 31: ['A', '♦'], 32: ['8', '♥'], 33: ['8', '♦'], 34: ['K', '♦'], 35: ['9', '♠'], 36: ['6', '♣'],
};

export const LEN = {
  1: [p('M34 24 Q34 74 50 78 Q66 74 66 24 M26 24 H42 M58 24 H74'), ...[[36, 38], [36, 54], [64, 38], [64, 54]].map(([x, y]) => c(x, y, 1.6, dolu)), p('M10 86 H30 M16 80 H30 M70 86 H90 M70 80 H84', ince)].join(''), // atlı: nal ve hız
  2: [c(40, 40, 10), c(60, 40, 10), c(50, 56, 10), p('M50 64 Q52 80 62 88')].join(''),
  3: [p('M20 64 H80 L70 80 H30Z'), p('M50 64 V16'), p('M50 20 L74 56 H50 M50 24 L30 56 H50', ince), p('M14 88 q8 -4 16 0 q8 4 16 0 q8 -4 16 0 q8 4 16 0', ince)].join(''),
  4: [p('M24 48 L50 24 L76 48 V84 H24Z'), p('M42 84 V62 H58 V84'), p('M64 34 V22 H70 V40', ince)].join(''),
  5: [p('M50 88 V44'), c(50, 36, 22), p('M50 64 L38 52 M50 56 L62 46 M50 74 L60 66', ince), p('M30 88 H70', ince)].join(''),
  6: [p('M22 60 a12 12 0 0 1 8 -22 a16 16 0 0 1 30 -4 a12 12 0 0 1 18 14 a10 10 0 0 1 -6 18 H28 a8 8 0 0 1 -6 -6z'), p('M34 80 l-4 8 M50 80 l-4 8 M66 80 l-4 8', ince)].join(''),
  7: [p('M12 70 C22 40 34 96 46 66 C58 36 70 92 82 58 Q86 46 76 44 Q68 44 70 52'), c(77, 48, 1.6, dolu), p('M70 52 l-6 2 M70 52 l-4 5', ince)].join(''),
  8: [p('M36 16 L64 16 L72 36 L64 90 L36 90 L28 36Z'), p('M50 34 V60 M42 42 H58', ince)].join(''),
  9: [c(50, 30, 8), c(36, 38, 7), c(64, 38, 7), c(44, 50, 6), c(58, 50, 6), p('M50 56 L42 88 H58Z'), p('M40 88 H60', ince)].join(''),
  10: [p('M30 90 L64 20'), p('M64 20 Q86 26 88 50 Q74 34 58 32')].join(''),
  11: [p('M26 88 L58 18 M74 88 L42 18'), p('M58 18 q10 6 4 16 q-6 8 4 16', ince), p('M42 18 q-10 6 -4 16 q6 8 -4 16', ince)].join(''),
  12: [p('M20 40 q10 -10 20 0 q10 -10 20 0'), p('M46 62 q10 -10 20 0 q10 -10 20 0'), p('M14 86 H86', ince)].join(''),
  13: [c(50, 30, 10), p('M50 40 V68 M36 50 H64 M50 68 L40 86 M50 68 L60 86'), p(yildiz(74, 24, 4), dolu)].join(''),
  14: [p('M24 30 L36 50 L50 44 L64 50 L76 30 L70 60 L50 82 L30 60Z'), c(42, 58, 2, dolu), c(58, 58, 2, dolu)].join(''),
  15: [c(50, 56, 24), c(32, 32, 8), c(68, 32, 8), c(42, 52, 2, dolu), c(58, 52, 2, dolu), `<ellipse cx="50" cy="66" rx="6" ry="4"/>`].join(''),
  16: [p(yildiz(50, 46, 16, 8, 0.4)), p(yildiz(24, 22, 5), dolu), p(yildiz(78, 24, 5), dolu), p(yildiz(28, 76, 4), dolu), p(yildiz(74, 74, 4), dolu)].join(''),
  17: [p('M30 46 Q30 28 50 30 Q66 32 66 46 Q66 56 50 56 Q36 56 30 46Z'), p('M30 40 L14 30 L30 36'), p('M44 56 V86 M56 56 V86 M40 86 H48 M52 86 H60'), c(60, 40, 1.8, dolu)].join(''),
  18: [p('M30 44 L30 28 L42 38 H58 L70 28 L70 44 Q70 70 50 74 Q30 70 30 44Z'), c(42, 50, 2, dolu), c(58, 50, 2, dolu), p('M46 62 L50 66 L54 62')].join(''),
  19: [p('M36 90 V30 H64 V90'), p('M32 30 H68 V20 h-6 v5 h-6 v-5 h-12 v5 h-6 v-5 h-6z'), p('M46 44 h8 v12 h-8z M46 66 h8 v12 h-8z', ince)].join(''),
  20: [p('M30 90 V48 Q50 30 70 48 V90'), p('M30 60 H70', ince), c(16, 50, 8), p('M16 58 V90'), c(84, 50, 8), p('M84 58 V90')].join(''),
  21: [p('M8 88 L36 32 L52 58 L64 42 L92 88Z'), p('M30 44 L36 32 L42 44 L38 40 L34 44Z', ince)].join(''),
  22: [p('M50 90 V54 L24 18 M50 54 L76 18'), p('M18 90 H82', ince)].join(''),
  23: [`<ellipse cx="44" cy="58" rx="20" ry="13"/>`, c(26, 46, 6), c(22, 56, 1.6, dolu), p('M64 58 Q80 58 82 72 Q84 84 72 86')].join(''),
  24: [p('M50 84 L22 52 A16 16 0 0 1 50 30 A16 16 0 0 1 78 52 Z')].join(''),
  25: [c(50, 58, 22), c(50, 58, 16, ince), p('M42 34 L50 22 L58 34', ince), p(yildiz(50, 26, 5, 4, 0.5), dolu)].join(''),
  26: [p('M50 30 Q34 22 16 26 V80 Q34 76 50 84 Q66 76 84 80 V26 Q66 22 50 30Z M50 30 V84'), p('M24 40 H42 M24 50 H42 M58 40 H76 M58 50 H76', ince)].join(''),
  27: [p('M16 30 H84 V76 H16Z'), p('M16 30 L50 56 L84 30'), c(50, 56, 4, dolu)].join(''),
  28: [c(44, 58, 18), p('M57 45 L78 24 M64 24 H78 V38')].join(''),
  29: [c(50, 42, 18), p('M50 60 V88 M38 76 H62')].join(''),
  30: [p('M50 88 V50'), p('M50 50 Q36 40 34 22 Q46 30 50 50 Q54 30 66 22 Q64 40 50 50Z'), p('M50 50 Q48 34 50 18 Q52 34 50 50', ince), p('M50 70 Q60 62 70 66 M50 76 Q40 68 30 72', ince)].join(''),
  31: [c(50, 50, 14), p(isinlar(50, 50, 18, 30, 16))].join(''),
  32: [p('M58 16 a34 34 0 1 0 0 68 a26 26 0 1 1 0 -68z'), p(yildiz(74, 30, 4), dolu)].join(''),
  33: [c(32, 50, 12), c(32, 50, 5, ince), p('M44 50 H86 M74 50 V62 M82 50 V60')].join(''),
  34: [p('M18 50 Q40 28 66 50 Q40 72 18 50Z'), p('M66 50 L84 36 V64Z'), c(30, 48, 2, dolu), p('M42 44 q4 6 0 12', ince)].join(''),
  35: [c(50, 22, 6), p('M50 28 V84 M38 38 H62'), p('M22 64 Q24 84 50 86 Q76 84 78 64 M18 68 L22 62 L28 66 M82 68 L78 62 L72 66')].join(''),
  36: [p('M42 14 H58 V36 H80 V52 H58 V90 H42 V52 H20 V36 H42Z')].join(''),
};

/* ---------- Rünler: çizgi (stave) yolları, 40×60 kutu ---------- */

export const RUN = {
  fehu: 'M12 56V4M12 20L28 8M12 34L28 22',
  uruz: 'M10 56V4L30 18V56',
  thurisaz: 'M12 4V56M12 18L28 30L12 42',
  ansuz: 'M12 56V4M12 4L28 16M12 18L28 30',
  raidho: 'M12 56V4L28 16L12 28L28 56',
  kenaz: 'M28 8L12 30L28 52',
  gebo: 'M8 8L32 52M32 8L8 52',
  wunjo: 'M12 56V4L28 16L12 28',
  hagalaz: 'M10 4V56M30 4V56M10 22L30 38',
  nauthiz: 'M20 4V56M10 22L30 36',
  isa: 'M20 4V56',
  jera: 'M18 10L8 22L18 34M22 26L32 38L22 50',
  eihwaz: 'M20 4V56M20 4L30 14M20 56L10 46',
  perthro: 'M12 4V56M12 4L28 14V22M12 56L28 46V38',
  algiz: 'M20 56V4M20 22L8 6M20 22L32 6',
  sowilo: 'M26 6L12 24L28 36L14 54',
  tiwaz: 'M20 56V4M8 18L20 4L32 18',
  berkano: 'M12 4V56M12 4L28 17L12 30L28 43L12 56',
  ehwaz: 'M10 56V4L20 18L30 4V56',
  mannaz: 'M10 56V4L30 24M30 56V4L10 24',
  laguz: 'M14 56V4L28 16',
  ingwaz: 'M20 14L32 30L20 46L8 30Z',
  dagaz: 'M8 8L32 52V8L8 52Z',
  othala: 'M20 6L32 22L10 52M20 6L8 22L30 52',
  bos: '',
};

/* ---------- İskambil: dolu takım işaretleri (-10..10) ve pip düzenleri ---------- */

export const ISK_TAKIM = {
  kupa: '<path d="M0 9 L-8 0 A4.6 4.6 0 0 1 0 -6 A4.6 4.6 0 0 1 8 0Z"/>',
  karo: '<path d="M0 -10 L7 0 L0 10 L-7 0Z"/>',
  sinek: '<circle cx="0" cy="-4.6" r="4.2"/><circle cx="-4.8" cy="1.6" r="4.2"/><circle cx="4.8" cy="1.6" r="4.2"/><path d="M-1.2 1 L-3 9.5 H3 L1.2 1Z"/>',
  maca: '<path d="M0 -10 L8 2 A4.6 4.6 0 0 1 0 6 A4.6 4.6 0 0 1 -8 2Z M-1.2 4 L-3 10 H3 L1.2 4Z"/>',
};
// İskambil pip düzenleri (120×200 yüz)
const I6 = [[40, 56], [80, 56], [40, 100], [80, 100], [40, 144], [80, 144]];
export const ISK_PIP = {
  2: [[60, 56], [60, 144]],
  3: [[60, 56], [60, 100], [60, 144]],
  4: [[40, 56], [80, 56], [40, 144], [80, 144]],
  5: [[40, 56], [80, 56], [60, 100], [40, 144], [80, 144]],
  6: I6,
  7: [...I6, [60, 78]],
  8: [...I6, [60, 78], [60, 122]],
  9: [[40, 52], [80, 52], [40, 83], [80, 83], [60, 100], [40, 117], [80, 117], [40, 148], [80, 148]],
  10: [[40, 52], [80, 52], [60, 68], [40, 83], [80, 83], [40, 117], [80, 117], [60, 132], [40, 148], [80, 148]],
};
export const ISK_KISA = { 1: 'A', 11: 'V', 12: 'K', 13: 'P' };
