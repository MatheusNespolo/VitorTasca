# Paleta e tipografia — Vitor Tasca

Direção (skill ui-ux-pro-max, "filmmaker portfolio cinematic dark red"): tema escuro de cinema, acento vermelho, display condensada pesada. A busca de tipografia sugeriu Bebas Neue / Barlow Condensed; mantivemos **Anton** (condensada mais pesada, no espírito do site atual) + **Inter** (corpo legível, sugerida pelo skill para "dark, cinematic").

## Tokens
| Token | Hex |
|---|---|
| --bg | #08080a |
| --surface | #121216 |
| --text | #f4f4f5 |
| --muted | #a1a1aa |
| --line | #26262b |
| --accent | #ff2d3a (rgb 255 45 58) |
| --on-accent | #0b0b0d |

## Fontes
- Display: Anton (apenas títulos/nome, maiúsculas)
- Corpo: Inter 400/500/600/700

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## Contraste WCAG (calculado, luminância relativa)
| Par | Razão | Mínimo | Resultado |
|---|---|---|---|
| text / bg | 18.21:1 | 4.5 | AA/AAA |
| text / surface | 17.00:1 | 4.5 | AA/AAA |
| muted / bg | 7.81:1 | 4.5 | AA |
| muted / surface | 7.29:1 | 4.5 | AA |
| accent / bg (texto/foco) | 5.42:1 | 4.5 (3 p/ UI) | AA |
| accent / surface | 5.06:1 | 4.5 | AA |
| on-accent / accent (botões, chip ativo) | 5.33:1 | 4.5 | AA |
| #fff / accent (rejeitado) | 3.69:1 | 4.5 | falha — por isso on-accent escuro |
| line / bg (apenas decorativo) | 1.33:1 | — | não carrega informação |
