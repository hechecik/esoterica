// Şifreli kasa: isteğe bağlı kalıcı saklama.
// Varsayılan davranış hiçbir şey saklamamaktır. Kullanıcı bir parola belirlerse
// veri PBKDF2 (SHA-256) ile türetilen anahtarla AES-GCM-256 şifrelenip IndexedDB'ye yazılır.
// Parola ve anahtar hiçbir yere yazılmaz; anahtar yalnızca bellekte, dışa aktarılamaz biçimde durur.

const YINELEME = 310_000; // OWASP 2023 önerisi (PBKDF2-HMAC-SHA256)
const SURUM = 1;
const DB = 'esoterica';
const DEPO = 'kasa';
const ANAHTAR = 'veri';

const enc = new TextEncoder();
const dec = new TextDecoder();
const subtle = () => globalThis.crypto.subtle;
const rastgele = (n) => globalThis.crypto.getRandomValues(new Uint8Array(n));

export async function anahtarTuret(parola, tuz, yineleme = YINELEME) {
  const ham = await subtle().importKey('raw', enc.encode(parola.normalize('NFC')), 'PBKDF2', false, ['deriveKey']);
  return subtle().deriveKey(
    { name: 'PBKDF2', salt: tuz, iterations: yineleme, hash: 'SHA-256' },
    ham, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'],
  );
}

/** Nesneyi şifreler. Dönen kayıt düz veridir (IndexedDB'ye yazılabilir). */
export async function sifrele(anahtar, tuz, veri, yineleme = YINELEME) {
  const iv = rastgele(12);
  const ct = await subtle().encrypt({ name: 'AES-GCM', iv }, anahtar, enc.encode(JSON.stringify(veri)));
  return { v: SURUM, tuz, iv, ct: new Uint8Array(ct), yineleme };
}

/** Yanlış parola ya da bozulmuş kayıtta hata fırlatır. */
export async function coz(anahtar, kayit) {
  const pt = await subtle().decrypt({ name: 'AES-GCM', iv: kayit.iv }, anahtar, kayit.ct);
  return JSON.parse(dec.decode(pt));
}

/* ---------- IndexedDB ---------- */

function ac() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(DEPO);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function islem(mod, f) {
  const db = await ac();
  try {
    return await new Promise((res, rej) => {
      const tx = db.transaction(DEPO, mod);
      const r = f(tx.objectStore(DEPO));
      tx.oncomplete = () => res(r?.result);
      tx.onerror = () => rej(tx.error);
    });
  } finally { db.close(); }
}
const oku = () => islem('readonly', (s) => s.get(ANAHTAR));
const yaz = (k) => islem('readwrite', (s) => s.put(k, ANAHTAR));

/* ---------- Oturum ---------- */

let oturum = null; // { anahtar, tuz, yineleme }

export const kasa = {
  get acik() { return !!oturum; },
  async varMi() { try { return !!(await oku()); } catch { return false; } },
  async olustur(parola, veri) {
    if (!parola || parola.length < 8) throw new Error('Parola en az 8 karakter olmalı.');
    const tuz = rastgele(16);
    const anahtar = await anahtarTuret(parola, tuz);
    oturum = { anahtar, tuz, yineleme: YINELEME };
    await yaz(await sifrele(anahtar, tuz, veri));
  },
  async kilitAc(parola) {
    const k = await oku();
    if (!k) throw new Error('Kayıtlı kasa yok.');
    const anahtar = await anahtarTuret(parola, k.tuz, k.yineleme);
    let veri;
    try { veri = await coz(anahtar, k); } catch { throw new Error('Parola yanlış.'); }
    oturum = { anahtar, tuz: k.tuz, yineleme: k.yineleme };
    return veri;
  },
  async kaydet(veri) {
    if (!oturum) return;
    await yaz(await sifrele(oturum.anahtar, oturum.tuz, veri, oturum.yineleme));
  },
  kilitle() { oturum = null; },
};

/**
 * Cihazdaki her izi siler: kasa, IndexedDB, önbellekler, service worker, depolama.
 * Sonrasında sayfa yeniden yüklenmelidir.
 */
export async function herSeyiSil() {
  oturum = null;
  const bekle = [];
  if (globalThis.indexedDB) {
    bekle.push(new Promise((res) => { const r = indexedDB.deleteDatabase(DB); r.onsuccess = r.onerror = r.onblocked = () => res(); }));
  }
  if (globalThis.caches) bekle.push(caches.keys().then((ks) => Promise.all(ks.map((k) => caches.delete(k)))));
  if (globalThis.navigator?.serviceWorker) bekle.push(navigator.serviceWorker.getRegistrations().then((rs) => Promise.all(rs.map((r) => r.unregister()))));
  try { localStorage.clear(); sessionStorage.clear(); } catch { /* yok say */ }
  await Promise.all(bekle);
}
