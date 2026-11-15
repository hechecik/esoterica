import { describe, it, expect } from 'vitest';
import { FIGURES, FIGURE_KEYS, figureFromRows, addFigures, contraryFigure, invertedFigure } from '../src/engine/remil/figures.js';
import { castChart, perfection, rotateHouse, adjacent, TOPIC_HOUSES } from '../src/engine/remil/chart.js';

describe('şekiller', () => {
  it('16 farklı şekil vardır ve satırları benzersizdir', () => {
    expect(FIGURE_KEYS).toHaveLength(16);
    const rows = new Set(FIGURE_KEYS.map((k) => FIGURES[k].rows.join('')));
    expect(rows.size).toBe(16);
  });

  it('nokta sayıları satırlarla tutarlıdır', () => {
    for (const k of FIGURE_KEYS) {
      const sum = FIGURES[k].rows.reduce((a, b) => a + b, 0);
      expect(sum).toBe(FIGURES[k].points);
    }
  });

  it('toplama işlemi klasik örneklerle uyuşur', () => {
    expect(addFigures('populus', 'via')).toBe('via');
    expect(addFigures('via', 'via')).toBe('populus');
    expect(addFigures('puer', 'tristitia')).toBe('fortunaMinor');
    expect(addFigures('carcer', 'carcer')).toBe('populus');
  });

  it('zıt ve ters şekiller', () => {
    expect(contraryFigure('via')).toBe('populus');
    expect(contraryFigure('fortunaMajor')).toBe('fortunaMinor');
    expect(invertedFigure('caputDraconis')).toBe('caudaDraconis');
    expect(invertedFigure('puer')).toBe('puella');
    expect(figureFromRows([1, 2, 1, 1])).toBe('puella');
  });
});

describe('kabul tablosu 1 (yolculuk)', () => {
  const counts = [11, 5, 10, 1, 2, 16, 12, 11, 12, 14, 19, 10, 11, 13, 14, 14];
  const chart = castChart(counts);

  it('ana şekiller', () => {
    expect(chart.mothers).toEqual(['puer', 'tristitia', 'albus', 'fortunaMinor']);
  });
  it('kızlar', () => {
    expect(chart.daughters).toEqual(['carcer', 'carcer', 'albus', 'fortunaMinor']);
  });
  it('torunlar', () => {
    expect(chart.nieces).toEqual(['fortunaMinor', 'caudaDraconis', 'populus', 'caudaDraconis']);
  });
  it('tanıklar, hâkim ve uzlaştırıcı', () => {
    expect(chart.witnesses).toEqual({ right: 'albus', left: 'caudaDraconis' });
    expect(chart.judge).toBe('fortunaMinor');
    expect(chart.reconciler).toBe('tristitia');
  });
  it('1. ve 9. hane arasında Atebe-i hâric üzerinden nakil vardır', () => {
    const p = perfection(chart, 1, 9);
    expect(p.occupation).toBe(false);
    expect(p.translation).not.toBeNull();
    expect(p.translation.figure).toBe('caudaDraconis');
    expect(p.perfects).toBe(true);
  });
  it('Nusretü’l-hâric tabloda 3 kez geçer (hane 4, 8, 9)', () => {
    expect(chart.houses.filter((f) => f === 'fortunaMinor')).toHaveLength(3);
  });
});

describe('kabul tablosu 2 (sınav)', () => {
  const counts = [3, 11, 8, 13, 16, 8, 12, 8, 12, 19, 11, 16, 9, 11, 6, 13];
  const chart = castChart(counts);

  it('ana şekiller', () => {
    expect(chart.mothers).toEqual(['puer', 'populus', 'conjunctio', 'puer']);
  });
  it('kızlar', () => {
    expect(chart.daughters).toEqual(['carcer', 'puella', 'albus', 'carcer']);
  });
  it('torunlar', () => {
    expect(chart.nieces).toEqual(['puer', 'puella', 'albus', 'puella']);
  });
  it('tanıklar, hâkim ve uzlaştırıcı', () => {
    expect(chart.witnesses).toEqual({ right: 'conjunctio', left: 'carcer' });
    expect(chart.judge).toBe('via');
    expect(chart.reconciler).toBe('albus');
  });
  it('1. ve 9. hanede Cevdele: işgal', () => {
    const p = perfection(chart, 1, 9);
    expect(p.occupation).toBe(true);
    expect(p.perfects).toBe(true);
  });
  it('10. hane (sonuç) Nakiyyü’l-hadd', () => {
    expect(chart.houses[9]).toBe('puella');
  });
});

describe('tablo kuralları', () => {
  it('her tabloda hâkimin nokta toplamı çifttir (rastgele 2000 deneme)', () => {
    let seed = 12345;
    const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648);
    for (let t = 0; t < 2000; t++) {
      const counts = Array.from({ length: 16 }, () => 1 + (rnd() % 30));
      const chart = castChart(counts);
      expect(FIGURES[chart.judge].points % 2).toBe(0);
      expect(chart.houses).toHaveLength(12);
    }
  });

  it('16 dışında satır sayısı reddedilir', () => {
    expect(() => castChart([1, 2, 3])).toThrow();
    expect(() => castChart(Array(16).fill(0))).toThrow();
  });

  it('hane döndürme ve komşuluk', () => {
    expect(rotateHouse(3, 2)).toBe(4);
    expect(rotateHouse(7, 7)).toBe(1);
    expect(rotateHouse(11, 5)).toBe(3);
    expect(adjacent(12, 1)).toBe(true);
    expect(adjacent(1, 3)).toBe(false);
  });

  it('konu-hane eşlemesi', () => {
    expect(TOPIC_HOUSES.sinav[0]).toBe(9);
    expect(TOPIC_HOUSES.ask[0]).toBe(7);
  });
});
