<script>
  // Tarot, Lenormand, rün ve iskambil için ortak ekran.
  // Deste crypto ile karıştırılır; kullanıcı ters kartlar arasından seçer; seçim yalnızca bellekte kalır.
  import { router } from '../../app/router.svelte.js';
  import { karistir, kriptoTam } from '../../engine/fal/motorlar.js';
  import { tarotDeste, tarotYorum, lenormandYorum, runYorum, iskambilDeste, iskambilYorum } from '../../engine/interpret/fal.js';
  import FalKarti from '../../ui/FalKarti.svelte';

  const TURLER = {
    tarot: {
      baslik: 'Tarot', alt: 'Yetmiş sekiz kart. Soruyu içinden geçir, kartları sen seç.',
      yukle: () => import('../../content/generated/tarot.json'), deste: (c) => tarotDeste(c), ters: 0.3,
      varsayilan: 'uc', konular: [['genel', 'Genel'], ['ask', 'Aşk'], ['is', 'İş ve para']],
      yorum: (a) => tarotYorum(a), secimMetni: 'kart seç',
    },
    lenormand: {
      baslik: 'Lenormand', alt: 'Otuz altı küçük kart; yan yana gelince cümle kurarlar.',
      yukle: () => import('../../content/generated/lenormand.json'), deste: (c) => c.kartlar, ters: 0,
      varsayilan: 'uc', yorum: (a) => lenormandYorum(a), secimMetni: 'kart seç',
    },
    run: {
      baslik: 'Rün', alt: 'Yaşlı Futhark: yirmi dört taş ve bir boş taş. Torbaya elini daldır.',
      yukle: () => import('../../content/generated/run.json'), deste: (c) => c.runler, ters: 0.3,
      varsayilan: 'uc', yorum: (a) => runYorum(a), secimMetni: 'taş çek',
    },
    iskambil: {
      baslik: 'İskambil falı', alt: 'Elli iki kart, katina usulü. Kendin, evin, beklediğin ve beklemediğin.',
      yukle: () => import('../../content/generated/iskambil.json'), deste: (c) => iskambilDeste(c), ters: 0,
      varsayilan: 'yedi', yorum: (a) => iskambilYorum(a), secimMetni: 'kart seç',
    },
  };

  const tur = router.path.slice(1);
  const T = TURLER[tur];

  let c = $state(null);
  let hata = $state('');
  let acilim = $state(T.varsayilan);
  let konu = $state('genel');
  let tersKullan = $state(T.ters > 0);
  let asama = $state('kur'); // kur | sec | ac
  let karisik = $state([]);   // [{kart, ters}]
  let secilen = $state([]);   // karisik içindeki indeksler
  let acilanSayi = $state(0);
  let tohum = $state('');

  $effect(() => { T.yukle().then((m) => (c = m.default)).catch((e) => (hata = e.message)); });

  const ac = $derived(c?.acilimlar?.[acilim]);
  const gerek = $derived(ac?.pozisyonlar.length ?? 0);
  const pozAd = (p) => (typeof p === 'string' ? p : p.ad);
  const yelpaze = $derived(karisik.slice(0, Math.min(karisik.length, 22)));

  function karistirVeBasla() {
    const deste = T.deste(c);
    const olas = tersKullan ? T.ters : 0;
    karisik = karistir(deste).map((kart) => ({ kart, ters: olas > 0 && kriptoTam(1000) < olas * 1000 }));
    secilen = [];
    acilanSayi = 0;
    tohum = Array.from({ length: 4 }, () => kriptoTam(1e9)).join('-');
    asama = 'sec';
  }

  function sec(i) {
    if (secilen.includes(i) || secilen.length >= gerek) return;
    secilen = [...secilen, i];
    if (secilen.length === gerek) setTimeout(acmaya, 450);
  }

  function acmaya() {
    asama = 'ac';
    acilanSayi = 0;
    const adim = () => { acilanSayi += 1; if (acilanSayi < gerek) setTimeout(adim, gerek > 5 ? 380 : 650); };
    setTimeout(adim, 250);
  }

  const cekilen = $derived(secilen.map((i) => karisik[i]));
  const yorum = $derived(
    asama === 'ac' && c
      ? T.yorum({ cekilen: tur === 'tarot' || tur === 'run' ? cekilen : cekilen.map((x) => x.kart), acilimKey: acilim, konu, c, seed: tohum })
      : null,
  );
  const hepsiAcik = $derived(acilanSayi >= gerek);

  function yeniden() { asama = 'kur'; secilen = []; karisik = []; }
