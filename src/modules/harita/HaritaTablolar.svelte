<script>
  // Teknik görünüm: konumlar, evler, açılar, denge. Yorumu okumak istemeyen ya da doğrulamak isteyen için.
  import { GEZEGENLER, GEZEGEN, ACILAR, BURCLAR, ELEMENT_ADI, NITELIK_ADI, konumYazi, burc } from '../../engine/astro/sabitler.js';
  let { harita, analiz } = $props();
  const ACI = Object.fromEntries(ACILAR.map((a) => [a.key, a]));
  const ad = (k) => (k === 'asc' ? 'Yükselen' : k === 'mc' ? 'MC' : GEZEGEN[k]?.ad ?? k);
  const ONUR_ADI = { ev: 'kendi evinde', yucelim: 'yücelimde', zarar: 'zararda', dusus: 'düşüşte' };
  const EV_SIS = { placidus: 'Placidus', koch: 'Koch', esit: 'Eşit ev', burc: 'Bütün burç' };
  const yuzde = (v, t) => Math.round((v / t) * 100);
</script>

<section class="tablolar">
  <h2>Konumlar</h2>
  <table>
    <thead><tr><th>Nokta</th><th>Konum</th>{#if harita.evler}<th>Ev</th>{/if}<th></th></tr></thead>
    <tbody>
      {#each GEZEGENLER as g}
        {@const k = harita.konumlar[g.key]}
        <tr>
          <td><span class="sem" aria-hidden="true">{g.sembol}</span> {g.ad}</td>
          <td>{konumYazi(k.lon)}</td>
          {#if harita.evler}<td>{k.ev}</td>{/if}
          <td class="sessiz kucuk">{k.retro ? 'geri hareket' : ''}{analiz.onurlar[g.key] ? (k.retro ? ', ' : '') + ONUR_ADI[analiz.onurlar[g.key]] : ''}</td>
        </tr>
      {/each}
      {#if harita.evler}
        <tr><td>Yükselen</td><td>{konumYazi(harita.evler.asc)}</td><td>1</td><td></td></tr>
        <tr><td>MC (Tepe noktası)</td><td>{konumYazi(harita.evler.mc)}</td><td>10</td><td></td></tr>
        <tr><td>Şans Noktası</td><td>{konumYazi(harita.sans)}</td><td></td><td class="sessiz kucuk">{harita.gunduz ? 'gündüz haritası' : 'gece haritası'}</td></tr>
      {/if}
    </tbody>
  </table>
  {#if harita.ayAraligi}
    <p class="kucuk sessiz">Ay o gün {konumYazi(harita.ayAraligi[0])} ile {konumYazi(harita.ayAraligi[1])} arasında hareket etti.</p>
  {/if}

  {#if harita.evler}
    <h2>Evler <span class="kucuk sessiz">· {EV_SIS[harita.evler.sistem]}{harita.evler.sistem !== harita.evler.istenen ? ' (kutup bölgesinde Placidus tanımsız olduğu için)' : ''}</span></h2>
    <ol class="evler">
      {#each harita.evler.cusps as c, i}<li><span class="sessiz">{i + 1}.</span> {konumYazi(c)}</li>{/each}
    </ol>
    {#if analiz.kesik.length}<p class="kucuk sessiz">Kesik burçlar: {analiz.kesik.map((k) => BURCLAR.find((b) => b.key === k).ad).join(', ')}</p>{/if}
  {/if}

  <h2>Açılar</h2>
  <table>
    <thead><tr><th>Noktalar</th><th>Açı</th><th>Orb</th></tr></thead>
    <tbody>
      {#each analiz.acilar as a}
        <tr>
          <td>{ad(a.a)} – {ad(a.b)}</td>
          <td><span class="sem" aria-hidden="true">{ACI[a.aci].sembol}</span> {ACI[a.aci].ad}</td>
          <td class="sessiz">{a.orb.toFixed(1)}° {a.yaklasan ? 'yaklaşıyor' : 'ayrılıyor'}</td>
        </tr>
      {/each}
    </tbody>
  </table>

  <h2>Denge</h2>
  <div class="denge">
    {#each Object.entries(analiz.denge.element) as [k, v]}
      <div class="cubuk"><span>{ELEMENT_ADI[k]}</span><span class="bar"><span style="width:{yuzde(v, analiz.denge.toplam)}%"></span></span><span class="sessiz kucuk">{yuzde(v, analiz.denge.toplam)}%</span></div>
    {/each}
    {#each Object.entries(analiz.denge.nitelik) as [k, v]}
      <div class="cubuk"><span>{NITELIK_ADI[k]}</span><span class="bar ni"><span style="width:{yuzde(v, analiz.denge.toplam)}%"></span></span><span class="sessiz kucuk">{yuzde(v, analiz.denge.toplam)}%</span></div>
    {/each}
  </div>
</section>

<style>
  .tablolar { display: grid; gap: 1rem; }
  h2 { font-size: var(--t-2); margin-top: 1rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
  th { text-align: left; font-weight: 500; color: var(--sessiz); font-size: var(--t-kucuk); padding: 0.4rem 0.5rem; border-bottom: 1px solid var(--cizgi); }
  td { padding: 0.45rem 0.5rem; border-bottom: 1px solid rgba(201, 162, 77, 0.08); }
  .sem { color: var(--altin); display: inline-block; width: 1.2em; text-align: center; }
  .evler { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr)); gap: 0.4rem 1rem; }
  .denge { display: grid; gap: 0.5rem; }
  .cubuk { display: grid; grid-template-columns: 5rem 1fr 3rem; gap: 0.75rem; align-items: center; }
  .bar { height: 6px; border-radius: 3px; background: rgba(201, 162, 77, 0.1); overflow: hidden; }
  .bar > span { display: block; height: 100%; background: var(--altin); }
  .bar.ni > span { background: var(--ay-soluk); }
</style>
