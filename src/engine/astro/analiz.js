// Doğum haritası analizi: saf fonksiyonlar, WASM gerektirmez (test edilebilir).

import { BURCLAR, GEZEGEN, GEZEGENLER, ONUR, ACILAR, burc, burcIndeksi, fark, norm360 } from './sabitler.js';

const ANA = GEZEGENLER.filter((g) => g.tur !== 'nokta').map((g) => g.key); // 10 gezegen
const ACI_HEDEFLERI = [...ANA, 'dugum', 'lilith'];

/** İki nokta arasındaki orb sınırı: ikisinin orb ortalaması × açı çarpanı. */
function orbSiniri(a, b, aci) {
  const oa = GEZEGEN[a]?.orb ?? 3;
  const ob = GEZEGEN[b]?.orb ?? 3;
  return ((oa + ob) / 2) * aci.orbCarpan;
}

/**
 * Açılar. Noktalar: gezegenler + (varsa) ASC ve MC.
 * Yaklaşan/ayrılan: hızlardan hesaplanır.
 */
export function acilar(konumlar, evler, { sadece } = {}) {
  const noktalar = ACI_HEDEFLERI.filter((k) => konumlar[k]).map((k) => ({ key: k, lon: konumlar[k].lon, hiz: konumlar[k].hiz ?? 0 }));
  if (evler) {
    noktalar.push({ key: 'asc', lon: evler.asc, hiz: 0 });
    noktalar.push({ key: 'mc', lon: evler.mc, hiz: 0 });
  }
  const sonuc = [];
  for (let i = 0; i < noktalar.length; i++) {
    for (let j = i + 1; j < noktalar.length; j++) {
      const A = noktalar[i], B = noktalar[j];
      if ((A.key === 'asc' || A.key === 'mc') && (B.key === 'asc' || B.key === 'mc')) continue;
      if ((A.key === 'dugum' && B.key === 'lilith') || (A.key === 'lilith' && B.key === 'dugum')) continue;
      if (sadece && !sadece.includes(A.key) && !sadece.includes(B.key)) continue;
      const d = fark(A.lon, B.lon);
      for (const aci of ACILAR) {
        const sinir = orbSiniri(A.key === 'asc' || A.key === 'mc' ? B.key : A.key, B.key === 'asc' || B.key === 'mc' ? A.key : B.key, aci);
        const orb = Math.abs(d - aci.aci);
        if (orb <= sinir) {
          // Yaklaşıyor mu: kısa süre sonra orb küçülüyor mu?
          const dt = 0.01;
          const d2 = fark(A.lon + A.hiz * dt, B.lon + B.hiz * dt);
          const yaklasan = Math.abs(d2 - aci.aci) < orb;
          sonuc.push({ a: A.key, b: B.key, aci: aci.key, orb, sinir, yaklasan, guc: 1 - orb / sinir });
          break;
        }
      }
    }
  }
  return sonuc.sort((x, y) => x.orb - y.orb);
}

/** Element ve nitelik dengesi. Güneş, Ay, ASC 2 puan; kişisel gezegenler 1; diğerleri 0,5. */
export function denge(konumlar, evler) {
  const el = { ates: 0, toprak: 0, hava: 0, su: 0 };
  const ni = { oncu: 0, sabit: 0, degisken: 0 };
  const ekle = (lon, w) => { const b = burc(lon); el[b.element] += w; ni[b.nitelik] += w; };
  for (const k of ANA) {
    const w = k === 'gunes' || k === 'ay' ? 2 : GEZEGEN[k].tur === 'kisisel' ? 1 : 0.5;
    ekle(konumlar[k].lon, w);
  }
  if (evler) ekle(evler.asc, 2);
  const toplam = Object.values(el).reduce((a, b) => a + b, 0);
  const sirala = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]);
  const elS = sirala(el), niS = sirala(ni);
  return {
    element: el, nitelik: ni, toplam,
    baskinElement: elS[0][0], zayifElement: elS[elS.length - 1][1] <= toplam * 0.08 ? elS[elS.length - 1][0] : null,
    baskinNitelik: niS[0][0],
  };
}

/** Onur durumu: ev, yücelim, zarar, düşüş ya da null. */
export function onur(gezegen, lon) {
  const o = ONUR[gezegen];
  if (!o) return null;
  const b = burc(lon).key;
  if (o.ev.includes(b)) return 'ev';
  if (o.yucelim === b) return 'yucelim';
  if (o.zarar.includes(b)) return 'zarar';
  if (o.dusus === b) return 'dusus';
  return null;
}

/** Harita yöneticisi: yükselen burcun geleneksel yöneticisi. */
export function haritaYoneticisi(evler) {
  if (!evler) return null;
  return burc(evler.asc).yonetici;
}

