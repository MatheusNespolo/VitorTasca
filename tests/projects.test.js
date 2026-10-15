import { describe, it, expect, vi } from 'vitest';
import { normalizeProjects, filterByNiche, nichesWithProjects, uniqueClients, stats } from '../src/domain/projects.js';
import { NICHES } from '../src/data/niches.js';
import { PROJECTS } from '../src/data/projects.js';

const raw = [
  { niche: 'eventos', title: 'A', client: 'X', youtube: 'https://youtu.be/aaaaaaaaaaa' },
  { niche: 'saude', title: 'B', client: ' x ', youtube: 'bbbbbbbbbbb', featured: true },
  { niche: 'eventos', title: 'C', client: 'Y', youtube: 'ccccccccccc', featured: true },
];

describe('normalizeProjects', () => {
  it('resolves ids, sorts featured first (stable)', () => {
    const ps = normalizeProjects(raw);
    expect(ps.map(p => p.title)).toEqual(['B', 'C', 'A']);
    expect(ps[2]).toEqual({ id: 'aaaaaaaaaaa', niche: 'eventos', title: 'A', client: 'X', youtubeId: 'aaaaaaaaaaa', featured: false });
  });
  it.each([{ title: '' }, { niche: 'casamentos' }, { youtube: 'https://vimeo.com/1' }])('drops invalid %o', o => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(normalizeProjects([{ ...raw[0], ...o }])).toEqual([]);
    expect(warn).toHaveBeenCalled(); warn.mockRestore();
  });
  it('makes ids unique when the same video repeats', () => {
    const ps = normalizeProjects([raw[0], raw[0]]);
    expect(new Set(ps.map(p => p.id)).size).toBe(2);
  });
  it('accepts every bundled project', () => {
    expect(normalizeProjects(PROJECTS)).toHaveLength(PROJECTS.length);
  });
});

it('filterByNiche', () => {
  const ps = normalizeProjects(raw);
  expect(filterByNiche(ps, 'todos')).toHaveLength(3);
  expect(filterByNiche(ps, 'eventos').map(p => p.title)).toEqual(['C', 'A']);
});
it('nichesWithProjects keeps NICHES order and hides empty', () => {
  expect(nichesWithProjects(normalizeProjects(raw)).map(n => n.slug)).toEqual(['eventos', 'saude']);
});
it('uniqueClients dedupes ignoring case/spaces, keeps first spelling', () => {
  expect(uniqueClients(normalizeProjects(raw))).toEqual(['x', 'Y']); // B (featured, client ' x ') comes first
});
it('stats', () => {
  expect(stats(normalizeProjects(raw), { yearsExperience: 3 })).toEqual({ years: 3, projects: 3, niches: 2 });
});
it('NICHES has the 6 slugs in order', () => {
  expect(NICHES.map(n => n.slug)).toEqual(['restaurantes', 'videoclipes', 'eventos', 'saude', 'esportes', 'institucional']);
});
