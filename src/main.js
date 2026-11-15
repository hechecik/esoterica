import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';

mount(App, { target: document.getElementById('app') });

// Çevrimdışı ve gizlilik: service worker + tüm modüllerin arka planda ön yüklenmesi
if ('serviceWorker' in navigator && !localStorage.getItem('esoterica:veri-tasarrufu')) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/esoterica/sw.js', { scope: '/esoterica/' });
      const liste = await fetch('/esoterica/onyukle.json').then((r) => (r.ok ? r.json() : []));
      (reg.active ?? reg.waiting ?? reg.installing)?.postMessage({ tip: 'onyukle', dosyalar: liste });
    } catch { /* geliştirme sunucusunda sw olmayabilir */ }
  });
}
