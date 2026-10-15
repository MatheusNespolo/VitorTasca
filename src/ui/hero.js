import { thumbUrl } from '../domain/youtube.js';
export const pickHeroImage = ({ heroImage, showreelYoutubeId }, latest) =>
  (heroImage ?? '').trim() || thumbUrl(latest?.youtubeId ?? showreelYoutubeId);
// Vertical videos (Reels) get a 1080x1920 `oar2` thumbnail without baked-in side bars;
// horizontal ones answer `oar2` with a 120px placeholder, so `fallback` takes over.
export function pickHeroSources({ heroImage, showreelYoutubeId }, latest) {
  const own = (heroImage ?? '').trim();
  if (own) return { src: own, fallback: '' };
  const id = latest?.youtubeId ?? showreelYoutubeId;
  return { src: thumbUrl(id, 'oar2'), fallback: thumbUrl(id) };
}
function photo(image, alt, fallback = '') {
  const img = document.createElement('img'); img.src = image; img.alt = alt;
  img.setAttribute('fetchpriority', 'high'); img.className = 'hero-img';
  if (fallback) {
    const swap = () => { if (img.src !== fallback) img.src = fallback; };
    img.addEventListener('load', () => { if (img.naturalWidth <= 120) swap(); });
    img.addEventListener('error', swap);
  }
  return img;
}
export function renderHero(container, { image, fallback = '', mp4, alt, label = alt }) {
  if (!mp4) { container.replaceChildren(photo(image, alt, fallback)); return 'photo'; }
  const v = document.createElement('video');
  v.className = 'hero-video'; v.autoplay = true; v.muted = true; v.loop = true;
  v.setAttribute('playsinline', ''); v.setAttribute('muted', ''); v.poster = fallback || image; v.setAttribute('aria-label', label);
  const s = document.createElement('source'); s.src = mp4; s.type = 'video/mp4';
  s.addEventListener('error', () => container.replaceChildren(photo(image, alt, fallback)));
  v.append(s); container.replaceChildren(v);
  return 'video';
}
