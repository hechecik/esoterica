import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { seeded } from '../src/engine/random/index.js';
import { kartCek, ichingOku, numeroloji, yildizname, cinBurcu, cinUyum } from '../src/engine/fal/motorlar.js';
import {
  tarotDeste, tarotYorum, lenormandYorum, runYorum, iskambilDeste, iskambilYorum,
  ichingYorum, sembolAra, kahveYorum, ruyaYorum, numerolojiYorum, yildiznameYorum, cinYorum,
} from '../src/engine/interpret/fal.js';

const J = (n) => JSON.parse(readFileSync(new URL(`../src/content/generated/${n}.json`, import.meta.url)));
const rnd = (s) => seeded(s).int;
const bos = (o) => JSON.stringify(o).includes('{') && /\{[a-zA-Z]+\}/.test(JSON.stringify(o));

describe('tarot', () => {
  const c = J('tarot');
  const deste = tarotDeste(c);
  it('78 benzersiz kart, adlar düzgün', () => {
    expect(deste).toHaveLength(78);
    expect(new Set(deste.map((k) => k.id)).size).toBe(78);
    expect(deste.find((k) => k.id === 'kupa-1').ad).toBe('Kupa ası');
    expect(deste.find((k) => k.id === 'kilic-13').ad).toBe('Kılıçların kraliçesi');
    expect(deste.find((k) => k.id === 'asa-3').ad).toBe('Asa üçlüsü');
  });
  it('her açılım her konu için eksiksiz yorum üretir', () => {
    for (const [key, ac] of Object.entries(c.acilimlar)) for (const konu of ['genel', 'ask', 'is']) {
      const cekilen = kartCek(deste, ac.pozisyonlar.length, { tersOlasiligi: 0.3, rnd: rnd(key + konu) });
      const y = tarotYorum({ cekilen, acilimKey: key, konu, c, seed: 'x' });
      expect(y.pozisyonlar).toHaveLength(ac.pozisyonlar.length);
      for (const p of y.pozisyonlar) expect(p.ana.length).toBeGreaterThan(20);
      expect(bos(y)).toBe(false);
    }
  });
  it('aynı tohum aynı metni verir', () => {
    const cekilen = kartCek(deste, 3, { rnd: rnd('a') });
    expect(tarotYorum({ cekilen, acilimKey: 'uc', c, seed: 's' })).toEqual(tarotYorum({ cekilen, acilimKey: 'uc', c, seed: 's' }));
  });
});

describe('lenormand, rün, iskambil', () => {
  it('lenormand 3x3 çiftleri', () => {
    const c = J('lenormand');
    const cekilen = kartCek(c.kartlar, 9, { rnd: rnd('l') }).map((x) => x.kart);
    const y = lenormandYorum({ cekilen, acilimKey: 'dokuz', c, seed: 1 });
    expect(y.ciftler).toHaveLength(8);
    expect(bos(y)).toBe(false);
  });
  it('simetrik rün ters okunmaz', () => {
    const c = J('run');
    const isa = c.runler.find((r) => r.key === 'isa');
    const y = runYorum({ cekilen: [{ kart: isa, ters: true }], acilimKey: 'tek', c });
    expect(y.pozisyonlar[0].ters).toBe(false);
    expect(y.pozisyonlar[0].metin).toBe(isa.duz);
  });
  it('iskambil 52 kart ve katina açılımı', () => {
    const c = J('iskambil');
    const d = iskambilDeste(c);
    expect(d).toHaveLength(52);
    const cekilen = kartCek(d, 7, { rnd: rnd('i') }).map((x) => x.kart);
    const y = iskambilYorum({ cekilen, acilimKey: 'yedi', c });
    expect(y.pozisyonlar).toHaveLength(7);
    expect(y.genel.length).toBeGreaterThan(0);
  });
});

describe('I Ching', () => {
  const c = J('iching');
  it('değişen çizgisiz okuma', () => {
    const y = ichingYorum(ichingOku([7, 7, 7, 7, 7, 7]), c);
    expect(y.birincil.no).toBe(1);
    expect(y.donusen).toBeNull();
  });
  it('tüm yang değişirse Alıcı olur', () => {
    const y = ichingYorum(ichingOku([9, 9, 9, 9, 9, 9]), c);
    expect(y.donusen.no).toBe(2);
    expect(y.degisen).toHaveLength(6);
  });
  it('64 heksagramın hepsi bulunur', () => {
    const r = seeded('ic');
    for (let i = 0; i < 400; i++) {
      const v = Array.from({ length: 6 }, () => [6, 7, 8, 9][r.int(4)]);
      const y = ichingYorum(ichingOku(v), c);
      expect(y.birincil.ad).toBeTruthy();
    }
  });
});

describe('kahve ve rüya', () => {
  it('kahve sembol arama Türkçe', () => {
    const c = J('kahve');
    expect(sembolAra(c.semboller, 'kuş')[0].key).toBe('kus');
    expect(sembolAra(c.semboller, 'güvercin').map((s) => s.key)).toContain('guvercin');
  });
  it('kahve yorumu bölge sırasıyla', () => {
    const c = J('kahve');
    const y = kahveYorum({ secimler: [{ key: 'balik', bolge: 'tabak' }, { key: 'kus', bolge: 'sap' }, { key: 'yol', bolge: 'kenar' }], c, seed: 1 });
    expect(y.bolumler[0].sembol.key).toBe('kus');
    expect(y.bolumler.at(-1).sembol.key).toBe('balik');
    expect(y.genel).toContain(c.genel.yollar);
    expect(bos(y)).toBe(false);
  });
  it('rüya çoklu sembol', () => {
    const c = J('ruya');
    const y = ruyaYorum({ keys: ['su', 'yilan', 'ev'], duygu: 'korku', c, seed: 1 });
    expect(y.semboller).toHaveLength(3);
    expect(y.sentez[0]).toMatch(/su, yılan ve ev/);
  });
});

describe('numeroloji, yıldızname, Çin', () => {
  it('numeroloji yorumu', () => {
    const c = J('numeroloji');
    const s = numeroloji('Ayşe Yılmaz', { yil: 1990, ay: 5, gun: 17 }, new Date(2026, 10, 16));
    const y = numerolojiYorum(s, c);
    expect(y.cekirdek).toHaveLength(5);
    for (const x of [...y.cekirdek, ...y.donem]) expect(x.metin.length).toBeGreaterThan(10);
  });
  it('yıldızname', () => {
    const y = yildiznameYorum(yildizname('Ali', 'Fatma'), J('yildizname'));
    expect(y.veri.metin).toBeTruthy();
  });
  it('Çin burcu ve uyum', () => {
    const y = cinYorum(cinBurcu(new Date(Date.UTC(1990, 5, 1))), J('cin'), 'kopek', cinUyum);
    expect(y.hayvanAd).toBe('At');
    expect(y.uyum.metin).toMatch(/uyumlu/);
  });
});
