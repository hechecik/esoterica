// Oturum içi kişi deposu: kullanıcının kendi doğum bilgisi ve yakınları.
// Varsayılan olarak yalnızca bellekte durur; sekme kapanınca biter.
// Kasa açıldıysa (src/engine/store/kasa.js) şifreli olarak IndexedDB'ye yazılır.

const durum = $state({ ben: null, yakinlar: [] });

export const kisi = {
  get ben() { return durum.ben; },
  set ben(v) { durum.ben = v; dinleyiciler.forEach((f) => f()); },
  get yakinlar() { return durum.yakinlar; },
  set yakinlar(v) { durum.yakinlar = v; dinleyiciler.forEach((f) => f()); },
  /** Kasa modülü değişiklikleri dinleyip şifreli kaydeder. */
  dinle(f) { dinleyiciler.add(f); return () => dinleyiciler.delete(f); },
  disaAktar() { return { ben: durum.ben, yakinlar: durum.yakinlar }; },
  iceAktar(v) { durum.ben = v?.ben ?? null; durum.yakinlar = v?.yakinlar ?? []; },
  temizle() { durum.ben = null; durum.yakinlar = []; },
};
const dinleyiciler = new Set();
