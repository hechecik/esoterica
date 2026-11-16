// Swiss Ephemeris (WASM, Moshier efemerisi gömülü) sarmalayıcısı.
// Tembel yüklenir: ilk harita hesaplanana kadar WASM indirilmez.

import { GEZEGENLER, norm360 } from './sabitler.js';

const MOSHIER = 4;
const SPEED = 256;
let motorSoz = null;

/**
 * @param {string} [wasmUrl] testlerde dosya yolu; tarayıcıda boş bırakılır (paket kendi yanında arar)
 */
export function motor(wasmUrl) {
  if (!motorSoz) {
    motorSoz = (async () => {
      const m = await import('@swisseph/browser');
      const swe = new m.SwissEphemeris();
      await swe.init(wasmUrl);
      return swe;
    })();
  }
  return motorSoz;
}

/** UTC milisaniyeden Jülyen günü (UT). */
export function julyen(swe, utcMs) {
  const d = new Date(utcMs);
  const saat = d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600 + d.getUTCMilliseconds() / 3.6e6;
  return swe.julianDay(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), saat);
}

/** Bir an için gezegen konumları (ev bilgisi olmadan). */
export function konumlar(swe, jd) {
  const out = {};
  for (const g of GEZEGENLER) {
    const p = swe.calculatePosition(jd, g.swe, MOSHIER | SPEED);
    out[g.key] = { lon: norm360(p.longitude), enlem: p.latitude, hiz: p.longitudeSpeed, retro: p.longitudeSpeed < 0 && g.tur !== 'nokta' };
  }
  return out;
}

const EV_SISTEMI = { placidus: 'P', koch: 'K', esit: 'A', burc: 'W' };

/** Ev başlangıçları. Kutup bölgelerinde Placidus/Koch tanımsız: Whole Sign'a düşer. */
export function evler(swe, jd, enlem, boylam, sistem = 'placidus') {
  let kullanilan = sistem;
  if ((sistem === 'placidus' || sistem === 'koch') && Math.abs(enlem) >= 66) kullanilan = 'burc';
  const h = swe.calculateHouses(jd, enlem, boylam, EV_SISTEMI[kullanilan]);
  const cusps = h.cusps.slice(1, 13).map(norm360);
  return { sistem: kullanilan, istenen: sistem, cusps, asc: norm360(h.ascendant), mc: norm360(h.mc) };
}

/** Boylamın hangi evde olduğunu bulur (1-12). */
export function evBul(lon, cusps) {
  const L = norm360(lon);
  for (let i = 0; i < 12; i++) {
    const a = cusps[i];
    const b = cusps[(i + 1) % 12];
    const span = norm360(b - a);
    if (norm360(L - a) < span) return i + 1;
  }
  return 12;
}

/**
 * Doğum haritası hesabı.
 * @param {object} p { utcMs, enlem, boylam, evSistemi, saatBilinmiyor }
 */
export async function haritaHesapla(p, wasmUrl) {
  const swe = await motor(wasmUrl);
  const jd = julyen(swe, p.utcMs);
  const kon = konumlar(swe, jd);
  const harita = { jd, utcMs: p.utcMs, konumlar: kon, saatBilinmiyor: !!p.saatBilinmiyor };

  if (!p.saatBilinmiyor) {
    const e = evler(swe, jd, p.enlem, p.boylam, p.evSistemi);
    harita.evler = e;
    for (const k of Object.keys(kon)) kon[k].ev = evBul(kon[k].lon, e.cusps);
    // Şans Noktası: gündüz (Güneş ufkun üstünde, 7-12. evler) ASC + Ay − Güneş; gece ASC + Güneş − Ay
    const gunduz = kon.gunes.ev >= 7;
    harita.gunduz = gunduz;
    harita.sans = norm360(gunduz ? e.asc + kon.ay.lon - kon.gunes.lon : e.asc + kon.gunes.lon - kon.ay.lon);
  } else {
    // Saat bilinmiyorsa Ay'ın gün içindeki aralığı (yerel gün başı ve sonu yaklaşık ±12 saat)
    const once = konumlar(swe, jd - 0.5).ay.lon;
    const sonra = konumlar(swe, jd + 0.5).ay.lon;
    harita.ayAraligi = [once, sonra];
  }
  return harita;
}

/** Belirli bir an için gökyüzü (transitler, ay evresi). */
export async function gokyuzu(utcMs, wasmUrl) {
  const swe = await motor(wasmUrl);
  const jd = julyen(swe, utcMs);
  return { jd, utcMs, konumlar: konumlar(swe, jd) };
}

/**
 * Güneş-Ay uzanımının hedef açıya ulaştığı bir sonraki anı bulur (0 yeni ay, 180 dolunay).
 * Adım adım tarama + ikiye bölme; Ay günde ~12° kazandığı için 30 günlük tarama yeterli.
 */
export async function sonrakiEvre(utcMs, hedef, wasmUrl) {
  const swe = await motor(wasmUrl);
  const uz = (ms) => {
    const k = konumlar(swe, julyen(swe, ms));
    return norm360(k.ay.lon - k.gunes.lon - hedef);
  };
  let a = utcMs;
  let fa = uz(a);
  const adim = 6 * 3600e3;
  for (let i = 0; i < 4 * 31; i++) {
    const b = a + adim;
    const fb = uz(b);
    if (fb < fa && fa > 300 && fb < 60) {
      let lo = a, hi = b;
      for (let j = 0; j < 30; j++) {
        const mid = (lo + hi) / 2;
        if (uz(mid) > 180) lo = mid; else hi = mid;
      }
      return hi;
    }
    a = b; fa = fb;
  }
  return null;
}
