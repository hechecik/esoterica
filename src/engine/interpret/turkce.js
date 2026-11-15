// Türkçe ek motoru: ünlü uyumu, ünsüz benzeşmesi, kaynaştırma,
// özel isimlerde kesme işareti, sayıların okunuşuna göre ek.
//
// Kullanım:  ek('Beyâz', 'in')  -> "Beyâz'ın"   (özel isim varsayılanı)
//            ek('kitap', 'e', { ozel: false }) -> "kitaba"
//            ek(9, 'de') -> "9'da"

const BACK = 'aıouâû';
const FRONT = 'eiöüîê';
const ROUND = 'ouöüûÛ';
const VOWELS = BACK + FRONT;
const VOICELESS = 'fstkçşhpFSTKÇŞHP';

// Yumuşamayan yaygın kelimeler (tek heceliler ve bazı alıntılar)
const NO_SOFTEN = new Set(['at', 'et', 'ot', 'süt', 'top', 'kat', 'saat', 'sanat', 'hukuk', 'ahlak', 'millet', 'devlet', 'sepet', 'tabiat']);

// Son ünlüsü kalın yazılsa da ince ek alan kelimeler (ince a / ince l).
// Sözlükten gelen terimler opts.sonUnlu ile de düzeltilebilir.
const INCE_SON = new Map([
  ['cemaat', 'e'], ['saat', 'e'], ['hakikat', 'e'], ['sıhhat', 'e'], ['kalp', 'e'],
  ['rol', 'e'], ['gol', 'e'], ['sembol', 'e'], ['alkol', 'e'], ['petrol', 'e'],
  ['hâl', 'e'], ['hal', 'e'], ['ihtimal', 'e'], ['istikbal', 'e'], ['kabul', 'e'],
  ['meşgul', 'e'], ['harf', 'e'], ['şefkat', 'e'], ['dikkat', 'e'], ['kudret', 'e'],
]);

function lastVowel(word) {
  const w = word.toLowerCase();
  const exc = INCE_SON.get(w) ?? INCE_SON.get(w.split(/[\s-]/).pop());
  if (exc) return exc;
  for (let i = w.length - 1; i >= 0; i--) {
    if (VOWELS.includes(w[i])) return w[i];
  }
  return null;
}

function endsWithVowel(word) {
  const w = word.toLowerCase();
  return VOWELS.includes(w[w.length - 1]);
}

function isBack(v) {
  return BACK.includes(v);
}
function isRound(v) {
  return ROUND.includes(v);
}

/** Dörtlü uyum: i / ı / ü / u */
function fourWay(v) {
  if (!v) return 'i';
  if (isBack(v)) return isRound(v) ? 'u' : 'ı';
  return isRound(v) ? 'ü' : 'i';
}
/** İkili uyum: e / a */
function twoWay(v) {
  if (!v) return 'e';
  return isBack(v) ? 'a' : 'e';
}

// Sayıların okunuşu için son hece bilgisi: [sonUnlu, unluyleBitiyor, sessizSert]
const DIGIT_INFO = {
  0: ['ı', false, false], // sıfır
  1: ['i', false, false], // bir
  2: ['i', true, false], // iki
  3: ['ü', false, true], // üç
  4: ['ö', false, true], // dört
  5: ['e', false, true], // beş
  6: ['ı', true, false], // altı
  7: ['i', true, false], // yedi
  8: ['i', false, false], // sekiz
  9: ['u', false, false], // dokuz
};
const TENS_INFO = {
  10: ['o', false, false], // on
  20: ['i', false, false], // yirmi -> aslında ünlüyle biter
  30: ['u', false, false], // otuz
  40: ['ı', false, true], // kırk
  50: ['i', false, false], // elli
  60: ['ı', false, true], // altmış
  70: ['i', false, true], // yetmiş
  80: ['e', false, false], // seksen
  90: ['a', false, false], // doksan
};
TENS_INFO[20] = ['i', true, false];
TENS_INFO[50] = ['i', true, false];

function numberInfo(n) {
  const abs = Math.abs(Math.trunc(n));
  if (abs === 0) return DIGIT_INFO[0];
  if (abs % 1000 === 0) return ['i', false, false]; // bin
  if (abs % 100 === 0) return ['ü', false, false]; // yüz
  const last = abs % 10;
  if (last !== 0) return DIGIT_INFO[last];
  return TENS_INFO[abs % 100] ?? DIGIT_INFO[0];
}

/**
 * Bir kelimeyi ek alacak biçimde çözümler.
 * @returns {{lastVowel:string, vowelEnd:boolean, voicelessEnd:boolean, text:string, ozel:boolean, apostrophe:boolean}}
 */
