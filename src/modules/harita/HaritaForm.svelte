<script>
  import { sehirleriYukle, sehirAra } from '../../engine/astro/sehirler.js';
  import { yereldenUtc, farkAciklama, farkYazi } from '../../engine/astro/zaman.js';

  let { onhesapla, baslangic = null, baslik = 'Doğum haritası', aciklama = '' } = $props();

  let ad = $state(baslangic?.ad ?? '');
  let tarih = $state(baslangic?.tarih ?? '');
  let saat = $state(baslangic?.saat ?? '12:00');
  let saatYok = $state(baslangic?.saatYok ?? false);
  let sorgu = $state(baslangic?.yer?.etiket ?? '');
  let yer = $state(baslangic?.yer ?? null);
  let oneriler = $state([]);
  let veri = $state(null);
  let yukleniyor = $state(false);
  let gelismis = $state(false);
  let evSistemi = $state(baslangic?.evSistemi ?? 'placidus');
  let elleFark = $state('');
  let elleEnlem = $state('');
  let elleBoylam = $state('');
  let elleTz = $state('Europe/Istanbul');
  let secimBelirsiz = $state('erken');

  async function ara() {
    if (!veri) { yukleniyor = true; veri = await sehirleriYukle(); yukleniyor = false; }
    oneriler = sehirAra(veri, sorgu);
  }
  function sec(s) { yer = s; sorgu = s.etiket; oneriler = []; }

  const parca = $derived.by(() => {
    if (!tarih) return null;
    const [y, a, g] = tarih.split('-').map(Number);
    const [h, m] = (saatYok ? '12:00' : saat || '12:00').split(':').map(Number);
    return { yil: y, ay: a, gun: g, saat: h, dakika: m };
  });

  const konum = $derived.by(() => {
    if (gelismis && elleEnlem !== '' && elleBoylam !== '') {
      const e = Number(String(elleEnlem).replace(',', '.')), b = Number(String(elleBoylam).replace(',', '.'));
      if (Number.isFinite(e) && Number.isFinite(b) && Math.abs(e) <= 90 && Math.abs(b) <= 180) return { etiket: `${e.toFixed(4)}, ${b.toFixed(4)}`, enlem: e, boylam: b, tz: elleTz };
      return null;
    }
    return yer;
  });

  const zaman = $derived.by(() => {
    if (!parca || !konum) return null;
    try {
      if (gelismis && elleFark !== '') {
        const dk = Math.round(Number(String(elleFark).replace(',', '.')) * 60);
        if (!Number.isFinite(dk)) return null;
        const utcMs = Date.UTC(parca.yil, parca.ay - 1, parca.gun, parca.saat, parca.dakika) - dk * 6e4;
        return { utcMs, offsetMin: dk, durum: 'elle' };
      }
      return yereldenUtc(parca, konum.tz);
    } catch { return null; }
  });

  const hazir = $derived(!!zaman && !!konum && parca?.yil >= 1800 && parca?.yil <= 2399);

  function gonder(e) {
    e.preventDefault();
    if (!hazir) return;
    const z = zaman.durum === 'belirsiz' && secimBelirsiz === 'gec' ? { ...zaman.alternatif, durum: 'belirsiz' } : zaman;
    onhesapla({
      ad: ad.trim(), tarih, saat: saatYok ? null : saat, saatYok, yer: konum, evSistemi,
      utcMs: z.utcMs, offsetMin: z.offsetMin, zamanDurum: zaman.durum,
    });
  }
</script>

