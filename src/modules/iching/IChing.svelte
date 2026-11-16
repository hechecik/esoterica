<script>
  // I Ching: altı atış, alttan üste. Atışlar crypto ile; çizgi değerleri 6/7/8/9.
  import { cizgiAt, ichingOku, kriptoTam } from '../../engine/fal/motorlar.js';
  import { ichingYorum } from '../../engine/interpret/fal.js';

  let c = $state(null);
  let hata = $state('');
  let yontem = $state('para');
  let degerler = $state([]);
  let sonParalar = $state(null); // [3|2, 3|2, 3|2]
  let atiliyor = $state(false);

  $effect(() => { import('../../content/generated/iching.json').then((m) => (c = m.default)).catch((e) => (hata = e.message)); });

  function at() {
    if (atiliyor || degerler.length >= 6) return;
    atiliyor = true;
    let v, paralar = null;
    if (yontem === 'para') {
      paralar = [0, 1, 2].map(() => (kriptoTam(2) ? 3 : 2));
      v = paralar.reduce((a, b) => a + b, 0);
    } else v = cizgiAt('civanpercemi');
    sonParalar = paralar;
    setTimeout(() => { degerler = [...degerler, v]; atiliyor = false; }, 650);
  }
  function hepsi() { // civanperçemi uzun bir ritüeldir; burada tek dokunuşla altısı
    const yeni = [...degerler];
    while (yeni.length < 6) yeni.push(cizgiAt(yontem));
    degerler = yeni;
  }
  const yorum = $derived(c && degerler.length === 6 ? ichingYorum(ichingOku(degerler), c) : null);
  const ADI = { 6: 'değişen yin', 7: 'sabit yang', 8: 'sabit yin', 9: 'değişen yang' };
  function yeniden() { degerler = []; sonParalar = null; }
</script>