/** Baskın gezegen puanlaması (öne çıkma, güç değil). */
export function baskinlik(konumlar, evler, aciListesi) {
  const yonetici = haritaYoneticisi(evler);
  const puan = {};
  for (const k of ANA) {
    let p = 0;
    const g = konumlar[k];
    if (k === 'gunes' || k === 'ay') p += 2;
    if (g.ev) p += [1, 4, 7, 10].includes(g.ev) ? 3 : [2, 5, 8, 11].includes(g.ev) ? 1 : 0;
    const o = onur(k, g.lon);
    if (o === 'ev') p += 3; else if (o === 'yucelim') p += 2;
    if (evler) {
      if (fark(g.lon, evler.asc) <= 5) p += 4;
      if (fark(g.lon, evler.mc) <= 5) p += 3;
    }
    if (k === yonetici) p += 3;
    for (const a of aciListesi) if (a.a === k || a.b === k) p += 0.5 + a.guc;
    puan[k] = Math.round(p * 10) / 10;
  }
  const sira = Object.entries(puan).sort((a, b) => b[1] - a[1]);
  return { puan, sira: sira.map(([k]) => k), baskin: sira[0][0] };
}

/** Açı kalıpları: yığılma (stelyum), T-kare, büyük üçgen, büyük haç, yod. */
export function kaliplar(konumlar, aciListesi) {
  const k = [];
  // Stelyum: aynı burçta 3+ gezegen (Güneş-Plüton)
  const burcta = {};
  for (const g of ANA) (burcta[burc(konumlar[g].lon).key] ??= []).push(g);
  for (const [b, list] of Object.entries(burcta)) if (list.length >= 3) k.push({ tip: 'stelyum', burc: b, gezegenler: list });
  // Aynı evde 3+ gezegen
  const evde = {};
  for (const g of ANA) if (konumlar[g].ev) (evde[konumlar[g].ev] ??= []).push(g);
  for (const [e, list] of Object.entries(evde)) if (list.length >= 3) k.push({ tip: 'ev-yigilmasi', ev: Number(e), gezegenler: list });

  const var_ = (a, b, tip) => aciListesi.some((x) => x.aci === tip && ((x.a === a && x.b === b) || (x.a === b && x.b === a)));
  const pl = ANA;
  const gorulen = new Set();
  const ekle = (tip, list) => { const id = tip + [...list].sort().join(); if (!gorulen.has(id)) { gorulen.add(id); k.push({ tip, gezegenler: list }); } };
  for (let i = 0; i < pl.length; i++) for (let j = i + 1; j < pl.length; j++) for (let m = 0; m < pl.length; m++) {
    const a = pl[i], b = pl[j], c = pl[m];
    if (c === a || c === b) continue;
    if (var_(a, b, 'karsit') && var_(a, c, 'kare') && var_(b, c, 'kare')) ekle('t-kare', [a, b, c]);
    if (m > j && var_(a, b, 'ucgen') && var_(a, c, 'ucgen') && var_(b, c, 'ucgen')) ekle('buyuk-ucgen', [a, b, c]);
    if (var_(a, b, 'altigen') && var_(a, c, 'quincunx') && var_(b, c, 'quincunx')) ekle('yod', [a, b, c]);
  }
  // Büyük haç: iki karşıt çifti, birbirine kare
  const karsitlar = aciListesi.filter((x) => x.aci === 'karsit' && ANA.includes(x.a) && ANA.includes(x.b));
  for (let i = 0; i < karsitlar.length; i++) for (let j = i + 1; j < karsitlar.length; j++) {
    const p = karsitlar[i], q = karsitlar[j];
    if (var_(p.a, q.a, 'kare') && var_(p.a, q.b, 'kare') && var_(p.b, q.a, 'kare') && var_(p.b, q.b, 'kare')) ekle('buyuk-hac', [p.a, p.b, q.a, q.b]);
  }
  return k;
}

/** Kesik (intercepted) burçlar: hiçbir ev başlangıcının düşmediği burçlar (bölmeli ev sistemlerinde). */
export function kesikBurclar(evler) {
  if (!evler || evler.sistem === 'burc' || evler.sistem === 'esit') return [];
  const basta = new Set(evler.cusps.map((c) => burcIndeksi(c)));
  return BURCLAR.filter((_, i) => !basta.has(i)).map((b) => b.key);
}

/** Tam analiz paketi. */
export function analiz(harita) {
  const { konumlar, evler } = harita;
  const ac = acilar(konumlar, evler);
  const onurlar = Object.fromEntries(ANA.map((k) => [k, onur(k, konumlar[k].lon)]));
  const retrolar = ANA.filter((k) => konumlar[k].retro);
  return {
    acilar: ac,
    denge: denge(konumlar, evler),
    onurlar,
    retrolar,
    yonetici: haritaYoneticisi(evler),
    baskinlik: baskinlik(konumlar, evler, ac),
    kaliplar: kaliplar(konumlar, ac),
    kesik: kesikBurclar(evler),
  };
}

export { ANA };
export const _test = { orbSiniri, norm360 };
