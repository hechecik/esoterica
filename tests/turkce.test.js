import { describe, it, expect } from 'vitest';
import { ek, doldur, basHarf } from '../src/engine/interpret/turkce.js';
import { seeded, hashSeed } from '../src/engine/random/index.js';

describe('Türkçe ekler: özel isimler (remil ve astroloji terimleri)', () => {
  const cases = [
    ['Beyâz', 'in', "Beyâz'ın"],
    ['Beyâz', 'e', "Beyâz'a"],
    ['Beyâz', 'de', "Beyâz'da"],
    ['Ukle', 'in', "Ukle'nin"],
    ['Ukle', 'e', "Ukle'ye"],
    ['Ukle', 'i', "Ukle'yi"],
    ['Cevdele', 'den', "Cevdele'den"],
    ['İnkîs', 'in', "İnkîs'in"],
    ['İnkîs', 'de', "İnkîs'te"],
    ['Tarîk', 'in', "Tarîk'in"],
    ['Tarîk', 'de', "Tarîk'te"],
    ['Cemaat', 'in', "Cemaat'in"],
    ['Cemaat', 'de', "Cemaat'te"],
    ['Lihyan', 'e', "Lihyan'a"],
    ['Humre', 'le', "Humre'yle"],
    ['Satürn', 'in', "Satürn'ün"],
    ['Ay', 'in', "Ay'ın"],
    ['Güneş', 'de', "Güneş'te"],
    ['Merkür', 'e', "Merkür'e"],
    ['Jüpiter', 'den', "Jüpiter'den"],
    ['Koç', 'de', "Koç'ta"],
    ['Boğa', 'in', "Boğa'nın"],
    ['İçtimâ', 'in', "İçtimâ'nın"],
    ['Atebe-i hâric', 'in', "Atebe-i hâric'in"],
    ["Nusretü'l-hâric", 'e', "Nusretü'l-hâric'e"],
  ];
  for (const [w, t, out] of cases) {
    it(`${w} + ${t} = ${out}`, () => expect(ek(w, t)).toBe(out));
  }
});

describe('Türkçe ekler: cins isimler', () => {
  const cases = [
    ['kitap', 'i', 'kitabı'],
    ['ağaç', 'e', 'ağaca'],
    ['yol', 'de', 'yolda'],
    ['ev', 'den', 'evden'],
    ['sokak', 'de', 'sokakta'],
    ['sokak', 'e', 'sokağa'],
    ['at', 'i', 'atı'],
    ['top', 'i', 'topu'],
    ['sevinç', 'le', 'sevinçle'],
    ['para', 'in', 'paranın'],
    ['köprü', 'den', 'köprüden'],
    ['kapı', 'ler', 'kapılar'],
    ['gün', 'ler', 'günler'],
    ['hane', 'si', 'hanesi'],
    ['yol', 'si', 'yolu'],
    ['hane', 'ki', 'hanedeki'],
    ['sınav', 'dir', 'sınavdır'],
    ['güç', 'dir', 'güçtür'],
  ];
  for (const [w, t, out] of cases) {
    it(`${w} + ${t} = ${out}`, () => expect(ek(w, t, { ozel: false })).toBe(out));
  }
});

describe('Türkçe ekler: sayılar', () => {
  const cases = [
    [1, 'de', "1'de"],
    [2, 'de', "2'de"],
    [3, 'de', "3'te"],
    [4, 'de', "4'te"],
    [5, 'de', "5'te"],
    [6, 'de', "6'da"],
    [7, 'de', "7'de"],
    [8, 'de', "8'de"],
    [9, 'de', "9'da"],
    [10, 'de', "10'da"],
    [11, 'de', "11'de"],
    [12, 'de', "12'de"],
    [9, 'in', "9'un"],
    [6, 'in', "6'nın"],
    [7, 'e', "7'ye"],
    [10, 'e', "10'a"],
    [20, 'de', "20'de"],
    [100, 'de', "100'de"],
    [1000, 'de', "1000'de"],
  ];
  for (const [w, t, out] of cases) {
    it(`${w} + ${t} = ${out}`, () => expect(ek(w, t)).toBe(out));
  }
});

describe('şablon doldurma', () => {
  it('ek belirteci çalışır', () => {
    expect(doldur('{sekil|in} etkisi {hane|de} görülür.', { sekil: 'Beyâz', hane: 9 })).toBe("Beyâz'ın etkisi 9'da görülür.");
  });
  it('ek yoksa düz yazar, eksik değişkeni bırakır', () => {
    expect(doldur('{a} ve {b}', { a: 'x' })).toBe('x ve {b}');
  });
  it('baş harf', () => {
    expect(basHarf('işte')).toBe('İşte');
    expect(basHarf('ılık')).toBe('Ilık');
  });
});

describe('tohumlu üreteç', () => {
  it('aynı tohum aynı diziyi verir, farklı tohum farklı', () => {
    const a = seeded('esoterica-2026-11-15');
    const b = seeded('esoterica-2026-11-15');
    const c = seeded('esoterica-2026-11-16');
    const sa = Array.from({ length: 10 }, () => a.int(1000));
    const sb = Array.from({ length: 10 }, () => b.int(1000));
    const sc = Array.from({ length: 10 }, () => c.int(1000));
    expect(sa).toEqual(sb);
    expect(sa).not.toEqual(sc);
  });
  it('dağılım kabaca düzgündür', () => {
    const r = seeded('dagilim');
    const bins = new Array(10).fill(0);
    for (let i = 0; i < 20000; i++) bins[r.int(10)]++;
    for (const b of bins) expect(Math.abs(b - 2000)).toBeLessThan(200);
  });
  it('hash kararlıdır', () => {
    expect(hashSeed('a')).toEqual(hashSeed('a'));
    expect(hashSeed('a')).not.toEqual(hashSeed('b'));
  });
});
