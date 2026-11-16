// Astroloji yorum motoru.
// haritaYorumu: doğum haritasını tartıp bölümlere ayırır (özet, üçlü, kişisel gezegenler, açılar, kalıplar, alanlar).
// transitler: belirli bir andaki gökyüzünü doğum haritasıyla karşılaştırır.
// gunlukYorum: günlük ekranın metinleri (ay, evre, retrolar, alanlar, öğüt).

import { seeded } from '../random/index.js';
import { doldur, basHarf } from './turkce.js';
import { BURCLAR, GEZEGEN, GEZEGENLER, ELEMENT_ADI, burc, fark, norm360 } from '../astro/sabitler.js';
import { ANA } from '../astro/analiz.js';

const DOGA = { kavusum: 'kavusum', ucgen: 'uyumlu', altigen: 'uyumlu', kare: 'gergin', karsit: 'gergin' };
const SIRA = Object.fromEntries(GEZEGENLER.map((g, i) => [g.key, i]));
const ciftAnahtar = (a, b) => (SIRA[a] < SIRA[b] ? `${a}-${b}` : `${b}-${a}`);

function seciciKur(seed, gorulen = new Set()) {
  const rng = seeded(seed);
  return {
    rng,
    sec(arr) {
      if (!arr?.length) return '';
      if (typeof arr === 'string') return arr;
      const s = rng.weighted(arr.map((x) => ({ item: x, w: gorulen.has(x) ? 0.15 : 1 })));
      gorulen.add(s);
      return s;
    },
  };
}

