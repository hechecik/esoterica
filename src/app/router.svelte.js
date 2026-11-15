// Hash tabanlı yönlendirme: GitHub Pages'te sunucu yönlendirmesi yok,
// URL'ye hiçbir kişisel veri yazılmaz (sadece ekran adı).

const state = $state({ path: parse() });

function parse() {
  const h = location.hash.replace(/^#\/?/, '');
  return h ? '/' + h : '/';
}

function apply() {
  const next = parse();
  if (next === state.path) return;
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.startViewTransition(() => { state.path = next; });
  } else {
    state.path = next;
  }
  window.scrollTo({ top: 0 });
}

window.addEventListener('hashchange', apply);

export const router = {
  get path() { return state.path; },
  go(path) { location.hash = '#' + path; },
};
