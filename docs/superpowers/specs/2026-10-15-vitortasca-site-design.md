# Vitor Tasca — Portfólio Filmmaker (Design)

Data: 2026-10-15 · Status: aprovado em conversa, aguardando revisão da spec
Site atual: https://vitortascafilmmaker.lovable.app (Lovable) · Base técnica: repositório `SportConceito`

## 1. Objetivo
Redesign do portfólio do filmmaker Vitor Tasca: mais cinematográfico, com showreel em destaque, todos os trabalhos navegáveis por nicho e contato em poucos cliques.

**Critérios de sucesso**
- Um contratante entende o trabalho em ≤ 10 s (hero + botão "Assistir showreel" visível sem rolar).
- Do carregamento ao WhatsApp em ≤ 2 cliques.
- Link direto por nicho (`/#restaurantes`) abre já filtrado.
- Lighthouse mobile ≥ 90 em Performance e Acessibilidade.
- Sem selo "Edit with Lovable".

## 2. Decisões
| Tema | Decisão |
|---|---|
| Conteúdo | Fixo no código: `src/data/projects.js`, editado pelo desenvolvedor sob demanda |
| Estrutura | Página única; filtro por nicho sincronizado com `location.hash` |
| Hero | Foto (`public/img/vitor-hero.jpg`) + botão "Assistir showreel" (YouTube no player). Se `config.showreelMp4` preenchido → vídeo MP4 em loop, mudo, `playsinline`, com botão "Assistir com som" |
| Vídeos | YouTube embed via `youtube-nocookie.com`, autoplay ao abrir o player; iframe removido ao fechar |
| Stack | Vite + JS puro + Vitest/jsdom (mesma base do SportConceito, copiada e adaptada; repositórios independentes) |
| Visual | Preto cinematográfico, tipografia condensada (display) + sans legível; **acento vermelho**; efeitos de luz/grain do SportConceito (`effects.css`) reutilizados; design via skill `ui-ux-pro-max` |
| Hospedagem | Cloudflare Pages + subdomínio DigitalPlat (igual ao SportConceito) |

## 3. Estrutura da página
1. **Header fixo** — "VITOR TASCA" + "Filmmaker & Creative Director"; links Trabalhos / Sobre / Contato; ícone Instagram.
2. **Hero** — foto com glow vermelho, título grande, CTA "Assistir showreel" (abre player) e "Fale comigo" (WhatsApp). Modo vídeo quando `showreelMp4` existe.
3. **Trabalhos** — chips: Todos + nichos com ≥ 1 projeto. Grade de cards (miniatura YouTube 16:9, título, cliente/descrição, nicho) com spotlight e zoom. Clique → player fullscreen (`<dialog>`), ESC/clique fora fecha, foco volta ao card. Destaques primeiro; depois ordem do arquivo.
4. **Sobre** — foto, texto, números: "3+ anos", "N projetos" (contado), "6 nichos" (contado).
5. **Clientes** — faixa (marquee estático com `prefers-reduced-motion`) com nomes únicos de clientes extraídos dos projetos.
6. **Contato** — botões grandes WhatsApp, e-mail, Instagram; botão flutuante WhatsApp.
7. **Rodapé** — nome, © ano, sem selo Lovable.

## 4. Dados
`config.js`: `name`, `role`, `whatsapp: '5511989552352'`, `email: 'vitortasca.filmmaker@gmail.com'`, `instagram: 'vitortasca.filmmaker'`, `showreelYoutubeId` (inicial: `DRcc5s0UkFE` até ele definir outro), `showreelMp4: ''`, `yearsExperience: 3`, textos do hero/sobre.

`NICHES` (ordem, slug, rótulo, descrição — textos do site atual):
- `restaurantes` — Restaurantes — "Vídeos que despertam o apetite. Captura de ambiente, processo e sabor com estética cinematográfica para restaurantes e marcas gastronômicas."
- `videoclipes` — Videoclipes — "Narrativas visuais para artistas. Direção, conceito e fotografia para clipes que traduzem a identidade de cada som."
- `eventos` — Eventos — "Aftermovies, cobertura completa e captação de eventos corporativos, festivais e palestras."
- `saude` — Saúde — "Produções para clínicas, hospitais e profissionais da saúde. Comunicação sensível, humana e tecnicamente apurada."
- `esportes` — Esportes — "Filmes para atletas, times e marcas esportivas com captação dinâmica e edição rítmica."
- `institucional` — Institucional — "Vídeos institucionais que comunicam propósito, cultura e valores. Narrativas visuais que apresentam marcas e empresas com clareza e elegância."

