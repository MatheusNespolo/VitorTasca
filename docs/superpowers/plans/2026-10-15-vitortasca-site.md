# Vitor Tasca Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portfólio single-page do filmmaker Vitor Tasca com hero (foto → vídeo opcional), trabalhos filtráveis por nicho com deep link, player YouTube em tela cheia, sobre, clientes e contato.

**Architecture:** Vite + JS puro (ES modules). `domain/` funções puras (YouTube, projetos), `router.js` (hash), `ui/` (DOM), `main.js` compõe. Conteúdo fixo em `src/data/projects.js` e `src/config.js`. Efeitos visuais copiados do repositório irmão `../SportConceito`.

**Tech Stack:** Node 20+, Vite 5, Vitest 2 + jsdom.

**Spec:** `docs/superpowers/specs/2026-10-15-vitortasca-site-design.md`

## Global Constraints
- Interface em pt-BR. Sem selo/menção "Lovable".
- Contatos: WhatsApp `5511989552352`, e-mail `vitortasca.filmmaker@gmail.com`, Instagram `vitortasca.filmmaker`.
- Slugs de nicho exatos e ordem: `restaurantes, videoclipes, eventos, saude, esportes, institucional`; filtro "todos".
- Embeds sempre em `https://www.youtube-nocookie.com/embed/<id>?autoplay=1&rel=0&modestbranding=1`.
- Dados do usuário/arquivo só via `textContent`/atributos; nunca `innerHTML` com dados.
- Mobile-first; grade 1 coluna < 640px, 2 colunas ≥ 640px, 3 colunas ≥ 1024px.
- Animações desligadas com `prefers-reduced-motion: reduce`; spotlight só com `(hover: hover)`.
- Contraste WCAG AA; todo `<img>` com `alt`; foco visível; foco volta ao card ao fechar o player.
- Acento vermelho; design via skill `ui-ux-pro-max` (Task 4).
- Commits terminam com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus
1. Links do YouTube colados em formatos variados (`youtu.be/ID?si=x`, `watch?v=ID&t=10`, `shorts/ID`, `embed/ID`, ID puro, lixo) → ID certo ou projeto ignorado. (Task 1)
2. Hash inválido ou com maiúsculas/acentos (`#Saúde`, `#xyz`) → filtro correto ou "todos", sem quebrar. (Task 3)
3. Fechar o player (ESC, botão, clique fora) → vídeo para (iframe removido) e foco volta ao card. (Task 6)
4. Nicho sem projetos → chip escondido; deep link para ele cai em "todos". (Task 2, Task 3, Task 7)
5. Miniatura `maxresdefault` inexistente (YouTube devolve 120×90) → troca para `hqdefault`. (Task 5)

---

## File Structure
```
VitorTasca/
  index.html
  package.json, vite.config.js, .gitignore
  public/img/vitor-hero.jpg, capa-*.jpg      # já existem
  src/config.js
  src/data/niches.js, src/data/projects.js
  src/domain/youtube.js, src/domain/projects.js
  src/router.js
  src/ui/grid.js, filters.js, player.js, hero.js, clients.js, spotlight.js
  src/main.js
  src/styles/tokens.css, base.css, effects.css, components.css
  tests/*.test.js
  docs/paleta.md, README.md
```

---

### Task 1: Scaffold + YouTube helpers

**Files:**
- Create: `package.json`, `vite.config.js`, `.gitignore`, `src/domain/youtube.js`
- Test: `tests/youtube.test.js`

**Interfaces:**
- Produces: `parseYouTubeId(input: string): string|null`; `thumbUrl(id: string, quality?: 'maxresdefault'|'hqdefault'): string`; `embedUrl(id: string): string`.

- [ ] **Step 1: Scaffold**

`package.json`:
```json
{
  "name": "vitortasca",
  "private": true,
  "type": "module",
  "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview", "test": "vitest run" },
  "devDependencies": { "vite": "^5.4.0", "vitest": "^2.1.0", "jsdom": "^25.0.0" }
}
```
`vite.config.js`:
```js
import { defineConfig } from 'vite';
export default defineConfig({ base: './', build: { target: 'es2022' }, test: { environment: 'jsdom' } });
```
`.gitignore`: `node_modules/`, `dist/`, `.superpowers/`. Run `npm install`.

