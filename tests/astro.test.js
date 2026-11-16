import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { yereldenUtc, offsetAt, farkYazi } from '../src/engine/astro/zaman.js';
import { haritaHesapla, motor, evBul, sonrakiEvre } from '../src/engine/astro/efemeris.js';
import { analiz, acilar, denge, onur, kaliplar } from '../src/engine/astro/analiz.js';
import { fark, burc, derece } from '../src/engine/astro/sabitler.js';

// Node'da WASM'ı dosyadan yükleyebilmek için fetch'e dosya desteği
const realFetch = globalThis.fetch;
globalThis.fetch = async (u, o) => {
  const s = String(u);
  if (s.startsWith('file:')) return new Response(readFileSync(new URL(s)), { headers: { 'content-type': 'application/wasm' } });
  return realFetch(u, o);
};
const WASM = new URL('../node_modules/@swisseph/browser/dist/swisseph.wasm', import.meta.url).href;
const GOLD = JSON.parse(readFileSync(new URL('./golden/astro.json', import.meta.url), 'utf8'));

// IANA ana verisinde 1970 öncesi bazı bölgeler birleştirildi (ör. Europe/Oslo -> Europe/Berlin,
// Atlantic/Reykjavik -> Africa/Abidjan). Tarayıcılar ana veriyi, Python sistemi "backzone" dahil veriyi kullanır.
// Bu bölgelerde 1970 öncesi saat farkı ayrışabilir: bilinen sınırlama; arayüzde elle düzeltme var.
const BIRLESIK = new Set(['Europe/Oslo', 'Atlantic/Reykjavik']);
const bilinenSinirlama = (v) => BIRLESIK.has(v.girdi.tz) && v.girdi.yil < 1970;
const SANIYE = 1 / 3600;
const DAKIKA = 1 / 60;

beforeAll(async () => { await motor(WASM); });

describe('saat dilimi', () => {
  it('Türkiye: 2016 öncesi kış UTC+2, yaz UTC+3; sonrası kalıcı UTC+3', () => {
    expect(yereldenUtc({ yil: 1975, ay: 1, gun: 15, saat: 14, dakika: 30 }, 'Europe/Istanbul').offsetMin).toBe(120);
    expect(yereldenUtc({ yil: 1975, ay: 7, gun: 15, saat: 14, dakika: 30 }, 'Europe/Istanbul').offsetMin).toBe(180);
    expect(yereldenUtc({ yil: 2016, ay: 12, gun: 1, saat: 12 }, 'Europe/Istanbul').offsetMin).toBe(180);
    expect(yereldenUtc({ yil: 2020, ay: 1, gun: 1, saat: 12 }, 'Europe/Istanbul').offsetMin).toBe(180);
  });
  it('ileri alınan saat: var olmayan yerel saat tespit edilir', () => {
    // 27 Mart 2011 03:00 -> 04:00 (Türkiye)
    const r = yereldenUtc({ yil: 2011, ay: 3, gun: 28, saat: 3, dakika: 30 }, 'Europe/Istanbul');
    expect(r.durum).toBe('yok');
  });
  it('geri alınan saat: iki kez yaşanan yerel saat belirsiz', () => {
    // 30 Ekim 2011 04:00 -> 03:00
    const r = yereldenUtc({ yil: 2011, ay: 10, gun: 30, saat: 3, dakika: 30 }, 'Europe/Istanbul');
    expect(r.durum).toBe('belirsiz');
    expect(r.alternatif.utcMs - r.utcMs).toBe(3600e3);
  });
  it('yarım saatlik ve çeyrek saatlik farklar', () => {
    expect(yereldenUtc({ yil: 2020, ay: 1, gun: 1, saat: 12 }, 'Asia/Kathmandu').offsetMin).toBe(345);
    expect(yereldenUtc({ yil: 2020, ay: 1, gun: 1, saat: 12 }, 'Asia/Kolkata').offsetMin).toBe(330);
  });
  it('fark yazısı', () => {
    expect(farkYazi(180)).toBe('UTC+3');
    expect(farkYazi(345)).toBe('UTC+5:45');
    expect(farkYazi(-300)).toBe('UTC−5');
    expect(offsetAt(Date.UTC(2020, 0, 1), 'UTC')).toBe(0);
  });
});

describe(`altın vakalar (${GOLD.vakalar.length}, ${GOLD.uretici})`, () => {
  it('saat farkı ve UTC anı birebir', () => {
    const hatalar = [];
    const bilinen = [];
    for (const v of GOLD.vakalar) {
      const r = yereldenUtc(v.girdi, v.girdi.tz);
      const ok = Math.abs(r.offsetMin - v.beklenen.offsetMin) < 1e-6 && r.utcMs === v.beklenen.utcMs;
      if (!ok) (bilinenSinirlama(v) ? bilinen : hatalar).push(`${v.etiket}: ${r.offsetMin} != ${v.beklenen.offsetMin}`);
    }
    if (bilinen.length) console.info('Bilinen IANA sınırlaması:', bilinen);
    expect(hatalar).toEqual([]);
    expect(bilinen.length).toBeLessThan(GOLD.vakalar.length * 0.03);
  });

  it('gezegenler 1″, yükselen/MC/evler 1′ tolerans içinde', async () => {
    const hatalar = [];
    for (const v of GOLD.vakalar) {
      if (bilinenSinirlama(v)) continue;
      const z = yereldenUtc(v.girdi, v.girdi.tz);
      const h = await haritaHesapla({ utcMs: z.utcMs, enlem: v.girdi.enlem, boylam: v.girdi.boylam, evSistemi: 'placidus' }, WASM);
      for (const [k, [lon, hiz]] of Object.entries(v.beklenen.konum)) {
        if (fark(h.konumlar[k].lon, lon) > SANIYE) hatalar.push(`${v.etiket} ${k}: ${h.konumlar[k].lon} != ${lon}`);
        if (Math.sign(h.konumlar[k].hiz) !== Math.sign(hiz) && Math.abs(hiz) > 1e-6) hatalar.push(`${v.etiket} ${k} hız yönü`);
      }
      if (h.evler.sistem !== v.beklenen.evSistemi) hatalar.push(`${v.etiket}: ev sistemi ${h.evler.sistem}`);
      if (fark(h.evler.asc, v.beklenen.asc) > DAKIKA) hatalar.push(`${v.etiket} asc`);
      if (fark(h.evler.mc, v.beklenen.mc) > DAKIKA) hatalar.push(`${v.etiket} mc`);
      v.beklenen.cusps.forEach((c, i) => { if (fark(h.evler.cusps[i], c) > DAKIKA) hatalar.push(`${v.etiket} ev ${i + 1}`); });
    }
    expect(hatalar.slice(0, 10)).toEqual([]);
  });
});