</script>

<section class="kf">
  <header>
    <h1>{T.baslik}</h1>
    <p class="okuma sessiz">{T.alt}</p>
  </header>

  {#if hata}<p class="hata">{hata}</p>
  {:else if !c}<p class="sessiz">Deste hazırlanıyor…</p>
  {:else if asama === 'kur'}
    <div class="kur">
      <div>
        <h2>Açılım</h2>
        <div class="cipler" role="group" aria-label="Açılım">
          {#each Object.entries(c.acilimlar) as [k, a]}
            <button class="cip" aria-pressed={acilim === k} onclick={() => (acilim = k)}>{a.ad}</button>
          {/each}
        </div>
        {#if ac?.aciklama}<p class="kucuk sessiz aciklama">{ac.aciklama}</p>{/if}
        <ol class="poz-liste kucuk sessiz">{#each ac.pozisyonlar as p}<li>{pozAd(p)}</li>{/each}</ol>
      </div>
      {#if T.konular}
        <div>
          <h2>Konu</h2>
          <div class="cipler" role="group" aria-label="Konu">
            {#each T.konular as [k, ad]}<button class="cip" aria-pressed={konu === k} onclick={() => (konu = k)}>{ad}</button>{/each}
          </div>
        </div>
      {/if}
      {#if T.ters > 0}
        <label class="tik"><input type="checkbox" bind:checked={tersKullan} /> Ters gelenleri de oku</label>
      {/if}
      <p class="kucuk"><a href="#/deste/{tur}">Desteyi tanı: bütün kartlar ve anlamları</a></p>
      <p class="kucuk sessiz">Sorunu içinden geçir. Yazmana gerek yok; yazsan bile hiçbir yere gitmez.</p>
      <div><button class="dugme asil" onclick={karistirVeBasla}>Karıştır</button></div>
    </div>

  {:else if asama === 'sec'}
    <p class="okuma">{gerek - secilen.length > 0 ? `${gerek - secilen.length} ${T.secimMetni}.` : 'Tamam.'}</p>
    <div class="yelpaze" role="group" aria-label="Ters duran kartlar">
      {#each yelpaze as x, i}
        <button class="yaprak" class:secili={secilen.includes(i)} disabled={secilen.includes(i)}
          onclick={() => sec(i)} aria-label={`Kart ${i + 1}`} style="--i:{i}">
          <FalKarti {tur} boyut="kucuk" />
        </button>
      {/each}
    </div>
    <button class="dugme sade" onclick={yeniden}>Vazgeç</button>

  {:else}
    <div class="masa" class:dokuz={gerek === 9} class:cok={gerek > 5}>
      {#each cekilen as x, i}
        <figure>
          <FalKarti {tur} kart={x.kart} ters={x.ters && (tur !== 'run' || x.kart.ters_olur)} acik={i < acilanSayi} boyut={gerek > 5 ? 'kucuk' : 'orta'} />
          <figcaption class="kucuk sessiz">{pozAd(ac.pozisyonlar[i])}{#if gerek > 5 && i < acilanSayi}<span class="fk-ad">{x.kart.ad}</span>{/if}</figcaption>
        </figure>
      {/each}
    </div>

    {#if hepsiAcik && yorum}
      <article class="yorum">
        {#if yorum.acilis}<p class="okuma sessiz">{yorum.acilis}</p>{/if}
        {#each yorum.pozisyonlar as p}
          <section class="poz">
            <h3>{pozAd(p.poz)} <span class="kart-ad">· {(p.kart ?? p.run).ad}{p.ters ? ', ters' : ''}</span></h3>
            {#if p.poz?.cerceve}<p class="kucuk sessiz">{p.poz.cerceve}</p>{/if}
            <p class="okuma">{p.ana ?? p.metin}</p>
            {#if p.ek}<p class="okuma sessiz">{p.ek}</p>{/if}
            {#if p.ogut && !p.ters}<p class="poz-ogut">{p.ogut}</p>{/if}
          </section>
        {/each}
        {#if yorum.ciftler?.length}
          <section class="poz">
            <h3>Kartlar birlikte</h3>
            <ul class="okuma">{#each yorum.ciftler as cumle}<li>{cumle}</li>{/each}</ul>
          </section>
        {/if}
        {#if yorum.genel}
          {@const genel = Array.isArray(yorum.genel) ? yorum.genel : [yorum.genel]}
          {#if genel.length}<section class="poz genel">{#each genel as g}<p class="okuma">{g}</p>{/each}</section>{/if}
        {/if}
        {#if yorum.kapanis}<p class="kapanis">{yorum.kapanis}</p>{/if}
      </article>
      <div class="eylem"><button class="dugme" onclick={yeniden}>Yeni açılım</button></div>
    {/if}
  {/if}
</section>

<style>
  .kf { display: grid; gap: 1.75rem; padding: 1.5rem 0; }
  header { display: grid; gap: 0.4rem; }
  h2 { font-size: var(--t-1); color: var(--altin); margin-bottom: 0.6rem; }
  .kur { display: grid; gap: 1.5rem; }
  .aciklama { margin-top: 0.6rem; }
  .poz-liste { margin: 0.4rem 0 0; padding-left: 1.2rem; columns: 2; }
  .tik { display: inline-flex; gap: 0.5rem; align-items: center; color: var(--ay-soluk); cursor: pointer; }
  .tik input { accent-color: var(--altin); }

  .yelpaze { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.35rem; padding: 0.5rem 0 1rem; }
  .yaprak {
    padding: 0; border: 0; background: none; cursor: pointer; border-radius: 8px;
    animation: dagit 520ms var(--yay) both; animation-delay: calc(var(--i) * 22ms);
    transition: transform 220ms var(--yay), opacity 220ms;
  }
  .yaprak:hover:not(:disabled) { transform: translateY(-6px); }
  .yaprak:focus-visible { outline: 2px solid var(--altin); outline-offset: 3px; }
  .yaprak.secili { transform: translateY(-14px) scale(0.92); opacity: 0.35; cursor: default; }
  @keyframes dagit { from { opacity: 0; transform: translateY(18px) rotate(-4deg); } to { opacity: 1; transform: none; } }

  .masa { display: flex; flex-wrap: wrap; justify-content: center; gap: 1.6rem 1rem; padding: 0.5rem 0 1rem; }
  .masa.dokuz { display: grid; grid-template-columns: repeat(3, auto); justify-content: center; }
  figure { margin: 0; display: grid; justify-items: center; gap: 0.8rem; }
  .masa:not(.cok) figure { gap: 1.8rem; }
  figcaption { text-align: center; max-width: 7.5rem; display: grid; gap: 0.1rem; }
  .fk-ad { font-family: var(--serif); font-size: var(--t-0); color: var(--ay); animation: belir 500ms var(--yay) both; }

  .yorum { display: grid; gap: 1.4rem; animation: belir 700ms var(--yay) both; }
  @keyframes belir { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .poz { border-left: 2px solid var(--altin-koyu); padding-left: 1rem; display: grid; gap: 0.4rem; }
  .poz h3 { font-size: var(--t-1); color: var(--altin); }
  .poz-ogut { font-family: var(--serif); font-style: italic; color: var(--altin-acik); }
  .kart-ad { color: var(--ay-soluk); font-weight: 400; }
  .poz ul { margin: 0; padding-left: 1.1rem; display: grid; gap: 0.5rem; }
  .genel { border-left-color: var(--altin); }
  .kapanis { font-family: var(--serif); font-style: italic; font-size: var(--t-1); color: var(--altin-acik); text-align: center; }
  .eylem { display: flex; justify-content: center; }
  .hata { color: #e3a07a; }
</style>
