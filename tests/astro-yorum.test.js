import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { haritaHesapla, gokyuzu, motor } from '../src/engine/astro/efemeris.js';
import { analiz } from '../src/engine/astro/analiz.js';
import { yereldenUtc } from '../src/engine/astro/zaman.js';
import { haritaYorumu, gunlukYorum, transitler, ayEvresi } from '../src/engine/interpret/astro.js';

const realFetch = globalThis.fetch;
globalThis.fetch = async (u, o) => {
  const s = String(u);
  if (s.startsWith('file:')) return new Response(readFileSync(new URL(s)), { headers: { 'content-type': 'application/wasm' } });
  return realFetch(u, o);
};
const WASM = new URL('../node_modules/@swisseph/browser/dist/swisseph.wasm', import.meta.url).href;
const C = JSON.parse(readFileSync(new URL('../src/content/generated/astroloji.json', import.meta.url), 'utf8'));
const GOLD = JSON.parse(readFileSync(new URL('./golden/astro.json', import.meta.url), 'utf8'));
const SABLON = /\{[a-zA-Z_]+(\|[a-z]+)?\}/;

beforeAll(async () => { await motor(WASM); });

async function harita(v, saatYok = false) {
  const z = yereldenUtc(v.girdi, v.girdi.tz);
  return haritaHesapla({ utcMs: z.utcMs, enlem: v.girdi.enlem, boylam: v.girdi.boylam, evSistemi: 'placidus', saatBilinmiyor: saatYok }, WASM);
}

describe('doğum haritası yorumu', () => {
  it('60 farklı haritada eksiksiz ve şablonsuz yorum', async () => {
    for (const v of GOLD.vakalar.slice(0, 60)) {
      const h = await harita(v);
      const y = haritaYorumu(h, analiz(h), C, { seed: v.etiket });
      expect(y.bolumler.length).toBeGreaterThanOrEqual(8);
      for (const b of y.bolumler) {
        expect(b.metin.length, `${v.etiket} ${b.tip}`).toBeGreaterThan(0);
        for (const m of b.metin) {
          expect(m, `${v.etiket} ${b.tip}`).toBeTruthy();
          expect(m).not.toMatch(SABLON);
        }
      }
    }
  });
  it('saat bilinmiyorsa evsiz yorum ve uyarı', async () => {
    const h = await harita(GOLD.vakalar[3], true);
    const y = haritaYorumu(h, analiz(h), C, { seed: 'x' });
    expect(y.bolumler.find((b) => b.tip === 'kariyer')).toBeUndefined();
    expect(y.metin).toMatch(/saat/i);
    expect(y.metin).not.toMatch(SABLON);
  });
  it('farklı tohumlar farklı metin, aynı tohum aynı metin', async () => {
    const h = await harita(GOLD.vakalar[5]);
    const a = analiz(h);
    const set = new Set();
    for (let i = 0; i < 10; i++) set.add(haritaYorumu(h, a, C, { seed: 's' + i }).metin);
    expect(set.size).toBeGreaterThanOrEqual(8);
    expect(haritaYorumu(h, a, C, { seed: 'q' }).metin).toBe(haritaYorumu(h, a, C, { seed: 'q' }).metin);
  });
});

describe('transitler ve günlük', () => {
  it('ay evresi sınırları', () => {
    const k = (ay, gunes) => ({ konumlar: { ay: { lon: ay }, gunes: { lon: gunes } } });
    expect(ayEvresi(k(10, 5)).key).toBe('yeni');
    expect(ayEvresi(k(185, 0)).key).toBe('dolunay');
    expect(ayEvresi(k(95, 0)).key).toBe('ilk_dordun');
    expect(ayEvresi(k(185, 0)).aydinlik).toBeGreaterThan(0.99);
  });
  it('doğum anında transit = doğum: tüm gezegenler kendi konumuna kavuşumda', async () => {
    const h = await harita(GOLD.vakalar[7]);
    const t = transitler(h, h);
    for (const g of ['gunes', 'ay', 'merkur', 'venus', 'mars']) expect(t.some((x) => x.transit === g && x.hedef === g && x.aci === 'kavusum')).toBe(true);
  });
  it('günlük yorum: doğum haritasıyla, yalnızca burçla ve hiçbir şey olmadan', async () => {
    const h = await harita(GOLD.vakalar[9]);
    const gok = await gokyuzu(Date.UTC(2026, 10, 16, 9), WASM);
    const a = gunlukYorum({ gok, natal: h, content: C, seed: '2026-11-16' });
    const b = gunlukYorum({ gok, gunesBurcu: 'akrep', content: C, seed: '2026-11-16' });
    const c = gunlukYorum({ gok, content: C, seed: '2026-11-16' });
    for (const g of [a, b, c]) {
      expect(g.ayMetin).toBeTruthy();
      expect(g.evreMetin).toBeTruthy();
      expect(Object.keys(g.alanlar)).toEqual(['kariyer', 'ask', 'ruh', 'para']);
      expect(JSON.stringify(g)).not.toMatch(SABLON);
    }
    expect(b.burcEvi.ev).toBeGreaterThanOrEqual(1);
    expect(a.ogut).toMatch(/:/);
  });
  it('30 gün boyunca günlük metinler tekrara düşmüyor', async () => {
    const h = await harita(GOLD.vakalar[11]);
    const metinler = [];
    for (let d = 0; d < 30; d++) {
      const gok = await gokyuzu(Date.UTC(2026, 10, 1 + d, 9), WASM);
      const g = gunlukYorum({ gok, natal: h, content: C, seed: `gun-${d}` });
      metinler.push([g.ayMetin, ...Object.values(g.alanlar), ...g.transitler.map((t) => t.metin)].join('|'));
    }
    expect(new Set(metinler).size).toBe(30);
  });
});