describe('ev yerleşimi ve analiz', () => {
  it('evBul sınırları doğru, 0° geçişi dahil', () => {
    const cusps = [350, 20, 50, 80, 110, 140, 170, 200, 230, 260, 290, 320];
    expect(evBul(355, cusps)).toBe(1);
    expect(evBul(5, cusps)).toBe(1);
    expect(evBul(20, cusps)).toBe(2);
    expect(evBul(349.9, cusps)).toBe(12);
  });
  it('onurlar', () => {
    expect(onur('gunes', 125)).toBe('ev');      // Aslan
    expect(onur('gunes', 15)).toBe('yucelim');   // Koç
    expect(onur('gunes', 195)).toBe('dusus');    // Terazi
    expect(onur('ay', 285)).toBe('zarar');       // Oğlak
  });
  it('açı tespiti, orb ve yaklaşma', () => {
    const k = { gunes: { lon: 10, hiz: 1 }, ay: { lon: 101, hiz: 13 }, merkur: { lon: 200, hiz: 1 }, venus: { lon: 300, hiz: 1 }, mars: { lon: 50, hiz: 0.5 },
      jupiter: { lon: 130, hiz: 0.1 }, saturn: { lon: 250, hiz: 0.05 }, uranus: { lon: 160, hiz: 0.01 }, neptun: { lon: 220, hiz: 0.01 }, pluton: { lon: 280, hiz: 0.01 } };
    const a = acilar(k);
    const ga = a.find((x) => x.a === 'gunes' && x.b === 'ay');
    expect(ga.aci).toBe('kare');
    expect(ga.orb).toBeCloseTo(1, 5);
    expect(ga.yaklasan).toBe(false); // Ay hızla uzaklaşıyor
    expect(a.find((x) => x.a === 'gunes' && x.b === 'jupiter')?.aci).toBe('ucgen');
  });
  it('kalıplar: T-kare ve büyük üçgen', () => {
    const k = { gunes: { lon: 0 }, ay: { lon: 180 }, merkur: { lon: 90 }, venus: { lon: 240 }, mars: { lon: 120 },
      jupiter: { lon: 1 }, saturn: { lon: 45 }, uranus: { lon: 300 }, neptun: { lon: 205 }, pluton: { lon: 330 } };
    for (const g of Object.values(k)) g.hiz = 0.1;
    const t = kaliplar(k, acilar(k)).map((x) => x.tip);
    expect(t).toContain('t-kare');
    expect(t).toContain('buyuk-ucgen');
  });
  it('gerçek harita analizi çalışır ve tutarlı', async () => {
    const z = yereldenUtc({ yil: 1990, ay: 6, gun: 1, saat: 14, dakika: 30 }, 'Europe/Istanbul');
    const h = await haritaHesapla({ utcMs: z.utcMs, enlem: 41.01384, boylam: 28.94966, evSistemi: 'placidus' }, WASM);
    const a = analiz(h);
    expect(burc(h.konumlar.gunes.lon).key).toBe('ikizler');
    expect(a.acilar.length).toBeGreaterThan(5);
    expect(Object.values(a.denge.element).reduce((x, y) => x + y)).toBeCloseTo(a.denge.toplam);
    expect(a.yonetici).toBeTruthy();
    expect(a.baskinlik.sira).toHaveLength(10);
    expect(h.sans).toBeGreaterThanOrEqual(0);
    expect(derece(h.evler.asc).yazi).toMatch(/°/);
  });
  it('saat bilinmiyorsa ev yok, Ay aralığı var', async () => {
    const h = await haritaHesapla({ utcMs: Date.UTC(1990, 5, 1, 9), enlem: 41, boylam: 29, saatBilinmiyor: true }, WASM);
    expect(h.evler).toBeUndefined();
    expect(h.ayAraligi).toHaveLength(2);
  });
  it('sonraki dolunay ve yeni ay bulunur', async () => {
    // 2026-11-16 sonrası: dolunay 24 Kasım 2026 civarı, yeni ay 9 Aralık civarı
    const t = Date.UTC(2026, 10, 16);
    const dolunay = await sonrakiEvre(t, 180, WASM);
    const yeniAy = await sonrakiEvre(t, 0, WASM);
    expect(dolunay).toBeGreaterThan(t);
    expect(dolunay - t).toBeLessThan(30 * 864e5);
    expect(yeniAy - t).toBeLessThan(30 * 864e5);
    expect(Math.abs(dolunay - yeniAy)).toBeGreaterThan(10 * 864e5);
  });
});
