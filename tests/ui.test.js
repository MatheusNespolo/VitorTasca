import { it, expect, vi } from 'vitest';
import { renderGrid } from '../src/ui/grid.js';
import { renderFilters } from '../src/ui/filters.js';
import { NICHES } from '../src/data/niches.js';
const p = { id: 'aaaaaaaaaaa', niche: 'eventos', title: 'Show <b>', client: 'Cli', youtubeId: 'aaaaaaaaaaa', featured: false };

it('renders safe cards that open the player', () => {
  const c = document.createElement('div'); const onOpen = vi.fn();
  renderGrid(c, [p], NICHES, onOpen);
  const card = c.querySelector('.card');
  expect(card.tagName).toBe('BUTTON');
  expect(card.getAttribute('aria-label')).toBe('Assistir Show <b> — Cli');
  expect(c.querySelector('b')).toBeNull();
  expect(c.querySelector('.card-niche').textContent).toBe('Eventos');
  const img = c.querySelector('img');
  expect(img.src).toBe('https://i.ytimg.com/vi/aaaaaaaaaaa/maxresdefault.jpg');
  expect(img.alt).toBe('Show <b> — Cli');
  card.click(); expect(onOpen).toHaveBeenCalledWith(p);
});
it('falls back to hqdefault for the 120px YouTube placeholder', () => {
  const c = document.createElement('div'); renderGrid(c, [p], NICHES, () => {});
  const img = c.querySelector('img');
  Object.defineProperty(img, 'naturalWidth', { value: 120 });
  img.dispatchEvent(new Event('load'));
  expect(img.src).toBe('https://i.ytimg.com/vi/aaaaaaaaaaa/hqdefault.jpg');
});
it('empty state', () => {
  const c = document.createElement('div'); renderGrid(c, [], NICHES, () => {});
  expect(c.textContent).toContain('Nenhum trabalho');
});
it('filters: Todos first, aria-pressed, change and focus restore', () => {
  const c = document.createElement('div'); document.body.append(c);
  const onChange = vi.fn();
  renderFilters(c, NICHES.slice(0, 2), 'todos', onChange);
  const bs = c.querySelectorAll('button');
  expect([...bs].map(b => b.textContent)).toEqual(['Todos', 'Restaurantes', 'Videoclipes']);
  expect(bs[0].getAttribute('aria-pressed')).toBe('true');
  bs[2].focus(); bs[2].click(); expect(onChange).toHaveBeenCalledWith('videoclipes');
  renderFilters(c, NICHES.slice(0, 2), 'videoclipes', onChange);
  expect(document.activeElement.textContent).toBe('Videoclipes');
});
it('project with empty client uses title only', () => {
  const c = document.createElement('div'); renderGrid(c, [{ ...p, title: 'Solo', client: '' }], NICHES, () => {});
  expect(c.querySelector('.card').getAttribute('aria-label')).toBe('Assistir Solo');
  expect(c.querySelector('img').alt).toBe('Solo');
  expect(c.querySelector('.card-client').textContent).toBe('');
});
