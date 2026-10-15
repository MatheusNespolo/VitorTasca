import { embedUrl } from '../domain/youtube.js';
export function openPlayer(youtubeId, title) {
  const opener = document.activeElement;
  const d = document.createElement('dialog'); d.className = 'player'; d.setAttribute('aria-label', title);
  const closeBtn = document.createElement('button'); closeBtn.type = 'button'; closeBtn.className = 'player-close icon-glow';
  closeBtn.setAttribute('aria-label', 'Fechar vídeo'); closeBtn.textContent = '×';
  const frame = document.createElement('div'); frame.className = 'player-frame';
  const f = document.createElement('iframe');
  f.src = embedUrl(youtubeId); f.title = title;
  f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
  frame.append(f); d.append(closeBtn, frame); document.body.append(d);
  let closed = false;
  const close = () => {
    if (closed) return; closed = true;
    if (d.open) d.close(); d.remove();
    document.body.classList.remove('no-scroll'); opener?.focus?.();
  };
  closeBtn.addEventListener('click', close);
  d.addEventListener('click', e => { if (e.target === d || e.target === frame) close(); });
  d.addEventListener('cancel', e => { e.preventDefault(); close(); });
  document.body.classList.add('no-scroll');
  d.showModal(); closeBtn.focus();
  return close;
}
