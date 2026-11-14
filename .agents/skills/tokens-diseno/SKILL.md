---
name: tokens-diseno
description: Aplica los tokens de diseño de Space Apps Starter (temas orbita, tierra, marte y cadete) a un prototipo en Next.js/Tailwind/shadcn, a un prompt de Stitch, Lovable o v0, o a Figma; también crea o ajusta un tema y valida su contraste. Úsala cuando el equipo elija colores, tipografía o estilo, cuando la app "se vea genérica", o cuando haya que cambiar o crear un tema.
---

# Tokens de diseño

Fuente única: `design-tokens/tokens.json`. Todo lo de `design-tokens/build/` se genera con `npm run tokens` (o `node scripts/build-tokens.mjs`), que además valida contraste WCAG y falla si un par no cumple.

## Elegir tema

| Tema | Modo | Para |
|---|---|---|
| `orbita` | oscuro | Tableros de datos, ciencia, salud, astronomía. Tema por defecto. |
| `tierra` | claro | Agricultura, incendios, comunidades; apps para usar a pleno sol. |
| `marte` | oscuro | Luna, Marte, misiones, exploración. |
| `cadete` | claro | Niños de 7–12 años, juegos educativos. |

La ficha de cada reto en `retos/` sugiere uno. Un solo tema por proyecto.

## Aplicar

- **Next.js + Tailwind v4 + shadcn/ui** (proyecto propio, v0 o Lovable exportado): copia `design-tokens/build/<tema>.css` debajo de `@import "tailwindcss";` en `app/globals.css`, reemplazando el `:root` y el `@theme inline` existentes. Carga las fuentes del comentario del archivo con `next/font/google`.
  Clases disponibles: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`, `bg-highlight`, `text-risk-high`, `font-display`, `font-mono`, `ease-out-strong`, etc.
- **Stitch / Lovable / v0 por prompt:** pega `design-tokens/build/<tema>.prompt.md` (skill `prompt-prototipado`).
- **Figma:** usa los hex de `tokens.json`; crea estilos de color con los mismos nombres.

## Reglas de uso

- `primary` (marca) para la acción principal, enlaces y foco. `highlight` solo para **una** cosa por pantalla (el dato clave o la CTA de la pantalla 3).
- Riesgo y estado siempre con texto + color, nunca solo color.
- Los números y datos van en `font-mono` con `tabular-nums`.
- No inventes colores sueltos en componentes: si falta un token, agrégalo a `tokens.json` y regenera.
- No uses el logo ni la marca de NASA.

## Crear o ajustar un tema

1. Edita `design-tokens/tokens.json` (copia un tema existente como base).
2. Corre `npm run tokens`. Si algún par sale `MAL`, ajusta ese color hasta que pase.
3. Corre `npm run check` antes de hacer commit.
