<script>
  // Atış ekranı: 16 kum satırı. Parmak ya da fare her satıra saymadan vuruş bırakır.
  // Alternatifler: kriptografik rastgele atış, ya da kâğıttan 16 sayı girişi.
  import { secureRemilCounts } from '../../engine/random/index.js';

  let { ontamam } = $props();
  let satirlar = $state(Array.from({ length: 16 }, () => []));
  let aktif = $state(0);
  let mod = $state('kum'); // kum | kagit
  let kagit = $state('');
  let surukle = $state(false);
  let sonX = 0;

  const dolu = $derived(satirlar.filter((s) => s.length >= 3).length);
  const hazir = $derived(dolu === 16);

  function vur(i, e) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    if (Math.abs(x - sonX) < 1.2 && satirlar[i].length) return; // aynı yerde çift sayma
    sonX = x;
    satirlar[i] = [...satirlar[i], { x, y: 30 + ((e.clientY - r.top) / r.height) * 40 }];
    aktif = i;
    if (navigator.vibrate) navigator.vibrate(6);
  }
  function basla(i, e) { surukle = true; sonX = -10; vur(i, e); e.currentTarget.setPointerCapture?.(e.pointerId); }
  function hareket(i, e) { if (surukle) vur(i, e); }
  function birak() { surukle = false; }
  function temizle(i) { satirlar[i] = []; }
  function sil() { satirlar = Array.from({ length: 16 }, () => []); aktif = 0; }

  function kumdanBitir() { ontamam(satirlar.map((s) => s.length), 'kum'); }
  function rastgele() { ontamam(secureRemilCounts(), 'rastgele'); }
  const kagitSayilar = $derived(kagit.split(/[\s,;]+/).map(Number).filter((n) => Number.isInteger(n) && n > 0));
  function kagittanBitir() { if (kagitSayilar.length === 16) ontamam(kagitSayilar, 'kagit'); }
</script>

<section class="atis">
  <header>
    <h1>Çizgiler</h1>
    <p class="okuma sessiz">Soruyu aklında tut. Her satıra parmağınla hızlıca vur ya da sürükle; sayma, ayarlama. On altı satır dolunca kum konuşur.</p>
  </header>

  <div class="modlar cipler" role="group" aria-label="Atış biçimi">
    <button type="button" class="cip" aria-pressed={mod === 'kum'} onclick={() => (mod = 'kum')}>Kumda çiz</button>
    <button type="button" class="cip" aria-pressed={mod === 'kagit'} onclick={() => (mod = 'kagit')}>Kâğıttan gir</button>
    <button type="button" class="cip" onclick={rastgele}>Sen at</button>
  </div>

  {#if mod === 'kum'}
    <div class="kum" role="group" aria-label="On altı kum satırı">
      {#each satirlar as s, i}
        <div
          class="satir" class:aktif={aktif === i} class:dolu={s.length >= 3}
          role="button" tabindex="0" aria-label="Satır {i + 1}, {s.length} vuruş"
          onpointerdown={(e) => basla(i, e)} onpointermove={(e) => hareket(i, e)} onpointerup={birak} onpointercancel={birak}
          onkeydown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); satirlar[i] = [...s, { x: 5 + s.length * 5.5, y: 50 }]; } if (e.key === 'Backspace') temizle(i); }}
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {#each s as v}
              <line x1={v.x} y1={v.y - 18} x2={v.x} y2={v.y + 18} />
            {/each}
          </svg>
          <span class="no kucuk">{i + 1}</span>
        </div>
      {/each}
    </div>
    <div class="alt">
      <span class="kucuk sessiz">{dolu} / 16 satır</span>
      <div class="eylem">
        <button class="dugme sade" onclick={sil} disabled={dolu === 0}>Temizle</button>
        <button class="dugme asil" onclick={kumdanBitir} disabled={!hazir}>Şekilleri çıkar</button>
      </div>
    </div>
  {:else}
    <div class="kagit">
      <p class="okuma sessiz">Kâğıda saymadan 16 satır çizgi çek, sonra her satırdaki çizgileri say ve sırayla yaz.</p>
      <textarea class="alan" rows="3" bind:value={kagit} placeholder="11 5 10 1 2 16 12 11 12 14 19 10 11 13 14 14"></textarea>
      <div class="alt">
        <span class="kucuk sessiz">{kagitSayilar.length} / 16 sayı</span>
        <button class="dugme asil" onclick={kagittanBitir} disabled={kagitSayilar.length !== 16}>Şekilleri çıkar</button>
      </div>
    </div>
  {/if}
</section>

<style>
  .atis { display: grid; gap: 1.25rem; padding: 1.5rem 0; }
  header { display: grid; gap: 0.75rem; }
  .kum {
    display: grid; gap: 4px; padding: 10px; border-radius: 14px;
    background:
      radial-gradient(120% 80% at 30% 0%, rgba(200, 183, 154, 0.08), transparent 60%),
      linear-gradient(180deg, rgba(140, 122, 92, 0.25), rgba(140, 122, 92, 0.12));
    border: 1px solid rgba(200, 183, 154, 0.25);
    touch-action: none; user-select: none;
  }
  .satir {
    position: relative; height: 34px; border-radius: 6px;
    background: rgba(200, 183, 154, 0.07);
    cursor: crosshair; transition: background 160ms var(--yay);
  }
  .satir:hover, .satir.aktif { background: rgba(200, 183, 154, 0.14); }
  .satir.dolu { background: rgba(200, 183, 154, 0.11); }
  .satir svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .satir line { stroke: var(--kum); stroke-width: 1.4; stroke-linecap: round; vector-effect: non-scaling-stroke; animation: iz 240ms var(--yay) both; }
  @keyframes iz { from { opacity: 0; transform: scaleY(0.4); transform-origin: center; transform-box: fill-box; } to { opacity: 1; transform: scaleY(1); } }
  .no { position: absolute; left: 8px; top: 50%; transform: translateY(-50%); color: var(--kum-koyu); pointer-events: none; }
  .alt { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
  .eylem { display: flex; gap: 0.5rem; }
  .kagit { display: grid; gap: 0.75rem; }
  @media (min-width: 40rem) { .satir { height: 30px; } }
</style>
