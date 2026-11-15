# Tokens de diseño

Seis temas listos para que tu prototipo no se vea "de plantilla". Todos pasan contraste WCAG AA (texto principal AAA).

| Tema | Modo | Ambiente | Para |
|---|---|---|---|
| `orbita` | Oscuro | Centro de control de misión de noche | Datos, ciencia, salud, astronomía. **Por defecto.** |
| `tierra` | Claro | Herramienta de campo clara y confiable | Agricultura, incendios, comunidades. |
| `marte` | Oscuro | Expedición planetaria, óxido y polvo | Luna, Marte, misiones. |
| `cadete` | Claro | Juego alegre de botones grandes | Niños de 7 a 12 años. |
| `milpa` | Claro | Cuaderno de campo cálido, con dibujos a color | Agricultores y comunidades rurales con poca lectura. |
| `surco` | Claro | Marca Surco: arena, tierra y verde Surco; maíz solo como relleno | La app Surco (Field Shift). |

## Cómo usarlos

| Herramienta | Archivo | Qué hacer |
|---|---|---|
| Google Stitch, Lovable, v0 (por prompt) | `build/<tema>.prompt.md` | Copia el bloque al final de tu prompt. |
| v0, Lovable exportado, Next.js + shadcn/ui | `build/<tema>.css` | Pégalo en `app/globals.css` debajo de `@import "tailwindcss";`. |
| Figma | `tokens.json` | Crea estilos de color y texto con los mismos nombres y hex. |

## Reglas de uso

- **Marca (`primary`)** para la acción principal, enlaces y foco.
- **Acento (`highlight`)** para una sola cosa por pantalla: el dato clave o la acción final.
- **Riesgo** siempre con texto y color ("Riesgo alto"), nunca solo color.
- Números en la fuente mono.
- No uses el logo de NASA.

## Cambiar o crear un tema

Edita `tokens.json` y corre:

```bash
npm run tokens
```

El script regenera `build/` y te dice qué pares de colores no cumplen contraste. No edites `build/` a mano.
