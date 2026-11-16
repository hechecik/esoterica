<script>
  // Günlük ekran: bugünün gerçek göğü + (varsa) doğum haritasına göre kişisel transitler.
  import { gokyuzu, haritaHesapla, sonrakiEvre } from '../../engine/astro/efemeris.js';
  import { gunlukYorum } from '../../engine/interpret/astro.js';
  import { BURCLAR, konumYazi } from '../../engine/astro/sabitler.js';
  import { kisi as kisiDeposu } from '../../app/kisi.svelte.js';
  import { gunlukIcs } from '../../engine/store/ics.js';
  import AyEvresi from '../../ui/AyEvresi.svelte';
  import { ek } from '../../engine/interpret/turkce.js';

  let icerik = $state(null);
  let gok = $state(null);
  let natal = $state(null);
  let gunesBurcu = $state(null);
  let evreler = $state(null);
  let hata = $state('');
  let saat = $state('08:30');

  const simdi = Date.now();
  const gun = new Date().toISOString().slice(0, 10);
  const tarihYazi = new Intl.DateTimeFormat('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const kisa = (ms) => new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(ms));

  $effect(() => {
    (async () => {
      try {
        const [c, g] = await Promise.all([import('../../content/generated/astroloji.json').then((m) => m.default), gokyuzu(simdi)]);
        icerik = c; gok = g;
        const ben = kisiDeposu.ben;
        if (ben) natal = await haritaHesapla({ utcMs: ben.utcMs, enlem: ben.yer.enlem, boylam: ben.yer.boylam, evSistemi: ben.evSistemi, saatBilinmiyor: ben.saatYok });
        const [d, y] = await Promise.all([sonrakiEvre(simdi, 180), sonrakiEvre(simdi, 0)]);
        evreler = { dolunay: d, yeniAy: y };
      } catch (e) { hata = e.message; }
    })();
  });

  const yorum = $derived(icerik && gok ? gunlukYorum({ gok, natal, gunesBurcu, content: icerik, seed: `${gun}|${kisiDeposu.ben?.utcMs ?? gunesBurcu ?? 'genel'}` }) : null);
  const ALAN = { kariyer: 'Kariyer', ask: 'Aşk ve ilişkiler', ruh: 'Ruh hâli', para: 'Para' };

  function hatirlatici() {
    const blob = new Blob([gunlukIcs(saat)], { type: 'text/calendar' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'esoterica-gunluk.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
</script>

<section class="gunluk">
  <header>
    <h1>Bugünün göğü</h1>
    <p class="sessiz">{tarihYazi}</p>
  </header>

  {#if hata}<p class="hata">{hata}</p>{/if}
  {#if !yorum}
    <p class="sessiz">Gök hesaplanıyor…</p>
  {:else}
    <div class="ay">
      <AyEvresi aydinlik={yorum.evre.aydinlik} buyuyor={yorum.evre.buyuyor} />
      <div>
        <h2>{yorum.evre.ad}, Ay {ek(yorum.ayBurc.ad, 'de', { ozel: true, kesme: true })}</h2>
        <p class="okuma">{yorum.ayMetin}</p>
        <p class="okuma sessiz">{yorum.evreMetin}</p>
      </div>
    </div>

    {#if yorum.burcEvi}<p class="okuma vurgu">{yorum.burcEvi.metin}</p>{/if}

    {#if !natal}
      <div class="kim">
        <p class="kucuk sessiz">Doğum haritan olmadan genel gökyüzünü görüyorsun. Kişisel transitler için:</p>
        <div class="eylem">
          <a class="dugme asil" href="#/harita">Doğum haritanı gir</a>
        </div>
        <p class="kucuk sessiz">ya da yalnızca Güneş burcunu seç:</p>
        <div class="cipler" role="group" aria-label="Güneş burcu">
          {#each BURCLAR as b}
            <button class="cip" aria-pressed={gunesBurcu === b.key} onclick={() => (gunesBurcu = b.key)}>{b.ad}</button>
          {/each}
        </div>
      </div>
    {/if}

    <div class="alanlar">
      {#each Object.entries(yorum.alanlar) as [k, m]}
        <article><h3>{ALAN[k]}</h3><p>{m}</p></article>
      {/each}
    </div>

    {#if yorum.transitler.length}
      <section><h2>Bugün haritana dokunanlar</h2>
        <ul class="liste">{#each yorum.transitler as t}<li>{t.metin} <span class="kucuk sessiz">({t.orb.toFixed(1)}° {t.yaklasan ? 'yaklaşıyor' : 'ayrılıyor'})</span></li>{/each}</ul>
      </section>
    {/if}
    {#if yorum.donemsel.length}
      <section><h2>Bu dönemin büyük temaları</h2>
        <ul class="liste">{#each yorum.donemsel as t}<li>{t.metin}</li>{/each}</ul>
      </section>
    {/if}
    {#if yorum.retrolar.length}
      <section><h2>Geri hareketler</h2>
        <ul class="liste">{#each yorum.retrolar as r}<li>{r.metin}</li>{/each}</ul>
      </section>
    {/if}

    <p class="ogut">{yorum.ogut}</p>

    {#if evreler}
      <section class="takvim kucuk">
        <h2>Yaklaşanlar</h2>
        {#if evreler.dolunay}<p>Dolunay: {kisa(evreler.dolunay)}</p>{/if}
        {#if evreler.yeniAy}<p>Yeni Ay: {kisa(evreler.yeniAy)}</p>{/if}
      </section>
    {/if}

    <details class="gok kucuk">
      <summary>Gezegenlerin bugünkü konumları</summary>
      <ul>{#each Object.entries(gok.konumlar).slice(0, 10) as [k, p]}<li>{k === 'gunes' ? 'Güneş' : k === 'ay' ? 'Ay' : k[0].toLocaleUpperCase('tr-TR') + k.slice(1)}: {konumYazi(p.lon)}{p.retro ? ' (geri)' : ''}</li>{/each}</ul>
    </details>

    <section class="hatir">
      <h2>Her sabah hatırlat</h2>
      <p class="kucuk sessiz">Bildirim için sunucu gerekir; biz sunucu kullanmıyoruz. Bunun yerine telefonunun kendi takvimine günlük bir hatırlatma ekleyebilirsin. Dosya cihazında oluşturulur.</p>
      <div class="eylem"><input class="alan saat" type="time" bind:value={saat} /><button class="dugme" onclick={hatirlatici}>Takvime ekle</button></div>
    </section>
  {/if}
</section>

<style>
  .gunluk { display: grid; gap: 1.75rem; padding: 1.5rem 0; }
  header { display: grid; gap: 0.25rem; }
  .ay { display: grid; grid-template-columns: auto 1fr; gap: 1.25rem; align-items: start; }
  .ay h2 { font-size: var(--t-2); margin-bottom: 0.5rem; }
  .vurgu { color: var(--altin-acik); }
  .kim { display: grid; gap: 0.6rem; padding: 1rem; border: 1px dashed var(--cizgi); border-radius: var(--yumusak); }
  .alanlar { display: grid; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); gap: 1rem; }
  .alanlar article { padding: 1rem 1.1rem; border-left: 2px solid var(--altin-koyu); }
  .alanlar h3 { font-size: var(--t-1); color: var(--altin); margin-bottom: 0.35rem; }
  h2 { font-size: var(--t-2); margin-bottom: 0.6rem; }
  .liste { margin: 0; padding-left: 1.1rem; display: grid; gap: 0.6rem; font-family: var(--serif); font-size: var(--t-1); line-height: 1.5; }
  .ogut { font-family: var(--serif); font-style: italic; font-size: var(--t-2); color: var(--altin-acik); text-align: center; padding: 1rem 0; }
  .takvim p { margin: 0.2rem 0; }
  .gok summary { cursor: pointer; color: var(--ay-soluk); }
  .gok ul { columns: 2; padding-left: 1.1rem; }
  .hatir { display: grid; gap: 0.6rem; border-top: 1px solid var(--cizgi); padding-top: 1.25rem; }
  .eylem { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
  .saat { width: auto; color-scheme: dark; }
  .hata { color: #e3a07a; }
</style>