- [ ] **Step 2: Failing test** — `tests/youtube.test.js`
```js
import { it, expect } from 'vitest';
import { parseYouTubeId, thumbUrl, embedUrl } from '../src/domain/youtube.js';
it.each([
  ['DRcc5s0UkFE', 'DRcc5s0UkFE'],
  ['  qnKdh-0LO9A ', 'qnKdh-0LO9A'],
  ['https://www.youtube.com/watch?v=ffJgbxoG_5k&t=10s', 'ffJgbxoG_5k'],
  ['https://youtu.be/TmJ4nGZJyJ0?si=abc', 'TmJ4nGZJyJ0'],
  ['https://www.youtube.com/shorts/QjqutziGnm8', 'QjqutziGnm8'],
  ['https://www.youtube.com/embed/HZJqueu4HBk', 'HZJqueu4HBk'],
  ['https://m.youtube.com/watch?feature=share&v=Yue2URbdrhc', 'Yue2URbdrhc'],
  ['https://www.youtube-nocookie.com/embed/V0MzkmC9B1s?rel=0', 'V0MzkmC9B1s'],
])('parses %s', (input, id) => expect(parseYouTubeId(input)).toBe(id));
it.each(['', 'abc', 'https://vimeo.com/123', 'https://youtube.com/watch?v=short', null, undefined])
  ('rejects %s', input => expect(parseYouTubeId(input)).toBeNull());
it('builds thumb and embed urls', () => {
  expect(thumbUrl('abcdefghijk')).toBe('https://i.ytimg.com/vi/abcdefghijk/maxresdefault.jpg');
  expect(thumbUrl('abcdefghijk', 'hqdefault')).toBe('https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg');
  expect(embedUrl('abcdefghijk')).toBe('https://www.youtube-nocookie.com/embed/abcdefghijk?autoplay=1&rel=0&modestbranding=1');
});
```
- [ ] **Step 3: Run** `npx vitest run tests/youtube.test.js` — Expected: FAIL (module not found).
- [ ] **Step 4: Implement** — `src/domain/youtube.js`
```js
const ID = /^[A-Za-z0-9_-]{11}$/;
export function parseYouTubeId(input) {
  const s = String(input ?? '').trim();
  if (ID.test(s)) return s;
  let url;
  try { url = new URL(s); } catch { return null; }
  const host = url.hostname.replace(/^(www|m)\./, '');
  let id = null;
  if (host === 'youtu.be') id = url.pathname.slice(1).split('/')[0];
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (url.pathname === '/watch') id = url.searchParams.get('v');
    else {
      const m = url.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/);
      if (m) id = m[1];
    }
  }
  return id && ID.test(id) ? id : null;
}
export const thumbUrl = (id, quality = 'maxresdefault') => `https://i.ytimg.com/vi/${id}/${quality}.jpg`;
export const embedUrl = id => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
```
- [ ] **Step 5: Run** — Expected: all pass.
- [ ] **Step 6: Commit** `git add -A && git commit -m "feat: scaffold project and YouTube helpers"`

---

### Task 2: Dados e domínio de projetos

**Files:**
- Create: `src/config.js`, `src/data/niches.js`, `src/data/projects.js`, `src/domain/projects.js`
- Test: `tests/projects.test.js`

**Interfaces:**
- Consumes: `parseYouTubeId` (Task 1).
- Produces:
  - `NICHES: Array<{slug: string, label: string, description: string, cover: string}>` (em `data/niches.js`).
  - `type Project = { id: string, niche: string, title: string, client: string, youtubeId: string, featured: boolean }`.
  - `normalizeProjects(raw: object[], niches = NICHES): Project[]` — valida, resolve `youtubeId`, ordena destaques primeiro (estável), `console.warn` em inválidos.
  - `filterByNiche(projects, slug): Project[]` (`'todos'` → todos).
  - `nichesWithProjects(projects, niches = NICHES): typeof NICHES`.
  - `uniqueClients(projects): string[]` (ordem de primeira aparição, sem duplicatas, ignorando caixa/espaços).
  - `stats(projects, config): { years: number, projects: number, niches: number }`.

- [ ] **Step 1: Data** — `src/config.js`
```js
export const config = {
  name: 'Vitor Tasca',
  role: 'Filmmaker & Creative Director',
  whatsapp: '5511989552352',
  email: 'vitortasca.filmmaker@gmail.com',
  instagram: 'vitortasca.filmmaker',
  showreelYoutubeId: 'DRcc5s0UkFE',
  showreelMp4: '', // ex.: './video/showreel.mp4' — quando preenchido, o hero vira vídeo
  heroImage: './img/vitor-hero.jpg',
  yearsExperience: 3,
  heroText: 'Filmmaker com mais de 3 anos de experiência, especializado em capturar momentos que falam. Olhar atento aos detalhes sutis e paixão por contar histórias visuais que revelam a essência autêntica de cada projeto.',
};
```
`src/data/niches.js`:
```js
export const NICHES = [
  { slug: 'restaurantes', label: 'Restaurantes', cover: './img/capa-restaurantes.jpg', description: 'Vídeos que despertam o apetite. Captura de ambiente, processo e sabor com estética cinematográfica para restaurantes e marcas gastronômicas.' },
  { slug: 'videoclipes', label: 'Videoclipes', cover: '', description: 'Narrativas visuais para artistas. Direção, conceito e fotografia para clipes que traduzem a identidade de cada som.' },
  { slug: 'eventos', label: 'Eventos', cover: './img/capa-eventos.jpg', description: 'Aftermovies, cobertura completa e captação de eventos corporativos, festivais e palestras.' },
  { slug: 'saude', label: 'Saúde', cover: './img/capa-saude.jpg', description: 'Produções para clínicas, hospitais e profissionais da saúde. Comunicação sensível, humana e tecnicamente apurada.' },
  { slug: 'esportes', label: 'Esportes', cover: './img/capa-esportes.jpg', description: 'Filmes para atletas, times e marcas esportivas com captação dinâmica e edição rítmica.' },
  { slug: 'institucional', label: 'Institucional', cover: './img/capa-institucional.jpg', description: 'Vídeos institucionais que comunicam propósito, cultura e valores. Narrativas visuais que apresentam marcas e empresas com clareza e elegância.' },
];
```
`src/data/projects.js` (comentário no topo explicando como adicionar um projeto):
```js
// Para adicionar um trabalho: copie uma linha, troque os campos e salve.
// niche: restaurantes | videoclipes | eventos | saude | esportes | institucional
// youtube: ID ou qualquer link do YouTube. featured: true aparece primeiro.
export const PROJECTS = [
  { niche: 'videoclipes', title: 'Mudança', client: 'Frank Aguiar', youtube: 'DRcc5s0UkFE', featured: true },
  { niche: 'restaurantes', title: 'Hamburgueria', client: 'Bevo Burger', youtube: 'ffJgbxoG_5k', featured: true },
  { niche: 'eventos', title: 'Lucky Day', client: 'Rex Customs', youtube: 'qnKdh-0LO9A', featured: true },
  { niche: 'restaurantes', title: 'Restaurante Japonês', client: 'Pappa Gohan', youtube: 'TmJ4nGZJyJ0' },
  { niche: 'restaurantes', title: 'Cafeteria', client: 'Dilly Cafés Especiais', youtube: 'QjqutziGnm8' },
  { niche: 'restaurantes', title: 'Restaurante Italiano', client: 'Romano Grand Cru', youtube: 'HZJqueu4HBk' },
  { niche: 'eventos', title: 'Mentoria Sankhya', client: 'Denis Antunes', youtube: 'nm5UqxnrHDQ' },
  { niche: 'eventos', title: 'FEIMEC', client: 'Prumo Tech', youtube: 'F18KNhDdlK4' },
  { niche: 'saude', title: 'Médico Cirurgião', client: 'Dr. Romulo Amorim', youtube: 'V0MzkmC9B1s' },
  { niche: 'saude', title: 'Esteticista e Cosmetóloga', client: 'Aline Berger', youtube: 'qMG9DHWFSAo' },
  { niche: 'saude', title: 'Médico Cirurgião', client: 'Dr. Romulo Amorim', youtube: 'ZhIAe9awOqQ' },
  { niche: 'esportes', title: 'Atleta de MMA', client: 'Enzo Popeye', youtube: '6PWyXDWLnbo' },
  { niche: 'esportes', title: 'Personal Trainer', client: 'Rodrigo Santana', youtube: 'LvvcfB4ddO4' },
  { niche: 'esportes', title: 'Personal Fighter', client: 'Furlani Fight Club', youtube: '9WCGjhET5dg' },
  { niche: 'institucional', title: 'Institucional', client: 'Samech Vedações', youtube: 'Yue2URbdrhc' },
];
```

- [ ] **Step 2: Failing test** — `tests/projects.test.js`
```js
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
```
- [ ] **Step 3: Run** `npx vitest run tests/projects.test.js` — Expected: FAIL.
- [ ] **Step 4: Implement** — `src/domain/projects.js`
```js
import { parseYouTubeId } from './youtube.js';
import { NICHES } from '../data/niches.js';

