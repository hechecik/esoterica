#!/usr/bin/env node
// İçerik derleyici: content/ (esoterica-kutuphane alt modülü) içindeki YAML'ı
// doğrular, şema alt sınırlarını denetler, yasak kelimeleri tarar ve
// src/content/generated/ altına modül başına JSON yazar.
// Çalışma anında hiçbir YAML okunmaz; site yalnızca bu JSON'ları yükler.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { parse } from 'yaml';

const ROOT = new URL('..', import.meta.url).pathname;
const CONTENT = join(ROOT, 'content');
const OUT = join(ROOT, 'src', 'content', 'generated');

const warnings = [];
const errors = [];
const warn = (m) => warnings.push(m);
const fail = (m) => errors.push(m);

function loadYaml(path) {
  try {
    return parse(readFileSync(path, 'utf8'));
  } catch (e) {
    fail(`${path}: YAML okunamadı: ${e.message}`);
    return null;
  }
}

function listYaml(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.yaml')).map((f) => join(dir, f));
}

function countList(x) {
  return Array.isArray(x) ? x.length : 0;
}

/** Tüm dize yapraklarını gezer (yasak kelime taraması için). */
function* strings(node, path = '') {
  if (typeof node === 'string') yield [path, node];
  else if (Array.isArray(node)) for (let i = 0; i < node.length; i++) yield* strings(node[i], `${path}[${i}]`);
  else if (node && typeof node === 'object') for (const k of Object.keys(node)) yield* strings(node[k], path ? `${path}.${k}` : k);
}

function buildRemil(sema) {
  const dir = join(CONTENT, 'remil');
  const out = { sekiller: {}, hucreler: {}, haneler: null, gelinme: null, iskelet: null, stats: {} };
  const s = sema.remil;

  // Şekiller
  for (const f of listYaml(join(dir, 'sekiller'))) {
    const d = loadYaml(f);
    if (!d) continue;
    for (const key of s.sekil.zorunlu) if (d[key] === undefined) fail(`${f}: zorunlu alan yok: ${key}`);
    const lim = s.sekil.alt_sinir;
    if (countList(d.portre) < lim.portre) warn(`${f}: portre ${countList(d.portre)} < ${lim.portre}`);
    if (countList(d.hakim?.genel) < lim.hakim_genel) warn(`${f}: hakim.genel ${countList(d.hakim?.genel)} < ${lim.hakim_genel}`);
    for (const konu of s.sekil.hakim_konular) {
      if (konu === 'genel') continue;
      if (countList(d.hakim?.[konu]) < lim.hakim_konu) warn(`${f}: hakim.${konu} ${countList(d.hakim?.[konu])} < ${lim.hakim_konu}`);
    }
    for (const k of ['tanik_sag', 'tanik_sol', 'uzlastirici', 'ogut']) {
      if (countList(d[k]) < lim[k]) warn(`${f}: ${k} ${countList(d[k])} < ${lim[k]}`);
    }
    const { kaynak, lang, ...rest } = d;
    out.sekiller[d.key] = rest;
  }
  if (Object.keys(out.sekiller).length !== 16) fail(`remil: 16 şekil bekleniyordu, ${Object.keys(out.sekiller).length} bulundu`);

  // Hücreler
  let cellVariants = 0;
  for (const f of listYaml(join(dir, 'hucreler'))) {
    const d = loadYaml(f);
    if (!d) continue;
    if (!out.sekiller[d.key]) fail(`${f}: bilinmeyen şekil ${d.key}`);
    const cells = {};
    for (let h = 1; h <= 12; h++) {
      const cell = d.haneler?.[h];
      if (!cell) { fail(`${f}: hane ${h} yok`); continue; }
      cells[h] = {};
      for (const ton of s.hucre.tonlar) {
        const n = countList(cell[ton]);
        if (n < s.hucre.alt_sinir.ton) warn(`${f}: hane ${h} ${ton} ${n} < ${s.hucre.alt_sinir.ton}`);
        cells[h][ton] = cell[ton] ?? [];
        cellVariants += n;
      }
    }
    out.hucreler[d.key] = cells;
  }
  for (const key of Object.keys(out.sekiller)) if (!out.hucreler[key]) fail(`remil: ${key} için hücre dosyası yok`);

  // Haneler
  const haneler = loadYaml(join(dir, 'haneler.yaml'));
  if (haneler) {
    const keys = Object.keys(haneler.haneler ?? {});
    if (keys.length !== s.haneler.sayi) fail(`haneler.yaml: ${s.haneler.sayi} hane bekleniyordu, ${keys.length} var`);
    for (const k of keys) {
      if (countList(haneler.haneler[k].cerceve) < s.haneler.alt_sinir.cerceve) warn(`haneler.yaml: hane ${k} cerceve az`);
    }
    out.haneler = haneler.haneler;
  }

  const gel = loadYaml(join(dir, 'gelinme.yaml'));
  if (gel) { const { kaynak, lang, ...rest } = gel; out.gelinme = rest; }
  const isk = loadYaml(join(dir, 'iskelet.yaml'));
  if (isk) out.iskelet = isk.bolumler;

  // Yasak kelime taraması
  for (const [path, str] of strings({ sekiller: out.sekiller, hucreler: out.hucreler })) {
    const low = str.toLocaleLowerCase('tr-TR');
    for (const y of sema.yasak_kelimeler ?? []) if (low.includes(y)) warn(`yasak kelime "${y}": remil.${path}`);
  }

  // Tekrar eden cümleler
  const seen = new Map();
  for (const [path, str] of strings({ sekiller: out.sekiller, hucreler: out.hucreler })) {
    const norm = str.trim().toLocaleLowerCase('tr-TR');
    if (norm.length < 20) continue; // ad, anahtar gibi kısa alanlar cümle değildir
    if (seen.has(norm)) warn(`tekrar eden cümle: remil.${path} == remil.${seen.get(norm)}`);
    else seen.set(norm, path);
  }

  // Genişlik ölçümü: 7 anlatı adımı için ortalama varyant sayısı
  const stepVariants = [
    out.iskelet?.acilis?.genel?.length ?? 0,
    out.iskelet?.hakim?.length ?? 0,
    out.iskelet?.taniklar?.length ?? 0,
    s.hucre.alt_sinir.ton * s.hucre.tonlar.length,
    out.gelinme?.isgal?.length ?? 0,
    out.iskelet?.uzlastirici?.length ?? 0,
    out.iskelet?.kapanis?.length ?? 0,
  ];
  const combos = stepVariants.reduce((a, b) => a * Math.max(b, 1), 1);
  out.stats = {
    sekil: Object.keys(out.sekiller).length,
    hucre: Object.keys(out.hucreler).length * 12,
    hucreVaryant: cellVariants,
    toplamCumle: seen.size,
    iskeletKombinasyon: combos,
  };
  return out;
}

