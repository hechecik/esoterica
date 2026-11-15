<script>
  let { onhazir } = $props();
  const konular = [
    ['genel', 'Genel'], ['ask', 'Aşk'], ['is', 'İş ve kariyer'], ['para', 'Para'], ['yolculuk', 'Yolculuk'],
    ['sinav', 'Sınav'], ['saglik', 'Sağlık'], ['aile', 'Aile'], ['kayip', 'Kayıp eşya'],
  ];
  const kisiler = [
    ['kendim', 'Kendim'], ['sevgili', 'Sevgilim / eşim'], ['kardes', 'Kardeşim'], ['ebeveyn', 'Annem / babam'],
    ['cocuk', 'Çocuğum'], ['arkadas', 'Arkadaşım'], ['is_arkadasi', 'İş arkadaşım'], ['baska', 'Başka biri'],
  ];
  let konu = $state('genel');
  let kisi = $state('kendim');
  let soru = $state('');
  let niyetOnun = $state(false);
</script>

<section class="niyet">
  <h1>Niyet</h1>
  <p class="okuma sessiz">Sorunu aklından geçir. Yazarsan yalnızca bu cihazda kalır; yazmazsan da olur.</p>

  <label class="blok">
    <span class="kucuk sessiz">Soru (isteğe bağlı)</span>
    <textarea class="alan" rows="2" bind:value={soru} placeholder="Örneğin: Bu iş yürür mü?" maxlength="200"></textarea>
  </label>

  <div class="blok">
    <span class="kucuk sessiz">Konu</span>
    <div class="cipler" role="group" aria-label="Konu">
      {#each konular as [k, ad]}
        <button type="button" class="cip" aria-pressed={konu === k} onclick={() => (konu = k)}>{ad}</button>
      {/each}
    </div>
  </div>

  <div class="blok">
    <span class="kucuk sessiz">Kimin için</span>
    <div class="cipler" role="group" aria-label="Kimin için">
      {#each kisiler as [k, ad]}
        <button type="button" class="cip" aria-pressed={kisi === k} onclick={() => (kisi = k)}>{ad}</button>
      {/each}
    </div>
    {#if kisi !== 'kendim'}
      <label class="onay">
        <input type="checkbox" bind:checked={niyetOnun} />
        <span>Niyeti o tuttu, çizgileri o çekecek (ya da onun yerine çekeceğim). Bu durumda tablo doğrudan onun tablosu sayılır.</span>
      </label>
    {/if}
  </div>

  <div class="eylem">
    <button class="dugme asil" onclick={() => onhazir({ konu, kisi: niyetOnun ? 'kendim' : kisi, soru })}>Kuma geç</button>
  </div>
</section>

<style>
  .niyet { display: grid; gap: 1.5rem; padding: 1.5rem 0; }
  .niyet h1 { margin-bottom: -0.5rem; }
  .blok { display: grid; gap: 0.5rem; }
  textarea.alan { resize: vertical; font-family: var(--serif); font-size: var(--t-1); }
  .onay { display: flex; gap: 0.6rem; align-items: flex-start; color: var(--ay-soluk); font-size: var(--t-kucuk); margin-top: 0.5rem; }
  .onay input { margin-top: 0.2rem; accent-color: var(--altin); }
  .eylem { padding-top: 0.5rem; }
</style>
