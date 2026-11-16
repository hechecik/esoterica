<script>
  // Rüya tabiri: rüyanı yaz ya da sembolleri tek tek seç. Metin cihazda kalır, hiçbir yere gitmez.
  import { ruyaYorum, ruyaMetindenBul, sembolAra } from '../../engine/interpret/fal.js';

  let c = $state(null);
  let hata = $state('');
  let metin = $state('');
  let sorgu = $state('');
  let secili = $state([]);
  let duygu = $state('notr');
  let yorum = $state(null);

  $effect(() => { import('../../content/generated/ruya.json').then((m) => (c = m.default)).catch((e) => (hata = e.message)); });

  const DUYGULAR = [['notr', 'Belirsiz'], ['mutluluk', 'Mutlu'], ['korku', 'Korku'], ['huzun', 'Hüzün'], ['ofke', 'Öfke'], ['saskinlik', 'Şaşkınlık']];
  const sonuc = $derived(c && sorgu.trim() ? sembolAra(c.semboller, sorgu, 12) : []);
  const ad = (k) => c.semboller.find((s) => s.key === k)?.ad;

  function metindenBul() {
    const bulunan = ruyaMetindenBul(c.semboller, metin);
    secili = [...new Set([...secili, ...bulunan])];
    yorum = null;
  }
  function ekle(k) { if (!secili.includes(k)) secili = [...secili, k]; sorgu = ''; yorum = null; }
  function cikar(k) { secili = secili.filter((x) => x !== k); yorum = null; }
  function yorumla() {
    yorum = ruyaYorum({ keys: secili, duygu, c, seed: secili.join('|') + duygu });
    requestAnimationFrame(() => document.getElementById('ruya-yorum')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
</script>

<section class="ruya">
  <header>
    <h1>Rüya tabiri</h1>
    <p class="okuma sessiz">Hatırladığın kadarını yaz. İçindeki sembolleri bulup iki türlü okuyacağız: geleneğin tabiri ve rüyanın sana dair söylediği.</p>
  </header>

  {#if hata}<p class="hata">{hata}</p>
  {:else if !c}<p class="sessiz">Açılıyor…</p>
  {:else}
    <div class="yaz">
      <label for="rm" class="kucuk sessiz">Rüyan (yazdığın bu cihazdan çıkmaz, sayfayı kapatınca silinir)</label>
      <textarea id="rm" class="alan" rows="5" bind:value={metin} placeholder="Bir evin içindeydim, merdivenlerden iniyordum, pencereden deniz görünüyordu…"></textarea>
      <div><button class="dugme" onclick={metindenBul} disabled={!metin.trim()}>Sembolleri bul</button></div>
    </div>

    <div class="ara">
      <label for="rs" class="kucuk sessiz">Ya da sembol ekle</label>
      <input id="rs" class="alan" type="search" bind:value={sorgu} placeholder="yılan, diş, uçmak, sınav…" autocomplete="off" />
      {#if sonuc.length}
        <ul class="oneri">{#each sonuc as s (s.key)}<li><button class="cip" onclick={() => ekle(s.key)}>{s.ad}</button></li>{/each}</ul>
      {:else if sorgu.trim()}<p class="kucuk sessiz">Bu sözlükte yok. Daha genel bir kelime dene.</p>{/if}
    </div>

    {#if secili.length}
      <section class="secili">
        <h2>Rüyandaki semboller</h2>
        <ul class="oneri">{#each secili as k (k)}<li><button class="cip" aria-pressed="true" onclick={() => cikar(k)} aria-label={`${ad(k)} kaldır`}>{ad(k)} ✕</button></li>{/each}</ul>
        <h2>Rüyada nasıl hissettin?</h2>
        <div class="cipler" role="group" aria-label="Duygu">
          {#each DUYGULAR as [k, a]}<button class="cip" aria-pressed={duygu === k} onclick={() => { duygu = k; yorum = null; }}>{a}</button>{/each}
        </div>
        <div><button class="dugme asil" onclick={yorumla}>Yorumla</button></div>
      </section>
    {:else if metin.trim()}
      <p class="kucuk sessiz">Sembol bulamadıysan aşağıdan elle ekleyebilirsin.</p>
    {/if}

    {#if yorum}
      <article id="ruya-yorum" class="yorum">
        <p class="okuma sessiz">{yorum.giris}</p>
        {#each yorum.semboller as s}
          <section class="blok">
            <h3>{s.ad}</h3>
            <p class="okuma"><span class="etiket">Gelenekte</span> {s.gelenek}</p>
            <p class="okuma"><span class="etiket">Sana dair</span> {s.ic}</p>
          </section>
        {/each}
        {#each yorum.sentez as s}<p class="okuma">{s}</p>{/each}
        <p class="okuma vurgu">{yorum.duygu}</p>
        <p class="kapanis">{yorum.kapanis}</p>
      </article>
    {/if}
  {/if}
</section>

<style>
  .ruya { display: grid; gap: 1.6rem; padding: 1.5rem 0; }
  header { display: grid; gap: 0.4rem; }
  .yaz, .ara, .secili { display: grid; gap: 0.6rem; }
  textarea.alan { resize: vertical; font-family: var(--serif); font-size: var(--t-1); line-height: 1.5; }
  .oneri { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 0.4rem; }
  h2 { font-size: var(--t-1); color: var(--altin); }
  .yorum { display: grid; gap: 1.2rem; animation: belir 700ms var(--yay) both; scroll-margin-top: 1rem; }
  @keyframes belir { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .blok { border-left: 2px solid var(--altin-koyu); padding-left: 1rem; display: grid; gap: 0.4rem; }
  .blok h3 { font-size: var(--t-1); color: var(--altin); }
  .etiket { font-family: var(--sans); font-size: var(--t-kucuk); color: var(--altin-koyu); margin-right: 0.3rem; }
  .vurgu { color: var(--altin-acik); }
  .kapanis { font-family: var(--serif); font-style: italic; font-size: var(--t-1); color: var(--altin-acik); text-align: center; }
  .hata { color: #e3a07a; }
</style>
