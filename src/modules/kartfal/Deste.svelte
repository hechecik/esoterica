<script>
  // Desteyi tanı: bir destenin bütün kartları, dokununca anlamı.
  import { router } from '../../app/router.svelte.js';
  import { tarotDeste, iskambilDeste } from '../../engine/interpret/fal.js';
  import FalKarti from '../../ui/FalKarti.svelte';

  const TURLER = {
    tarot: { ad: 'Tarot destesi', yukle: () => import('../../content/generated/tarot.json'), deste: (c) => tarotDeste(c) },
    lenormand: { ad: 'Lenormand destesi', yukle: () => import('../../content/generated/lenormand.json'), deste: (c) => c.kartlar },
    run: { ad: 'Rün taşları', yukle: () => import('../../content/generated/run.json'), deste: (c) => c.runler },
    iskambil: { ad: 'İskambil destesi', yukle: () => import('../../content/generated/iskambil.json'), deste: (c) => iskambilDeste(c) },
  };
  const tur = router.path.split('/')[2] in TURLER ? router.path.split('/')[2] : 'tarot';
  const T = TURLER[tur];

  let c = $state(null);
  let secili = $state(null);
  let grup = $state('hepsi');
  $effect(() => { T.yukle().then((m) => (c = m.default)); });

  const kartlar = $derived(c ? T.deste(c) : []);
  const GRUPLAR = { tarot: [['hepsi', 'Hepsi'], ['buyuk', 'Büyük arkana'], ['asa', 'Asalar'], ['kupa', 'Kupalar'], ['kilic', 'Kılıçlar'], ['tilsim', 'Tılsımlar']], iskambil: [['hepsi', 'Hepsi'], ['kupa', 'Kupa'], ['karo', 'Karo'], ['sinek', 'Sinek'], ['maca', 'Maça']] };
  const gorunen = $derived(kartlar.filter((k) => grup === 'hepsi' || (grup === 'buyuk' ? k.buyuk : (k.seri ?? k.renk) === grup)));

  function anlam(k) {
    if (tur === 'tarot') {
      if (k.buyuk) return { ust: k.veri.anahtar, duz: k.veri.duz[0], ters: k.veri.ters[0], ask: k.veri.ask, is: k.veri.is, ogut: k.veri.ogut };
      return { ust: `${c.seriler[k.seri].tema}; ${c.rutbeler[k.rutbe].tema}`, duz: k.veri.duz, ters: k.veri.ters, ask: k.veri.ask, is: k.veri.is, ogut: k.veri.ogut };
    }
    if (tur === 'lenormand') return { ust: k.konu, duz: k.anlam.join(' ') };
    if (tur === 'run') return { ust: k.anlam, duz: k.duz, ters: k.ters_olur ? k.ters : null };
    return { ust: c.renkler[k.renk].tema, duz: c.ozel[k.id] };
  }
  const digerleri = [['tarot', 'Tarot'], ['lenormand', 'Lenormand'], ['run', 'Rün'], ['iskambil', 'İskambil']];
</script>

<section class="deste">
  <header>
    <h1>{T.ad}</h1>
    <p class="okuma sessiz">Bir karta dokun, anlamını oku. Açılım yapmak için <a href="#/{tur}">buradan</a> başla.</p>
    <nav class="cipler" aria-label="Desteler">
      {#each digerleri as [k, a]}<a class="cip" aria-current={k === tur ? 'page' : undefined} href="#/deste/{k}">{a}</a>{/each}
    </nav>
  </header>

  {#if GRUPLAR[tur]}
    <div class="cipler" role="group" aria-label="Grup">
      {#each GRUPLAR[tur] as [k, a]}<button class="cip" aria-pressed={grup === k} onclick={() => (grup = k)}>{a}</button>{/each}
    </div>
  {/if}

  {#if !c}<p class="sessiz">Deste açılıyor…</p>{:else}
    <ul class="izgara">
      {#each gorunen as k, i (k.id ?? k.key ?? k.no)}
        <li>
          <button class="kart-dugme" aria-label={k.ad} aria-expanded={secili === k} onclick={() => (secili = secili === k ? null : k)}>
            <FalKarti {tur} kart={k} acik={true} boyut="orta" gecikme={Math.min(i, 20) * 25} />
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  {#if secili}
    {@const a = anlam(secili)}
    <div class="perde" role="presentation" onclick={() => (secili = null)}></div>
    <dialog open class="detay" aria-label={secili.ad}>
      <div class="detay-ic">
        <FalKarti {tur} kart={secili} acik={true} boyut="buyuk" />
        <div class="metin">
          <h2>{secili.ad}</h2>
          {#if a.ust}<p class="kucuk sessiz">{a.ust}</p>{/if}
          <p class="okuma">{a.duz}</p>
          {#if a.ters}<p class="okuma sessiz"><span class="etiket">Ters</span> {a.ters}</p>{/if}
          {#if a.ask}<p class="okuma"><span class="etiket">Aşk</span> {a.ask}</p>{/if}
          {#if a.is}<p class="okuma"><span class="etiket">İş</span> {a.is}</p>{/if}
          {#if a.ogut}<p class="ogut">{a.ogut}</p>{/if}
          <button class="dugme" onclick={() => (secili = null)}>Kapat</button>
        </div>
      </div>
    </dialog>
  {/if}
</section>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape') secili = null; }} />

<style>
  .deste { display: grid; gap: 1.4rem; padding: 1.5rem 0; }
  header { display: grid; gap: 0.6rem; }
  a.cip { text-decoration: none; }
  a.cip[aria-current="page"] { background: var(--altin); color: var(--gece); border-color: var(--altin); }
  .izgara { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(6.4rem, 1fr)); gap: 1rem 0.8rem; justify-items: center; }
  .izgara :global(.kart) { --gen: 6.2rem; }
  .kart-dugme { padding: 0; border: 0; background: none; cursor: pointer; border-radius: 8px; transition: transform 200ms var(--yay); }
  .kart-dugme:hover { transform: translateY(-4px) rotate(-1deg); }
  .perde { position: fixed; inset: 0; background: rgba(6, 5, 16, 0.78); backdrop-filter: blur(3px); z-index: 20; animation: belir 250ms both; }
  .detay {
    position: fixed; inset: auto 0 0 0; margin: 0 auto; z-index: 21; width: min(42rem, 100%); max-height: 88vh; overflow-y: auto;
    border: 1px solid var(--cizgi); border-radius: 16px 16px 0 0; background: var(--murekkep); color: var(--ay); padding: 1.5rem var(--kenar) 2rem;
    animation: yuksel 380ms var(--yay) both;
  }
  @media (min-width: 40rem) { .detay { inset: 10vh 0 auto 0; border-radius: 16px; } }
  .detay-ic { display: grid; gap: 1.4rem; justify-items: center; }
  @media (min-width: 40rem) { .detay-ic { grid-template-columns: auto 1fr; align-items: start; justify-items: start; } }
  .metin { display: grid; gap: 0.6rem; }
  h2 { font-size: var(--t-3); color: var(--altin); }
  .etiket { font-family: var(--sans); font-size: var(--t-kucuk); color: var(--altin-koyu); margin-right: 0.3rem; }
  .ogut { font-family: var(--serif); font-style: italic; color: var(--altin-acik); font-size: var(--t-1); }
  @keyframes belir { from { opacity: 0; } }
  @keyframes yuksel { from { opacity: 0; transform: translateY(24px); } }
</style>
