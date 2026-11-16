import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { BUYUK, TAKIM, PIP, SARAY, LEN, LEN_KOSE, RUN, ISK_TAKIM, ISK_PIP } from '../src/ui/kart-sanati.js';

const J = (n) => JSON.parse(readFileSync(new URL(`../src/content/generated/${n}.json`, import.meta.url)));

describe('kart sanatı eksiksiz', () => {
  it('22 büyük arkana amblemi', () => {
    for (let i = 0; i <= 21; i++) expect(BUYUK[i], `amblem ${i}`).toMatch(/<(path|circle|ellipse)/);
  });
  it('takım, pip ve saray işaretleri', () => {
    for (const t of ['asa', 'kupa', 'kilic', 'tilsim']) expect(TAKIM[t]).toBeTruthy();
    for (let n = 1; n <= 10; n++) expect(PIP[n]).toHaveLength(n);
    for (let n = 2; n <= 10; n++) expect(ISK_PIP[n]).toHaveLength(n);
    for (const r of [11, 12, 13, 14]) expect(SARAY[r]).toBeTruthy();
    for (const t of ['kupa', 'karo', 'sinek', 'maca']) expect(ISK_TAKIM[t]).toBeTruthy();
  });
  it('36 Lenormand ikonu ve köşesi', () => {
    for (const k of J('lenormand').kartlar) { expect(LEN[k.no]).toBeTruthy(); expect(LEN_KOSE[k.no]).toHaveLength(2); }
    const koseler = Object.values(LEN_KOSE).map((x) => x.join(''));
    expect(new Set(koseler).size).toBe(36);
  });
  it('her rünün çizimi var', () => {
    for (const r of J('run').runler) expect(r.key in RUN).toBe(true);
  });
  it('SVG yollarında NaN yok', () => {
    const hepsi = JSON.stringify([BUYUK, LEN, RUN, TAKIM, SARAY]);
    expect(hepsi).not.toMatch(/NaN|undefined/);
  });
});
