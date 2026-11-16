<script>
  import { kasa, herSeyiSil } from '../engine/store/kasa.js';
  import { kisi } from './kisi.svelte.js';

  let varMi = $state(false);
  let acik = $state(kasa.acik);
  let parola = $state('');
  let parola2 = $state('');
  let mesaj = $state('');
  let mesgul = $state(false);
  let silOnay = $state(false);

  $effect(() => { kasa.varMi().then((v) => (varMi = v)); });

  async function olustur(e) {
    e.preventDefault(); mesaj = '';
    if (parola !== parola2) { mesaj = 'Parolalar aynı değil.'; return; }
    mesgul = true;
    try { await kasa.olustur(parola, kisi.disaAktar()); varMi = true; acik = true; parola = parola2 = ''; mesaj = 'Kasa kuruldu. Doğum bilgin artık bu cihazda şifreli duruyor.'; }
    catch (err) { mesaj = err.message; } finally { mesgul = false; }
  }
  async function kilitAc(e) {
    e.preventDefault(); mesaj = ''; mesgul = true;
    try { kisi.iceAktar(await kasa.kilitAc(parola)); acik = true; parola = ''; mesaj = 'Kasa açıldı.'; }
    catch (err) { mesaj = err.message; } finally { mesgul = false; }
  }
  function kilitle() { kasa.kilitle(); kisi.temizle(); acik = false; mesaj = 'Kasa kilitlendi; bellekteki bilgiler silindi.'; }
  async function sil() {
    kisi.temizle();
    await herSeyiSil();
    location.replace(location.pathname);
  }

  const LISANSLAR = [
    ['Swiss Ephemeris (@swisseph/browser)', 'AGPL-3.0', 'Astrodienst AG; gezegen ve ev hesapları'],
    ['AstroChart (@astrodraw/astrochart)', 'MIT', 'doğum haritası çarkı'],
    ['Svelte', 'MIT', 'arayüz'],
    ['all-the-cities', 'MIT', 'şehir listesi (derleme anında)'],
    ['GeoNames', 'CC BY 4.0', 'şehir verisi, geonames.org'],
    ['@photostructure/tz-lookup', 'CC0-1.0', 'saat dilimi (derleme anında)'],
    ['IANA saat dilimi veritabanı', 'kamu malı', 'tarayıcının Intl katmanı üzerinden'],
    ['Cormorant Garamond, IBM Plex Sans', 'SIL OFL 1.1', 'yazı tipleri, repoda barınır'],
  ];
</script>

