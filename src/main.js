import './styles/tokens.css'; import './styles/base.css'; import './styles/effects.css'; import './styles/components.css';
import { config } from './config.js';
import { NICHES } from './data/niches.js';
import { PROJECTS } from './data/projects.js';
import { normalizeProjects, filterByNiche, nichesWithProjects, uniqueClients, stats } from './domain/projects.js';
import { readNiche, writeNiche } from './router.js';
import { renderGrid } from './ui/grid.js';
import { renderFilters } from './ui/filters.js';
import { openPlayer } from './ui/player.js';
import { renderHero } from './ui/hero.js';
import { renderClients } from './ui/clients.js';
import { initSpotlight } from './ui/spotlight.js';

const $ = id => document.getElementById(id);
const projects = normalizeProjects(PROJECTS);
const niches = nichesWithProjects(projects);
const slugs = niches.map(n => n.slug);
const wa = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent('Olá, Vitor! Vi seu portfólio e quero conversar sobre um projeto.')}`;
const ig = `https://www.instagram.com/${config.instagram}/`;
let active = readNiche(location.hash, slugs);

function render() {
  renderFilters($('filters'), niches, active, slug => { active = slug; writeNiche(slug); render(); });
  $('niche-desc').textContent = niches.find(n => n.slug === active)?.description ?? '';
  renderGrid($('grid'), filterByNiche(projects, active), NICHES, p => openPlayer(p.youtubeId, p.client ? `${p.title} — ${p.client}` : p.title));
}

renderHero($('hero-media'), { image: config.heroImage, mp4: config.showreelMp4, alt: config.name });
$('hero-name').textContent = config.name;
$('hero-text').textContent = config.heroText;
$('btn-showreel').addEventListener('click', () => openPlayer(config.showreelYoutubeId, `Showreel — ${config.name}`));
$('btn-contact').href = wa;
$('about-photo').src = config.heroImage;
$('about-text').textContent = config.heroText;
const s = stats(projects, config);
$('stat-years').textContent = `${s.years}+`; $('stat-projects').textContent = String(s.projects); $('stat-niches').textContent = String(s.niches);
renderClients($('clients'), uniqueClients(projects));
for (const id of ['contact-wa', 'wa-float']) $(id).href = wa;
$('contact-email').href = `mailto:${config.email}`;
document.querySelectorAll('[data-ig]').forEach(a => { a.href = ig; a.target = '_blank'; a.rel = 'noopener'; });
$('year').textContent = String(new Date().getFullYear());
window.addEventListener('hashchange', () => { active = readNiche(location.hash, slugs); render(); });
initSpotlight(document.body);
render();
if (active !== 'todos') $('trabalhos').scrollIntoView();
