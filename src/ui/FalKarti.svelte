<script>
  // Tek bir fal kartı: arkası (desen) ve yüzü. Görsel yok; telifsiz, hafif.
  // tur: tarot | lenormand | run | iskambil
  let { tur, kart = null, ters = false, acik = false, boyut = 'orta', gecikme = 0 } = $props();

  const ROMA = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];
  const SERI_SEMBOL = { asa: '⚚', kupa: '♡', kilic: '⚔', tilsim: '✪' };
  const RUTBE_KISA = { 1: 'As', 11: 'Uşak', 12: 'Şövalye', 13: 'Kraliçe', 14: 'Kral' };
  const ISK_KISA = { 1: 'A', 11: 'V', 12: 'K', 13: 'P' };

  const ust = $derived.by(() => {
    if (!kart) return '';
    if (tur === 'tarot') return kart.buyuk ? ROMA[kart.no] : (RUTBE_KISA[kart.rutbe] ?? kart.rutbe);
    if (tur === 'lenormand') return kart.no;
    if (tur === 'iskambil') return ISK_KISA[kart.sayi] ?? kart.sayi;
    return '';
  });
  const merkez = $derived.by(() => {
    if (!kart) return '';
    if (tur === 'tarot') return kart.buyuk ? '✶' : SERI_SEMBOL[kart.seri];
    if (tur === 'run') return kart.harf;
    if (tur === 'iskambil') return kart.sembol;
    return '';
  });
  const ad = $derived(kart?.ad ?? '');
  const kirmizi = $derived(tur === 'iskambil' && kart?.kirmizi);
</script>

<div class="kart {boyut} {tur}" class:acik class:ters style="--gecikme:{gecikme}ms">
  <div class="ic">
    <div class="arka" aria-hidden="true">
      <svg viewBox="0 0 60 100" preserveAspectRatio="none">
        <rect x="4" y="4" width="52" height="92" rx="3" fill="none" stroke="currentColor" stroke-width="0.6" />
        <rect x="7" y="7" width="46" height="86" rx="2" fill="none" stroke="currentColor" stroke-width="0.3" />
        <g fill="currentColor"><circle cx="30" cy="34" r="2.4" /><circle cx="30" cy="66" r="2.4" /><circle cx="21" cy="50" r="2.4" /><circle cx="39" cy="50" r="2.4" /></g>
        <path d="M30 22 L42 50 L30 78 L18 50 Z" fill="none" stroke="currentColor" stroke-width="0.4" />
      </svg>
    </div>
    <div class="yuz" class:kirmizi aria-hidden={!acik}>
      {#if ust !== ''}<span class="ust">{ust}</span>{/if}
      <span class="merkez" class:run={tur === 'run'}>{merkez}</span>
      <span class="ad">{ad}</span>
      {#if ters && tur !== 'iskambil'}<span class="ters-isaret">ters</span>{/if}
    </div>
  </div>
</div>

<style>
  .kart { perspective: 900px; aspect-ratio: 3 / 5; width: var(--gen, 7.5rem); }
  .kart.kucuk { --gen: 4.2rem; }
  .kart.buyuk { --gen: 9.5rem; }
  .run { aspect-ratio: 4 / 5; }
  .ic {
    position: relative; width: 100%; height: 100%;
    transform-style: preserve-3d;
    transition: transform 700ms var(--yay) var(--gecikme);
  }
  .acik .ic { transform: rotateY(180deg); }
  .arka, .yuz {
    position: absolute; inset: 0; border-radius: 8px;
    backface-visibility: hidden; -webkit-backface-visibility: hidden;
    border: 1px solid var(--altin-koyu);
  }
  .arka {
    color: var(--altin-koyu);
    background: radial-gradient(circle at 50% 40%, var(--murekkep-2), var(--gece) 75%);
    display: grid;
  }
  .arka svg { width: 100%; height: 100%; }
  .run .arka, .run .yuz { border-radius: 40% 40% 36% 36% / 30% 30% 26% 26%; }
  .yuz {
    transform: rotateY(180deg);
    background: linear-gradient(170deg, #f3ecdc, #e2d6bb);
    color: #2a2140;
    display: grid; grid-template-rows: auto 1fr auto; justify-items: center; align-items: center;
    padding: 0.45rem 0.35rem 0.55rem; text-align: center;
    font-family: var(--serif);
  }
  .run .yuz { background: radial-gradient(circle at 40% 35%, #8c8478, #4d473f 80%); color: #f1e6c8; grid-template-rows: 1fr auto; }
  .ust { font-size: 0.85em; letter-spacing: 0.08em; }
  .merkez { font-size: calc(var(--gen) * 0.36); line-height: 1; }
  .merkez.run { font-size: calc(var(--gen) * 0.5); font-family: var(--sans); }
  .ad { font-size: clamp(0.7rem, calc(var(--gen) * 0.12), 1rem); line-height: 1.15; }
  .kucuk .ad { display: none; }
  .kirmizi { color: #8f2b2b; }
  .ters .yuz .merkez { transform: rotate(180deg); }
  .ters-isaret { position: absolute; bottom: -1.4rem; left: 0; right: 0; font-size: var(--t-kucuk); color: var(--altin); font-style: italic; }
  .kucuk .ters-isaret { display: none; }
</style>
