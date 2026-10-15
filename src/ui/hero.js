import { thumbUrl } from '../domain/youtube.js';
export const pickHeroImage = ({ heroImage, showreelYoutubeId }, latest) =>
  (heroImage ?? '').trim() || thumbUrl(latest?.youtubeId ?? showreelYoutubeId);
function photo(image, alt) {
  const img = document.createElement('img'); img.src = image; img.alt = alt;
  img.setAttribute('fetchpriority', 'high'); img.className = 'hero-img'; return img;
}
export function renderHero(container, { image, mp4, alt, label = alt }) {
  if (!mp4) { container.replaceChildren(photo(image, alt)); return 'photo'; }
  const v = document.createElement('video');
  v.className = 'hero-video'; v.autoplay = true; v.muted = true; v.loop = true;
  v.setAttribute('playsinline', ''); v.setAttribute('muted', ''); v.poster = image; v.setAttribute('aria-label', label);
  const s = document.createElement('source'); s.src = mp4; s.type = 'video/mp4';
  s.addEventListener('error', () => container.replaceChildren(photo(image, alt)));
  v.append(s); container.replaceChildren(v);
  return 'video';
}
