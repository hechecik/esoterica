<script>
  import { haritaYorumu } from '../../engine/interpret/astro.js';
  let { harita, analiz, girdi } = $props();
  let icerik = $state(null);
  let hata = $state('');

  $effect(() => {
    import('../../content/generated/astroloji.json').then((m) => (icerik = m.default)).catch((e) => (hata = e.message));
  });

  const gun = new Date().toISOString().slice(0, 10);
  const yorum = $derived(icerik ? haritaYorumu(harita, analiz, icerik, { seed: `${harita.utcMs}|${girdi.yer.enlem}|${gun}` }) : null);
</script>

{#if hata}<p class="hata">Yorum kütüphanesi yüklenemedi: {hata}</p>{/if}
{#if !yorum}
  <p class="sessiz">Yorum hazırlanıyor…</p>
{:else}
  <div class="yorum">
    {#each yorum.bolumler as b, i}
      <section class="bolum" style="--i:{i}">
        <h2>{b.baslik}</h2>
        <div class="okuma">{#each b.metin as m}<p>{m}</p>{/each}</div>
      </section>
    {/each}
    <p class="kucuk sessiz not">Astroloji bir kendini düşünme dili; bir kader hükmü değil. Bu yorum her gün biraz farklı cümlelerle yeniden yazılır, ama haritanın kendisi değişmez.</p>
  </div>
{/if}

<style>
  .yorum { display: grid; gap: 2rem; }
  .bolum { display: grid; gap: 0.6rem; animation: gel 500ms var(--yay) both; animation-delay: calc(var(--i) * 70ms); }
  h2 { font-size: var(--t-2); color: var(--altin-acik); }
  .not { border-top: 1px solid var(--cizgi); padding-top: 1rem; }
  .hata { color: #e3a07a; }
  @keyframes gel { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .bolum { animation: none; } }
</style>
