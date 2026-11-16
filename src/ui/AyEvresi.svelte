<script>
  // Ay evresi çizimi: aydınlık oranı ve büyüme yönüne göre terminatör eğrisi.
  let { aydinlik = 0.5, buyuyor = true, boy = 72 } = $props();
  const r = 30;
  // Terminatör: elips yarıçapı = r * |1 - 2*aydinlik|
  const rx = $derived(Math.abs(1 - 2 * aydinlik) * r);
  const sagAydinlik = $derived(buyuyor); // kuzey yarımküre: büyüyen ay sağdan aydınlanır
  const yol = $derived.by(() => {
    const dis = sagAydinlik ? 1 : 0; // dış yay hangi tarafta
    const icSweep = aydinlik > 0.5 ? (sagAydinlik ? 0 : 1) : (sagAydinlik ? 1 : 0);
    return `M 0 ${-r} A ${r} ${r} 0 0 ${dis} 0 ${r} A ${rx} ${r} 0 0 ${icSweep} 0 ${-r} Z`;
  });
</script>

<svg width={boy} height={boy} viewBox="-36 -36 72 72" role="img" aria-label="Ay evresi, yüzde {Math.round(aydinlik * 100)} aydınlık">
  <circle r={r} class="karanlik" />
  {#if aydinlik > 0.02}<path d={yol} class="aydinlik" />{/if}
  <circle r={r} class="cevre" />
</svg>

<style>
  .karanlik { fill: #1d1838; }
  .aydinlik { fill: var(--ay); filter: drop-shadow(0 0 6px rgba(239, 233, 220, 0.35)); }
  .cevre { fill: none; stroke: rgba(201, 162, 77, 0.35); stroke-width: 0.8; }
</style>
