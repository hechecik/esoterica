<script>
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
  <h1>Gece seansı açık.</h1>
  <p class="okuma sessiz">Soru sende, cevap kumda. Burada baktığın hiçbir fal cihazından çıkmaz; ne soru, ne doğum tarihi, ne sonuç.</p>
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
  .giris { padding: 3rem 0 2.5rem; }
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
