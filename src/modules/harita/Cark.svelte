<script>
  // Doğum haritası çarkı: AstroChart (MIT) ile SVG, gece temasına göre stillendirilmiş.
  // İsteğe bağlı dış halka: transitler.
  import { onMount } from 'svelte';
  import { GEZEGENLER, BURCLAR } from '../../engine/astro/sabitler.js';

  let { harita, transit = null, boy = 520 } = $props();
  let kap;
  const id = 'cark-' + Math.random().toString(36).slice(2, 8);

  const ELEMENT_RENK = { ates: 'rgba(201,120,77,0.16)', toprak: 'rgba(160,140,90,0.16)', hava: 'rgba(140,160,200,0.14)', su: 'rgba(90,120,170,0.16)' };

  function veri(h, evYok) {
    const planets = {};
    for (const g of GEZEGENLER) {
      const k = h.konumlar[g.key];
      if (k) planets[g.astrochart] = [k.lon, k.retro ? -1 : 1];
    }
    // Saat yoksa evler 0° Koç'tan eşit 30° (yalnızca çizim için; ev yorumu yapılmaz)
    const cusps = evYok ? Array.from({ length: 12 }, (_, i) => i * 30) : h.evler.cusps;
    return { planets, cusps };
  }

  async function ciz() {
    if (!kap) return;
    kap.innerHTML = '';
    const { Chart } = await import('@astrodraw/astrochart');
    const css = getComputedStyle(document.documentElement);
    const altin = css.getPropertyValue('--altin').trim() || '#c9a24d';
    const ay = css.getPropertyValue('--ay').trim() || '#efe9dc';
    const sessiz = css.getPropertyValue('--sessiz').trim() || '#7f7892';
    const ayarlar = {
      COLOR_BACKGROUND: 'transparent',
      POINTS_COLOR: ay, SIGNS_COLOR: altin, CIRCLE_COLOR: 'rgba(201,162,77,0.45)', LINE_COLOR: 'rgba(201,162,77,0.35)',
      CUSPS_FONT_COLOR: sessiz, SYMBOL_AXIS_FONT_COLOR: altin, CUSPS_STROKE: 0.8, SYMBOL_SCALE: boy < 420 ? 0.8 : 1,
      COLORS_SIGNS: BURCLAR.map((b) => ELEMENT_RENK[b.element]),
      POINTS_TEXT_SIZE: 9, PADDING: 16, MARGIN: 34, SHOW_DIGNITIES_TEXT: false,
      ASPECTS: {
        conjunction: { degree: 0, orbit: 10, color: 'transparent' },
        opposition: { degree: 180, orbit: 10, color: 'rgba(220,120,110,0.75)' },
        square: { degree: 90, orbit: 8, color: 'rgba(220,120,110,0.65)' },
        trine: { degree: 120, orbit: 8, color: 'rgba(140,190,170,0.7)' },
        sextile: { degree: 60, orbit: 6, color: 'rgba(140,170,210,0.6)' },
      },
    };
    const div = document.createElement('div');
    div.id = id;
    kap.appendChild(div);
    const evYok = !harita.evler;
    const chart = new Chart(id, boy, boy, ayarlar);
    const radix = chart.radix(veri(harita, evYok));
    if (transit) radix.transit({ planets: veri(transit, true).planets, cusps: veri(harita, evYok).cusps });
    else radix.aspects();
    const svg = kap.querySelector('svg');
    if (svg) {
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', 'Doğum haritası çarkı');
      svg.setAttribute('viewBox', `0 0 ${boy} ${boy}`);
      svg.removeAttribute('width');
      svg.removeAttribute('height');
    }
  }

  onMount(ciz);
  $effect(() => { harita; transit; ciz(); });
</script>

<div class="cark" bind:this={kap}></div>

<style>
  .cark { width: 100%; max-width: 560px; margin: 0 auto; aspect-ratio: 1; }
  .cark :global(svg) { width: 100%; height: auto; display: block; }
  .cark :global(text) { font-family: var(--sans); }
</style>