/** Doğum haritası yorumu. */
export function haritaYorumu(harita, analiz, c, { seed = 'harita', gorulen } = {}) {
  const { sec } = seciciKur(seed, gorulen);
  const k = harita.konumlar;
  const e = harita.evler;
  const bolum = [];
  const B = (lon) => burc(lon).key;
  const gb = c.gezegenBurc;
  const ge = c.gezegenEv;

  // 1. Üçlü: Güneş, Ay, Yükselen
  const gunesB = B(k.gunes.lon), ayB = B(k.ay.lon);
  const ayKesin = !harita.ayAraligi || B(harita.ayAraligi[0]) === B(harita.ayAraligi[1]);
  const uclu = [sec(c.burclar[gunesB].gunes)];
  if (e) uclu.push(sec(ge.gezegenler.gunes[k.gunes.ev]));
  if (ayKesin) {
    uclu.push(sec(c.burclar[ayB].ay));
    if (e) uclu.push(sec(ge.gezegenler.ay[k.ay.ev]));
  } else {
    uclu.push(`Doğum saatin bilinmediği için Ay ${BURCLAR.find((b) => b.key === B(harita.ayAraligi[0])).ad} ya da ${BURCLAR.find((b) => b.key === B(harita.ayAraligi[1])).ad} burcunda olabilir. İkisini de oku; hangisinin sana benzediğini sen bilirsin.`);
    uclu.push(sec(c.burclar[B(harita.ayAraligi[0])].ay), sec(c.burclar[B(harita.ayAraligi[1])].ay));
  }
  if (e) uclu.push(sec(c.burclar[B(e.asc)].yukselen));
  // Üçlü sentezi
  const el = [burc(k.gunes.lon).element, ayKesin ? burc(k.ay.lon).element : null, e ? burc(e.asc).element : null].filter(Boolean);
  let sentez;
  if (el.length === 3 && new Set(el).size === 1) sentez = doldur(c.sentez.ucluler.ayni_element, { element: ELEMENT_ADI[el[0]] });
  else if (ayKesin && gunesB === ayB) sentez = c.sentez.ucluler.ayni_burc;
  else if (el.includes('ates') && el.includes('su')) sentez = c.sentez.ucluler.ates_su;
  else if (el.includes('toprak') && el.includes('hava')) sentez = c.sentez.ucluler.toprak_hava;
  else sentez = c.sentez.ucluler.karisik;
  uclu.push(sec(c.sentez.ozet_baglac) + ' ' + sentez);
  if (!e) uclu.push(sec(c.sentez.saat_yok));
  bolum.push({ tip: 'uclu', baslik: e ? 'Güneş, Ay ve Yükselen' : 'Güneş ve Ay', metin: uclu });

  // 2. Haritanın genel tonu: element/nitelik dengesi, baskın gezegen, yönetici
  const genel = [sec(c.sentez.element_baskin[analiz.denge.baskinElement])];
  if (analiz.denge.zayifElement) genel.push(c.sentez.element_eksik[analiz.denge.zayifElement]);
  genel.push(c.sentez.nitelik_baskin[analiz.denge.baskinNitelik]);
  genel.push(c.sentez.baskin_gezegen[analiz.baskinlik.baskin]);
  if (e && analiz.yonetici) {
    const y = analiz.yonetici;
    genel.push(doldur(sec(c.sentez.yonetici), {
      gezegen: GEZEGEN[y].ad, burc: burc(k[y].lon).ad, ev: k[y].ev, alan: ge.evler[k[y].ev].alan,
    }));
  }
  bolum.push({ tip: 'genel', baslik: 'Haritanın genel tonu', metin: genel });

  // 3. Kişisel gezegenler
  const kisisel = [];
  for (const g of ['merkur', 'venus', 'mars']) {
    kisisel.push(sec(gb.gezegenler[g][B(k[g].lon)]));
    if (e) kisisel.push(sec(ge.gezegenler[g][k[g].ev]));
  }
  bolum.push({ tip: 'kisisel', baslik: 'Zihin, sevgi ve enerji', metin: kisisel });

  // 4. Sosyal ve kuşak gezegenleri
  const sosyal = [];
  for (const g of ['jupiter', 'saturn']) {
    sosyal.push(sec(gb.gezegenler[g][B(k[g].lon)]));
    if (e) sosyal.push(sec(ge.gezegenler[g][k[g].ev]));
  }
  // Kuşak gezegenleri: yalnızca köşedeyse ya da kişisel bir gezegenle sıkı açıdaysa ayrıntı
  for (const g of ['uranus', 'neptun', 'pluton']) {
    const onemli = (e && [1, 4, 7, 10].includes(k[g].ev)) || analiz.acilar.some((a) => (a.a === g || a.b === g) && ['gunes', 'ay', 'merkur', 'venus', 'mars'].includes(a.a === g ? a.b : a.a) && a.orb < 3);
    if (onemli) {
      sosyal.push(sec(gb.gezegenler[g][B(k[g].lon)]));
      if (e) sosyal.push(sec(ge.gezegenler[g][k[g].ev]));
    }
  }
  bolum.push({ tip: 'sosyal', baslik: 'Büyüme, sınırlar ve kuşak', metin: sosyal });

  // 5. Öne çıkan açılar: kişisel noktaları içerenler önce, en sıkı 7 tanesi
  const kisiselNokta = new Set(['gunes', 'ay', 'merkur', 'venus', 'mars', 'asc', 'mc']);
  const secilen = analiz.acilar
    .filter((a) => ANA.includes(a.a) || a.a === 'asc' || a.a === 'mc')
    .filter((a) => ANA.includes(a.b) || a.b === 'asc' || a.b === 'mc')
    .map((a) => ({ ...a, puan: a.guc + (kisiselNokta.has(a.a) ? 0.5 : 0) + (kisiselNokta.has(a.b) ? 0.5 : 0) }))
    .sort((x, y) => y.puan - x.puan)
    .slice(0, 7);
  const acilar = [];
  for (const a of secilen) {
    if (a.a === 'asc' || a.b === 'asc' || a.a === 'mc' || a.b === 'mc') {
      const kose = a.a === 'asc' || a.a === 'mc' ? a.a : a.b;
      const g = kose === a.a ? a.b : a.a;
      if (a.aci === 'kavusum' && c.acilar.koseler[kose]?.[g]) acilar.push(c.acilar.koseler[kose][g]);
      continue;
    }
    const cift = c.acilar.ciftler[ciftAnahtar(a.a, a.b)];
    if (!cift) continue;
    if (a.aci === 'quincunx') { acilar.push(`${GEZEGEN[a.a].ad} ve ${GEZEGEN[a.b].ad} quincunx: ${c.acilar.genel.quincunx}`); continue; }
    acilar.push(cift[DOGA[a.aci]]);
  }
  if (acilar.length) bolum.push({ tip: 'acilar', baslik: 'Öne çıkan açılar', metin: [...new Set(acilar)] });

  // 6. Kalıplar ve geri hareketler
  const kalip = [];
  const adlar = (list) => list.map((g) => GEZEGEN[g].ad).join(', ');
  for (const p of analiz.kaliplar.slice(0, 4)) {
    const tpl = c.sentez.kalip[p.tip];
    if (!tpl) continue;
    kalip.push(doldur(tpl, {
      burc: p.burc ? BURCLAR.find((b) => b.key === p.burc).ad : '', ev: p.ev ?? '', sayi: p.gezegenler.length,
      liste: adlar(p.gezegenler), alan: p.ev ? ge.evler[p.ev].alan : '',
    }));
  }
  for (const g of analiz.retrolar.filter((x) => ['merkur', 'venus', 'mars', 'jupiter', 'saturn'].includes(x))) kalip.push(c.sentez.retro[g]);
  if (kalip.length) bolum.push({ tip: 'kaliplar', baslik: 'Özel işaretler', metin: kalip });

  // 7. Yaşam alanları
  if (e) {
    const ev7 = B(e.cusps[6]), ev2 = B(e.cusps[1]), mcB = B(e.mc);
    bolum.push({ tip: 'ask', baslik: c.sentez.alanlar.ask.baslik, metin: [
      sec(c.sentez.alanlar.ask.giris),
      sec(gb.gezegenler.venus[B(k.venus.lon)]),
      `Yedinci evin başında ${BURCLAR.find((b) => b.key === ev7).ad} var: ilişkide aradığın nitelikler bu burcun dilinden konuşur. ${sec(c.burclar[ev7].portre)}`,
    ] });
    bolum.push({ tip: 'kariyer', baslik: c.sentez.alanlar.kariyer.baslik, metin: [
      sec(c.sentez.alanlar.kariyer.giris), sec(c.burclar[mcB].mc), sec(ge.gezegenler.saturn[k.saturn.ev]),
    ] });
    bolum.push({ tip: 'para', baslik: c.sentez.alanlar.para.baslik, metin: [
      sec(c.sentez.alanlar.para.giris),
      `İkinci evin başında ${BURCLAR.find((b) => b.key === ev2).ad} var. ${sec(c.burclar[ev2].portre)}`,
      sec(ge.gezegenler.jupiter[k.jupiter.ev]),
    ] });
  }

  // 8. Yaşam yönü: Kuzey Ay Düğümü
  const yon = [sec(gb.gezegenler.dugum[B(k.dugum.lon)])];
  if (e) yon.push(sec(ge.gezegenler.dugum[k.dugum.ev]));
  yon.push(sec(gb.gezegenler.lilith[B(k.lilith.lon)]));
  bolum.push({ tip: 'yon', baslik: 'Yaşam yönü ve gölge', metin: yon });

  return { bolumler: bolum, metin: bolum.map((b) => b.baslik + '\n' + b.metin.join(' ')).join('\n\n') };
}

