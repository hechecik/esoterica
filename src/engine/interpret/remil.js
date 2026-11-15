// Remil yorum motoru: kalkan tablosu + içerik kütüphanesi + tohum -> okunur yorum.
// Boru hattı: tartma -> anlatı iskeleti -> gerçekleştirme (Türkçe ekler) -> seçim ve kaçınma.
// Aynı tohum aynı metni üretir; farklı tohum farklı varyantları seçer.

import { FIGURES } from '../remil/figures.js';
import { TOPIC_HOUSES, PERSON_HOUSES, rotateHouse, perfection } from '../remil/chart.js';
import { seeded } from '../random/index.js';
import { doldur, basHarf } from './turkce.js';

const KISI_ADI = {
  kendim: 'sen', kardes: 'kardeşin', ebeveyn: 'ebeveynin', cocuk: 'çocuğun', es: 'eşin', sevgili: 'sevgilin',
  arkadas: 'arkadaşın', is_arkadasi: 'iş arkadaşın', baska: 'baktığın kişi',
};

const HANE_ADI = ['', 'birinci hane', 'ikinci hane', 'üçüncü hane', 'dördüncü hane', 'beşinci hane', 'altıncı hane',
  'yedinci hane', 'sekizinci hane', 'dokuzuncu hane', 'onuncu hane', 'on birinci hane', 'on ikinci hane'];

// Şekillerin geleneksel iyi/kötü/karışık doğası ve hızı (tartma için)
const NATURE = {
  fortunaMajor: { iyi: 2, hiz: -1 }, fortunaMinor: { iyi: 1, hiz: 2 }, acquisitio: { iyi: 2, hiz: 0 },
  laetitia: { iyi: 2, hiz: 1 }, albus: { iyi: 1, hiz: -1 }, puella: { iyi: 1, hiz: 0 },
  conjunctio: { iyi: 0, hiz: 0 }, populus: { iyi: 0, hiz: 0 }, via: { iyi: 0, hiz: 1 },
  caputDraconis: { iyi: 1, hiz: -1 }, puer: { iyi: -1, hiz: 2 }, rubeus: { iyi: -2, hiz: 1 },
  amissio: { iyi: -1, hiz: 1 }, tristitia: { iyi: -2, hiz: -2 }, carcer: { iyi: -1, hiz: -2 },
  caudaDraconis: { iyi: -2, hiz: 1 },
};

/** Şekil adını ek alabilecek biçimde döndürür (son ünlü ipucuyla). */
function ad(content, key) {
  const s = content.sekiller[key];
  const text = s?.ad ?? key;
  // Osmanlıca adlarda son ünlü için ipucu: inceltme işaretli â ince-uzun değil kalın sayılır
  const bare = text.replace(/['’]/g, '');
  const m = bare.match(/[aeıioöuüâîû](?=[^aeıioöuüâîû]*$)/i);
  const son = (m?.[0] ?? 'e').toLowerCase().replace('â', 'a').replace('î', 'i').replace('û', 'u');
  return { text, opts: { sonUnlu: son, ozel: true, kesme: true } };
}

/**
 * Tartma: tabloyu tema ve ton açısından puanlar.
 * Sonuç: hâkimin doğası, sorunun tonu, tekrar eden şekiller, hız.
 */
export function tartma(chart, content, soruHane) {
  const judgeN = NATURE[chart.judge];
  const soruF = chart.houses[soruHane - 1];
  const soruN = NATURE[soruF];
  const sag = NATURE[chart.witnesses.right];
  const sol = NATURE[chart.witnesses.left];

  const puan = judgeN.iyi * 2 + soruN.iyi + sag.iyi * 0.5 + sol.iyi * 0.5;
  const ton = puan >= 2 ? 'olumlu' : puan <= -2 ? 'temkinli' : 'notr';
  const hiz = judgeN.hiz + soruN.hiz;
  const zaman = hiz >= 2 ? 'hizli' : hiz <= -2 ? 'yavas' : 'orta';

  // Tekrarlar: 12 hane + tanıklar + hâkim içinde 3 ve üstü
  const tekrar = Object.entries(chart.counts).filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]);

  // Çelişki: hâkim ile soru hanesi zıt doğada mı?
  const celiski = judgeN.iyi * soruN.iyi < 0 && Math.abs(judgeN.iyi - soruN.iyi) >= 3;

  // Tema puanları: şekil temalarının ağırlıklı toplamı
  const temalar = {};
  const add = (key, w) => {
    for (const [t, v] of Object.entries(content.sekiller[key]?.temalar ?? {})) temalar[t] = (temalar[t] ?? 0) + v * w;
  };
  add(chart.judge, 3);
  add(soruF, 2);
  add(chart.houses[0], 1.5);
  add(chart.witnesses.right, 1);
  add(chart.witnesses.left, 1);
  add(chart.reconciler, 1);
  const baskin = Object.entries(temalar).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);

  return { puan, ton, zaman, tekrar, celiski, baskin };
}

