import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// GitHub Pages proje sitesi: https://hechecik.github.io/esoterica/
// Swiss Ephemeris paketinde hiç çağrılmayan bir CDN indirme yöntemi var (loadStandardEphemeris).
// Biz Moshier kipini kullanıyoruz; adres paketin içinde kalmasın diye derlemede silinir.
const cdnTemizle = {
  name: 'cdn-temizle',
  transform(code, id) {
    if (id.includes('@swisseph/browser') && code.includes('cdn.jsdelivr.net')) {
      return { code: code.replace(/https:\/\/cdn\.jsdelivr\.net\/gh\/aloistr\/swisseph\/ephe/g, ''), map: null };
    }
  },
};

export default defineConfig({
  base: '/esoterica/',
  plugins: [svelte(), cdnTemizle],
  build: {
    target: 'es2022',
    sourcemap: false,
    // Hiçbir şey inline edilmesin: CSP 'self' ile uyum
    assetsInlineLimit: 0,
    modulePreload: { polyfill: false },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
