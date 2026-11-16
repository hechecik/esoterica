<script>
  const fallar = [
    { yol: '#/gunluk', ad: 'Bugünün göğü', alt: 'Ay nerede, sana ne fısıldıyor. Her gün yeniden.', hazir: true },
    { yol: '#/remil', ad: 'Remil', alt: 'Kumda on altı satır, bir hâkim. İlm-i remil.', hazir: true },
    { yol: '#/harita', ad: 'Doğum haritası', alt: 'Doğduğun anın göğü, gezegenler ve evler.', hazir: true },
    { ad: 'Tarot', alt: 'Yetmiş sekiz kart, bir soru.', hazir: false },
    { ad: 'Kahve falı', alt: 'Fincanın dibi, kenarı, sapı ve tabak.', hazir: false },
    { ad: 'I Ching', alt: 'Üç para, altı çizgi, altmış dört heksagram.', hazir: false },
    { ad: 'Rüya tabiri', alt: 'Gördüğünü anlat, sembolleri bulalım.', hazir: false },
  ];
</script>

<section class="giris">
  <h1>Gece seansı açık.</h1>
  <p class="okuma sessiz">Soru sende, cevap kumda. Burada baktığın hiçbir fal cihazından çıkmaz; ne soru, ne doğum tarihi, ne sonuç.</p>
</section>

<ul class="liste" aria-label="Fal türleri">
  {#each fallar as f}
    <li>
      {#if f.hazir}
        <a href={f.yol} class="kart hazir">
          <h3>{f.ad}</h3>
          <p class="sessiz">{f.alt}</p>
        </a>
      {:else}
        <div class="kart" aria-disabled="true">
          <h3>{f.ad}</h3>
          <p class="sessiz">{f.alt}</p>
          <span class="kucuk yakinda">yakında</span>
        </div>
      {/if}
    </li>
  {/each}
</ul>

<style>
  .giris { padding: 3rem 0 2.5rem; }
  .giris h1 { margin-bottom: 1rem; }
  .liste { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.75rem; }
  .kart {
    display: block; position: relative;
    padding: 1.25rem 1.4rem; border-radius: var(--yumusak);
    border: 1px solid var(--cizgi); color: inherit;
    transition: border-color 180ms var(--yay), background 180ms var(--yay);
  }
  .kart h3 { margin-bottom: 0.25rem; }
  .kart.hazir:hover { text-decoration: none; border-color: var(--altin); background: rgba(27, 20, 51, 0.5); }
  .kart[aria-disabled="true"] { opacity: 0.55; }
  .yakinda { position: absolute; top: 1.1rem; right: 1.25rem; color: var(--altin-koyu); font-family: var(--serif); font-style: italic; font-size: var(--t-1); }
</style>