Projeto: `{ id, niche, title, client, youtube, featured }` — `youtube` aceita ID ou qualquer URL do YouTube.

Conteúdo inicial (do site atual):
| nicho | title | client | youtube |
|---|---|---|---|
| restaurantes | Hamburgueria | Bevo Burger | ffJgbxoG_5k |
| restaurantes | Restaurante Japonês | Pappa Gohan | TmJ4nGZJyJ0 |
| restaurantes | Cafeteria | Dilly Cafés Especiais | QjqutziGnm8 |
| restaurantes | Restaurante Italiano | Romano Grand Cru | HZJqueu4HBk |
| videoclipes | Mudança | Frank Aguiar | DRcc5s0UkFE |
| eventos | Mentoria Sankhya | Denis Antunes | nm5UqxnrHDQ |
| eventos | Lucky Day | Rex Customs | qnKdh-0LO9A |
| eventos | FEIMEC | Prumo Tech | F18KNhDdlK4 |
| saude | Médico Cirurgião | Dr. Romulo Amorim | V0MzkmC9B1s |
| saude | Esteticista e Cosmetóloga | Aline Berger | qMG9DHWFSAo |
| saude | Médico Cirurgião | Dr. Romulo Amorim | ZhIAe9awOqQ |
| esportes | Atleta de MMA | Enzo Popeye | 6PWyXDWLnbo |
| esportes | Personal Trainer | Rodrigo Santana | LvvcfB4ddO4 |
| esportes | Personal Fighter | Furlani Fight Club | 9WCGjhET5dg |
| institucional | Institucional | Samech Vedações | Yue2URbdrhc |

`featured: true` inicial: Mudança (videoclipes), Bevo Burger, Lucky Day.
Imagens já salvas em `public/img/` (foto do hero e capas por nicho, do site atual).

## 5. Unidades
| Módulo | Responsabilidade |
|---|---|
| `src/domain/youtube.js` | `parseYouTubeId(input)` (ID puro, watch?v=, youtu.be, shorts, embed, com params) → id ou null; `thumbUrl(id, quality)`; `embedUrl(id)` (nocookie, autoplay=1, rel=0) |
| `src/domain/projects.js` | `normalizeProjects(raw, niches)` (valida, resolve youtubeId, warn em inválidos), `sortProjects` (featured primeiro, estável), `filterByNiche`, `nichesWithProjects`, `uniqueClients`, `stats` |
| `src/router.js` | `readNiche(hash, validSlugs)` → slug ou 'todos'; `writeNiche(slug)` (history.replaceState) |
| `src/ui/grid.js`, `filters.js`, `player.js`, `hero.js`, `clients.js` | Render/interação; só `textContent`, nunca `innerHTML` com dados |
| `src/main.js` | Composição, `hashchange` |

## 6. Erros
- Projeto sem título/nicho válido/YouTube reconhecível → ignorado + `console.warn`.
- `maxresdefault` inexistente (YouTube devolve imagem 120×90) → `onload` checa `naturalWidth <= 120` e troca para `hqdefault`.
- Hash desconhecido → "todos".
- MP4 do hero falha → volta para a foto.

## 7. Testes
Vitest: youtube.js (todos os formatos + inválidos), projects.js (validação, ordenação estável, clientes únicos, stats, nichos vazios), router.js, hero (modo foto vs vídeo), player (abre iframe nocookie, fecha remove iframe e devolve foco), grid/filters (XSS-safe, aria-pressed). Navegador: 375px e desktop, teclado, `prefers-reduced-motion`.

## 8. Fora de escopo
Formulário de contato, blog, versão em inglês, painel admin, páginas separadas por nicho.
