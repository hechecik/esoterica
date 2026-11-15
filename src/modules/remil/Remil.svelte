<script>
  // Remil modülü: niyet -> atış -> kalkan -> yorum. İçerik kütüphanesi ilk ihtiyaçta yüklenir.
  import { castChart, TOPIC_HOUSES, PERSON_HOUSES, rotateHouse } from '../../engine/remil/chart.js';
  import { yorumla } from '../../engine/interpret/remil.js';
  import Niyet from './Niyet.svelte';
  import Atis from './Atis.svelte';
  import Kalkan from './Kalkan.svelte';
  import Yorum from './Yorum.svelte';

  let adim = $state('niyet');
  let niyet = $state({ konu: 'genel', kisi: 'kendim', soru: '' });
  let chart = $state(null);
  let icerik = $state(null);
  let ortak = $state(null);
  let yorum = $state(null);
  let hata = $state('');

  // Aynı gün aynı fal yeniden açılırsa aynı metin; gün değişince yeni varyantlar
  const gun = () => new Date().toISOString().slice(0, 10);

  async function yukle() {
    if (icerik) return;
    const [r, o] = await Promise.all([
      import('../../content/generated/remil.json'),
      import('../../content/generated/ortak.json'),
    ]);
    icerik = r.default; ortak = o.default;
  }

  function hazir(n) { niyet = n; adim = 'atis'; yukle().catch((e) => (hata = 'Kütüphane yüklenemedi: ' + e.message)); }

  function tamam(counts) {
    try { chart = castChart(counts); adim = 'kalkan'; }
    catch (e) { hata = e.message; }
  }

  async function oku() {
    await yukle();
    const seed = `${chart.bits.join('')}|${niyet.konu}|${niyet.kisi}|${gun()}`;
    yorum = yorumla(chart, icerik, { konu: niyet.konu, kisi: niyet.kisi, ortak, seed });
    adim = 'yorum';
    window.scrollTo({ top: 0 });
  }

  function yeni() { chart = null; yorum = null; adim = 'niyet'; window.scrollTo({ top: 0 }); }

  const vurgulu = $derived.by(() => {
    if (!chart) return [];
    const taban = PERSON_HOUSES[niyet.kisi] ?? 1;
    return [taban, ...TOPIC_HOUSES[niyet.konu].map((h) => rotateHouse(taban, h))];
  });
</script>

<nav class="adimlar kucuk" aria-label="Adımlar">
  {#each [['niyet', 'Niyet'], ['atis', 'Çizgiler'], ['kalkan', 'Kalkan'], ['yorum', 'Yorum']] as [k, ad], i}
    <span class:aktif={adim === k} class:gecti={['niyet', 'atis', 'kalkan', 'yorum'].indexOf(adim) > i}>{ad}</span>
  {/each}
</nav>

{#if hata}<p class="hata">{hata}</p>{/if}

{#if adim === 'niyet'}
  <Niyet onhazir={hazir} />
{:else if adim === 'atis'}
  <Atis ontamam={tamam} />
{:else if adim === 'kalkan'}
  <Kalkan {chart} adlar={icerik?.sekiller} {vurgulu} onoku={oku} />
{:else if adim === 'yorum'}
  <Yorum {yorum} adlar={icerik?.sekiller} soru={niyet.soru} onyeni={yeni} onbasa={() => (adim = 'kalkan')} />
{/if}

<style>
  .adimlar { display: flex; gap: 1.25rem; color: var(--sessiz); padding-top: 0.5rem; }
  .adimlar span { position: relative; }
  .adimlar .gecti { color: var(--ay-soluk); }
  .adimlar .aktif { color: var(--altin); }
  .adimlar .aktif::after { content: ''; position: absolute; left: 0; right: 0; bottom: -4px; height: 1px; background: var(--altin); }
  .hata { color: #e3a07a; }
</style>
