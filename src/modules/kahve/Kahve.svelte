<script>
  // Kahve falı: fincanı sen kapatırsın, şekilleri sen görürsün; biz sembolü ve yerini okuruz.
  // Fotoğraf yok: hiçbir görüntü işlenmez ya da bir yere gönderilmez.
  import { kahveYorum, sembolAra } from '../../engine/interpret/fal.js';
  import { kriptoTam } from '../../engine/fal/motorlar.js';

  let c = $state(null);
  let hata = $state('');
  let bolge = $state('sap');
  let sorgu = $state('');
  let kat = $state('hepsi');
  let secimler = $state([]); // [{key, bolge, id}]
  let koyu = $state(false);
  let yollar = $state(false);
  let yorum = $state(null);

  $effect(() => { import('../../content/generated/kahve.json').then((m) => (c = m.default)).catch((e) => (hata = e.message)); });

  const KATLAR = [['hepsi', 'Hepsi'], ['hayvan', 'Hayvanlar'], ['insan', 'İnsanlar'], ['nesne', 'Nesneler'], ['doga', 'Doğa'], ['ev', 'Yapılar'], ['ulasim', 'Yol'], ['sekil', 'Şekiller'], ['harf', 'Harf, rakam']];
  const sonuclar = $derived(c ? sembolAra(kat === 'hepsi' ? c.semboller : c.semboller.filter((s) => s.kat === kat), sorgu, sorgu ? 24 : 200) : []);
  const bolgeAd = (k) => c?.bolgeler[k]?.ad ?? k;
  const adOf = (k) => c.semboller.find((s) => s.key === k)?.ad;

  function ekle(s) {
    secimler = [...secimler, { key: s.key, bolge, id: kriptoTam(1e9) }];
    yorum = null;
  }
  function cikar(id) { secimler = secimler.filter((x) => x.id !== id); yorum = null; }
  function oku() {
    yorum = kahveYorum({ secimler, fincan: { koyu, yollar }, c, seed: secimler.map((x) => x.key + x.bolge).join('|') + new Date().toISOString().slice(0, 10) });
    requestAnimationFrame(() => document.getElementById('kahve-yorum')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
</script>

<section class="kahve">
  <header>
    <h1>Kahve falı</h1>
    <p class="okuma sessiz">Fincanı kapat, soğusun. Sonra açıp bak: ne görüyorsan, nerede görüyorsan bize söyle. Fotoğraf istemiyoruz; şekli gören göz senin.</p>
  </header>

  {#if hata}<p class="hata">{hata}</p>
  {:else if !c}<p class="sessiz">Fincan ısınıyor…</p>
  {:else}
    <div class="duzen">
      <div class="fincan-kutu">
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <svg viewBox="0 0 220 220" class="fincan" aria-hidden="true" onclick={(e) => { const b = e.target.closest('[data-bolge]')?.dataset.bolge; if (b) bolge = b; }}>
          <circle cx="110" cy="110" r="104" class="tabak" class:aktif={bolge === 'tabak'} data-bolge="tabak" />
          <circle cx="110" cy="110" r="80" class="bolge" class:aktif={bolge === 'kenar'} data-bolge="kenar" />
          <path d="M110 110 L 30 110 A 80 80 0 0 1 110 30 Z" class="bolge" class:aktif={bolge === 'sap'} data-bolge="sap" />
          <path d="M110 110 L 190 110 A 80 80 0 0 1 110 190 Z" class="bolge" class:aktif={bolge === 'karsi'} data-bolge="karsi" />
          <circle cx="110" cy="110" r="44" class="bolge" class:aktif={bolge === 'orta'} data-bolge="orta" />
          <circle cx="110" cy="110" r="20" class="bolge dip" class:aktif={bolge === 'dip'} data-bolge="dip" />
          <path d="M18 92 q -16 18 0 36" class="sap" />
          {#each secimler as x, i}
            {@const a = (i * 137.5) * Math.PI / 180}
            {@const r = { tabak: 94, kenar: 70, sap: 58, karsi: 58, orta: 33, dip: 8 }[x.bolge]}
            {@const merkezA = { sap: Math.PI * 1.25, karsi: Math.PI * 0.25 }[x.bolge]}
            {@const aa = merkezA != null ? merkezA + ((i % 5) - 2) * 0.18 : a}
            <circle cx={110 + Math.cos(aa) * r} cy={110 + Math.sin(aa) * r} r="3.2" class="telve" />
          {/each}
        </svg>
        <div class="cipler bolgeler" role="group" aria-label="Bölge seç">
          {#each Object.entries(c.bolgeler) as [k, b]}
            <button class="cip" aria-pressed={bolge === k} onclick={() => (bolge = k)}>{b.ad}</button>
          {/each}
        </div>
      </div>

      <div class="secici">
        <label class="kucuk sessiz" for="ks">{bolgeAd(bolge)} bölgesinde ne görüyorsun?</label>
        <input id="ks" class="alan" type="search" placeholder="kuş, yol, yüzük, harf…" bind:value={sorgu} autocomplete="off" />
        <div class="cipler katlar" role="group" aria-label="Kategori">
          {#each KATLAR as [k, ad]}<button class="cip kucuk" aria-pressed={kat === k} onclick={() => (kat = k)}>{ad}</button>{/each}
        </div>
        <ul class="sonuclar">
          {#each sonuclar as s (s.key)}
            <li><button class="sembol" onclick={() => ekle(s)}><span>{s.ad}</span><span class="kucuk sessiz">ekle</span></button></li>
          {:else}<li class="kucuk sessiz">Bu adla bir sembol yok. Benzer bir şekil dene: daire, çizgi, hayvan…</li>{/each}
        </ul>
      </div>
    </div>

    {#if secimler.length}
      <section class="gorulen">
        <h2>Fincanda gördüklerin</h2>
        <ul class="cipler">
          {#each secimler as x (x.id)}
            <li><button class="cip secili" onclick={() => cikar(x.id)} aria-label={`${adOf(x.key)} kaldır`}>{adOf(x.key)} <span class="kucuk">· {bolgeAd(x.bolge)} ✕</span></button></li>
          {/each}
        </ul>
        <div class="secenek">
          <label class="tik"><input type="checkbox" bind:checked={koyu} /> Telve koyu ve kalın</label>
          <label class="tik"><input type="checkbox" bind:checked={yollar} /> Akıntılar, yollar var</label>
        </div>
        <button class="dugme asil" onclick={oku}>Fincanı oku</button>
      </section>
    {/if}

    {#if yorum}
      <article id="kahve-yorum" class="yorum">
        {#each yorum.genel as g}<p class="okuma sessiz">{g}</p>{/each}
        {#each yorum.bolumler as b}
          <section class="blok"><h3>{b.sembol.ad} <span class="kucuk sessiz">· {b.bolge}, {b.zaman}</span></h3><p class="okuma">{b.metin}</p></section>
        {/each}
        <p class="kapanis">{yorum.kapanis}</p>
      </article>
    {/if}
  {/if}
</section>

<style>
  .kahve { display: grid; gap: 1.75rem; padding: 1.5rem 0; }
  header { display: grid; gap: 0.4rem; }
  .duzen { display: grid; gap: 1.5rem; }
  @media (min-width: 40rem) { .duzen { grid-template-columns: 15rem 1fr; align-items: start; } }
  .fincan-kutu { display: grid; gap: 0.8rem; justify-items: center; }
  .fincan { width: 14rem; max-width: 100%; }
  .fincan .tabak { fill: rgba(200, 183, 154, 0.08); stroke: var(--kum-koyu); stroke-width: 1; cursor: pointer; }
  .fincan .bolge { fill: rgba(36, 26, 68, 0.75); stroke: var(--altin-koyu); stroke-width: 0.8; cursor: pointer; transition: fill 200ms var(--yay); }
  .fincan .bolge.dip { fill: #1a1210; }
  .fincan .aktif { fill: rgba(201, 162, 77, 0.28) !important; stroke: var(--altin); }
  .fincan .sap { fill: none; stroke: var(--altin-koyu); stroke-width: 6; stroke-linecap: round; }
  .fincan .telve { fill: #2a1a10; stroke: var(--kum); stroke-width: 0.8; pointer-events: none; animation: dus 400ms var(--yay) both; }
  @keyframes dus { from { opacity: 0; transform: translateY(-4px); } }
  .bolgeler { justify-content: center; }
  .secici { display: grid; gap: 0.7rem; }
  .katlar .cip { padding: 0.3rem 0.7rem; }
  .sonuclar { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr)); gap: 0.35rem; max-height: 22rem; overflow-y: auto; }
  .sembol { width: 100%; display: flex; justify-content: space-between; align-items: baseline; gap: 0.5rem; padding: 0.5rem 0.75rem; border: 1px solid var(--cizgi); border-radius: var(--yumusak); background: transparent; cursor: pointer; font-family: var(--serif); font-size: var(--t-0); text-align: left; }
  .sembol:hover { border-color: var(--altin); }
  .sembol .sessiz { opacity: 0; transition: opacity 150ms; }
  .sembol:hover .sessiz, .sembol:focus-visible .sessiz { opacity: 1; }
  .gorulen { display: grid; gap: 0.9rem; }
  .gorulen ul { list-style: none; padding: 0; margin: 0; }
  .cip.secili { border-color: var(--altin-koyu); color: var(--ay); }
  .secenek { display: flex; gap: 1.2rem; flex-wrap: wrap; }
  .tik { display: inline-flex; gap: 0.5rem; align-items: center; color: var(--ay-soluk); cursor: pointer; }
  .tik input { accent-color: var(--altin); }
  h2 { font-size: var(--t-1); color: var(--altin); }
  .yorum { display: grid; gap: 1.2rem; animation: belir 700ms var(--yay) both; scroll-margin-top: 1rem; }
  @keyframes belir { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .blok { border-left: 2px solid var(--altin-koyu); padding-left: 1rem; display: grid; gap: 0.3rem; }
  .blok h3 { font-size: var(--t-1); color: var(--altin); }
  .kapanis { font-family: var(--serif); font-style: italic; font-size: var(--t-1); color: var(--altin-acik); text-align: center; }
  .hata { color: #e3a07a; }
</style>
