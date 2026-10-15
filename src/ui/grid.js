import { thumbUrl } from '../domain/youtube.js';
export function renderGrid(container, projects, niches, onOpen) {
  container.replaceChildren();
  if (!projects.length) {
    const e = document.createElement('p'); e.className = 'empty';
    e.textContent = 'Nenhum trabalho neste nicho ainda.'; container.append(e); return;
  }
  const labels = Object.fromEntries(niches.map(n => [n.slug, n.label]));
  for (const p of projects) {
    const label = p.client ? `${p.title} — ${p.client}` : p.title;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'card spotlight'; b.setAttribute('aria-label', `Assistir ${label}`);
    const media = document.createElement('span'); media.className = 'card-media';
    const img = document.createElement('img');
    img.src = thumbUrl(p.youtubeId); img.alt = label; img.loading = 'lazy';
    img.addEventListener('load', () => { if (img.naturalWidth <= 120 && !img.src.includes('hqdefault')) img.src = thumbUrl(p.youtubeId, 'hqdefault'); });
    const play = document.createElement('span'); play.className = 'card-play'; play.setAttribute('aria-hidden', 'true'); play.textContent = '▶';
    media.append(img, play);
    const niche = document.createElement('span'); niche.className = 'card-niche'; niche.textContent = labels[p.niche] ?? p.niche;
    const title = document.createElement('span'); title.className = 'card-title'; title.textContent = p.title;
    const client = document.createElement('span'); client.className = 'card-client'; client.textContent = p.client;
    b.append(media, niche, title, client);
    b.addEventListener('click', () => onOpen(p));
    container.append(b);
  }
}