<form class="form" onsubmit={gonder}>
  <h1>{baslik}</h1>
  {#if aciklama}<p class="okuma sessiz">{aciklama}</p>{/if}

  <label class="blok">
    <span class="kucuk sessiz">Ad (isteğe bağlı, yalnızca bu cihazda)</span>
    <input class="alan" bind:value={ad} maxlength="40" autocomplete="off" />
  </label>

  <div class="iki">
    <label class="blok">
      <span class="kucuk sessiz">Doğum tarihi</span>
      <input class="alan" type="date" bind:value={tarih} min="1800-01-01" max="2399-12-31" required />
    </label>
    <label class="blok">
      <span class="kucuk sessiz">Doğum saati</span>
      <input class="alan" type="time" bind:value={saat} disabled={saatYok} />
    </label>
  </div>
  <label class="onay">
    <input type="checkbox" bind:checked={saatYok} />
    <span>Saati bilmiyorum. Yükselen ve evler hesaplanmaz; Ay'ın kesin yeri belirsiz kalır.</span>
  </label>

  {#if !gelismis}
    <div class="blok yer">
      <span class="kucuk sessiz">Doğum yeri</span>
      <input class="alan" bind:value={sorgu} oninput={ara} onfocus={ara} placeholder="Şehir ya da ilçe yaz" autocomplete="off"
        role="combobox" aria-expanded={oneriler.length > 0} aria-controls="sehir-liste" />
      {#if yukleniyor}<span class="kucuk sessiz">Şehirler yükleniyor…</span>{/if}
      {#if oneriler.length}
        <ul id="sehir-liste" class="oneriler" role="listbox">
          {#each oneriler as s}
            <li role="option" aria-selected={yer === s}><button type="button" onclick={() => sec(s)}>{s.etiket}</button></li>
          {/each}
        </ul>
      {/if}
      <span class="kucuk sessiz">İlçen listede yoksa il merkezini seç; fark yükselende birkaç dakikalık açıdır.</span>
    </div>
  {/if}

  <button type="button" class="dugme sade kucuk" onclick={() => (gelismis = !gelismis)}>{gelismis ? 'Şehir aramasına dön' : 'Gelişmiş: koordinat ve saat farkı'}</button>

  {#if gelismis}
    <div class="gelismis">
      <div class="iki">
        <label class="blok"><span class="kucuk sessiz">Enlem (kuzey +)</span><input class="alan" bind:value={elleEnlem} inputmode="decimal" placeholder="41.0138" /></label>
        <label class="blok"><span class="kucuk sessiz">Boylam (doğu +)</span><input class="alan" bind:value={elleBoylam} inputmode="decimal" placeholder="28.9497" /></label>
      </div>
      <label class="blok"><span class="kucuk sessiz">Saat dilimi (IANA)</span><input class="alan" bind:value={elleTz} /></label>
      <label class="blok"><span class="kucuk sessiz">Saat farkını elle gir (saat, ör. 2 ya da 5.75; boş bırakırsan saat diliminden hesaplanır)</span><input class="alan" bind:value={elleFark} inputmode="decimal" /></label>
      <label class="blok"><span class="kucuk sessiz">Ev sistemi</span>
        <select class="alan" bind:value={evSistemi}>
          <option value="placidus">Placidus</option><option value="burc">Bütün burç (Whole Sign)</option>
          <option value="koch">Koch</option><option value="esit">Eşit ev</option>
        </select>
      </label>
    </div>
  {/if}

  {#if zaman && konum}
    <div class="ozet kucuk">
      {#if zaman.durum === 'yok'}
        <p class="uyari">Bu yerel saat o gün hiç yaşanmadı: saatler ileri alınmıştı. Saati kontrol et; hesap {farkYazi(zaman.offsetMin)} ile yapılacak.</p>
      {:else if zaman.durum === 'belirsiz'}
        <p class="uyari">Bu yerel saat o gece iki kez yaşandı (saatler geri alındı). Hangisi?</p>
        <div class="cipler">
          <button type="button" class="cip" aria-pressed={secimBelirsiz === 'erken'} onclick={() => (secimBelirsiz = 'erken')}>İlki ({farkYazi(zaman.offsetMin)})</button>
          <button type="button" class="cip" aria-pressed={secimBelirsiz === 'gec'} onclick={() => (secimBelirsiz = 'gec')}>İkincisi ({farkYazi(zaman.alternatif.offsetMin)})</button>
        </div>
      {:else}
        <p class="sessiz">Doğduğun anda {konum.etiket} için saat: {zaman.durum === 'elle' ? farkYazi(zaman.offsetMin) + ' (elle girildi)' : farkAciklama(zaman.offsetMin, konum.tz)}. Yanlışsa gelişmiş ayardan düzeltebilirsin.</p>
      {/if}
    </div>
  {/if}

  <div class="eylem"><button class="dugme asil" type="submit" disabled={!hazir}>Haritayı çıkar</button></div>
</form>

<style>
  .form { display: grid; gap: 1.1rem; padding: 1.5rem 0; }
  .blok { display: grid; gap: 0.4rem; position: relative; }
  .iki { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .onay { display: flex; gap: 0.6rem; align-items: flex-start; color: var(--ay-soluk); font-size: var(--t-kucuk); }
  .onay input { margin-top: 0.2rem; accent-color: var(--altin); }
  input[type='date'], input[type='time'] { color-scheme: dark; }
  .oneriler { list-style: none; margin: 0; padding: 0.25rem; border: 1px solid var(--cizgi); border-radius: var(--yumusak); background: var(--murekkep); }
  .oneriler button { width: 100%; text-align: left; padding: 0.55rem 0.75rem; background: none; border: 0; border-radius: 6px; cursor: pointer; }
  .oneriler button:hover, .oneriler button:focus-visible { background: var(--murekkep-2); }
  .gelismis { display: grid; gap: 0.75rem; padding: 1rem; border: 1px dashed var(--cizgi); border-radius: var(--yumusak); }
  .ozet { padding: 0.75rem 1rem; border-left: 2px solid var(--altin-koyu); display: grid; gap: 0.5rem; }
  .uyari { color: var(--altin-acik); }
  select.alan { appearance: auto; }
  .eylem { padding-top: 0.25rem; }
  @media (max-width: 26rem) { .iki { grid-template-columns: 1fr; } }
</style>
