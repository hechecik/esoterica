// Rastgelelik: gerçek çekimler için crypto, yeniden üretilebilir yorumlar
// için tohumlu sfc32. Math.random hiçbir yerde kullanılmaz.

/** 1..max aralığında kriptografik rastgele tam sayı. */
export function secureInt(max) {
  if (!Number.isInteger(max) || max < 1) throw new Error('max >= 1 olmalı');
  const c = globalThis.crypto;
  if (!c?.getRandomValues) throw new Error('crypto.getRandomValues yok');
  const buf = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / max) * max; // yanlılığı önle
  let v;
  do {
    c.getRandomValues(buf);
    v = buf[0];
  } while (v >= limit);
  return (v % max) + 1;
}

/** Remil için 16 satır: her satırda 5..24 arası rastgele vuruş. */
export function secureRemilCounts() {
  return Array.from({ length: 16 }, () => 4 + secureInt(20));
}

/** Metin tohumu -> 4 x 32 bit (cyrb128). */
export function hashSeed(str) {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0; i < str.length; i++) {
    const k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
}

/** Tohumlu, belirleyici üreteç (sfc32). Aynı tohum aynı diziyi verir. */
export function seeded(seedText) {
  let [a, b, c, d] = hashSeed(String(seedText));
  const next = () => {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
  for (let i = 0; i < 12; i++) next(); // ısınma
  const rng = {
    float: next,
    int: (max) => Math.floor(next() * max), // 0..max-1
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    shuffle: (arr) => {
      const a2 = [...arr];
      for (let i = a2.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a2[i], a2[j]] = [a2[j], a2[i]];
      }
      return a2;
    },
    /** Ağırlıklı seçim: [{item, w}] */
    weighted: (items) => {
      const total = items.reduce((s, x) => s + (x.w ?? 1), 0);
      let r = next() * total;
      for (const x of items) {
        r -= x.w ?? 1;
        if (r <= 0) return x.item;
      }
      return items[items.length - 1].item;
    },
  };
  return rng;
}
