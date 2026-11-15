<script>
  // Kalkan tablosu: gelenekte sağdan sola okunur. Üst sıra 1..8 (analar ve kızlar),
  // ikinci sıra 9..12 (torunlar), sonra tanıklar, hâkim ve kenarda uzlaştırıcı.
  import Sekil from './Sekil.svelte';
  let { chart, adlar, vurgulu = [], onoku } = $props();
  const ad = (k) => adlar?.[k]?.ad ?? k;
  const T = 110; // sıra gecikmesi (ms)
</script>

<section class="kalkan">
  <h1>Kalkan</h1>
  <p class="okuma sessiz">Sağdan sola: dört ana, dört kız, dört torun. Altta tanıklar ve hâkim.</p>

  <div class="tablo" dir="rtl">
    <div class="sira sekiz">
      {#each chart.houses.slice(0, 8) as k, i}
        <div class="hane" dir="ltr">
          <Sekil key={k} etiket={ad(k)} gecikme={i * T} vurgu={vurgulu.includes(i + 1)} />
          <span class="no kucuk">{i + 1}</span>
        </div>
      {/each}
    </div>
    <div class="sira dort">
      {#each chart.houses.slice(8, 12) as k, i}
        <div class="hane" dir="ltr">
          <Sekil key={k} etiket={ad(k)} gecikme={(8 + i) * T} vurgu={vurgulu.includes(9 + i)} />
          <span class="no kucuk">{9 + i}</span>
        </div>
      {/each}
    </div>
    <div class="sira iki">
      <div class="hane" dir="ltr"><Sekil key={chart.witnesses.right} etiket="Sağ tanık · {ad(chart.witnesses.right)}" gecikme={12 * T} /></div>
      <div class="hane" dir="ltr"><Sekil key={chart.witnesses.left} etiket="Sol tanık · {ad(chart.witnesses.left)}" gecikme={13 * T} /></div>
    </div>
    <div class="sira bir">
      <div class="hane hakim" dir="ltr"><Sekil key={chart.judge} boy={48} etiket="Hâkim · {ad(chart.judge)}" gecikme={14 * T} vurgu={true} /></div>
    </div>
    <div class="sira bir uzlas" dir="ltr">
      <div class="hane"><Sekil key={chart.reconciler} boy={28} etiket="Uzlaştırıcı · {ad(chart.reconciler)}" gecikme={15 * T} /></div>
    </div>
  </div>

  <div class="eylem">
    <button class="dugme asil" onclick={onoku}>Yorumu oku</button>
  </div>
</section>

<style>
  .kalkan { display: grid; gap: 1.25rem; padding: 1.5rem 0; }
  .tablo { display: grid; gap: 1rem; padding: 1.25rem 0.5rem; border-top: 1px solid var(--cizgi); border-bottom: 1px solid var(--cizgi); }
  .sira { display: grid; gap: 0.5rem; justify-items: center; }
  .sekiz { grid-template-columns: repeat(8, 1fr); }
  .dort { grid-template-columns: repeat(4, 1fr); width: 100%; max-width: 70%; margin: 0 auto; }
  .iki { grid-template-columns: repeat(2, 1fr); max-width: 50%; margin: 0 auto; width: 100%; }
  .bir { grid-template-columns: 1fr; }
  .hane { position: relative; display: grid; justify-items: center; gap: 0.25rem; }
  .no { color: var(--sessiz); }
  .hakim { padding: 0.5rem 1.25rem; border: 1px solid var(--cizgi); border-radius: var(--yumusak); background: rgba(27, 20, 51, 0.5); }
  .uzlas { opacity: 0.8; }
  .eylem { display: flex; justify-content: flex-end; }
  @media (max-width: 30rem) {
    .sekiz { grid-template-columns: repeat(4, 1fr); row-gap: 1rem; }
  }
</style>
