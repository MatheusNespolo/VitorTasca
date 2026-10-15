# Vitor Tasca — Portfólio

Site estático (Vite, JavaScript puro) do filmmaker Vitor Tasca.

## Comandos

```bash
npm install      # instala as dependências
npm run dev      # servidor local com hot reload
npm test         # roda os testes (vitest)
npm run build    # gera a pasta dist/ para publicação
```

## Como adicionar um trabalho

Edite `src/data/projects.js` e copie uma linha do array `PROJECTS`:

```js
{ niche: 'restaurantes', title: 'Nome do vídeo', client: 'Nome do cliente', youtube: 'ID_OU_LINK_DO_YOUTUBE' },
```

- `niche`: `restaurantes`, `videoclipes`, `eventos`, `saude`, `esportes` ou `institucional`.
- `youtube`: aceita o ID ou qualquer link do YouTube.
- `featured: true`: o trabalho aparece primeiro na listagem.
- `client` é opcional.

## Como ativar o showreel em vídeo no hero

1. Coloque o arquivo em `public/video/showreel.mp4` (15–30 s, no máximo 8 MB, H.264, sem som).
2. Em `src/config.js`, preencha `showreelMp4: './video/showreel.mp4'`.

Enquanto o campo estiver vazio, o hero usa a imagem.

## Links por nicho

Cada nicho tem um link direto que abre a página já filtrada e rola até os trabalhos:

- `https://<dominio>/#restaurantes`
- `https://<dominio>/#videoclipes`
- `https://<dominio>/#eventos`
- `https://<dominio>/#saude`
- `https://<dominio>/#esportes`
- `https://<dominio>/#institucional`

Nichos sem trabalhos cadastrados não aparecem como filtro.

## Deploy (Cloudflare Pages)

1. No Cloudflare Pages, conecte o repositório.
2. Build command: `npm run build`. Output directory: `dist`.
3. Subdomínio gratuito DigitalPlat: crie um registro CNAME apontando para `<projeto>.pages.dev` e adicione o domínio como domínio customizado no projeto do Pages.

## Antes de publicar

- [ ] Confirmar o showreel (ID do YouTube em `config.js` e, se houver, o MP4).
- [ ] Revisar textos, contatos (WhatsApp, e-mail, Instagram) e lista de trabalhos.
- [ ] Rodar o Lighthouse em modo mobile e confirmar nota >= 90.
