<script>
  import { router } from './app/router.svelte.js';
  import YildizAlani from './ui/YildizAlani.svelte';
  import Ana from './app/Ana.svelte';
  import Gizlilik from './app/Gizlilik.svelte';
  import Remil from './modules/remil/Remil.svelte';

  const sayfa = $derived(
    router.path.startsWith('/remil') ? Remil :
    router.path === '/gizlilik' ? Gizlilik : Ana,
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
    <svelte:component this={sayfa} />
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
