import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// GitHub Pages proje sitesi: https://hechecik.github.io/esoterica/
export default defineConfig({
  base: '/esoterica/',
  plugins: [svelte()],
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
