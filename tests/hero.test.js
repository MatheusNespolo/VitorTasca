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