/* ---------- Transitler ---------- */

const TRANSIT_ORB = { ay: 4, gunes: 2, merkur: 2, venus: 2, mars: 2, jupiter: 1.5, saturn: 1.5, uranus: 1.2, neptun: 1.2, pluton: 1.2 };
const TRANSIT_ACILAR = [
  { key: 'kavusum', aci: 0 }, { key: 'karsit', aci: 180 }, { key: 'kare', aci: 90 }, { key: 'ucgen', aci: 120 }, { key: 'altigen', aci: 60 },
];

/** Transit gezegenlerin doğum noktalarına yaptığı açılar. */
export function transitler(natal, gok) {
  const hedefler = ANA.map((key) => ({ key, lon: natal.konumlar[key].lon }));
  if (natal.evler) hedefler.push({ key: 'asc', lon: natal.evler.asc }, { key: 'mc', lon: natal.evler.mc });
  const sonuc = [];
  for (const t of Object.keys(TRANSIT_ORB)) {
    const tk = gok.konumlar[t];
    for (const h of hedefler) {
      // Ay kendi doğum konumuna, Güneş kendi konumuna (doğum günü) kavuşumu da anlamlı; dışlamıyoruz
      const d = fark(tk.lon, h.lon);
      for (const a of TRANSIT_ACILAR) {
        const orb = Math.abs(d - a.aci);
        const sinir = TRANSIT_ORB[t] * (a.key === 'altigen' ? 0.7 : 1);
        if (orb <= sinir) {
          const d2 = fark(tk.lon + tk.hiz * 0.05, h.lon);
          sonuc.push({ transit: t, hedef: h.key, aci: a.key, doga: DOGA[a.key], orb, yaklasan: Math.abs(d2 - a.aci) < orb, yavas: ['jupiter', 'saturn', 'uranus', 'neptun', 'pluton'].includes(t), guc: 1 - orb / sinir });
          break;
        }
      }
    }
  }
  return sonuc.sort((x, y) => y.guc - x.guc);
}

const EVRE = ['yeni', 'hilal', 'ilk_dordun', 'siskin', 'dolunay', 'azalan', 'son_dordun', 'balzamik'];
const EVRE_ADI = { yeni: 'Yeni Ay', hilal: 'Büyüyen hilal', ilk_dordun: 'İlk dördün', siskin: 'Şişkin Ay', dolunay: 'Dolunay', azalan: 'Azalan Ay', son_dordun: 'Son dördün', balzamik: 'Balzamik Ay' };

/** Ay evresi: Güneş-Ay uzanımından 8 evre ve aydınlık oranı. */
export function ayEvresi(gok) {
  const uz = norm360(gok.konumlar.ay.lon - gok.konumlar.gunes.lon);
  const i = Math.floor(((uz + 22.5) % 360) / 45);
  return { key: EVRE[i], ad: EVRE_ADI[EVRE[i]], uzanim: uz, aydinlik: (1 - Math.cos((uz * Math.PI) / 180)) / 2, buyuyor: uz < 180 };
}

