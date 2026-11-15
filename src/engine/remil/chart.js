// Remil kalkan tablosu ve hane tablosu hesabı.
// Girdi: 16 satırın nokta/çizgi sayıları (ya da doğrudan 16 parite değeri).
// Çıktı: ana şekiller, kızlar, torunlar, tanıklar, hâkim, uzlaştırıcı,
// 12 hane ve gelinme (perfection) tespitleri.

import { FIGURES, figureFromRows, addFigures, parity } from './figures.js';

/**
 * 16 satır sayısından (ya da 1/2 paritelerinden) tam tabloyu kurar.
 * @param {number[]} counts  16 pozitif tam sayı
 */
export function castChart(counts) {
  if (!Array.isArray(counts) || counts.length !== 16) {
    throw new Error('Remil için tam 16 satır gerekir');
  }
  const bits = counts.map(parity);

  // Ana şekiller (ümmehât): her 4 satır bir şekil, yukarıdan aşağı
  const mothers = [0, 1, 2, 3].map((i) => figureFromRows(bits.slice(i * 4, i * 4 + 4)));

  // Kızlar (benât): anaların satırları yatay okunur
  const daughters = [0, 1, 2, 3].map((row) =>
    figureFromRows(mothers.map((m) => FIGURES[m].rows[row])),
  );

  // Torunlar (hafîdât / nieces)
  const nieces = [
    addFigures(mothers[0], mothers[1]),
    addFigures(mothers[2], mothers[3]),
    addFigures(daughters[0], daughters[1]),
    addFigures(daughters[2], daughters[3]),
  ];

  const rightWitness = addFigures(nieces[0], nieces[1]);
  const leftWitness = addFigures(nieces[2], nieces[3]);
  const judge = addFigures(rightWitness, leftWitness);
  const reconciler = addFigures(judge, mothers[0]);

  // Geometrik kontrol: hâkimin nokta toplamı daima çifttir
  if (FIGURES[judge].points % 2 !== 0) {
    throw new Error('Tutarsız tablo: hâkimin nokta toplamı tek çıktı');
  }

  const houses = [...mothers, ...daughters, ...nieces]; // 1..12 -> index 0..11

  const chart = {
    bits,
    mothers,
    daughters,
    nieces,
    witnesses: { right: rightWitness, left: leftWitness },
    judge,
    reconciler,
    houses,
    counts: countFigures(houses, judge, rightWitness, leftWitness),
  };
  chart.wayOfThePoint = wayOfThePoint(chart);
  return chart;
}

/** Her şeklin 12 hanede kaç kez geçtiği. */
export function countFigures(houses, ...extra) {
  const map = {};
  for (const f of [...houses, ...extra]) map[f] = (map[f] || 0) + 1;
  return map;
}

/**
 * Noktanın yolu (Via Puncti): hâkimin başı tek ise, tek başlı şekiller
 * boyunca köke doğru izlenir. Sonuç: izlenen hane dizisi ya da boş dizi.
 */
export function wayOfThePoint(chart) {
  const head = (k) => FIGURES[k].rows[0];
  if (head(chart.judge) !== 1) return [];
  const path = [{ level: 'hakim', key: chart.judge }];
  const ws = [
    { level: 'tanik', pos: 'sag', key: chart.witnesses.right, from: [chart.nieces[0], chart.nieces[1]], idx: [8, 9] },
    { level: 'tanik', pos: 'sol', key: chart.witnesses.left, from: [chart.nieces[2], chart.nieces[3]], idx: [10, 11] },
  ].filter((w) => head(w.key) === 1);
  for (const w of ws) {
    path.push({ level: w.level, pos: w.pos, key: w.key });
    w.from.forEach((n, i) => {
      if (head(n) === 1) path.push({ level: 'torun', house: w.idx[i] + 1, key: n });
    });
  }
  // Torunlardan ana ve kızlara iniş
  const nieceSources = [[1, 2], [3, 4], [5, 6], [7, 8]]; // hane numaraları
  for (const step of [...path]) {
    if (step.level !== 'torun') continue;
    const src = nieceSources[step.house - 9];
    for (const h of src) {
      const k = chart.houses[h - 1];
      if (k && head(k) === 1) path.push({ level: h <= 4 ? 'ana' : 'kiz', house: h, key: k });
    }
  }
  return path;
}

/** Hane numarasını dairede 1..12 aralığına katlar. */
export function wrapHouse(n) {
  return ((n - 1) % 12 + 12) % 12 + 1;
}