{#snippet heks(cizgiler, degisen = [])}
  <svg class="heks" viewBox="0 0 100 92" role="img" aria-label="Heksagram">
    {#each cizgiler as b, i}
      {@const y = 80 - i * 15}
      {#if b}<rect x="8" {y} width="84" height="8" rx="1.5" />
      {:else}<rect x="8" {y} width="36" height="8" rx="1.5" /><rect x="56" {y} width="36" height="8" rx="1.5" />{/if}
      {#if degisen.includes(i + 1)}<circle cx="100" cy={y + 4} r="2.6" class="nokta" />{/if}
    {/each}
  </svg>
{/snippet}

<section class="ic">
  <header>
    <h1>I Ching</h1>
    <p class="okuma sessiz">Değişimler Kitabı. Altı kez at; her atış bir çizgi. Çizgiler alttan yukarı kurulur.</p>
  </header>

  {#if hata}<p class="hata">{hata}</p>
  {:else if !c}<p class="sessiz">Açılıyor…</p>
  {:else if !yorum}
    {#if degerler.length === 0}
      <div class="cipler" role="group" aria-label="Yöntem">
        <button class="cip" aria-pressed={yontem === 'para'} onclick={() => (yontem = 'para')}>Üç para</button>
        <button class="cip" aria-pressed={yontem === 'civanpercemi'} onclick={() => (yontem = 'civanpercemi')}>Civanperçemi olasılıkları</button>
      </div>
      <p class="kucuk sessiz">{yontem === 'para' ? 'Yazı 3, tura 2 sayılır. Üç paranın toplamı çizgiyi verir: 6 ve 9 değişen çizgidir.' : 'Geleneksel sap yönteminin olasılıkları: değişen yang daha sık, değişen yin daha seyrek gelir (1/16, 5/16, 7/16, 3/16).'}</p>
    {/if}
    <div class="atis">
      <div class="kule" aria-live="polite">
        {#each Array(6) as _, i}
          {@const v = degerler[5 - i]}
          <div class="satir" class:dolu={v != null}>
            {#if v != null}
              <span class="cizgi" class:yin={v % 2 === 0}><i></i><i></i></span>
              <span class="kucuk sessiz">{ADI[v]}</span>
            {:else}<span class="bos"></span>{/if}
          </div>
        {/each}
      </div>
      {#if yontem === 'para'}
        <div class="paralar" class:donuyor={atiliyor} aria-hidden="true">
          {#each sonParalar ?? [2, 3, 2] as p}<span class="para" class:yazi={p === 3}>{p === 3 ? '陽' : '陰'}</span>{/each}
        </div>
      {/if}
      <div class="eylem">
        <button class="dugme asil" onclick={at} disabled={atiliyor}>{yontem === 'para' ? 'Paraları at' : 'Sapları ayır'} ({degerler.length + 1}/6)</button>
        <button class="dugme sade" onclick={hepsi}>Kalanını bir kerede</button>
      </div>
    </div>
  {:else}
    <article class="yorum">
      <div class="ikili">
        <figure>
          {@render heks(yorum.birincil.cizgiler, yorum.degisen.map((d) => d.cizgi))}
          <figcaption><span class="no">{yorum.birincil.no}</span> {yorum.birincil.ad} <span class="sessiz kucuk">{yorum.birincil.cin}</span></figcaption>
        </figure>
        {#if yorum.donusen}
          <span class="ok" aria-hidden="true">→</span>
          <figure>
            {@render heks(yorum.donusen.cizgiler)}
            <figcaption><span class="no">{yorum.donusen.no}</span> {yorum.donusen.ad} <span class="sessiz kucuk">{yorum.donusen.cin}</span></figcaption>
          </figure>
        {/if}
      </div>
      <section class="blok">
        <h2>{yorum.birincil.ad}</h2>
        <p class="okuma">{yorum.birincil.anlam}</p>
        <p class="okuma sessiz">{yorum.imge}</p>
        <p class="ogut">{yorum.birincil.ogut}</p>
      </section>
      <section class="blok">
        <p class="okuma sessiz">{yorum.degisenSayisi}</p>
        {#each yorum.degisen as d}<p class="okuma">{d.metin}</p>{/each}
      </section>
      {#if yorum.donusen}
        <section class="blok">
          <h2>Dönüşen: {yorum.donusen.ad}</h2>
          <p class="okuma">{yorum.donusen.anlam}</p>
          <p class="ogut">{yorum.donusen.ogut}</p>
        </section>
      {/if}
      <p class="kucuk sessiz">Heksagram adları ve anlamları klasik metnin özgün Türkçe yorumudur, çeviri değildir. Çizgi metinleri bu sürümde çizginin konumuna göre genel olarak okunur.</p>
      <div class="eylem"><button class="dugme" onclick={yeniden}>Yeni soru</button></div>
    </article>
  {/if}
</section>

<style>
  .ic { display: grid; gap: 1.5rem; padding: 1.5rem 0; }
  header { display: grid; gap: 0.4rem; }
  .atis { display: grid; justify-items: center; gap: 1.5rem; }
  .kule { display: grid; gap: 0.6rem; width: min(18rem, 100%); }
  .satir { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 0.8rem; height: 1.4rem; }
  .bos { height: 2px; background: var(--cizgi); }
  .cizgi { display: flex; gap: 0; height: 0.7rem; animation: koy 500ms var(--yay) both; }
  .cizgi i { flex: 1; background: var(--altin); border-radius: 2px; }
  .cizgi.yin { gap: 18%; }
  .cizgi:not(.yin) i + i { margin-left: -1px; }
  @keyframes koy { from { opacity: 0; transform: scaleX(0.3); } to { opacity: 1; transform: none; } }
  .paralar { display: flex; gap: 0.8rem; }
  .para {
    width: 2.6rem; height: 2.6rem; border-radius: 50%; display: grid; place-items: center;
    border: 1px solid var(--altin-koyu); background: radial-gradient(circle at 35% 30%, #5a4a26, #2b2214);
    color: var(--altin-acik); font-size: 1.1rem;
  }
  .para.yazi { background: radial-gradient(circle at 35% 30%, #a68845, #5d4a20); color: var(--gece); }
  .donuyor .para { animation: don 650ms var(--yay); }
  .donuyor .para:nth-child(2) { animation-delay: 60ms; }
  .donuyor .para:nth-child(3) { animation-delay: 120ms; }
  @keyframes don { 0% { transform: translateY(0) rotateX(0); } 50% { transform: translateY(-2.2rem) rotateX(540deg); } 100% { transform: translateY(0) rotateX(1080deg); } }
  .eylem { display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center; }
  .yorum { display: grid; gap: 1.5rem; animation: belir 700ms var(--yay) both; }
  @keyframes belir { from { opacity: 0; } to { opacity: 1; } }
  .ikili { display: flex; align-items: center; justify-content: center; gap: 1.5rem; flex-wrap: wrap; }
  figure { margin: 0; display: grid; justify-items: center; gap: 0.6rem; }
  figcaption { font-family: var(--serif); font-size: var(--t-1); text-align: center; }
  .no { color: var(--altin); }
  .heks { width: 7rem; fill: var(--altin); overflow: visible; }
  .heks .nokta { fill: var(--ay); }
  .ok { color: var(--altin-koyu); font-size: var(--t-3); }
  .blok { display: grid; gap: 0.6rem; border-left: 2px solid var(--altin-koyu); padding-left: 1rem; }
  h2 { font-size: var(--t-2); color: var(--altin); }
  .ogut { font-family: var(--serif); font-style: italic; color: var(--altin-acik); font-size: var(--t-1); }
  .hata { color: #e3a07a; }
</style>
