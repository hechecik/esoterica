<script>
  // Yorum ekranı: bölümler sırayla açılır ("falcı konuşuyor"); "hepsini göster" ile atlanır.
  import Sekil from './Sekil.svelte';
  let { yorum, adlar, soru = '', onyeni, onbasa } = $props();
  const ad = (k) => adlar?.[k]?.ad ?? k;
  const basliklar = {
    acilis: '', hakim: 'Hüküm', taniklar: 'Tanıklar', soran: 'Soran', soru: 'Soru', gelinme: 'Gelinme',
    vurgu: 'Vurgu', celiski: 'Gerilim', zaman: 'Zamanlama', uzlastirici: 'Uzlaştırıcı', ogut: '', kapanis: '',
  };
  let gorunen = $state(1);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let zamanlayici;
  $effect(() => {
    if (reduce) { gorunen = yorum.bolumler.length; return; }
    zamanlayici = setInterval(() => {
      if (gorunen >= yorum.bolumler.length) clearInterval(zamanlayici);
      else gorunen += 1;
    }, 1700);
    return () => clearInterval(zamanlayici);
  });
  function hepsi() { clearInterval(zamanlayici); gorunen = yorum.bolumler.length; }

  async function kopyala() {
    const metin = (soru ? `Soru: ${soru}\n\n` : '') + yorum.metin + '\n\n— Esoterica';
    try { await navigator.clipboard.writeText(metin); kopyalandi = true; setTimeout(() => (kopyalandi = false), 1800); } catch { /* pano yoksa sessiz geç */ }
  }
  let kopyalandi = $state(false);
</script>

<section class="yorum">
  <header>
    <h1>Yorum</h1>
    {#if soru}<p class="okuma sessiz">“{soru}”</p>{/if}
  </header>

  <div class="bolumler">
    {#each yorum.bolumler.slice(0, gorunen) as b, i (i)}
      <article class="bolum" class:kapanis={b.tip === 'kapanis'}>
        {#if b.sekil && !Array.isArray(b.sekil)}
          <div class="kenar"><Sekil key={b.sekil} boy={26} canli={false} /></div>
        {:else if Array.isArray(b.sekil)}
          <div class="kenar cift">{#each b.sekil as k}<Sekil key={k} boy={22} canli={false} />{/each}</div>
        {:else}
          <div class="kenar"></div>
        {/if}
        <div class="govde">
          {#if basliklar[b.tip]}<h3>{basliklar[b.tip]}{#if b.hane} <span class="sessiz">· {b.hane}. hane</span>{/if}</h3>{/if}
          <div class="okuma">
            {#each b.metin as m}<p>{m}</p>{/each}
          </div>
        </div>
      </article>
    {/each}
  </div>

  <div class="alt">
    {#if gorunen < yorum.bolumler.length}
      <button class="dugme sade" onclick={hepsi}>Hepsini göster</button>
    {:else}
      <button class="dugme sade" onclick={kopyala}>{kopyalandi ? 'Kopyalandı' : 'Metni kopyala'}</button>
      <button class="dugme" onclick={onbasa}>Kalkana dön</button>
      <button class="dugme asil" onclick={onyeni}>Yeni fal</button>
    {/if}
  </div>
</section>

<style>
  .yorum { display: grid; gap: 1.5rem; padding: 1.5rem 0; }
  header { display: grid; gap: 0.5rem; }
  .bolumler { display: grid; gap: 1.75rem; }
  .bolum { display: grid; grid-template-columns: 2.5rem 1fr; gap: 0.75rem; animation: gel 600ms var(--yay) both; }
  @keyframes gel { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  .kenar { display: grid; justify-items: center; align-content: start; padding-top: 0.35rem; }
  .kenar.cift { gap: 0.35rem; }
  .govde { display: grid; gap: 0.5rem; }
  h3 { font-size: var(--t-1); color: var(--altin); }
  .kapanis .okuma { font-style: italic; color: var(--ay-soluk); }
  .alt { display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end; border-top: 1px solid var(--cizgi); padding-top: 1.25rem; }
  @media (prefers-reduced-motion: reduce) { .bolum { animation: none; } }
</style>
