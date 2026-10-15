import { it, expect } from 'vitest';
import { renderHero } from '../src/ui/hero.js';
import { renderClients } from '../src/ui/clients.js';
it('photo mode when no mp4', () => {
  const c = document.createElement('div');
  expect(renderHero(c, { image: './img/a.jpg', mp4: '', alt: 'Vitor' })).toBe('photo');
  expect(c.querySelector('img').alt).toBe('Vitor'); expect(c.querySelector('video')).toBeNull();
});
it('video mode with mp4, falls back to photo on error', () => {
  const c = document.createElement('div');
  expect(renderHero(c, { image: './img/a.jpg', mp4: './v.mp4', alt: 'Vitor' })).toBe('video');
  const v = c.querySelector('video');
  expect(v.muted).toBe(true); expect(v.loop).toBe(true); expect(v.hasAttribute('playsinline')).toBe(true);
  v.querySelector('source').dispatchEvent(new Event('error'));
  expect(c.querySelector('video')).toBeNull(); expect(c.querySelector('img')).not.toBeNull();
});
it('clients marquee duplicates list for screen-reader-hidden loop', () => {
  const c = document.createElement('div'); renderClients(c, ['A', 'B']);
  const lists = c.querySelectorAll('ul');
  expect(lists).toHaveLength(2); expect(lists[1].getAttribute('aria-hidden')).toBe('true');
  expect(lists[0].textContent).toBe('AB');
});
it('decorative photo (alt "") keeps video aria-label from label', () => {
  const c = document.createElement('div');
  renderHero(c, { image: './a.jpg', mp4: '', alt: '', label: 'Vitor' });
  expect(c.querySelector('img').getAttribute('alt')).toBe('');
  renderHero(c, { image: './a.jpg', mp4: './v.mp4', alt: '', label: 'Vitor' });
  expect(c.querySelector('video').getAttribute('aria-label')).toBe('Vitor');
});
import { pickHeroImage } from '../src/ui/hero.js';
const T = id => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
it('pickHeroImage uses heroImage when set', () => {
  expect(pickHeroImage({ heroImage: ' ./img/capa.jpg ', showreelYoutubeId: 'DRcc5s0UkFE' }, { youtubeId: 'LATESTxxxxx' })).toBe('./img/capa.jpg');
});
it('pickHeroImage uses the latest work thumbnail', () => {
  expect(pickHeroImage({ heroImage: '   ', showreelYoutubeId: 'DRcc5s0UkFE' }, { youtubeId: 'TmJ4nGZJyJ0' })).toBe(T('TmJ4nGZJyJ0'));
});
it('pickHeroImage falls back to the showreel thumbnail', () => {
  expect(pickHeroImage({ heroImage: '', showreelYoutubeId: 'DRcc5s0UkFE' }, null)).toBe(T('DRcc5s0UkFE'));
  expect(pickHeroImage({ heroImage: '', showreelYoutubeId: 'DRcc5s0UkFE' })).toBe(T('DRcc5s0UkFE'));
});
import { pickHeroSources } from '../src/ui/hero.js';
it('pickHeroSources prefers the vertical oar2 thumbnail with maxres fallback', () => {
  expect(pickHeroSources({ heroImage: '', showreelYoutubeId: 'DRcc5s0UkFE' }, { youtubeId: 'TmJ4nGZJyJ0' }))
    .toEqual({ src: 'https://i.ytimg.com/vi/TmJ4nGZJyJ0/oar2.jpg', fallback: 'https://i.ytimg.com/vi/TmJ4nGZJyJ0/maxresdefault.jpg' });
  expect(pickHeroSources({ heroImage: './img/c.jpg', showreelYoutubeId: 'x' }, null)).toEqual({ src: './img/c.jpg', fallback: '' });
});
it('hero photo swaps to fallback when YouTube returns the 120px placeholder or errors', () => {
  const c = document.createElement('div');
  renderHero(c, { image: 'https://i.ytimg.com/vi/a/oar2.jpg', fallback: 'https://i.ytimg.com/vi/a/maxresdefault.jpg', mp4: '', alt: '' });
  const img = c.querySelector('img');
  Object.defineProperty(img, 'naturalWidth', { value: 120 });
  img.dispatchEvent(new Event('load'));
  expect(img.src).toBe('https://i.ytimg.com/vi/a/maxresdefault.jpg');
  const c2 = document.createElement('div');
  renderHero(c2, { image: 'https://i.ytimg.com/vi/b/oar2.jpg', fallback: 'https://i.ytimg.com/vi/b/maxresdefault.jpg', mp4: '', alt: '' });
  c2.querySelector('img').dispatchEvent(new Event('error'));
  expect(c2.querySelector('img').src).toBe('https://i.ytimg.com/vi/b/maxresdefault.jpg');
});