export function normalizeProjects(raw, niches = NICHES) {
  const slugs = new Set(niches.map(n => n.slug));
  const seen = new Map();
  const out = [];
  for (const r of raw) {
    const title = String(r.title ?? '').trim();
    const niche = String(r.niche ?? '').trim();
    const youtubeId = parseYouTubeId(r.youtube);
    if (!title || !slugs.has(niche) || !youtubeId) { console.warn('[projetos] item ignorado:', r); continue; }
    const n = (seen.get(youtubeId) ?? 0) + 1; seen.set(youtubeId, n);
    out.push({ id: n === 1 ? youtubeId : `${youtubeId}-${n}`, niche, title,
      client: String(r.client ?? '').trim(), youtubeId, featured: r.featured === true });
  }
  return [...out.filter(p => p.featured), ...out.filter(p => !p.featured)];
}
export const filterByNiche = (ps, slug) => (slug === 'todos' ? ps : ps.filter(p => p.niche === slug));
export const nichesWithProjects = (ps, niches = NICHES) => niches.filter(n => ps.some(p => p.niche === n.slug));
export function uniqueClients(ps) {
  const seen = new Set(); const out = [];
  for (const p of ps) {
    const key = p.client.toLowerCase().replace(/\s+/g, ' ');
    if (p.client && !seen.has(key)) { seen.add(key); out.push(p.client); }
  }
  return out;
}
export const stats = (ps, config) => ({ years: config.yearsExperience, projects: ps.length, niches: nichesWithProjects(ps).length });
```
- [ ] **Step 5: Run** — Expected: all pass.
- [ ] **Step 6: Commit** `feat: project data and domain helpers`

---

### Task 3: Roteador por hash

**Files:**
- Create: `src/router.js`
- Test: `tests/router.test.js`

**Interfaces:**
- Produces: `readNiche(hash: string, validSlugs: string[]): string` (slug ou `'todos'`); `writeNiche(slug: string): void` (`history.replaceState`; `'todos'` limpa o hash).

- [ ] **Step 1: Failing test**
```js
import { it, expect } from 'vitest';
import { readNiche, writeNiche } from '../src/router.js';
const valid = ['restaurantes', 'saude'];
it.each([['#restaurantes', 'restaurantes'], ['#SAUDE', 'saude'], ['#Sa%C3%BAde', 'saude'], ['#saúde', 'saude'],
  ['#xyz', 'todos'], ['', 'todos'], ['#', 'todos'], ['#%E0%A4%A', 'todos']])
  ('readNiche(%s)', (h, out) => expect(readNiche(h, valid)).toBe(out));