export function analyze(word, opts = {}) {
  if (typeof word === 'number') {
    const [v, ve, hard] = numberInfo(word);
    return { text: String(word), lastVowel: v, vowelEnd: ve, voicelessEnd: hard, ozel: true, apostrophe: true };
  }
  const text = String(word);
  const bare = text.replace(/['’]$/, '');
  const lv = opts.sonUnlu ?? lastVowel(bare);
  const ve = opts.unluyleBiter ?? endsWithVowel(bare);
  const last = bare[bare.length - 1] ?? '';
  const voiceless = VOICELESS.includes(last);
  const ozel = opts.ozel ?? /^[A-ZÇĞİÖŞÜÂÎÛ]/.test(bare);
  return { text: bare, lastVowel: lv, vowelEnd: ve, voicelessEnd: voiceless, ozel, apostrophe: opts.kesme ?? ozel };
}

function soften(text) {
  const low = text.toLowerCase();
  if (NO_SOFTEN.has(low)) return text;
  const last = text[text.length - 1];
  const map = { p: 'b', ç: 'c', t: 'd', k: 'ğ', P: 'B', Ç: 'C', T: 'D', K: 'Ğ' };
  // Tek heceli kelimelerde yumuşama genelde olmaz
  const vowelCount = [...low].filter((ch) => VOWELS.includes(ch)).length;
  if (vowelCount <= 1) return text;
  if (map[last]) return text.slice(0, -1) + map[last];
  return text;
}

/**
 * Ek türleri: in (ilgi), e (yönelme), i (belirtme), de (bulunma),
 * den (ayrılma), ler (çoğul), le (ile), si (3. tekil iyelik), ken ('-ken' yok),
 * dir (bildirme), lik.
 */
export function ek(word, tur, opts = {}) {
  const a = analyze(word, opts);
  const v = a.lastVowel;
  let base = a.text;
  let suffix = '';
  const ap = a.apostrophe ? "'" : '';

  switch (tur) {
    case 'in': // -(n)in
      suffix = (a.vowelEnd ? 'n' : '') + fourWay(v) + 'n';
      break;
    case 'e': // -(y)e
      suffix = (a.vowelEnd ? 'y' : '') + twoWay(v);
      break;
    case 'i': // -(y)i
      suffix = (a.vowelEnd ? 'y' : '') + fourWay(v);
      break;
    case 'de':
      suffix = (a.voicelessEnd ? 't' : 'd') + twoWay(v);
      break;
    case 'den':
      suffix = (a.voicelessEnd ? 't' : 'd') + twoWay(v) + 'n';
      break;
    case 'ler':
      suffix = 'l' + twoWay(v) + 'r';
      break;
    case 'le': // -(y)le
      suffix = (a.vowelEnd ? 'y' : '') + 'l' + twoWay(v);
      break;
    case 'si': // -(s)i
      suffix = (a.vowelEnd ? 's' : '') + fourWay(v);
      break;
    case 'dir':
      suffix = (a.voicelessEnd ? 't' : 'd') + fourWay(v) + 'r';
      break;
    case 'lik':
      suffix = 'l' + fourWay(v) + (fourWay(v) === 'ı' || fourWay(v) === 'i' ? 'k' : 'k');
      break;
    case 'ki': // -deki / -daki
      suffix = (a.voicelessEnd ? 't' : 'd') + twoWay(v) + 'ki';
      break;
    default:
      throw new Error(`Bilinmeyen ek: ${tur}`);
  }

  // Ünlüyle başlayan ek + özel olmayan isim -> yumuşama
  const startsWithVowel = VOWELS.includes(suffix[0]);
  if (startsWithVowel && !a.ozel && !a.vowelEnd) base = soften(base);

  return base + ap + suffix;
}

/**
 * Şablon doldurucu: "{ad|in} etkisi" -> ek(ad, 'in') + " etkisi"
 * Değerler düz metin ya da {text, opts} olabilir.
 */
export function doldur(template, vars) {
  return template.replace(/\{([a-zA-Z0-9_]+)(?:\|([a-z]+))?\}/g, (_, name, tur) => {
    const val = vars[name];
    if (val === undefined || val === null) return `{${name}}`;
    const text = typeof val === 'object' && 'text' in val ? val.text : val;
    const opts = typeof val === 'object' && 'opts' in val ? val.opts : {};
    if (!tur) return String(text);
    return ek(text, tur, opts);
  });
}

/** Cümle başı büyük harf (Türkçe i/İ doğru). */
export function basHarf(s) {
  if (!s) return s;
  const first = s[0] === 'i' ? 'İ' : s[0].toLocaleUpperCase('tr-TR');
  return first + s.slice(1);
}