function buildOrtak() {
  const tonlar = loadYaml(join(CONTENT, 'ortak', 'tonlar.yaml'));
  if (!tonlar) return null;
  const { kaynak, lang, ...rest } = tonlar;
  return rest;
}

function main() {
  if (!existsSync(CONTENT) || !existsSync(join(CONTENT, 'ortak', 'sema.yaml'))) {
    console.error('content/ alt modülü boş. Çalıştır: git submodule update --init');
    process.exit(2);
  }
  const sema = loadYaml(join(CONTENT, 'ortak', 'sema.yaml'));
  if (!sema) process.exit(1);

  mkdirSync(OUT, { recursive: true });
  const remil = buildRemil(sema);
  const ortak = buildOrtak();

  writeFileSync(join(OUT, 'remil.json'), JSON.stringify(remil));
  writeFileSync(join(OUT, 'ortak.json'), JSON.stringify(ortak));

  const report = {
    tarih: new Date().toISOString(),
    remil: remil.stats,
    uyari: warnings.length,
    hata: errors.length,
  };
  writeFileSync(join(OUT, 'rapor.json'), JSON.stringify(report, null, 2));

  for (const w of warnings) console.warn('UYARI', w);
  for (const e of errors) console.error('HATA', e);
  console.log(`remil: ${remil.stats.sekil} şekil, ${remil.stats.hucre} hücre, ${remil.stats.hucreVaryant} hücre varyantı, ${remil.stats.toplamCumle} benzersiz cümle, iskelet kombinasyonu ~${remil.stats.iskeletKombinasyon.toLocaleString('tr-TR')}`);
  console.log(`${warnings.length} uyarı, ${errors.length} hata`);
  if (errors.length) process.exit(1);
}

main();
