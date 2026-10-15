import { parseYouTubeId } from './youtube.js';
import { NICHES } from '../data/niches.js';

export function normalizeProjects(raw, niches = NICHES) {
  const slugs = new Set(niches.map(n => n.slug));
  const seen = new Map();
  const out = [];
  for (const r of raw) {
    const title = String(r.title ?? '').trim();
    const niche = String(r.niche ?? '').trim();
    const youtubeId = parseYouTubeId(r.youtube);
    if (!title || !slugs.has(niche) || !youtubeId) { console.warn('[projetos] item ignorado:', r); continue; }
    const n = (seen.get(youtubeId) ?? 0) + 1; seen.set(youtubeId, n);
    out.push({ id: n === 1 ? youtubeId : `${youtubeId}-${n}`, niche, title,
      client: String(r.client ?? '').trim(), youtubeId, featured: r.featured === true });
  }
  return [...out.filter(p => p.featured), ...out.filter(p => !p.featured)];
}
export const filterByNiche = (ps, slug) => (slug === 'todos' ? ps : ps.filter(p => p.niche === slug));
export const nichesWithProjects = (ps, niches = NICHES) => niches.filter(n => ps.some(p => p.niche === n.slug));
export function uniqueClients(ps) {
  const seen = new Set(); const out = [];
  for (const p of ps) {
    const key = p.client.toLowerCase().replace(/\s+/g, ' ');
    if (p.client && !seen.has(key)) { seen.add(key); out.push(p.client); }
  }
  return out;
}
export const stats = (ps, config) => ({ years: config.yearsExperience, projects: ps.length, niches: nichesWithProjects(ps).length });
