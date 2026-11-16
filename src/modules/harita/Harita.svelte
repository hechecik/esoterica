<script>
  // Doğum haritası modülü: form -> hesap -> çark + yorum + teknik tablolar.
  import { haritaHesapla } from '../../engine/astro/efemeris.js';
  import { analiz as analizEt } from '../../engine/astro/analiz.js';
  import { konumYazi, burc } from '../../engine/astro/sabitler.js';
  import { kisi as kisiDeposu } from '../../app/kisi.svelte.js';
  import HaritaForm from './HaritaForm.svelte';
  import Cark from './Cark.svelte';
  import HaritaTablolar from './HaritaTablolar.svelte';
  import HaritaYorum from './HaritaYorum.svelte';

  let girdi = $state(kisiDeposu.ben);
  let harita = $state(null);
  let analiz = $state(null);
  let hata = $state('');
  let sekme = $state('yorum');
  let hesaplaniyor = $state(false);

  async function hesapla(g) {
    hata = ''; hesaplaniyor = true;
    try {
      const h = await haritaHesapla({ utcMs: g.utcMs, enlem: g.yer.enlem, boylam: g.yer.boylam, evSistemi: g.evSistemi, saatBilinmiyor: g.saatYok });
      harita = h; analiz = analizEt(h); girdi = g;
      kisiDeposu.ben = g; // günlük ekran için bellekte tutulur (kasa açıksa şifreli kaydedilir)
      window.scrollTo({ top: 0 });
    } catch (e) {
      hata = 'Harita hesaplanamadı: ' + e.message;
    } finally { hesaplaniyor = false; }
  }

  $effect(() => { if (kisiDeposu.ben && !harita && !hesaplaniyor) hesapla(kisiDeposu.ben); });

  function yeniden() { harita = null; analiz = null; kisiDeposu.ben = null; }
  const tarihYazi = (g) => new Intl.DateTimeFormat('tr-TR', { dateStyle: 'long' }).format(new Date(g.tarih + 'T12:00:00Z'));
</script>

{#if hata}<p class="hata">{hata}</p>{/if}

{#if !harita}
  {#if hesaplaniyor}<p class="sessiz okuma bekle">Gök hesaplanıyor…</p>{/if}
  <HaritaForm onhesapla={hesapla} baslangic={girdi}
    aciklama="Doğduğun anın göğü. Bilgilerin hiçbir yere gönderilmez; hesap bu cihazda, tarayıcının içinde yapılır." />
{:else}
  <section class="ust">
    <h1>{girdi.ad || 'Doğum haritan'}</h1>
    <p class="sessiz">{tarihYazi(girdi)}{girdi.saat ? ', ' + girdi.saat : ', saat bilinmiyor'} · {girdi.yer.etiket}</p>
    <p class="uclu">
      <span>Güneş {burc(harita.konumlar.gunes.lon).ad}</span>
      <span>Ay {harita.ayAraligi && burc(harita.ayAraligi[0]).key !== burc(harita.ayAraligi[1]).key ? burc(harita.ayAraligi[0]).ad + ' ya da ' + burc(harita.ayAraligi[1]).ad : burc(harita.konumlar.ay.lon).ad}</span>
      {#if harita.evler}<span>Yükselen {burc(harita.evler.asc).ad}</span>{/if}
    </p>
  </section>

  <Cark {harita} />

  <div class="sekmeler cipler" role="tablist">
    <button class="cip" role="tab" aria-selected={sekme === 'yorum'} aria-pressed={sekme === 'yorum'} onclick={() => (sekme = 'yorum')}>Yorum</button>
    <button class="cip" role="tab" aria-selected={sekme === 'teknik'} aria-pressed={sekme === 'teknik'} onclick={() => (sekme = 'teknik')}>Konumlar ve açılar</button>
  </div>

  {#if sekme === 'yorum'}
    <HaritaYorum {harita} {analiz} {girdi} />
  {:else}
    <HaritaTablolar {harita} {analiz} />
  {/if}

  <div class="alt">
    <a class="dugme" href="#/gunluk">Bugün göğün sana etkisi</a>
    <button class="dugme sade" onclick={yeniden}>Başka bir harita</button>
  </div>
{/if}

<style>
  .ust { padding: 1.5rem 0 0.5rem; display: grid; gap: 0.35rem; }
  .uclu { display: flex; flex-wrap: wrap; gap: 0.4rem 1.25rem; font-family: var(--serif); font-size: var(--t-1); color: var(--altin-acik); }
  .sekmeler { margin: 1.5rem 0 1rem; }
  .alt { display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end; border-top: 1px solid var(--cizgi); padding-top: 1.25rem; margin-top: 2rem; }
  .hata { color: #e3a07a; }
  .bekle { padding-top: 1rem; }
</style>
