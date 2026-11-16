// Şehir arama: veri tembel yüklenir; arama Türkçe karaktere duyarsız.

let veri = null;

export async function sehirleriYukle() {
  if (!veri) {
    const m = await import('../../content/generated/sehirler.json');
    veri = m.default;
    veri.anahtar = veri.s.map((s) => katla(s[0]));
  }
  return veri;
}

/** Türkçe katlama: "İstanbul", "istanbul", "Istanbul" aynı anahtara iner. */
export function katla(s) {
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/[ıi̇]/g, 'i')
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/ø/g, 'o').replace(/æ/g, 'ae').replace(/å/g, 'a').replace(/ß/g, 'ss').replace(/ł/g, 'l').replace(/đ/g, 'd')
    .normalize('NFD').replace(/[̀-ͯ]/g, '');
}

let ulkeAdi;
function ulke(cc) {
  try { ulkeAdi ??= new Intl.DisplayNames(['tr'], { type: 'region' }); return ulkeAdi.of(cc); } catch { return cc; }
}

function kayit(s, tzList) {
  const [ad, cc, il, enlem, boylam, tz] = s;
  return {
    ad, ulke: cc, enlem, boylam, tz: tzList[tz],
    etiket: cc === 'TR' ? (il ? `${ad}, ${il}` : ad) : `${ad}, ${ulke(cc)}`,
  };
}

/** Önek eşleşmeleri önce, sonra içeren eşleşmeler; nüfus sırası korunur. */
export function sehirAra(v, sorgu, limit = 8) {
  const q = katla(sorgu.trim());
  if (q.length < 2) return [];
  const bas = [], ic = [];
  for (let i = 0; i < v.s.length && bas.length < limit; i++) {
    const k = v.anahtar[i];
    if (k.startsWith(q)) bas.push(i);
    else if (ic.length < limit && k.includes(q)) ic.push(i);
  }
  return [...bas, ...ic].slice(0, limit).map((i) => kayit(v.s[i], v.tz));
}
