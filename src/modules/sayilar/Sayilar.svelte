<script>
  // Numeroloji, yıldızname ve Çin burcu: aynı girdiden (ad, anne adı, doğum tarihi) üç ayrı gelenek.
  // Hesaplar tamamen cihazda; girilenler hiçbir yere yazılmaz.
  import { numeroloji, yildizname, cinBurcu, cinUyum, HAYVANLAR } from '../../engine/fal/motorlar.js';
  import { numerolojiYorum, yildiznameYorum, cinYorum } from '../../engine/interpret/fal.js';
  import { kisi } from '../../app/kisi.svelte.js';

  let c = $state(null);
  let hata = $state('');
  let ad = $state('');
  let anne = $state('');
  let tarih = $state(kisi.ben?.tarih ?? '');
  let sekme = $state('numeroloji');
  let karsiHayvan = $state('');
  let sonuc = $state(null);

  $effect(() => {
    Promise.all([
      import('../../content/generated/numeroloji.json'),
      import('../../content/generated/yildizname.json'),
      import('../../content/generated/cin.json'),
    ].map((p) => p.then((m) => m.default)))
      .then(([n, y, ci]) => (c = { n, y, ci })).catch((e) => (hata = e.message));
  });

  const ilkAd = $derived(ad.trim().split(/\s+/)[0] ?? '');
  const hazir = $derived(c && ad.trim() && /^\d{4}-\d{2}-\d{2}$/.test(tarih));

  function hesapla(e) {
    e?.preventDefault();
    if (!hazir) return;
    const [yil, ay, gun] = tarih.split('-').map(Number);
    const dt = new Date(Date.UTC(yil, ay - 1, gun, 12));
    sonuc = {
      num: numerolojiYorum(numeroloji(ad, { yil, ay, gun }), c.n),
      yz: anne.trim() ? yildiznameYorum(yildizname(ilkAd, anne.trim().split(/\s+/)[0]), c.y) : null,
      cinHam: cinBurcu(dt),
    };
  }
  const cinSonuc = $derived(sonuc && c ? cinYorum(sonuc.cinHam, c.ci, karsiHayvan || null, cinUyum) : null);
  const SEKMELER = [['numeroloji', 'Numeroloji'], ['yildizname', 'Yıldızname'], ['cin', 'Çin burcu']];
</script>

