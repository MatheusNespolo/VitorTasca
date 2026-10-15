import { it, expect, beforeAll } from 'vitest';
import { openPlayer } from '../src/ui/player.js';
beforeAll(() => { HTMLDialogElement.prototype.showModal ??= function () { this.open = true; };
  HTMLDialogElement.prototype.close ??= function () { this.open = false; }; });
it('opens nocookie iframe and closes cleanly', () => {
  const opener = document.createElement('button'); document.body.append(opener); opener.focus();
  const close = openPlayer('abcdefghijk', 'Clipe');
  const d = document.querySelector('dialog.player');
  const f = d.querySelector('iframe');
  expect(f.src).toBe('https://www.youtube-nocookie.com/embed/abcdefghijk?autoplay=1&rel=0&modestbranding=1');
  expect(f.title).toBe('Clipe');
  expect(document.body.classList.contains('no-scroll')).toBe(true);
  close(); close();
  expect(document.querySelector('dialog.player')).toBeNull();
  expect(document.body.classList.contains('no-scroll')).toBe(false);
  expect(document.activeElement).toBe(opener);
});
it('cancel event (ESC) closes', () => {
  openPlayer('abcdefghijk', 'X');
  document.querySelector('dialog.player').dispatchEvent(new Event('cancel', { cancelable: true }));
  expect(document.querySelector('dialog.player')).toBeNull();
});
it('click on .player-frame (backdrop area) closes', () => {
  openPlayer('abcdefghijk', 'X');
  document.querySelector('.player-frame').click();
  expect(document.querySelector('dialog.player')).toBeNull();
});
it('click on iframe wrapper child does not close; close button closes and restores focus', () => {
  const opener = document.createElement('button'); document.body.append(opener); opener.focus();
  openPlayer('abcdefghijk', 'X');
  document.querySelector('iframe').click();
  expect(document.querySelector('dialog.player')).not.toBeNull();
  document.querySelector('.player-close').click();
  expect(document.querySelector('dialog.player')).toBeNull();
  expect(document.activeElement).toBe(opener);
  expect(document.body.classList.contains('no-scroll')).toBe(false);
});
it('cancel removes no-scroll', () => {
  openPlayer('abcdefghijk', 'X');
  document.querySelector('dialog.player').dispatchEvent(new Event('cancel', { cancelable: true }));
  expect(document.body.classList.contains('no-scroll')).toBe(false);
});
