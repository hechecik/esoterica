<script>
  import { router } from './app/router.svelte.js';
  import YildizAlani from './ui/YildizAlani.svelte';
  import Ana from './app/Ana.svelte';
  import Gizlilik from './app/Gizlilik.svelte';
  import Remil from './modules/remil/Remil.svelte';
  import { kisi } from './app/kisi.svelte.js';
  import { kasa } from './engine/store/kasa.js';

  // Kasa açıksa kişi bilgisi değiştikçe şifreli olarak yeniden yazılır; kapalıysa hiçbir şey saklanmaz.
  kisi.dinle(() => { if (kasa.acik) kasa.kaydet($state.snapshot(kisi.disaAktar())).catch(() => {}); });

  // Modüller tembel yüklenir: ilk açılış küçük kalır
  const MODULLER = {
    '/harita': () => import('./modules/harita/Harita.svelte'),
    '/gunluk': () => import('./modules/gunluk/Gunluk.svelte'),
    '/tarot': () => import('./modules/kartfal/KartFali.svelte'),
    '/lenormand': () => import('./modules/kartfal/KartFali.svelte'),
    '/run': () => import('./modules/kartfal/KartFali.svelte'),
    '/iskambil': () => import('./modules/kartfal/KartFali.svelte'),
    '/iching': () => import('./modules/iching/IChing.svelte'),
    '/kahve': () => import('./modules/kahve/Kahve.svelte'),
    '/ruya': () => import('./modules/ruya/Ruya.svelte'),
    '/sayilar': () => import('./modules/sayilar/Sayilar.svelte'),
    '/deste': () => import('./modules/kartfal/Deste.svelte'),
  };
  const anahtar = (p) => (p.startsWith('/deste') ? '/deste' : p);
  // Yüklenen bileşen hangi yol için yüklendiyse yalnızca o yolda gösterilir;
  // böylece yol değişirken eski modül yeni yolla bir an bile kurulmaz.
  let tembel = $state(null); // { yol, bilesen }
  $effect(() => {
    const yol = router.path;
    const yukle = MODULLER[anahtar(yol)];
    if (yukle) yukle().then((m) => { if (router.path === yol) tembel = { yol, bilesen: m.default }; });
  });
  const Sayfa = $derived(
    router.path.startsWith('/remil') ? Remil :
    router.path === '/gizlilik' ? Gizlilik :
    MODULLER[anahtar(router.path)] ? (tembel?.yol === router.path ? tembel.bilesen : null) : Ana,
  );
</script>

<YildizAlani />

<header class="ust">
  <a href="#/" class="marka" aria-label="Esoterica ana sayfa">
    <svg width="22" height="22" viewBox="0 0 64 64" aria-hidden="true"><g fill="currentColor"><circle cx="32" cy="14" r="5"/><circle cx="32" cy="50" r="5"/><circle cx="20" cy="32" r="5"/><circle cx="44" cy="32" r="5"/></g></svg>
    <span>Esoterica</span>
  </a>
  <a href="#/gizlilik" class="kucuk sessiz">Falın sende kalır</a>
</header>

<main class="sayfa">
  {#key router.path}
    {#if Sayfa}
      <Sayfa />
    {:else}
      <p class="sessiz yukleniyor">Açılıyor…</p>
    {/if}
  {/key}
</main>

<style>
  .ust {
    position: relative; z-index: 1;
    max-width: var(--sutun); margin: 0 auto; padding: 1.25rem var(--kenar);
    display: flex; align-items: center; justify-content: space-between;
  }
  .marka { display: inline-flex; align-items: center; gap: 0.6rem; color: var(--altin); font-family: var(--serif); font-size: var(--t-2); font-weight: 500; letter-spacing: 0.04em; }
  .marka:hover { text-decoration: none; color: var(--altin-acik); }
</style>
