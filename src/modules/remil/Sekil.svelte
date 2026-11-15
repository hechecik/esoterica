<script>
  // Bir remil şekli: dört satır, her satırda bir ya da iki nokta.
  import { FIGURES } from '../../engine/remil/figures.js';
  let { key, boy = 36, etiket = '', vurgu = false, gecikme = 0, canli = true } = $props();
  const rows = $derived(FIGURES[key]?.rows ?? [2, 2, 2, 2]);
  const r = $derived(boy / 11);
</script>

<figure class="sekil" class:vurgu aria-label={etiket || key} style="--d:{gecikme}ms">
  <svg width={boy} height={boy * 1.15} viewBox="0 0 {boy} {boy * 1.15}">
    {#each rows as n, i}
      {#if n === 1}
        <circle class:canli cx={boy / 2} cy={boy * 0.16 + i * boy * 0.28} r={r} style="--i:{i}" />
      {:else}
        <circle class:canli cx={boy * 0.32} cy={boy * 0.16 + i * boy * 0.28} r={r} style="--i:{i}" />
        <circle class:canli cx={boy * 0.68} cy={boy * 0.16 + i * boy * 0.28} r={r} style="--i:{i}" />
      {/if}
    {/each}
  </svg>
  {#if etiket}<figcaption class="kucuk">{etiket}</figcaption>{/if}
</figure>

<style>
  .sekil { margin: 0; display: inline-flex; flex-direction: column; align-items: center; gap: 0.3rem; }
  circle { fill: var(--ay); }
  .vurgu circle { fill: var(--altin-acik); filter: drop-shadow(0 0 4px rgba(227, 199, 122, 0.6)); }
  circle.canli { opacity: 0; transform-origin: center; transform-box: fill-box; animation: dogus 420ms var(--yay) forwards; animation-delay: calc(var(--d) + var(--i) * 90ms); }
  @keyframes dogus { from { opacity: 0; transform: scale(0.2); } to { opacity: 1; transform: scale(1); } }
  figcaption { color: var(--ay-soluk); font-family: var(--serif); font-size: var(--t-0); text-align: center; line-height: 1.15; }
  @media (prefers-reduced-motion: reduce) { circle.canli { animation: none; opacity: 1; } }
</style>
