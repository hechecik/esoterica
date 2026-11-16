#!/usr/bin/env node
// Şehir veritabanı: all-the-cities (MIT; veri GeoNames, CC BY 4.0).
// Türkiye: tüm yerleşimler (il, ilçe, kasaba); dünya: nüfusu 15.000 ve üstü.
// Saat dilimi derleme anında koordinattan bulunur (tz-lookup, CC0); çalışma anında gerekmez.
// Çıktı: src/content/generated/sehirler.json
//   { tz: [ ...IANA adları ], s: [[ad, ülke, il, enlem, boylam, tzIndex], ...] } (nüfusa göre sıralı)

import { writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const cities = require('all-the-cities');
const tzlookup = require('@photostructure/tz-lookup');

const OUT = new URL('../src/content/generated/', import.meta.url).pathname;
const DUNYA_ESIK = 15000;

// GeoNames'te ASCII yazılmış birkaç Türkçe ad
const AD_DUZELT = { 745044: 'İstanbul' };

// Türkiye il adları: aynı adminCode'daki il merkezi (PPLA ya da başkent PPLC)
const ilAdi = {};
for (const c of cities) {
  if (c.country === 'TR' && (c.featureCode === 'PPLA' || c.featureCode === 'PPLC')) ilAdi[c.adminCode] = AD_DUZELT[c.cityId] ?? c.name;
}

const tzList = [];
const tzIndex = new Map();
const tzId = (tz) => {
  if (!tzIndex.has(tz)) { tzIndex.set(tz, tzList.length); tzList.push(tz); }
  return tzIndex.get(tz);
};

const satirlar = [];
for (const c of cities) {
  const tr = c.country === 'TR';
  if (!tr && c.population < DUNYA_ESIK) continue;
  const [lon, lat] = c.loc.coordinates;
  let tz;
  try { tz = tzlookup(lat, lon); } catch { continue; }
  const ad = AD_DUZELT[c.cityId] ?? c.name;
  const il = tr ? (ilAdi[c.adminCode] ?? '') : '';
  satirlar.push([ad, c.country, il === ad ? '' : il, Math.round(lat * 1e4) / 1e4, Math.round(lon * 1e4) / 1e4, tzId(tz), c.population]);
}
// Nüfusa göre sırala: arama sonuçlarında büyük yerler önce gelir
satirlar.sort((a, b) => b[6] - a[6]);
for (const s of satirlar) s.length = 6; // nüfus yalnızca sıralama için

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'sehirler.json'), JSON.stringify({ kaynak: 'GeoNames (CC BY 4.0) via all-the-cities', tz: tzList, s: satirlar }));
const tr = satirlar.filter((s) => s[1] === 'TR').length;
console.log(`şehirler: ${satirlar.length} (Türkiye ${tr}), ${tzList.length} saat dilimi`);
