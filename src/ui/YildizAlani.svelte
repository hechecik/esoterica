<script>
  // Yıldız alanı: canvas üzerinde yavaş dönen yıldızlar. Düşük güçte ya da
  // azaltılmış hareket isteğinde statik tek kare çizilir.
  import { onMount } from 'svelte';
  let canvas;

  onMount(() => {
    const ctx = canvas.getContext('2d');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowPower = (navigator.hardwareConcurrency ?? 4) <= 2;
    let w = 0, h = 0, raf = 0, stars = [];
    const dpr = Math.min(devicePixelRatio || 1, 2);

    function resize() {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((w * h) / 6000);
      // Belirleyici dağılım: aynı ekran boyutunda aynı gökyüzü
      let s = 2463534242;
      const rnd = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 10000) / 10000; };
      stars = Array.from({ length: n }, () => ({
        x: rnd() * w, y: rnd() * h, r: 0.3 + rnd() * 1.1, a: 0.25 + rnd() * 0.6, p: rnd() * Math.PI * 2,
      }));
      draw(0);
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      for (const st of stars) {
        const tw = reduce || lowPower ? 1 : 0.75 + 0.25 * Math.sin(t / 1400 + st.p);
        ctx.globalAlpha = st.a * tw;
        ctx.fillStyle = st.r > 1.1 ? '#e3c77a' : '#efe9dc';
        ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function loop(t) { draw(t); raf = requestAnimationFrame(loop); }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas);
    if (!reduce && !lowPower) raf = requestAnimationFrame(loop);
    const vis = () => { if (document.hidden) cancelAnimationFrame(raf); else if (!reduce && !lowPower) raf = requestAnimationFrame(loop); };
    document.addEventListener('visibilitychange', vis);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); document.removeEventListener('visibilitychange', vis); };
  });
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
  canvas { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
</style>