// Hangi transit hedefi hangi yaşam alanına yazılır
const ALAN_HEDEF = {
  kariyer: ['mc', 'saturn', 'gunes', 'jupiter', 'mars'],
  ask: ['venus', 'mars', 'ay'],
  ruh: ['ay', 'neptun', 'gunes', 'asc'],
  para: ['venus', 'jupiter', 'saturn'],
};
const ALAN_TRANSIT = {
  kariyer: ['gunes', 'mars', 'jupiter', 'saturn', 'merkur', 'pluton', 'uranus'],
  ask: ['venus', 'mars', 'ay', 'jupiter', 'neptun'],
  ruh: ['ay', 'neptun', 'saturn', 'pluton', 'gunes'],
  para: ['venus', 'jupiter', 'saturn', 'merkur'],
};

/**
 * Günlük yorum. natal yoksa yalnızca genel gökyüzü ve (varsa) Güneş burcuna göre Ay evi.
 * @param {object} p { gok, natal?, gunesBurcu?, content, seed }
 */
export function gunlukYorum({ gok, natal = null, gunesBurcu = null, content: c, seed = 'gun' }) {
  const { sec } = seciciKur(seed);
  const tr = c.transit;
  const ayB = burc(gok.konumlar.ay.lon).key;
  const evre = ayEvresi(gok);
  const sonuc = {
    ayBurc: BURCLAR.find((b) => b.key === ayB),
    ayMetin: sec(tr.ay_burcta[ayB]),
    evre, evreMetin: sec(tr.evreler[evre.key]),
    retrolar: ['merkur', 'venus', 'mars', 'jupiter', 'saturn'].filter((g) => gok.konumlar[g].retro).map((g) => ({ g, ad: GEZEGEN[g].ad, metin: tr.retro_gok[g] })),
    alanlar: {}, transitler: [], donemsel: [], ogut: '',
  };

  let ton = 'notr';
  if (natal) {
    const list = transitler(natal, gok);
    const hedefAd = (h) => (h === 'asc' ? 'Yükselen' : h === 'mc' ? 'MC' : GEZEGEN[h].ad);
    const yaz = (t) => basHarf(doldur(sec(tr.transitler[t.transit][t.doga]), { hedef: hedefAd(t.hedef), hedefAlan: tr.hedef_alan[t.hedef] }));
    const hizli = list.filter((t) => !t.yavas);
    const yavas = list.filter((t) => t.yavas);
    sonuc.transitler = hizli.slice(0, 6).map((t) => ({ ...t, metin: yaz(t) }));
    sonuc.donemsel = yavas.slice(0, 4).map((t) => ({ ...t, metin: yaz(t) }));
    const kullanilan = new Set();
    for (const alan of Object.keys(ALAN_HEDEF)) {
      const t = list.find((x) => !kullanilan.has(x) && ALAN_HEDEF[alan].includes(x.hedef) && ALAN_TRANSIT[alan].includes(x.transit));
      if (t) { kullanilan.add(t); sonuc.alanlar[alan] = yaz(t); } else sonuc.alanlar[alan] = sec(tr.alan_bos[alan]);
    }
    const gerginlik = hizli.slice(0, 5).reduce((s, t) => s + (t.doga === 'gergin' ? t.guc : t.doga === 'uyumlu' ? -t.guc : 0), 0);
    ton = gerginlik > 0.4 ? 'gergin' : gerginlik < -0.4 ? 'akici' : 'notr';
  } else if (gunesBurcu) {
    // Güneş burcuna göre bütün burç evleri: Ay'ın bugün hangi "evde" olduğu
    const i = BURCLAR.findIndex((b) => b.key === gunesBurcu);
    const ev = ((BURCLAR.findIndex((b) => b.key === ayB) - i + 12) % 12) + 1;
    const alan = c.gezegenEv.evler[ev];
    sonuc.burcEvi = { ev, metin: `${BURCLAR[i].ad} için Ay bugün ${ev}. evinden geçiyor (${alan.ad.toLocaleLowerCase('tr-TR')}): ${alan.alan} bugün duygusal olarak öne çıkıyor.` };
    for (const a of Object.keys(ALAN_HEDEF)) sonuc.alanlar[a] = sec(tr.alan_bos[a]);
  } else {
    for (const a of Object.keys(ALAN_HEDEF)) sonuc.alanlar[a] = sec(tr.alan_bos[a]);
  }
  if (evre.key === 'dolunay' || evre.key === 'ilk_dordun' || evre.key === 'son_dordun') ton = ton === 'akici' ? 'notr' : ton;
  sonuc.ton = ton;
  sonuc.ogut = doldur(sec(tr.gunun_ogudu), { ogut: sec(tr.ogutler[ton]) });
  return sonuc;
}

export { EVRE_ADI };