<section class="sayilar">
  <header>
    <h1>Adın ve sayıların</h1>
    <p class="okuma sessiz">Üç eski gelenek, aynı bilgiden üç ayrı okuma: harflerin sayısı, adının yıldızı ve doğduğun yılın hayvanı.</p>
  </header>

  {#if hata}<p class="hata">{hata}</p>
  {:else if !c}<p class="sessiz">Açılıyor…</p>
  {:else}
    <form class="form" onsubmit={hesapla}>
      <label>Adın ve soyadın<input class="alan" bind:value={ad} autocomplete="off" placeholder="Doğumda verilen tam ad" /></label>
      <label>Annenin adı <span class="kucuk sessiz">(yıldızname için, isteğe bağlı)</span><input class="alan" bind:value={anne} autocomplete="off" /></label>
      <label>Doğum tarihin<input class="alan tarih" type="date" bind:value={tarih} /></label>
      <div><button class="dugme asil" type="submit" disabled={!hazir}>Hesapla</button></div>
      <p class="kucuk sessiz">Yazdıkların yalnızca bu sayfada, bellekte durur.</p>
    </form>

    {#if sonuc}
      <div class="cipler sekmeler" role="tablist">
        {#each SEKMELER as [k, a]}<button class="cip" role="tab" aria-selected={sekme === k} onclick={() => (sekme = k)}>{a}</button>{/each}
      </div>

      {#if sekme === 'numeroloji'}
        <article class="yorum">
          <div class="rakamlar">
            {#each sonuc.num.cekirdek as x}
              <div class="rakam"><span class="sayi">{x.sayi}</span><span class="kucuk sessiz">{x.ad}</span></div>
            {/each}
          </div>
          {#each sonuc.num.vurgu as v}<p class="okuma vurgu">{v}</p>{/each}
          {#each sonuc.num.cekirdek as x}
            <section class="blok">
              <h3>{x.ad}: {x.veri.ad}</h3>
              <p class="kucuk sessiz">{x.aciklama}</p>
              <p class="okuma">{x.metin}</p>
              {#if x.alan === 'yasamYolu'}
                <p class="okuma sessiz">{x.veri.golge}</p>
                <p class="okuma"><span class="etiket">Aşk</span> {x.veri.ask}</p>
                <p class="okuma"><span class="etiket">İş</span> {x.veri.is}</p>
              {/if}
            </section>
          {/each}
          {#each sonuc.num.donem as x}
            <section class="blok donem"><h3>{x.ad}: {x.sayi}</h3><p class="okuma">{x.metin}</p></section>
          {/each}
          <details class="kucuk sessiz"><summary>Nasıl hesaplandı?</summary><p>{sonuc.num.yontem}</p></details>
        </article>

      {:else if sekme === 'yildizname'}
        <article class="yorum">
          {#if sonuc.yz}
            <p class="buyuk-ad">{sonuc.yz.veri.ad}</p>
            <p class="kucuk sessiz merkez">{ilkAd} + {anne.trim().split(/\s+/)[0]} = {sonuc.yz.toplam}; 12'ye bölümünden kalan {sonuc.yz.kalan}</p>
            <p class="okuma">{sonuc.yz.veri.metin}</p>
            <p class="ogut">{sonuc.yz.veri.ogut}</p>
            <p class="kucuk sessiz">{sonuc.yz.uyari}</p>
            <details class="kucuk sessiz"><summary>Nasıl hesaplandı?</summary><p>{sonuc.yz.yontem}</p></details>
          {:else}
            <p class="okuma sessiz">Yıldızname için annenin adı gerekiyor. Yukarıya ekleyip yeniden hesapla.</p>
          {/if}
        </article>

      {:else if cinSonuc}
        <article class="yorum">
          <p class="buyuk-ad">{cinSonuc.elementAd} {cinSonuc.hayvanAd}</p>
          <p class="kucuk sessiz merkez">Çin takviminde {cinSonuc.yil} yılı, {cinSonuc.yinYang}</p>
          {#if cinSonuc.miladiFarkli}<p class="okuma vurgu">Çin Yeni Yılı'ndan önce doğduğun için hayvanın bir önceki yılın hayvanı.</p>{/if}
          <p class="okuma">{cinSonuc.metin}</p>
          <p class="okuma sessiz">Gölge yanı: {cinSonuc.golge.toLocaleLowerCase('tr-TR')}</p>
          <p class="okuma">{cinSonuc.elementMetin}</p>
          <section class="blok">
            <h3>Biriyle uyumun</h3>
            <select class="alan" bind:value={karsiHayvan} aria-label="Karşı tarafın hayvanı">
              <option value="">Karşı tarafın hayvanını seç</option>
              {#each HAYVANLAR as h}<option value={h}>{c.ci.hayvanlar[h].ad}</option>{/each}
            </select>
            {#if cinSonuc.uyum}<p class="okuma">{cinSonuc.hayvanAd} ve {cinSonuc.uyum.karsi}: {cinSonuc.uyum.metin}</p>{/if}
          </section>
          <details class="kucuk sessiz"><summary>Nasıl hesaplandı?</summary><p>{cinSonuc.yontem}</p></details>
        </article>
      {/if}
    {/if}
  {/if}
</section>

<style>
  .sayilar { display: grid; gap: 1.6rem; padding: 1.5rem 0; }
  header { display: grid; gap: 0.4rem; }
  .form { display: grid; gap: 0.9rem; }
  .form label { display: grid; gap: 0.35rem; color: var(--ay-soluk); }
  .tarih { color-scheme: dark; }
  .sekmeler { justify-content: center; }
  .yorum { display: grid; gap: 1.2rem; animation: belir 600ms var(--yay) both; }
  @keyframes belir { from { opacity: 0; } to { opacity: 1; } }
  .rakamlar { display: flex; flex-wrap: wrap; justify-content: center; gap: 1.2rem; }
  .rakam { display: grid; justify-items: center; gap: 0.2rem; min-width: 5rem; }
  .sayi { font-family: var(--serif); font-size: var(--t-5); line-height: 1; color: var(--altin); }
  .blok { border-left: 2px solid var(--altin-koyu); padding-left: 1rem; display: grid; gap: 0.4rem; }
  .blok h3 { font-size: var(--t-1); color: var(--altin); }
  .donem { border-left-color: var(--altin); }
  .etiket { font-family: var(--sans); font-size: var(--t-kucuk); color: var(--altin-koyu); margin-right: 0.3rem; }
  .vurgu { color: var(--altin-acik); }
  .buyuk-ad { font-family: var(--serif); font-size: var(--t-4); color: var(--altin); text-align: center; line-height: 1.1; }
  .merkez { text-align: center; }
  .ogut { font-family: var(--serif); font-style: italic; font-size: var(--t-1); color: var(--altin-acik); text-align: center; }
  details summary { cursor: pointer; }
  details p { margin-top: 0.5rem; line-height: 1.5; }
  select.alan { color-scheme: dark; }
  .hata { color: #e3a07a; }
</style>