/**
 * Yorum üretir.
 * @param {object} chart castChart çıktısı
 * @param {object} content derlenmiş remil.json
 * @param {object} opts { konu, kisi, seed, ortak, gorulen:Set<string> }
 */
export function yorumla(chart, content, opts = {}) {
  const konu = TOPIC_HOUSES[opts.konu] ? opts.konu : 'genel';
  const kisi = PERSON_HOUSES[opts.kisi] ? opts.kisi : 'kendim';
  const taban = PERSON_HOUSES[kisi];
  const soranHane = taban;
  const soruHane = rotateHouse(taban, TOPIC_HOUSES[konu][0]);
  const rng = seeded(opts.seed ?? `${chart.bits.join('')}|${konu}|${kisi}`);
  const gorulen = opts.gorulen ?? new Set();
  const t = tartma(chart, content, soruHane);
  const isk = content.iskelet;
  const ortak = opts.ortak ?? {};

  // Daha önce görülen varyantları cezalandırarak seç
  const sec = (arr) => {
    if (!arr?.length) return '';
    const items = arr.map((s) => ({ item: s, w: gorulen.has(s) ? 0.15 : 1 }));
    const s = rng.weighted(items);
    gorulen.add(s);
    return s;
  };
  // Hücre seçimi: seçilen ton tam ağırlık, nötr ton yarım ağırlık (nötr cümle her tona uyar).
  // Nötr tonda ise üç havuz da açılır; böylece 2'lik havuz 4-6'ya çıkar.
  const hucre = (f, h) => {
    const cell = content.hucreler[f][h];
    const havuz = t.ton === 'notr'
      ? [...cell.notr.map((s) => ({ item: s, w: 1 })), ...cell.olumlu.map((s) => ({ item: s, w: 0.35 })), ...cell.temkinli.map((s) => ({ item: s, w: 0.35 }))]
      : [...cell[t.ton].map((s) => ({ item: s, w: 1 })), ...cell.notr.map((s) => ({ item: s, w: 0.5 }))];
    const items = havuz.map((x) => ({ item: x.item, w: gorulen.has(x.item) ? x.w * 0.15 : x.w }));
    const s = rng.weighted(items);
    gorulen.add(s);
    return s;
  };
  const sekilVars = (extra = {}) => ({
    hakim: ad(content, chart.judge),
    sag: ad(content, chart.witnesses.right),
    sol: ad(content, chart.witnesses.left),
    uzlastirici: ad(content, chart.reconciler),
    soru_hane: HANE_ADI[soruHane],
    ...extra,
  });
  const cumle = (tpl, vars) => basHarf(doldur(tpl, vars));

  const gel = perfection(chart, soranHane, soruHane);
  const bolumler = [];

  // 1. Açılış
  bolumler.push({ tip: 'acilis', metin: [cumle(sec(isk.acilis[konu] ?? isk.acilis.genel), sekilVars())] });

  // 2. Hâkim
  const hk = content.sekiller[chart.judge].hakim;
  bolumler.push({
    tip: 'hakim', sekil: chart.judge, metin: [
      cumle(sec(isk.hakim), sekilVars()),
      sec(hk[konu] ?? hk.genel),
      sec(hk.genel),
    ],
  });

  // 3. Tanıklar
  bolumler.push({
    tip: 'taniklar', sekil: [chart.witnesses.right, chart.witnesses.left], metin: [
      cumle(sec(isk.taniklar), sekilVars()),
      sec(content.sekiller[chart.witnesses.right].tanik_sag),
      sec(content.sekiller[chart.witnesses.left].tanik_sol),
    ],
  });

  // 4. Soran (1. hane ya da kişi hanesi)
  const soranF = chart.houses[soranHane - 1];
  const baska = kisi !== 'kendim';
  const kisiVars = (extra = {}) => sekilVars({ kisi: { text: KISI_ADI[kisi], opts: { ozel: false, kesme: false } }, ...extra });
  bolumler.push({
    tip: 'soran', hane: soranHane, sekil: soranF, metin: [
      baska
        ? cumle(sec(isk.soran_baska), kisiVars({ sekil: ad(content, soranF), hane: { text: HANE_ADI[soranHane], opts: { ozel: false, kesme: false } } }))
        : cumle(sec(isk.soran), sekilVars({ sekil: ad(content, soranF) })),
      hucre(soranF, 1),
    ],
  });

  // 5. Soru hanesi (ana + varsa ikincil hane)
  const soruF = chart.houses[soruHane - 1];
  const soruMetin = [
    baska
      ? cumle(sec(isk.soru_baska), kisiVars({ sekil: ad(content, soruF), hane: { text: HANE_ADI[soruHane], opts: { ozel: false, kesme: false } } }))
      : cumle(sec(isk.soru), sekilVars({ sekil: ad(content, soruF) })),
    hucre(soruF, TOPIC_HOUSES[konu][0]),
  ];
  if (TOPIC_HOUSES[konu][1]) {
    const h2 = rotateHouse(taban, TOPIC_HOUSES[konu][1]);
    const f2 = chart.houses[h2 - 1];
    soruMetin.push(hucre(f2, TOPIC_HOUSES[konu][1]));
  }
  if (konu !== 'genel') bolumler.push({ tip: 'soru', hane: soruHane, sekil: soruF, metin: soruMetin });

  // 6. Gelinme
  if (konu !== 'genel') {
    const g = content.gelinme;
    let tpl, vars = sekilVars({ sekil: ad(content, soranF) });
    if (gel.occupation) tpl = sec(g.isgal);
    else if (gel.conjunction) tpl = sec(g.kavusma);
    else if (gel.mutation) tpl = sec(g.mutasyon);
    else if (gel.translation) { tpl = sec(g.nakil); vars = sekilVars({ araci: ad(content, gel.translation.figure) }); }
    else tpl = sec(g.yok);
    bolumler.push({ tip: 'gelinme', gelinme: gel, metin: [cumle(sec(isk.gelinme), vars), cumle(tpl, vars)] });
  }

  // 7. Vurgu (tekrarlar) ve çelişki
  for (const [key, n] of t.tekrar.slice(0, 2)) {
    bolumler.push({ tip: 'vurgu', sekil: key, n, metin: [
      cumle(sec(isk.vurgu), sekilVars({ sekil: ad(content, key), n })),
      sec(content.sekiller[key].portre),
    ] });
  }
  if (t.celiski && ortak.baglac?.celiski) bolumler.push({ tip: 'celiski', metin: [sec(ortak.baglac.celiski)] });

  // 8. Zamanlama
  if (ortak.zaman?.[t.zaman]) bolumler.push({ tip: 'zaman', zaman: t.zaman, metin: [sec(ortak.zaman[t.zaman])] });

  // 9. Uzlaştırıcı
  bolumler.push({ tip: 'uzlastirici', sekil: chart.reconciler, metin: [
    cumle(sec(isk.uzlastirici), sekilVars()),
    sec(content.sekiller[chart.reconciler].uzlastirici),
  ] });

  // 10. Öğüt ve kapanış
  const ogutKaynak = t.ton === 'temkinli' ? content.sekiller[chart.judge].ogut : content.sekiller[soruF].ogut;
  bolumler.push({ tip: 'ogut', metin: [sec(isk.ogut) + ' ' + sec(ogutKaynak)] });
  bolumler.push({ tip: 'kapanis', metin: [sec(isk.kapanis)] });

  return {
    konu, kisi, soranHane, soruHane, ton: t.ton, zaman: t.zaman, baskin: t.baskin, gelinme: gel,
    bolumler,
    metin: bolumler.map((b) => b.metin.join(' ')).join('\n\n'),
  };
}

/** Yorumu sade metne çevirir (paylaşım ve test için). */
export function duzMetin(yorum) {
  return yorum.metin;
}

export { FIGURES };
