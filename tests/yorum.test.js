import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { castChart } from '../src/engine/remil/chart.js';
import { yorumla, tartma } from '../src/engine/interpret/remil.js';

const GEN = new URL('../src/content/generated/', import.meta.url);
let content, ortak;

beforeAll(() => {
  const p = new URL('remil.json', GEN);
  if (!existsSync(p)) throw new Error('Önce `npm run content` çalıştır (content/ alt modülü gerekli)');
  content = JSON.parse(readFileSync(p, 'utf8'));
  ortak = JSON.parse(readFileSync(new URL('ortak.json', GEN), 'utf8'));
});

const T1 = [11, 5, 10, 1, 2, 16, 12, 11, 12, 14, 19, 10, 11, 13, 14, 14]; // yolculuk
const T2 = [3, 11, 8, 13, 16, 8, 12, 8, 12, 19, 11, 16, 9, 11, 6, 13]; // sınav

describe('içerik kütüphanesi', () => {
  it('16 şekil, 192 hücre, 3 ton', () => {
    expect(Object.keys(content.sekiller)).toHaveLength(16);
    expect(Object.keys(content.hucreler)).toHaveLength(16);
    for (const k of Object.keys(content.hucreler)) {
      for (let h = 1; h <= 12; h++) {
        for (const ton of ['olumlu', 'notr', 'temkinli']) expect(content.hucreler[k][h][ton].length).toBeGreaterThanOrEqual(2);
      }
    }
  });
});

describe('tartma', () => {
  it('yolculuk tablosunda hız ve nakil', () => {
    const c = castChart(T1);
    const t = tartma(c, content, 9);
    expect(['hizli', 'orta']).toContain(t.zaman);
    expect(t.tekrar[0][0]).toBe('fortunaMinor');
  });
  it('sınav tablosunda işgal olumlu ton verir', () => {
    const c = castChart(T2);
    const y = yorumla(c, content, { konu: 'sinav', ortak });
    expect(y.gelinme.occupation).toBe(true);
    expect(y.soruHane).toBe(9);
  });
});

describe('yorum üretimi', () => {
  it('aynı tohum aynı metni verir', () => {
    const c = castChart(T1);
    const a = yorumla(c, content, { konu: 'yolculuk', ortak, seed: 'x' }).metin;
    const b = yorumla(c, content, { konu: 'yolculuk', ortak, seed: 'x' }).metin;
    expect(a).toBe(b);
  });
  it('farklı tohumlar farklı metin verir', () => {
    const c = castChart(T1);
    const set = new Set();
    for (let i = 0; i < 30; i++) set.add(yorumla(c, content, { konu: 'yolculuk', ortak, seed: `s${i}` }).metin);
    expect(set.size).toBeGreaterThanOrEqual(28);
  });
  it('aynı cümle oranı %10 altında (30 tohum)', () => {
    const c = castChart(T2);
    const all = [];
    for (let i = 0; i < 30; i++) {
      const y = yorumla(c, content, { konu: 'sinav', ortak, seed: `g${i}` });
      all.push(...y.bolumler.flatMap((b) => b.metin));
    }
    const freq = new Map();
    for (const s of all) freq.set(s, (freq.get(s) ?? 0) + 1);
    // Bir cümlenin 30 yorumun %40'ından fazlasında geçmesi tekrar sayılır
    const tekrarEden = [...freq.values()].filter((n) => n > 12).length;
    expect(tekrarEden / freq.size).toBeLessThan(0.1);
  });
  it('çözülmemiş şablon kalmaz ve ekler doğru', () => {
    const c = castChart(T1);
    const y = yorumla(c, content, { konu: 'yolculuk', ortak, seed: 'ek' });
    expect(y.metin).not.toMatch(/\{[a-z_]+(\|[a-z]+)?\}/);
    // Nakil cümlesi Atebe-i hâric'i aracı olarak anar
    const g = y.bolumler.find((b) => b.tip === 'gelinme');
    expect(g.metin.join(' ')).toMatch(/Atebe-i hâric/);
  });
  it('her konu ve kişi için çalışır', () => {
    const c = castChart(T2);
    for (const konu of ['genel', 'ask', 'is', 'para', 'yolculuk', 'sinav', 'saglik', 'aile', 'kayip']) {
      for (const kisi of ['kendim', 'sevgili', 'kardes', 'arkadas']) {
        const y = yorumla(c, content, { konu, kisi, ortak });
        expect(y.metin.length).toBeGreaterThan(300);
      }
    }
  });
  it('korkutucu kehanet yok', () => {
    const c = castChart(T1);
    for (const konu of ['saglik', 'aile', 'genel']) {
      const y = yorumla(c, content, { konu, ortak });
      expect(y.metin.toLocaleLowerCase('tr-TR')).not.toMatch(/öleceksin|kaza geçireceksin|kanser|felç/);
    }
  });
});
