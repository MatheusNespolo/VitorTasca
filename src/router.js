export function readNiche(hash, validSlugs) {
  let s = String(hash ?? '').replace(/^#/, '');
  try { s = decodeURIComponent(s); } catch { return 'todos'; }
  s = s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  return validSlugs.includes(s) ? s : 'todos';
}
export function writeNiche(slug) {
  const url = slug === 'todos' ? location.pathname + location.search : `#${slug}`;
  history.replaceState(null, '', url);
}