it('writeNiche sets and clears hash', () => {
  writeNiche('saude'); expect(location.hash).toBe('#saude');
  writeNiche('todos'); expect(location.hash).toBe('');
});
```
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** — `src/router.js`
```js
export function readNiche(hash, validSlugs) {
  let s = String(hash ?? '').replace(/^#/, '');
  try { s = decodeURIComponent(s); } catch { return 'todos'; }
  s = s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  return validSlugs.includes(s) ? s : 'todos';
}
export function writeNiche(slug) {
  const url = slug === 'todos' ? location.pathname + location.search : `#${slug}`;
  history.replaceState(null, '', url);
}
```
- [ ] **Step 4: Run** — pass.
- [ ] **Step 5: Commit** `feat: hash router for niche deep links`

---

### Task 4: Paleta vermelha, tokens, efeitos e página base

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/effects.css`, `src/ui/spotlight.js`, `index.html`, `src/styles/components.css`, `docs/paleta.md`

**Interfaces:**
- Produces: tokens `--bg --surface --text --muted --line --accent --accent-rgb --on-accent --radius --font-display --font-body`; classes de efeito `.glow-btn .text-glow .hero-blob .bg-grid .grain .spotlight .icon-glow`; `initSpotlight(root)`; IDs no `index.html` usados pela Task 7: `#hero`, `#hero-media`, `#hero-name`, `#hero-text`, `#btn-showreel`, `#btn-contact`, `#filters`, `#grid`, `#niche-desc`, `#about-photo`, `#about-text`, `#stat-years`, `#stat-projects`, `#stat-niches`, `#clients`, `#contact-wa`, `#contact-email`, `#contact-ig`, `#wa-float`, `#year`; `data-ig` em todo link do Instagram.

- [ ] **Step 1: Copiar efeitos** — copiar sem alterar de `../SportConceito/src/styles/effects.css`, `../SportConceito/src/styles/base.css` e `../SportConceito/src/ui/spotlight.js` (eles já usam `--accent-rgb`).
- [ ] **Step 2: Invocar o skill `ui-ux-pro-max`** com: "portfólio de filmmaker / diretor criativo, cinematográfico, tema escuro, tipografia condensada de cinema, acento vermelho, referência: sites de filmmaker no Pinterest". Escolher: vermelho de acento (perto de `#e50914`–`#ff2d3a`), par de fontes do Google Fonts (display condensada + sans), verificar contraste AA de texto/fundo, muted/fundo e texto sobre o acento (definir `--on-accent` que passe AA). Registrar hex, fontes, `<link>` do Google Fonts e as razões de contraste em `docs/paleta.md`.
- [ ] **Step 3: tokens.css** com os valores escolhidos, por exemplo:
```css
:root{
  --bg:#08080a; --surface:#121216; --text:#f4f4f5; --muted:#a1a1aa; --line:#26262b;
  --accent:#ff2d3a; --accent-rgb:255 45 58; --on-accent:#0b0b0d; --radius:12px;
  --font-display:'Anton',system-ui,sans-serif; --font-body:'Inter',system-ui,sans-serif;
}
```
- [ ] **Step 4: index.html** — `<html lang="pt-BR">`, viewport, `<title>Vitor Tasca — Filmmaker & Creative Director</title>`, meta description, Open Graph (`og:title`, `og:description`, `og:image` = `./img/vitor-hero.jpg`), `<link>` das fontes, `<body class="grain">`:
  - `header.site-header` fixo: nome + função, nav (`#trabalhos`, `#sobre`, `#contato`), link Instagram `.icon-glow` com `data-ig` e `aria-label="Instagram"`.
  - `section#hero.hero.bg-grid`: `.hero-blob`, `div#hero-media` (preenchido pela Task 6), `h1#hero-name.text-glow`, `p#hero-text`, `button#btn-showreel.glow-btn` "Assistir showreel", `a#btn-contact` "Fale comigo".
  - `section#trabalhos`: `h2` "Trabalhos", `div#filters role="group" aria-label="Nichos"`, `p#niche-desc`, `div#grid aria-live="polite"`.
  - `section#sobre`: `img#about-photo` (alt "Vitor Tasca"), `p#about-text`, `dl` com `#stat-years`, `#stat-projects`, `#stat-niches`.
  - `section.clients`: `h2` "Clientes", `div#clients`.
  - `section#contato`: `h2` "Vamos criar juntos", `a#contact-wa.glow-btn` "WhatsApp", `a#contact-email` "E-mail", `a#contact-ig` com `data-ig` "Instagram".
  - `footer`: "Vitor Tasca", `span#year`. Sem menção ao Lovable.
  - `a#wa-float.glow-btn` flutuante com `aria-label="Falar no WhatsApp"`.
  - `<script type="module" src="/src/main.js"></script>`.
- [ ] **Step 5: components.css** — header fixo com `backdrop-filter: blur(12px)` e `scroll-margin-top: 80px` nas seções; hero em tela cheia (`min-height:100svh`), foto com `object-fit:cover` e glow vermelho; grade 1/2/3 colunas (Global Constraints); `.card` como botão sem estilo nativo, mídia 16:9, zoom no hover em `(hover:hover)`, ícone ▶ central; chips com `aria-pressed="true"` em `--accent` + `--on-accent`; `.clients` como faixa horizontal (`animation: marquee 30s linear infinite`, parada em reduced-motion); seção contato com botões grandes; `.player` (`dialog`) tela cheia com `::backdrop` escuro; `@media (max-width:480px)` com logo menor para não encostar na nav.
- [ ] **Step 6: Verify** `npx vitest run` passa; `npm run build` só pode falhar por `src/main.js` ainda inexistente (registrar no relatório).
- [ ] **Step 7: Commit** `feat: red cinematic design tokens, effects and page skeleton`

---

### Task 5: Grade e filtros

**Files:**
- Create: `src/ui/grid.js`, `src/ui/filters.js`
- Test: `tests/ui.test.js`

**Interfaces:**
- Consumes: `Project`, `thumbUrl`, `NICHES`.
- Produces: `renderGrid(container, projects: Project[], niches, onOpen: (p) => void): void`; `renderFilters(container, niches: typeof NICHES, active: string, onChange: (slug) => void): void` (primeiro chip "Todos" = `'todos'`; mantém o foco no chip ativo se o foco estava em `container`).

- [ ] **Step 1: Failing test** — `tests/ui.test.js`
```js
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
```
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** — `src/ui/grid.js`
```js
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
```
`src/ui/filters.js`
```js
export function renderFilters(container, niches, active, onChange) {
  const hadFocus = container.contains(document.activeElement);
  const items = [['todos', 'Todos'], ...niches.map(n => [n.slug, n.label])];
  container.replaceChildren(...items.map(([value, label]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.textContent = label;
    b.setAttribute('aria-pressed', String(value === active));
    b.addEventListener('click', () => onChange(value));
    return b;
  }));
  if (hadFocus) container.querySelector('[aria-pressed="true"]')?.focus();
}
```
- [ ] **Step 4: Run** — pass.
- [ ] **Step 5: Commit** `feat: work grid with YouTube thumbnails and niche filters`

---

### Task 6: Player, hero e clientes

**Files:**
- Create: `src/ui/player.js`, `src/ui/hero.js`, `src/ui/clients.js`
- Test: `tests/player.test.js`, `tests/hero.test.js`

**Interfaces:**
- Consumes: `embedUrl`, `thumbUrl`.
- Produces:
  - `openPlayer(youtubeId: string, title: string): () => void` — cria `<dialog class="player">` com `iframe` (`src = embedUrl(id)`, `title`, `allow="autoplay; encrypted-media; picture-in-picture; fullscreen"`, `allowfullscreen`), botão fechar `aria-label="Fechar vídeo"`; fecha com botão/ESC (`cancel`)/clique no backdrop; ao fechar remove o dialog (para o vídeo), tira `no-scroll` do body e devolve o foco ao elemento que abriu. `close()` é idempotente.
  - `renderHero(container: Element, { image: string, mp4: string, alt: string }): 'photo'|'video'` — com `mp4` vazio: `<img>` (`fetchpriority="high"`); com `mp4`: `<video autoplay muted loop playsinline poster=image>` + `<source>`; erro no vídeo → troca por `<img>`; retorna o modo.
  - `renderClients(container: Element, clients: string[]): void` — lista `<ul>` com `<li>` por cliente, duplicada com `aria-hidden="true"` para o marquee contínuo.

- [ ] **Step 1: Failing tests**
`tests/player.test.js`
```js
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
```
`tests/hero.test.js`
```js
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
```
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** — `src/ui/player.js`
```js
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
  d.addEventListener('click', e => { if (e.target === d) close(); });
  d.addEventListener('cancel', e => { e.preventDefault(); close(); });
  document.body.classList.add('no-scroll');
  d.showModal(); closeBtn.focus();
  return close;
}
```
`src/ui/hero.js`
```js
function photo(image, alt) {
  const img = document.createElement('img'); img.src = image; img.alt = alt;
  img.setAttribute('fetchpriority', 'high'); img.className = 'hero-img'; return img;
}
export function renderHero(container, { image, mp4, alt }) {
  if (!mp4) { container.replaceChildren(photo(image, alt)); return 'photo'; }
  const v = document.createElement('video');
  v.className = 'hero-video'; v.autoplay = true; v.muted = true; v.loop = true;
  v.setAttribute('playsinline', ''); v.setAttribute('muted', ''); v.poster = image; v.setAttribute('aria-label', alt);
  const s = document.createElement('source'); s.src = mp4; s.type = 'video/mp4';
  s.addEventListener('error', () => container.replaceChildren(photo(image, alt)));
  v.append(s); container.replaceChildren(v);
  return 'video';
}
```
`src/ui/clients.js`
```js
export function renderClients(container, clients) {
  const list = hidden => {
    const ul = document.createElement('ul'); ul.className = 'clients-list';
    if (hidden) ul.setAttribute('aria-hidden', 'true');
    for (const c of clients) { const li = document.createElement('li'); li.textContent = c; ul.append(li); }
    return ul;
  };
  container.replaceChildren(list(false), list(true));
}
```
- [ ] **Step 4: Run** — pass.
- [ ] **Step 5: Commit** `feat: fullscreen YouTube player, hero media and clients marquee`

---

### Task 7: Composição, deep link e README

**Files:**
- Create: `src/main.js`, `README.md`

**Interfaces:**
- Consumes: tudo acima.

- [ ] **Step 1: Implement** — `src/main.js`
```js
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
```
- [ ] **Step 2: README.md** (pt-BR): `npm install`, `npm run dev`, `npm test`, `npm run build`; **como adicionar um trabalho** (editar `src/data/projects.js`, exemplo de linha, `featured`); **como ativar o showreel em vídeo** (colocar `public/video/showreel.mp4` de 15–30 s, ≤ 8 MB, H.264, sem som, e preencher `showreelMp4: './video/showreel.mp4'` em `config.js`); **links por nicho** (`https://<dominio>/#restaurantes` etc.); deploy Cloudflare Pages (build `npm run build`, output `dist`) + subdomínio DigitalPlat (CNAME para `<projeto>.pages.dev` + domínio customizado no Pages); checklist "Antes de publicar" (confirmar showreel, textos, rodar Lighthouse mobile ≥ 90).
- [ ] **Step 3: Verify** `npx vitest run && npm run build` — ambos passam; colar saída no relatório.
- [ ] **Step 4: Commit** `feat: compose portfolio page with deep links and README`

---

### Task 8: Verificação no navegador (controller)

- [ ] **Step 1:** `.claude/launch.json` na raiz da sessão com `{"name":"vitortasca","runtimeExecutable":"npm","runtimeArgs":["--prefix","VitorTasca","run","dev","--","--port","5174"],"port":5174}`; `preview_start`.
- [ ] **Step 2:** 375×812: hero com foto e botões visíveis sem rolar; header sem sobreposição; "Assistir showreel" abre player com iframe nocookie; ESC fecha e foco volta ao botão; chips Todos + 6 nichos; `/#saude` abre filtrado com 3 trabalhos; `#xyz` → todos; 15 cards; destaques primeiro.
- [ ] **Step 3:** Desktop: 3 colunas, spotlight, glow vermelho, marquee de clientes rodando; console sem erros.
- [ ] **Step 4:** Emular `prefers-reduced-motion` → marquee e grain parados.
- [ ] **Step 5:** Teste temporário do modo vídeo: setar `showreelMp4` para um arquivo inexistente → hero volta para a foto (não commitar).