/**
 * Üçüncü kişi için hane döndürme: "base" hanesi o kişinin 1. hanesi olur.
 * Örnek: kardeş (3) için 2. hane (para) -> rotateHouse(3, 2) = 4
 */
export function rotateHouse(base, n) {
  return wrapHouse(base + n - 1);
}

export function adjacent(a, b) {
  const d = Math.abs(wrapHouse(a) - wrapHouse(b));
  return d === 1 || d === 11;
}

/**
 * Gelinme (perfection) tespiti.
 * @param {object} chart castChart çıktısı
 * @param {number} querentHouse genelde 1
 * @param {number} quesitedHouse soru konusunun hanesi
 */
export function perfection(chart, querentHouse, quesitedHouse) {
  const H = chart.houses;
  const fq = H[wrapHouse(querentHouse) - 1];
  const fs = H[wrapHouse(quesitedHouse) - 1];
  const result = { occupation: false, conjunction: null, mutation: null, translation: null, perfects: false };

  if (fq === fs) result.occupation = true;

  // Kavuşma: soranın şekli sorulan hanenin yanında, ya da sorulanın şekli soranın yanında
  for (let h = 1; h <= 12; h++) {
    if (h === querentHouse || h === quesitedHouse) continue;
    if (H[h - 1] === fq && adjacent(h, quesitedHouse)) {
      result.conjunction = { mover: 'querent', house: h };
      break;
    }
    if (H[h - 1] === fs && adjacent(h, querentHouse)) {
      result.conjunction = { mover: 'quesited', house: h };
      break;
    }
  }

  // Mutasyon: iki şekil tabloda başka bir yerde yan yana
  if (fq !== fs) {
    for (let h = 1; h <= 12; h++) {
      const next = wrapHouse(h + 1);
      const pair = [H[h - 1], H[next - 1]];
      const involved = [h, next].some((x) => x === querentHouse || x === quesitedHouse);
      if (!involved && ((pair[0] === fq && pair[1] === fs) || (pair[0] === fs && pair[1] === fq))) {
        result.mutation = { houses: [h, next] };
        break;
      }
    }
  }

  // Nakil: üçüncü bir şekil hem sorana hem sorulana bitişik
  for (let h = 1; h <= 12; h++) {
    const f = H[h - 1];
    if (f === fq || f === fs) continue;
    const nearQ = [1, -1].some((d) => H[wrapHouse(h + d) - 1] === fq && wrapHouse(h + d) !== quesitedHouse && adjacent(h, wrapHouse(h + d)));
    const nearS = [1, -1].some((d) => H[wrapHouse(h + d) - 1] === fs && wrapHouse(h + d) !== querentHouse && adjacent(h, wrapHouse(h + d)));
    // Klasik tanım: aynı üçüncü şekil, sorana bitişik bir hanede VE sorulana bitişik bir hanede bulunur
    if (nearQ && nearS) {
      result.translation = { figure: f, house: h };
      break;
    }
  }
  if (!result.translation) {
    // Daha geniş tanım: aynı üçüncü şekil, biri sorana biri sorulana bitişik iki ayrı hanede
    for (const f of new Set(H)) {
      if (f === fq || f === fs) continue;
      const atQ = [];
      const atS = [];
      for (let h = 1; h <= 12; h++) {
        if (H[h - 1] !== f) continue;
        if (adjacent(h, querentHouse)) atQ.push(h);
        if (adjacent(h, quesitedHouse)) atS.push(h);
      }
      if (atQ.length && atS.length) {
        result.translation = { figure: f, houses: { querentSide: atQ[0], quesitedSide: atS[0] } };
        break;
      }
    }
  }

  result.perfects = result.occupation || !!result.conjunction || !!result.mutation || !!result.translation;
  return result;
}

/** Soru konusu -> hane(ler). İlk eleman birincil hanedir. */
export const TOPIC_HOUSES = Object.freeze({
  genel: [1],
  ask: [7, 5],
  is: [10, 6],
  para: [2, 8],
  yolculuk: [9, 3],
  sinav: [9, 10],
  saglik: [6, 1],
  aile: [4, 3],
  kayip: [2, 4],
  ev: [4],
  dostluk: [11],
  gizli: [12],
});

/** Kimin için bakıldığı -> taban hanesi (döndürme için). */
export const PERSON_HOUSES = Object.freeze({
  kendim: 1,
  kardes: 3,
  ebeveyn: 4,
  cocuk: 5,
  es: 7,
  sevgili: 7,
  arkadas: 11,
  is_arkadasi: 6,
  baska: 7,
});
