<script>
  // Tek bir fal kartı: arka yüz ve özgün SVG ön yüz.
  // tur: tarot | lenormand | run | iskambil
  import { BUYUK, TAKIM, TAKIM_RENK, PIP, SARAY, LEN, LEN_KOSE, RUN, ISK_TAKIM, ISK_KISA, ISK_PIP } from './kart-sanati.js';

  let { tur, kart = null, ters = false, acik = false, boyut = 'orta', gecikme = 0 } = $props();

  const ROMA = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];
  const RUTBE_AD = { 1: 'As', 11: 'Uşak', 12: 'Şövalye', 13: 'Kraliçe', 14: 'Kral' };

  const adBoy = $derived((kart?.ad?.length ?? 0) > 16 ? 9 : 11);
  const iskKirmizi = $derived(tur === 'iskambil' && kart?.kirmizi);
  const iskRenk = $derived(iskKirmizi ? '#9e2a2b' : '#1d1830');
  const lenKose = $derived(tur === 'lenormand' && kart ? LEN_KOSE[kart.no] : null);
  // Kafes deseni (arka yüz) için çizgiler
  const kafes = Array.from({ length: 9 }, (_, i) => i * 25 - 40);
</script>

<div class="kart {boyut} {tur}" class:acik style="--gecikme:{gecikme}ms">
  <div class="ic">
    <!-- ARKA -->
    <div class="arka" aria-hidden="true">
      {#if tur === 'run'}
        <svg viewBox="0 0 40 50"><circle cx="20" cy="25" r="5" class="oyuk" /><circle cx="20" cy="25" r="1.4" class="oyuk-dolu" /></svg>
      {:else}
        <svg viewBox="0 0 120 200">
          <rect x="5" y="5" width="110" height="190" rx="6" class="cer" />
          <g class="kafes">
            {#each kafes as k}<path d="M{k} 10 L{k + 180} 190 M{k + 180} 10 L{k} 190" />{/each}
          </g>
          <rect x="10" y="10" width="100" height="180" rx="3" class="cer ince" />
          {#if tur === 'tarot'}
            <circle cx="60" cy="100" r="30" class="madalyon" />
            <g transform="translate(60 100)" class="isin">{@html Array.from({ length: 24 }, (_, i) => { const a = (i * Math.PI) / 12; return `<path d="M${(Math.cos(a) * 33).toFixed(1)} ${(Math.sin(a) * 33).toFixed(1)}L${(Math.cos(a) * (i % 2 ? 40 : 46)).toFixed(1)} ${(Math.sin(a) * (i % 2 ? 40 : 46)).toFixed(1)}"/>`; }).join('')}</g>
            <g class="nokta"><circle cx="60" cy="86" r="3.4" /><circle cx="60" cy="114" r="3.4" /><circle cx="48" cy="100" r="3.4" /><circle cx="72" cy="100" r="3.4" /></g>
          {:else if tur === 'lenormand'}
            <rect x="34" y="70" width="52" height="60" rx="26" class="madalyon" />
            <path d="M60 82 L70 100 L60 118 L50 100Z" class="cer" />
          {:else}
            <path d="M60 64 L84 100 L60 136 L36 100Z" class="madalyon" />
            <path d="M60 78 L74 100 L60 122 L46 100Z" class="cer" />
          {/if}
        </svg>
      {/if}
    </div>

    <!-- ÖN -->
    <div class="yuz" aria-hidden={!acik}>
      {#if kart}
        {#if tur === 'tarot'}
          {@const minor = !kart.buyuk}
          <svg viewBox="0 0 120 200" class="tarot-yuz" class:ters style={minor ? `--takim:${TAKIM_RENK[kart.seri]}` : ''}>
            <rect x="5" y="5" width="110" height="190" rx="6" class="cer" />
            <rect x="9.5" y="9.5" width="101" height="181" rx="3" class="cer ince" />
            {#each [[9.5, 9.5], [110.5, 9.5], [9.5, 190.5], [110.5, 190.5]] as [x, y]}<path d="M{x} {y - 3} L{x + 3} {y} L{x} {y + 3} L{x - 3} {y}Z" class="kose" />{/each}
            <path d="M42 15 H78 Q82 23 78 31 H42 Q38 23 42 15Z" class="kartus" />
            <text x="60" y="27" class="no">{kart.buyuk ? ROMA[kart.no] : RUTBE_AD[kart.rutbe] ?? kart.rutbe}</text>
            {#if kart.buyuk}
              <g transform="translate(14 42) scale(0.92)" class="amblem">{@html BUYUK[kart.no]}</g>
            {:else if kart.rutbe === 1}
              <g transform="translate(60 98)" class="amblem takim-renk">
                {@html Array.from({ length: 16 }, (_, i) => { const a = (i * Math.PI) / 8; return `<path class="ince" d="M${(Math.cos(a) * 30).toFixed(1)} ${(Math.sin(a) * 30).toFixed(1)}L${(Math.cos(a) * 40).toFixed(1)} ${(Math.sin(a) * 40).toFixed(1)}"/>`; }).join('')}
                <circle r="26" class="ince" />
                <g transform="scale(2.3)">{@html TAKIM[kart.seri]}</g>
              </g>
            {:else if kart.rutbe <= 10}
              {#each PIP[kart.rutbe] as [x, y]}
                <g transform="translate({x} {y * 0.86 + 12}) scale(1.05)" class="amblem takim-renk">{@html TAKIM[kart.seri]}</g>
              {/each}
            {:else}
              <g transform="translate(25 36) scale(0.7)" class="amblem">{@html SARAY[kart.rutbe]}</g>
              <g transform="translate(60 120) scale(2.4)" class="amblem takim-renk">{@html TAKIM[kart.seri]}</g>
            {/if}
            <path d="M24 160 H96" class="cer ince" />
            <text x="60" y="178" class="ad" style="font-size:{adBoy}px">{kart.ad}</text>
          </svg>

        {:else if tur === 'lenormand'}
          <svg viewBox="0 0 120 200" class="len-yuz" class:ters>
            <rect x="6" y="6" width="108" height="188" rx="5" class="cer" />
            <text x="16" y="24" class="no-sol">{kart.no}</text>
            {#if lenKose}
              <rect x="88" y="11" width="21" height="28" rx="2" class="kose-kart" />
              <text x="98.5" y="23" class="kose-rakam" class:kirmizi={'♥♦'.includes(lenKose[1])}>{lenKose[0]}</text>
              <text x="98.5" y="35" class="kose-rakam" class:kirmizi={'♥♦'.includes(lenKose[1])}>{lenKose[1]}</text>
            {/if}
            <circle cx="60" cy="96" r="42" class="hale" />
            <g transform="translate(18 54) scale(0.84)" class="ikon">{@html LEN[kart.no]}</g>
            <path d="M30 156 H90" class="cer ince" />
            <text x="60" y="176" class="ad" style="font-size:{adBoy + 1}px">{kart.ad}</text>
          </svg>

        {:else if tur === 'iskambil'}
          <svg viewBox="0 0 120 200" class="isk-yuz" style="--isk:{iskRenk}">
            <rect x="5" y="5" width="110" height="190" rx="7" class="cer" />
            {#each [0, 1] as ters2}
              <g transform={ters2 ? 'rotate(180 60 100)' : ''}>
                <text x="15" y="26" class="isk-indeks">{ISK_KISA[kart.sayi] ?? kart.sayi}</text>
                <g transform="translate(15 37) scale(0.55)" class="isk-p">{@html ISK_TAKIM[kart.renk]}</g>
              </g>
            {/each}
            {#if kart.sayi === 1}
              <g transform="translate(60 100) scale(3.2)" class="isk-p">{@html ISK_TAKIM[kart.renk]}</g>
              <circle cx="60" cy="100" r="40" class="cer ince" />
            {:else if kart.sayi <= 10}
              {#each ISK_PIP[kart.sayi] as [x, y]}
                <g transform="translate({x} {y}) scale(1.05){y > 100 ? ' rotate(180)' : ''}" class="isk-p">{@html ISK_TAKIM[kart.renk]}</g>
              {/each}
            {:else}
              <rect x="27" y="34" width="66" height="132" rx="3" class="cer" />
              <rect x="31" y="38" width="58" height="124" rx="2" class="saray-zemin" />
              <g transform="translate(36 40) scale(0.48)" class="saray-ikon">{@html SARAY[kart.sayi === 11 ? 11 : kart.sayi === 12 ? 13 : 14]}</g>
              <text x="60" y="122" class="saray-harf">{ISK_KISA[kart.sayi]}</text>
              <g transform="translate(60 144) scale(1.2)" class="isk-p">{@html ISK_TAKIM[kart.renk]}</g>
            {/if}
          </svg>

        {:else if tur === 'run'}
          <svg viewBox="-4 -2 48 64" class="run-yuz" class:ters={ters && kart.ters_olur}>
            {#if RUN[kart.key]}
              <path d={RUN[kart.key]} class="oyma-isik" transform="translate(0.9 0.9)" />
              <path d={RUN[kart.key]} class="oyma" />
            {:else}
              <circle cx="20" cy="30" r="9" class="oyma-bos" />
            {/if}
          </svg>
          <span class="run-ad">{kart.ad}</span>
        {/if}
      {/if}
    </div>
  </div>
</div>

<style>
  .kart { perspective: 1000px; aspect-ratio: 3 / 5; width: var(--gen, 7.5rem); flex: none; }
  .kart.kucuk { --gen: 4.4rem; }
  .kart.buyuk { --gen: 10rem; }
  .run { aspect-ratio: 4 / 5; }
  .ic {
    position: relative; width: 100%; height: 100%;
    transform-style: preserve-3d;
    transition: transform 800ms var(--yay) var(--gecikme);
  }
  .acik .ic { transform: rotateY(180deg); }
  .arka, .yuz {
    position: absolute; inset: 0; border-radius: 7px; overflow: hidden;
    backface-visibility: hidden; -webkit-backface-visibility: hidden;
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.45), 0 1px 0 rgba(255, 255, 255, 0.05) inset;
  }
  svg { width: 100%; height: 100%; display: block; }

  /* --- Arka yüzler --- */
  .arka { background: radial-gradient(ellipse at 50% 45%, #2b1f55, #120d26 70%); color: var(--altin-koyu); }
  .lenormand .arka { background: radial-gradient(ellipse at 50% 45%, #4b1c33, #1f0b16 72%); }
  .iskambil .arka { background: radial-gradient(ellipse at 50% 45%, #1d2c52, #0c1226 72%); }
  .arka .cer { fill: none; stroke: currentColor; stroke-width: 1; }
  .arka .cer.ince { stroke-width: 0.6; }
  .arka .kafes path { stroke: currentColor; stroke-width: 0.35; opacity: 0.45; }
  .arka .madalyon { fill: #120d26; stroke: var(--altin); stroke-width: 0.9; }
  .lenormand .arka .madalyon { fill: #1f0b16; }
  .iskambil .arka .madalyon { fill: #0c1226; }
  :global(.arka .isin path) { stroke: var(--altin-koyu); stroke-width: 0.7; }
  .arka .nokta circle { fill: var(--altin); }
  .run .arka { background: radial-gradient(circle at 38% 30%, #6d675e, #39352f 75%); border-radius: 44% 44% 38% 38% / 34% 34% 28% 28%; }
  .run .yuz { border-radius: 44% 44% 38% 38% / 34% 34% 28% 28%; }
  .oyuk { fill: none; stroke: #2a2620; stroke-width: 1.2; }
  .oyuk-dolu { fill: #2a2620; }

  /* --- Ön yüzler --- */
  .yuz { transform: rotateY(180deg); }
  .tarot .yuz { background: radial-gradient(ellipse at 50% 38%, #2d2258 0%, #17122f 62%, #0f0b22 100%); }
  .tarot-yuz { color: var(--altin); }
  .tarot-yuz .cer { fill: none; stroke: var(--altin-koyu); stroke-width: 1.1; }
  .tarot-yuz .cer.ince { stroke-width: 0.6; }
  .tarot-yuz .kose { fill: var(--altin); }
  .tarot-yuz .kartus { fill: rgba(201, 162, 77, 0.12); stroke: var(--altin-koyu); stroke-width: 0.7; }
  .tarot-yuz .no { fill: var(--altin-acik); font-family: var(--serif); font-size: 10.5px; text-anchor: middle; letter-spacing: 0.08em; }
  .tarot-yuz .ad { fill: var(--ay); font-family: var(--serif); text-anchor: middle; letter-spacing: 0.02em; }
  :global(.tarot-yuz .amblem path), :global(.tarot-yuz .amblem circle), :global(.tarot-yuz .amblem ellipse) { fill: none; stroke: var(--altin); stroke-width: 1.35; stroke-linecap: round; stroke-linejoin: round; }
  :global(.tarot-yuz .amblem .ince) { stroke-width: 0.8; opacity: 0.85; }
  :global(.tarot-yuz .amblem .dolu) { fill: var(--altin); }
  :global(.tarot-yuz .amblem .vurgu) { stroke: var(--altin-acik); stroke-width: 1.8; }
  :global(.tarot-yuz .takim-renk path), :global(.tarot-yuz .takim-renk circle) { stroke: var(--takim); }
  :global(.tarot-yuz .takim-renk .dolu) { fill: var(--takim); }
  .tarot-yuz.ters { transform: rotate(180deg); }

  .lenormand .yuz { background: linear-gradient(170deg, #f4ecd9, #e4d4b4); }
  .len-yuz .cer { fill: none; stroke: #7a5a3a; stroke-width: 1; }
  .len-yuz .cer.ince { stroke-width: 0.6; }
  .len-yuz .hale { fill: rgba(122, 90, 58, 0.07); stroke: rgba(122, 90, 58, 0.25); stroke-width: 0.6; }
  .len-yuz .no-sol { fill: #5a3e26; font-family: var(--serif); font-size: 13px; font-weight: 600; }
  .len-yuz .kose-kart { fill: #fffaf0; stroke: #7a5a3a; stroke-width: 0.6; }
  .len-yuz .kose-rakam { fill: #1d1830; font-family: var(--serif); font-size: 10px; text-anchor: middle; font-weight: 600; }
  .len-yuz .kose-rakam.kirmizi { fill: #9e2a2b; }
  .len-yuz .ad { fill: #2a2140; font-family: var(--serif); text-anchor: middle; font-weight: 600; }
  :global(.len-yuz .ikon path), :global(.len-yuz .ikon circle), :global(.len-yuz .ikon ellipse) { fill: none; stroke: #2a2140; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
  :global(.len-yuz .ikon .ince) { stroke-width: 0.9; }
  :global(.len-yuz .ikon .dolu) { fill: #2a2140; }
  .len-yuz.ters { transform: rotate(180deg); }

  .iskambil .yuz { background: linear-gradient(170deg, #fbf7ee, #ece2cc); }
  .isk-yuz .cer { fill: none; stroke: #b9a888; stroke-width: 0.8; }
  .isk-yuz .cer.ince { stroke-width: 0.5; }
  .isk-yuz .isk-indeks { fill: var(--isk); font-family: var(--serif); font-size: 15px; font-weight: 600; text-anchor: middle; }
  :global(.isk-yuz .isk-p *) { fill: var(--isk); stroke: none; }
  .isk-yuz .saray-zemin { fill: rgba(201, 162, 77, 0.14); }
  :global(.isk-yuz .saray-ikon path), :global(.isk-yuz .saray-ikon circle) { fill: none; stroke: var(--isk); stroke-width: 1.4; }
  :global(.isk-yuz .saray-ikon .dolu) { fill: var(--isk); }
  .isk-yuz .saray-harf { fill: var(--isk); font-family: var(--serif); font-size: 44px; font-weight: 600; text-anchor: middle; }

  .run .yuz { background: radial-gradient(circle at 38% 30%, #8e877b, #4b463f 78%); display: grid; grid-template-rows: 1fr auto; justify-items: center; }
  .run-yuz { width: 54%; height: auto; align-self: center; margin-top: 10%; }
  .run-yuz.ters { transform: rotate(180deg); }
  .oyma { fill: none; stroke: #241f19; stroke-width: 3.2; stroke-linecap: round; stroke-linejoin: round; }
  .oyma-isik { fill: none; stroke: rgba(240, 228, 200, 0.45); stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; }
  .oyma-bos { fill: none; stroke: rgba(36, 31, 25, 0.5); stroke-width: 1.2; stroke-dasharray: 2 3; }
  .run-ad { font-family: var(--serif); color: #f1e6c8; font-size: clamp(0.65rem, calc(var(--gen) * 0.13), 1rem); padding-bottom: 12%; }
  .kucuk .run-ad { display: none; }
</style>
