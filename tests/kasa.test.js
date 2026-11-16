import { describe, it, expect } from 'vitest';
import { anahtarTuret, sifrele, coz } from '../src/engine/store/kasa.js';

// Testte yineleme düşük tutulur; üretimde 310 000.
const Y = 1000;
const tuz = crypto.getRandomValues(new Uint8Array(16));

describe('kasa şifreleme', () => {
  it('doğru parola ile çözülür', async () => {
    const a = await anahtarTuret('gizli-parola-1', tuz, Y);
    const k = await sifrele(a, tuz, { ben: { tarih: '1990-06-01' } }, Y);
    expect(await coz(a, k)).toEqual({ ben: { tarih: '1990-06-01' } });
  });
  it('yanlış parola ile çözülemez', async () => {
    const a = await anahtarTuret('gizli-parola-1', tuz, Y);
    const b = await anahtarTuret('gizli-parola-2', tuz, Y);
    const k = await sifrele(a, tuz, { x: 1 }, Y);
    await expect(coz(b, k)).rejects.toThrow();
  });
  it('şifreli metin düz veriyi içermez ve her seferinde farklıdır', async () => {
    const a = await anahtarTuret('gizli-parola-1', tuz, Y);
    const k1 = await sifrele(a, tuz, { ad: 'Ayşe' }, Y);
    const k2 = await sifrele(a, tuz, { ad: 'Ayşe' }, Y);
    expect(new TextDecoder().decode(k1.ct)).not.toContain('Ayşe');
    expect(Buffer.from(k1.ct).equals(Buffer.from(k2.ct))).toBe(false);
  });
  it('anahtar dışa aktarılamaz', async () => {
    const a = await anahtarTuret('gizli-parola-1', tuz, Y);
    expect(a.extractable).toBe(false);
  });
});
