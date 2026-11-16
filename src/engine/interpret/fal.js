// Kart, rün, I Ching, kahve, rüya, numeroloji, yıldızname ve Çin burcu yorumları.
// Hepsi saf fonksiyon: içerik (derlenmiş JSON) + çekim/seçim + tohum -> metin yapısı.
// Çekimin kendisi motorlar.js'te crypto ile yapılır; burada yalnızca okunur.

import { seeded } from '../random/index.js';
import { doldur, basHarf } from './turkce.js';
import { indirge } from '../fal/motorlar.js';

const RUTBE_SIRA = { 11: 'uşağı', 12: 'şövalyesi', 13: 'kraliçesi', 14: 'kralı' };
const SAYI_AD = { 2: 'İkilisi', 3: 'Üçlüsü', 4: 'Dörtlüsü', 5: 'Beşlisi', 6: 'Altılısı', 7: 'Yedilisi', 8: 'Sekizlisi', 9: 'Dokuzlusu', 10: 'Onlusu' };
const SERI_TEKIL = { asa: 'Asa', kupa: 'Kupa', kilic: 'Kılıç', tilsim: 'Tılsım' };
const SERI_COGUL = { asa: 'Asaların', kupa: 'Kupaların', kilic: 'Kılıçların', tilsim: 'Tılsımların' };

/* ---------------- Tarot ---------------- */

/** 78 kartlık deste: 22 büyük + 56 küçük arkana. */
export function tarotDeste(c) {
  const d = c.buyuk.map((k) => ({ id: `b-${k.key}`, ad: k.ad, buyuk: true, no: k.no, veri: k }));
  for (const seri of Object.keys(c.seriler)) {
    for (let r = 1; r <= 14; r++) {
      const ad = r === 1 ? `${SERI_TEKIL[seri]} ası`
        : r <= 10 ? `${SERI_TEKIL[seri]} ${SAYI_AD[r].toLocaleLowerCase('tr-TR')}`
        : `${SERI_COGUL[seri]} ${RUTBE_SIRA[r]}`;
      d.push({ id: `${seri}-${r}`, ad: basHarf(ad), buyuk: false, seri, rutbe: r, veri: c.kucuk[seri][r] });
    }
  }
  return d;
}

function tarotKartMetni(kart, ters, c, konu, rng) {
  if (kart.buyuk) {
    const v = kart.veri;
    const ana = rng.pick(ters ? v.ters : v.duz);
    const ek = konu === 'ask' ? v.ask : konu === 'is' ? v.is : null;
    return { ana, ek, ogut: v.ogut, anahtar: v.anahtar };
  }
  const s = c.seriler[kart.seri];
  const r = c.rutbeler[kart.rutbe];
  const ana = ters ? kart.veri.ters : kart.veri.duz;
  const ek = konu === 'ask' ? s.ask : konu === 'is' ? s.is : `${s.ad} (${s.element}): ${s.tema}. ${r.ad}: ${r.tema}.`;
  return { ana, ek, anahtar: `${s.tema}; ${r.tema}` };
}

/**
 * @param cekilen [{kart, ters}] tarotDeste'den
 * @param acilimKey c.acilimlar anahtarı
 * @param konu 'genel' | 'ask' | 'is'
 */
export function tarotYorum({ cekilen, acilimKey, konu = 'genel', c, seed }) {
  const rng = seeded(`tarot|${seed}`);
  const ac = c.acilimlar[acilimKey];
  const pozisyonlar = cekilen.map((x, i) => ({
    poz: ac.pozisyonlar[i],
    kart: x.kart,
    ters: x.ters,
    ...tarotKartMetni(x.kart, x.ters, c, konu, rng),
  }));
  const genel = [];
  const n = cekilen.length;
  if (n >= 3) {
    const buyuk = cekilen.filter((x) => x.kart.buyuk).length;
    if (buyuk / n >= 0.5) genel.push(c.genel.buyuk_cok);
    else if (buyuk === 0) genel.push(c.genel.buyuk_yok);
    const ters = cekilen.filter((x) => x.ters).length;
    if (ters / n > 0.5) genel.push(c.genel.ters_cok);
    const seriSay = {};
    for (const x of cekilen) if (!x.kart.buyuk) seriSay[x.kart.seri] = (seriSay[x.kart.seri] ?? 0) + 1;
    const [enSeri, enSay] = Object.entries(seriSay).sort((a, b) => b[1] - a[1])[0] ?? [];
    if (enSeri && enSay >= Math.max(2, Math.ceil(n / 3))) genel.push(doldur(c.genel.seri_baskin, { seri: c.seriler[enSeri].ad, tema: c.seriler[enSeri].tema }));
    const rutbeSay = {};
    for (const x of cekilen) if (!x.kart.buyuk) rutbeSay[x.kart.rutbe] = (rutbeSay[x.kart.rutbe] ?? 0) + 1;
    for (const [r, s] of Object.entries(rutbeSay)) if (s >= 2) genel.push(doldur(c.genel.ayni_rutbe, { rutbe: c.rutbeler[r].ad, tema: c.rutbeler[r].tema }));
  }
  return { baslik: ac.ad, acilis: rng.pick(c.acilis), pozisyonlar, genel, kapanis: rng.pick(c.kapanis) };
}

