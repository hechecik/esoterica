<script>
  import FalKarti from '../ui/FalKarti.svelte';
  import { seeded } from '../engine/random/index.js';

  // Günün kartı: herkes için aynı gün aynı kart (tarihten tohum), cihazda seçilir.
  const gun = new Date().toLocaleDateString('sv-SE');
  let gunKart = $state(null);
  let acik = $state(false);
  let mesaj = $state(null);
  async function cevir() {
    if (acik) return;
    const [{ default: c }, { tarotDeste }] = await Promise.all([import('../content/generated/tarot.json'), import('../engine/interpret/fal.js')]);
    const deste = tarotDeste(c);
    const r = seeded(`gunun-karti|${gun}`);
    gunKart = deste[r.int(deste.length)];
    mesaj = gunKart.buyuk ? r.pick(gunKart.veri.duz) : gunKart.veri.duz;
    requestAnimationFrame(() => requestAnimationFrame(() => (acik = true)));
  }
  const fallar = [
    { yol: '#/gunluk', ad: 'Bugünün göğü', alt: 'Ay nerede, sana ne fısıldıyor. Her gün yeniden.' },
    { yol: '#/kahve', ad: 'Kahve falı', alt: 'Fincanın dibi, kenarı, sapı ve tabak. Gördüğünü söyle, okuyalım.' },
    { yol: '#/tarot', ad: 'Tarot', alt: 'Yetmiş sekiz kart, bir soru. Tek karttan Kelt haçına.' },
    { yol: '#/harita', ad: 'Doğum haritası', alt: 'Doğduğun anın göğü, gezegenler ve evler.' },
    { yol: '#/remil', ad: 'Remil', alt: 'Kumda on altı satır, bir hâkim. İlm-i remil.' },
    { yol: '#/ruya', ad: 'Rüya tabiri', alt: 'Rüyanı yaz; sembolleri bulup gelenekle ve içinden okuyalım.' },
    { yol: '#/iching', ad: 'I Ching', alt: 'Üç para, altı çizgi, altmış dört heksagram.' },
    { yol: '#/sayilar', ad: 'Adın ve sayıların', alt: 'Numeroloji, yıldızname ve Çin burcu.' },
    { yol: '#/iskambil', ad: 'İskambil falı', alt: 'Katina usulü yedi kart.' },
    { yol: '#/lenormand', ad: 'Lenormand', alt: 'Otuz altı kart, yan yana gelince cümle kurarlar.' },
    { yol: '#/run', ad: 'Rün', alt: 'Kuzeyin yirmi dört taşı.' },
  ];
</script>

<section class="giris">
  <div class="metin">
    <h1>Gece seansı açık.</h1>
    <p class="okuma sessiz">Soru sende, cevap kumda. Burada baktığın hiçbir fal cihazından çıkmaz; ne soru, ne doğum tarihi, ne sonuç.</p>
  </div>
  <div class="gunun">
    <button class="gunun-kart" onclick={cevir} aria-label={acik ? `Günün kartı: ${gunKart?.ad}` : 'Günün kartını çevir'}>
      <FalKarti tur="tarot" kart={gunKart} {acik} boyut="buyuk" />
    </button>
    {#if acik && gunKart}
      <p class="gunun-metin"><span class="sessiz kucuk">Günün kartı · {gunKart.ad}</span><br />{mesaj}</p>
      <a class="kucuk" href="#/tarot">Kendi açılımını yap</a>
    {:else}
      <p class="sessiz kucuk">Günün kartı. Çevirmek için dokun.</p>
    {/if}
  </div>
</section>

<ul class="liste" aria-label="Fal türleri">
  {#each fallar as f}
    <li>
      <a href={f.yol} class="kart hazir">
          <h3>{f.ad}</h3>
          <p class="sessiz">{f.alt}</p>
        </a>
    </li>
  {/each}
</ul>

<style>
  .giris { padding: 2.5rem 0 2.5rem; display: grid; gap: 2rem; align-items: center; }
  @media (min-width: 40rem) { .giris { grid-template-columns: 1fr auto; } }
  .gunun { display: grid; justify-items: center; gap: 0.7rem; text-align: center; max-width: 16rem; margin: 0 auto; }
  .gunun-kart { padding: 0; border: 0; background: none; cursor: pointer; border-radius: 8px; animation: suzul 6s ease-in-out infinite; }
  .gunun-kart:hover { animation-play-state: paused; }
  @keyframes suzul { 0%, 100% { transform: translateY(0) rotate(-1.5deg); } 50% { transform: translateY(-6px) rotate(1deg); } }
  .gunun-metin { font-family: var(--serif); font-size: var(--t-0); line-height: 1.45; animation: belir 900ms 500ms var(--yay) both; }
  @keyframes belir { from { opacity: 0; transform: translateY(6px); } }
  .giris h1 { margin-bottom: 1rem; }
  .liste { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr)); }
  .liste li:first-child { grid-column: 1 / -1; }
  .liste li:first-child .kart { border-color: var(--altin-koyu); }
  .liste li:first-child h3 { font-size: var(--t-3); }
  .kart {
    display: block; position: relative;
    padding: 1.25rem 1.4rem; border-radius: var(--yumusak);
    border: 1px solid var(--cizgi); color: inherit;
    transition: border-color 180ms var(--yay), background 180ms var(--yay);
  }
  .kart h3 { margin-bottom: 0.25rem; }
  .kart.hazir:hover { text-decoration: none; border-color: var(--altin); background: rgba(27, 20, 51, 0.5); }
</style>
