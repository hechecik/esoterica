import { describe, it, expect } from 'vitest';
import { seeded } from '../src/engine/random/index.js';
import {
  karistir, kartCek, heksagram, ichingOku, cizgiAt, indirge, numeroloji, ebced, yildizname, cinBurcu, cinUyum, kriptoTam,
} from '../src/engine/fal/motorlar.js';

const rndTohum = (s) => seeded(s).int;

describe('deste', () => {
  it('karıştırma permütasyondur', () => {
    const a = Array.from({ length: 78 }, (_, i) => i);
    const b = karistir(a, rndTohum('x'));
    expect([...b].sort((x, y) => x - y)).toEqual(a);
    expect(b).not.toEqual(a);
  });
  it('kriptoTam aralıkta ve dağılımı makul', () => {
    const say = new Array(6).fill(0);
    for (let i = 0; i < 6000; i++) say[kriptoTam(6)]++;
    for (const s of say) expect(s).toBeGreaterThan(800);
  });
  it('kart çekme: tekrar yok, ters olasılığı', () => {
    const k = Array.from({ length: 78 }, (_, i) => ({ id: i }));
    const c = kartCek(k, 10, { tersOlasiligi: 0.5, rnd: rndTohum('y') });
    expect(new Set(c.map((x) => x.kart.id)).size).toBe(10);
    expect(kartCek(k, 10, { rnd: rndTohum('z') }).every((x) => !x.ters)).toBe(true);
  });
});

describe('I Ching', () => {
  it('King Wen tablosu 1-64 her birini bir kez içerir', () => {
    const set = new Set();
    for (let n = 0; n < 64; n++) set.add(heksagram([0, 1, 2, 3, 4, 5].map((i) => (n >> i) & 1)).no);
    expect(set.size).toBe(64);
  });
  it('bilinen heksagramlar', () => {
    expect(heksagram([1, 1, 1, 1, 1, 1]).no).toBe(1);
    expect(heksagram([0, 0, 0, 0, 0, 0]).no).toBe(2);
    expect(heksagram([1, 1, 1, 0, 0, 0]).no).toBe(11); // Yer üstte, Gök altta: Barış
    expect(heksagram([1, 0, 1, 0, 1, 0]).no).toBe(63); // Su üstte, Ateş altta
    expect(heksagram([1, 0, 0, 0, 1, 0]).no).toBe(3);
  });
  it('değişen çizgiler dönüşen heksagramı verir', () => {
    const o = ichingOku([9, 7, 7, 7, 7, 7]);
    expect(o.birincil.no).toBe(1);
    expect(o.degisen).toEqual([1]);
    expect(o.donusen.no).toBe(44);
    expect(ichingOku([7, 8, 7, 8, 7, 8]).donusen).toBeNull();
  });
  it('para ve civanperçemi olasılıkları', () => {
    const r = rndTohum('iching');
    const say = (y) => { const c = { 6: 0, 7: 0, 8: 0, 9: 0 }; for (let i = 0; i < 16000; i++) c[cizgiAt(y, r)]++; return c; };
    const p = say('para');
    expect(p[6] / 16000).toBeCloseTo(1 / 8, 1);
    expect(p[7] / 16000).toBeCloseTo(3 / 8, 1);
    const c = say('civanpercemi');
    expect(c[6] / 16000).toBeCloseTo(1 / 16, 1);
    expect(c[8] / 16000).toBeCloseTo(7 / 16, 1);
  });
});

describe('numeroloji', () => {
  it('indirgeme ve usta sayılar', () => {
    expect(indirge(29)).toBe(11);
    expect(indirge(1990)).toBe(1); // 1+9+9+0=19 -> 10 -> 1
    expect(indirge(38)).toBe(11);
    expect(indirge(38, false)).toBe(2);
  });
  it('Türkçe harflerle hesap', () => {
    const n = numeroloji('Şule Çağlar', { yil: 1990, ay: 6, gun: 1 }, new Date(2026, 10, 16));
    expect(n.yasamYolu).toBe(indirge(indirge(1) + indirge(6) + indirge(1990)));
    expect(n.ifade).toBeGreaterThan(0);
    expect(n.ruh).toBeGreaterThan(0);
    expect(n.kisiselGun).toBeGreaterThanOrEqual(1);
    expect(n.kisiselGun).toBeLessThanOrEqual(9);
  });
});

describe('yıldızname', () => {
  it('ebced toplamı ve 12 kalanı', () => {
    expect(ebced('Ali')).toBe(1 + 30 + 10);
    const y = yildizname('Ali', 'Ayşe');
    expect(y.toplam).toBe(41 + (1 + 10 + 300 + 5));
    expect(y.yildiz).toBe(['koc', 'boga', 'ikizler', 'yengec', 'aslan', 'basak', 'terazi', 'akrep', 'yay', 'oglak', 'kova', 'balik'][(y.toplam % 12 || 12) - 1]);
  });
});

describe('Çin burcu', () => {
  it('ay yılı sınırları', () => {
    expect(cinBurcu(new Date('1990-01-20T12:00:00Z')).hayvan).toBe('yilan'); // 1989 Yılan
    expect(cinBurcu(new Date('1990-01-30T12:00:00Z')).hayvan).toBe('at');
    expect(cinBurcu(new Date('2026-02-18T12:00:00Z'))).toMatchObject({ hayvan: 'at', element: 'ates' });
    expect(cinBurcu(new Date('2000-02-06T12:00:00Z'))).toMatchObject({ hayvan: 'ejderha', element: 'metal' });
  });
  it('uyum', () => {
    expect(cinUyum('fare', 'ejderha')).toBe('uyumlu');
    expect(cinUyum('fare', 'at')).toBe('zit');
    expect(cinUyum('fare', 'okuz')).toBe('notr');
  });
});