/* ---------------- Lenormand ---------------- */

export function lenormandYorum({ cekilen, acilimKey, c, seed }) {
  const rng = seeded(`lenormand|${seed}`);
  const ac = c.acilimlar[acilimKey];
  const pozisyonlar = cekilen.map((k, i) => ({ poz: ac.pozisyonlar[i], kart: k, ana: rng.pick(k.anlam) }));
  const ciftler = [];
  const ekle = (a, b) => ciftler.push(doldur(rng.pick(c.cift_sablon), { a: a.ad, b: b.ad, aKonu: a.konu, bNitelik: b.nitelik }));
  if (cekilen.length === 9) {
    // 3x3: satırlar ve merkezden geçen çaprazlar
    for (const r of [0, 3, 6]) { ekle(cekilen[r], cekilen[r + 1]); ekle(cekilen[r + 1], cekilen[r + 2]); }
    ekle(cekilen[0], cekilen[4]); ekle(cekilen[4], cekilen[8]);
  } else {
    for (let i = 0; i + 1 < cekilen.length; i++) ekle(cekilen[i], cekilen[i + 1]);
  }
  const ton = cekilen.reduce((s, k) => s + (k.ton ?? 0), 0);
  const genel = ton >= 2 ? c.genel.olumlu : ton <= -2 ? c.genel.olumsuz : c.genel.karisik;
  return { baslik: ac.ad, pozisyonlar, ciftler, genel };
}

/* ---------------- Rün ---------------- */

export function runYorum({ cekilen, acilimKey, c }) {
  const ac = c.acilimlar[acilimKey];
  return {
    baslik: ac.ad,
    pozisyonlar: cekilen.map((x, i) => ({
      poz: ac.pozisyonlar[i], run: x.kart, ters: x.ters && x.kart.ters_olur,
      metin: x.ters && x.kart.ters_olur ? x.kart.ters : x.kart.duz,
    })),
  };
}

/* ---------------- İskambil (katina) ---------------- */

export function iskambilDeste(c) {
  const d = [];
  for (const [rk, r] of Object.entries(c.renkler)) for (let s = 1; s <= 13; s++) {
    d.push({ id: `${rk}-${s}`, renk: rk, sayi: s, ad: `${r.ad} ${c.sayilar[s].ad.toLocaleLowerCase('tr-TR')}`, sembol: r.sembol, kirmizi: r.renk === 'kirmizi' });
  }
  return d;
}

export function iskambilYorum({ cekilen, acilimKey, c }) {
  const ac = c.acilimlar[acilimKey];
  const pozisyonlar = cekilen.map((k, i) => {
    const r = c.renkler[k.renk];
    const ozel = c.ozel[k.id];
    const metin = ozel ?? `${basHarf(k.ad)}: ${r.tema} alanında ${c.sayilar[k.sayi].anlam}.`;
    return { poz: ac.pozisyonlar[i], kart: k, metin };
  });
  const genel = [];
  const kirmizi = cekilen.filter((k) => k.kirmizi).length;
  const oran = kirmizi / cekilen.length;
  genel.push(oran > 0.6 ? c.genel.kirmizi : oran < 0.4 ? c.genel.siyah : c.genel.dengeli);
  const say = {};
  for (const k of cekilen) say[k.sayi] = (say[k.sayi] ?? 0) + 1;
  for (const [s, n] of Object.entries(say)) if (n >= 2) genel.push(doldur(c.genel.ayni_sayi, { sayi: c.sayilar[s].ad, anlam: c.sayilar[s].anlam }));
  return { baslik: ac.ad, pozisyonlar, genel };
}

/* ---------------- I Ching ---------------- */

