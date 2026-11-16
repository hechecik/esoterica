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

const BURC_KEYS = ['koc', 'boga', 'ikizler', 'yengec', 'aslan', 'basak', 'terazi', 'akrep', 'yay', 'oglak', 'kova', 'balik'];
const GEZ10 = ['gunes', 'ay', 'merkur', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptun', 'pluton'];

function buildAstro() {
  const dir = join(CONTENT, 'astroloji');
  if (!existsSync(dir)) { warn('astroloji/ yok'); return null; }
  const strip = (d) => { if (!d) return d; const { kaynak, lang, ...rest } = d; return rest; };
  const out = {
    burclar: strip(loadYaml(join(dir, 'burclar.yaml')))?.burclar,
    gezegenBurc: strip(loadYaml(join(dir, 'gezegen-burc.yaml'))),
    gezegenEv: strip(loadYaml(join(dir, 'gezegen-ev.yaml'))),
    acilar: strip(loadYaml(join(dir, 'acilar.yaml'))),
    sentez: strip(loadYaml(join(dir, 'sentez.yaml'))),
    transit: strip(loadYaml(join(dir, 'transit.yaml'))),
  };
  for (const b of BURC_KEYS) {
    const d = out.burclar?.[b];
    if (!d) { fail(`astroloji: burç yok ${b}`); continue; }
    for (const k of ['portre', 'gunes', 'ay', 'yukselen', 'mc']) if (countList(d[k]) < 2) warn(`astroloji: ${b}.${k} ${countList(d[k])} < 2`);
  }
  for (const [g, burclar] of Object.entries(out.gezegenBurc?.gezegenler ?? {})) {
    for (const b of BURC_KEYS) if (!countList(burclar[b])) fail(`astroloji: ${g} ${b} burcunda metin yok`);
  }
  for (const [g, evler] of Object.entries(out.gezegenEv?.gezegenler ?? {})) {
    for (let h = 1; h <= 12; h++) if (!countList(evler[h])) fail(`astroloji: ${g} ${h}. evde metin yok`);
  }
  for (let i = 0; i < GEZ10.length; i++) for (let j = i + 1; j < GEZ10.length; j++) {
    const c = out.acilar?.ciftler?.[`${GEZ10[i]}-${GEZ10[j]}`];
    if (!c) { fail(`astroloji: açı çifti yok ${GEZ10[i]}-${GEZ10[j]}`); continue; }
    for (const t of ['kavusum', 'uyumlu', 'gergin']) if (!c[t]) fail(`astroloji: ${GEZ10[i]}-${GEZ10[j]} ${t} yok`);
  }
  let n = 0;
  for (const [, str] of strings(out)) if (str.length >= 20) n++;
  out.stats = { cumle: n };
  return out;
}


/* ---------- Diğer fallar ---------- */

const RUTBE = Array.from({ length: 14 }, (_, i) => i + 1);
function yukle(modul, dosya) {
  const p = join(CONTENT, modul, dosya);
  if (!existsSync(p)) { fail(`${modul}/${dosya} yok`); return null; }
  const d = loadYaml(p);
  if (!d) return null;
  const { kaynak, lang, ...rest } = d;
  return { ...rest, kaynak };
}
function benzersizKey(liste, ad) {
  const g = new Set();
  for (const x of liste ?? []) {
    if (!x.key) fail(`${ad}: key eksik (${x.ad})`);
    if (g.has(x.key)) fail(`${ad}: tekrar eden key ${x.key}`);
    g.add(x.key);
  }
}
function metinSay(o) { let n = 0; for (const [, s] of strings(o)) if (s.length >= 20) n++; return n; }

function buildFal() {
  const out = {};
  const tarot = yukle('tarot', 'kartlar.yaml');
  const tarotA = yukle('tarot', 'acilimlar.yaml');
  if (tarot && tarotA) {
    if (countList(tarot.buyuk) !== 22) fail(`tarot: büyük arkana ${countList(tarot.buyuk)} != 22`);
    benzersizKey(tarot.buyuk, 'tarot');
    for (const k of tarot.buyuk) for (const a of ['duz', 'ters']) if (countList(k[a]) < 2) fail(`tarot: ${k.key}.${a} < 2`);
    for (const s of Object.keys(tarot.seriler)) for (const r of RUTBE) {
      const c = tarot.kucuk?.[s]?.[r];
      if (!c?.duz || !c?.ters) fail(`tarot: küçük arkana ${s}-${r} eksik`);
    }
    const ek = yukle('tarot', 'kucuk-ek.yaml');
    for (const s of Object.keys(tarot.seriler)) for (const r of RUTBE) {
      const e = ek?.kucuk_ek?.[s]?.[r];
      if (!e?.ask || !e?.is || !e?.ogut) fail(`tarot: küçük arkana ek ${s}-${r} eksik`);
      else Object.assign(tarot.kucuk[s][r], e);
    }
    out.tarot = { ...tarot, ...tarotA, kaynak: tarot.kaynak };
  }
  const len = yukle('lenormand', 'kartlar.yaml');
  if (len) {
    if (countList(len.kartlar) !== 36) fail(`lenormand: ${countList(len.kartlar)} != 36`);
    benzersizKey(len.kartlar, 'lenormand');
    for (const k of len.kartlar) if (!k.konu || !k.nitelik || countList(k.anlam) < 1) fail(`lenormand: ${k.key} eksik`);
    out.lenormand = len;
  }
  const run = yukle('run', 'runler.yaml');
  if (run) {
    if (countList(run.runler) !== 25) fail(`run: ${countList(run.runler)} != 25`);
    benzersizKey(run.runler, 'run');
    for (const r of run.runler) if (!r.duz || (r.ters_olur && !r.ters)) fail(`run: ${r.key} eksik`);
    out.run = run;
  }
  const isk = yukle('iskambil', 'kartlar.yaml');
  if (isk) {
    for (let i = 1; i <= 13; i++) if (!isk.sayilar?.[i]) fail(`iskambil: sayı ${i} yok`);
    const tum = yukle('iskambil', 'tum-kartlar.yaml')?.kartlar ?? {};
    for (const r of Object.keys(isk.renkler)) for (let i = 1; i <= 13; i++) if (!tum[`${r}-${i}`]) fail(`iskambil: ${r}-${i} metni yok`);
    isk.ozel = { ...isk.ozel, ...tum };
    out.iskambil = isk;
  }
  const ic = yukle('iching', 'heksagramlar.yaml');
  if (ic) {
    const nolar = new Set((ic.heksagramlar ?? []).map((h) => h.no));
    for (let i = 1; i <= 64; i++) if (!nolar.has(i)) fail(`iching: heksagram ${i} yok`);
    for (let i = 1; i <= 6; i++) if (!ic.cizgi_konumu?.[i]) fail(`iching: çizgi konumu ${i} yok`);
    ic.cizgiler = {};
    for (const f of listYaml(join(CONTENT, 'iching')).filter((f) => basename(f).startsWith('cizgiler'))) Object.assign(ic.cizgiler, loadYaml(f)?.cizgiler ?? {});
    for (let i = 1; i <= 64; i++) {
      const c6 = ic.cizgiler[i];
      if (countList(c6) !== 6) fail(`iching: heksagram ${i} çizgi sayısı ${countList(c6)} != 6`);
    }
    out.iching = ic;
  }
  const kahve = yukle('kahve', 'semboller.yaml');
  if (kahve) {
    for (const f of listYaml(join(CONTENT, 'kahve')).filter((f) => /semboller-\d+\.yaml$/.test(f))) kahve.semboller.push(...(loadYaml(f)?.semboller ?? []));
    benzersizKey(kahve.semboller, 'kahve');
    for (const s of kahve.semboller) if (!s.anlam || ![-1, 0, 1].includes(s.ton)) fail(`kahve: ${s.key} eksik`);
    if (countList(kahve.semboller) < 240) warn(`kahve: ${countList(kahve.semboller)} sembol < 240`);
    out.kahve = kahve;
  }
  const ruya = yukle('ruya', 'sozluk.yaml');
  if (ruya) {
    for (const f of listYaml(join(CONTENT, 'ruya')).filter((f) => /sozluk-\d+\.yaml$/.test(f))) ruya.semboller.push(...(loadYaml(f)?.semboller ?? []));
    benzersizKey(ruya.semboller, 'ruya');
    for (const s of ruya.semboller) if (!s.gelenek || !s.ic) fail(`ruya: ${s.key} eksik`);
    if (countList(ruya.semboller) < 240) warn(`ruya: ${countList(ruya.semboller)} sembol < 240`);
    out.ruya = ruya;
  }
  const num = yukle('numeroloji', 'sayilar.yaml');
  if (num) {
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]) if (!num.sayilar?.[n]?.portre) fail(`numeroloji: ${n} yok`);
    out.numeroloji = num;
  }
  const yz = yukle('yildizname', 'yildizlar.yaml');
  if (yz) { for (const b of BURC_KEYS) if (!yz.yildizlar?.[b]) fail(`yildizname: ${b} yok`); out.yildizname = yz; }
  const cin = yukle('cin', 'burclar.yaml');
  if (cin) { if (Object.keys(cin.hayvanlar ?? {}).length !== 12) fail('cin: 12 hayvan değil'); out.cin = cin; }
  for (const k of Object.keys(out)) out[k].stats = { metin: metinSay(out[k]) };
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
  const astro = buildAstro();
  if (astro) writeFileSync(join(OUT, 'astroloji.json'), JSON.stringify(astro));

  const fal = buildFal();
  for (const [k, v] of Object.entries(fal)) writeFileSync(join(OUT, `${k}.json`), JSON.stringify(v));

  const report = {
    tarih: new Date().toISOString(),
    remil: remil.stats,
    astroloji: astro?.stats,
    fal: Object.fromEntries(Object.entries(fal).map(([k, v]) => [k, v.stats])),
    uyari: warnings.length,
    hata: errors.length,
  };
  writeFileSync(join(OUT, 'rapor.json'), JSON.stringify(report, null, 2));

  for (const w of warnings) console.warn('UYARI', w);
  for (const e of errors) console.error('HATA', e);
  console.log(`remil: ${remil.stats.sekil} şekil, ${remil.stats.hucre} hücre, ${remil.stats.hucreVaryant} hücre varyantı, ${remil.stats.toplamCumle} benzersiz cümle, iskelet kombinasyonu ~${remil.stats.iskeletKombinasyon.toLocaleString('tr-TR')}`);
  if (astro) console.log(`astroloji: ${astro.stats.cumle} metin`);
  console.log('fallar: ' + Object.entries(fal).map(([k, v]) => `${k} ${v.stats.metin}`).join(', '));
  console.log(`${warnings.length} uyarı, ${errors.length} hata`);
  if (errors.length) process.exit(1);
}

main();