<section class="okuma giz">
  <h1>Falın sende kalır</h1>
  <p>Bu site hiçbir veri göndermez. Sorduğun soru, girdiğin doğum bilgisi ve çıkan fal yalnızca senin cihazında işlenir; sunucuya, analitik servisine ya da üçüncü bir tarafa hiçbir şey gitmez. Çerez yok, takip yok, hesap yok.</p>
  <p>Tek dürüst sınır şu: Site GitHub Pages üzerinde barınıyor. GitHub, bir sayfa ziyaret edildiğinde ziyaretçinin IP adresini güvenlik amacıyla kaydeder. Ama GitHub yalnızca hangi dosyaların indirildiğini görür; hangi fala baktığını, ne sorduğunu ya da doğum tarihini göremez, çünkü bunların hiçbiri ağa taşınmaz. İlk ziyaretten sonra site internetsiz de çalışır.</p>

  <h2>Varsayılan: iz bırakmaz</h2>
  <p>Hiçbir ayar yapmazsan girdiğin her şey yalnızca açık sekmenin belleğinde durur. Sekmeyi kapattığında biter; cihazda bir kayıt kalmaz.</p>

  <h2>İstersen: şifreli kasa</h2>
  <p class="sessiz">Doğum bilgini her seferinde yeniden girmek istemiyorsan, bir parolayla bu cihazda saklayabilirsin. Bilgi parolandan türetilen anahtarla (PBKDF2, AES-GCM 256) şifrelenir. Parolayı biz bilmeyiz, kurtaramayız; unutursan kasayı silip yeniden kurarsın.</p>

  {#if acik}
    <p>Kasa açık. {kisi.ben ? 'Doğum bilgin kayıtlı.' : 'Henüz kayıtlı doğum bilgisi yok; doğum haritanı çıkardığında buraya şifreli yazılır.'}</p>
    <div class="eylem"><button class="dugme" onclick={kilitle}>Kasayı kilitle</button></div>
  {:else if varMi}
    <form class="form" onsubmit={kilitAc}>
      <label>Kasa parolası<input class="alan" type="password" autocomplete="current-password" bind:value={parola} /></label>
      <div><button class="dugme asil" disabled={mesgul || !parola}>{mesgul ? 'Açılıyor…' : 'Kasayı aç'}</button></div>
    </form>
  {:else}
    <form class="form" onsubmit={olustur}>
      <label>Parola (en az 8 karakter)<input class="alan" type="password" autocomplete="new-password" bind:value={parola} /></label>
      <label>Parola tekrar<input class="alan" type="password" autocomplete="new-password" bind:value={parola2} /></label>
      <div><button class="dugme" disabled={mesgul || parola.length < 8}>{mesgul ? 'Kuruluyor…' : 'Kasa kur'}</button></div>
    </form>
  {/if}
  {#if mesaj}<p class="mesaj" role="status">{mesaj}</p>{/if}

  <h2>Her şeyi sil</h2>
  <p class="sessiz">Kasayı, çevrimdışı önbelleği ve bu sitenin cihazda bıraktığı her şeyi siler. Geri alınamaz.</p>
  {#if silOnay}
    <div class="eylem"><button class="dugme tehlike" onclick={sil}>Evet, hepsini sil</button><button class="dugme sade" onclick={() => (silOnay = false)}>Vazgeç</button></div>
  {:else}
    <div class="eylem"><button class="dugme" onclick={() => (silOnay = true)}>Her şeyi sil</button></div>
  {/if}

  <h2>Açık kaynak</h2>
  <p>Kodun tamamı açık; iddiayı kendin doğrulayabilirsin: <a href="https://github.com/hechecik/esoterica" rel="noopener">github.com/hechecik/esoterica</a>. Kod AGPL-3.0, fal metinleri CC BY-NC-SA 4.0 lisanslıdır.</p>
  <details class="kucuk">
    <summary>Kullanılan üçüncü taraf yazılım ve veriler</summary>
    <ul class="lisans">
      {#each LISANSLAR as [ad, lisans, not]}<li><span>{ad}</span> <span class="sessiz">· {lisans} · {not}</span></li>{/each}
    </ul>
  </details>

  <p class="sessiz son">Fal bir eğlence ve kendini düşünme aracıdır; hekimin, avukatın ya da mali danışmanın yerine geçmez. Kararlar şekillerin değil, senindir.</p>
</section>

<style>
  .giz { padding: 2rem 0; }
  h1 { margin-bottom: 1.25rem; }
  h2 { font-size: var(--t-2); color: var(--altin); margin: 2rem 0 0.6rem; }
  .form { display: grid; gap: 0.8rem; margin-top: 1rem; font-family: var(--sans); font-size: var(--t-0); }
  .form label { display: grid; gap: 0.35rem; color: var(--ay-soluk); }
  .eylem { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.8rem; font-family: var(--sans); font-size: var(--t-0); }
  .mesaj { color: var(--altin-acik); }
  .tehlike { border-color: #b8604a; color: #f0b9a8; }
  .lisans { padding-left: 1.1rem; display: grid; gap: 0.35rem; margin-top: 0.6rem; font-family: var(--sans); }
  details summary { cursor: pointer; color: var(--ay-soluk); font-family: var(--sans); }
  .son { margin-top: 2rem; }
</style>