export function ichingYorum(okuma, c) {
  const bul = (no) => c.heksagramlar.find((h) => h.no === no);
  const b = okuma.birincil;
  const birincil = { ...bul(b.no), alt: c.ucluler[b.alt], ust: c.ucluler[b.ust], cizgiler: b.cizgiler };
  const donusen = okuma.donusen ? { ...bul(okuma.donusen.no), alt: c.ucluler[okuma.donusen.alt], ust: c.ucluler[okuma.donusen.ust], cizgiler: okuma.donusen.cizgiler } : null;
  const imge = `Alt üçlü ${birincil.alt.ad} (${birincil.alt.nitelik}), üst üçlü ${birincil.ust.ad} (${birincil.ust.nitelik}).`;
  const degisen = okuma.degisen.map((i) => ({ cizgi: i, metin: c.cizgi_konumu[i] }));
  return { birincil, donusen, imge, degisenSayisi: c.degisen_sayisi[okuma.degisen.length], degisen };
}

/* ---------------- Kahve falı ---------------- */

/** Sembol arama: ad ve eş anlamlılarda Türkçe katlamalı eşleşme. */
const katla = (s) => s.toLocaleLowerCase('tr-TR').replace(/[âî]/g, (x) => ({ â: 'a', î: 'i' })[x]);
export function sembolAra(liste, sorgu, limit = 20) {
  const q = katla(sorgu.trim());
  if (!q) return liste.slice(0, limit);
  const puan = (s) => {
    const adlar = [s.ad, ...(s.es ?? [])].map(katla);
    if (adlar.some((a) => a === q)) return 3;
    if (adlar.some((a) => a.startsWith(q))) return 2;
    if (adlar.some((a) => a.includes(q))) return 1;
    return 0;
  };
  return liste.map((s) => [s, puan(s)]).filter(([, p]) => p > 0).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([s]) => s);
}

/**
 * @param secimler [{key, bolge}] bolge: sap | karsi | kenar | orta | dip | tabak
 * @param fincan {koyu?: bool, yollar?: bool}
 */
export function kahveYorum({ secimler, fincan = {}, c, seed }) {
  const rng = seeded(`kahve|${seed}`);
  const bulS = (k) => c.semboller.find((s) => s.key === k);
  const sirali = ['sap', 'orta', 'kenar', 'karsi', 'dip', 'tabak'];
  const ogeler = secimler
    .map((x) => ({ ...x, s: bulS(x.key) }))
    .filter((x) => x.s)
    .sort((a, b) => sirali.indexOf(a.bolge) - sirali.indexOf(b.bolge));
  const bolumler = ogeler.map(({ s, bolge }) => {
    const b = c.bolgeler[bolge];
    return { sembol: s, bolge: b.ad, zaman: b.zaman, metin: `${doldur(b.cerceve, { ad: s.ad.toLocaleLowerCase('tr-TR') })} ${s.anlam}` };
  });
  const genel = [];
  genel.push(fincan.koyu ? c.genel.koyu : c.genel.acik);
  if (fincan.yollar || ogeler.some((x) => x.s.kat === 'ulasim')) genel.push(c.genel.yollar);
  const ton = ogeler.reduce((t, x) => t + x.s.ton, 0);
  if (ogeler.length >= 3 && ton >= Math.ceil(ogeler.length / 2)) genel.push(c.genel.olumlu_cok);
  else if (ogeler.length >= 2 && ton <= -2) genel.push(c.genel.olumsuz_cok);
  // Kategori örüntüleri: aynı türden çok sembol bir temayı güçlendirir
  const kat = {};
  for (const x of ogeler) kat[x.s.kat] = (kat[x.s.kat] ?? 0) + 1;
  const KAT_TEMA = { hayvan: 'hayvan figürleri insanları ve içgüdüleri', insan: 'insan figürleri çevrendeki kişileri', nesne: 'nesneler somut gelişmeleri', doga: 'doğa işaretleri ruh hâlini', ev: 'yapılar yuva ve güven meselesini', sekil: 'şekiller zamanlama ve yönü', ulasim: 'yol işaretleri hareketi', harf: 'harf ve rakamlar kişi ve zamanı' };
  for (const [k, n] of Object.entries(kat)) if (n >= 3) genel.push(`Fincanda ${KAT_TEMA[k]} anlatıyor; bu dönem bunlar öne çıkıyor.`);
  return { bolumler, genel, kapanis: rng.pick(c.genel.kapanis) };
}

/* ---------------- Rüya tabiri ---------------- */

export function ruyaYorum({ keys, duygu = 'notr', c, seed }) {
  const rng = seeded(`ruya|${seed}`);
  const semboller = keys.map((k) => c.semboller.find((s) => s.key === k)).filter(Boolean);
  const sentez = [];
  if (semboller.length >= 2) {
    const adlar = semboller.map((s) => s.ad.toLocaleLowerCase('tr-TR'));
    const son = adlar.pop();
    sentez.push(`Rüyanda ${adlar.join(', ')} ve ${son} birlikte görünüyor. Bu imgeler aynı hikâyenin parçaları: birinin anlattığı duygu, diğerinin sahnesinde yaşanıyor.`);
  }
  return {
    giris: rng.pick(c.giris),
    semboller,
    duygu: c.duygu[duygu] ?? c.duygu.notr,
    sentez,
    kapanis: rng.pick(c.kapanis),
  };
}

/* ---------------- Numeroloji ---------------- */

export function numerolojiYorum(sonuc, c) {
  const satir = (alan, n, tur = 'portre') => {
    const s = c.sayilar[n] ?? c.sayilar[indirge(n, false)];
    return { alan, ad: c.konumlar[alan].ad, aciklama: c.konumlar[alan].aciklama, sayi: n, veri: s, metin: s[tur] || c.sayilar[indirge(n, false)][tur] };
  };
  const cekirdek = ['yasamYolu', 'ifade', 'ruh', 'kisilik', 'dogumGunu'].filter((a) => sonuc[a] != null).map((a) => satir(a, sonuc[a]));
  const donem = [satir('kisiselYil', sonuc.kisiselYil, 'yil'), satir('kisiselGun', sonuc.kisiselGun, 'gun')];
  const tekrar = {};
  for (const x of cekirdek) tekrar[x.sayi] = (tekrar[x.sayi] ?? 0) + 1;
  const vurgu = Object.entries(tekrar).filter(([, n]) => n >= 2).map(([s, n]) => `${c.sayilar[s].ad} sayısı ${n} kez çıkıyor: ${c.sayilar[s].anahtar} temaları hayatında belirgin.`);
  return { yontem: c.yontem, cekirdek, donem, vurgu };
}

/* ---------------- Yıldızname ---------------- */

export function yildiznameYorum(sonuc, c) {
  return { ...sonuc, veri: c.yildizlar[sonuc.yildiz], yontem: c.yontem, uyari: c.uyari };
}

/* ---------------- Çin burcu ---------------- */

export function cinYorum(sonuc, c, karsi = null, cinUyum = null) {
  const h = c.hayvanlar[sonuc.hayvan];
  const e = c.elementler[sonuc.element];
  const out = { ...sonuc, hayvanAd: h.ad, metin: h.metin, golge: h.golge, elementAd: e.ad, elementMetin: e.metin, yontem: c.yontem };
  if (karsi && cinUyum) out.uyum = { karsi: c.hayvanlar[karsi].ad, metin: c.uyum[cinUyum(sonuc.hayvan, karsi)] };
  return out;
}

// İki harfli adlar (ev, su, at…) için yalnızca yaygın hâl ve iyelik ekleri kabul edilir.
const KISA_EK = new Set(['', 'e', 'a', 'i', 'ı', 'u', 'ü', 'de', 'da', 'te', 'ta', 'den', 'dan', 'ten', 'tan', 'im', 'ım', 'um', 'üm', 'ime', 'ıma', 'uma', 'üme', 'imde', 'ımda', 'umda', 'ümde', 'imden', 'ımdan', 'in', 'ın', 'un', 'ün', 'ler', 'lar', 'leri', 'ları', 'imiz', 'ımız', 'ye', 'ya', 'yu', 'yü', 'yi', 'yı', 'yla', 'yle', 'la', 'le']);

/**
 * Serbest rüya metninde sembolleri bulur. Türkçe ekler için kelime başı eşleşmesi:
 * "yılanı", "yılanlar" -> yılan. Çok kısa adlar (3 harften az) yalnızca tam eşleşir.
 */
export function ruyaMetindenBul(liste, metin) {
  const kelimeler = katla(metin).split(/[^a-zçğıöşü]+/).filter(Boolean);
  const bulunan = [];
  for (const s of liste) {
    const adlar = [s.ad, ...(s.es ?? [])].map(katla);
    const tutar = adlar.some((ad) => {
      const parca = ad.split(/[^a-zçğıöşü]+/).filter(Boolean);
      if (parca.length > 1) return katla(metin).includes(ad);
      const a = parca[0];
      if (!a) return false;
      return kelimeler.some((k) => (a.length < 3 ? k.startsWith(a) && KISA_EK.has(k.slice(a.length)) : k.startsWith(a) && k.length - a.length <= 5));
    });
    if (tutar) bulunan.push(s.key);
  }
  return bulunan;
}
