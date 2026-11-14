# 🚀 Space Apps Starter · San Pedro Sula 2026

Kit para que tu equipo pase **del problema al prototipo** en el NASA Space Apps Challenge 2026.
Sirve para quien usa **Google Stitch, Lovable o v0** y para quien programa con **Claude Code o Codex**.

> **Make it believable, not complete.** El jurado no premia el producto más completo:
> premia la historia más creíble con datos NASA en el centro.

## Elige tu camino

| Tu equipo… | Empieza aquí | Resultado |
|---|---|---|
| No programa | [`retos/`](retos/README.md) → [`prompts/google-stitch.md`](prompts/google-stitch.md) | Pantallas navegables (Nivel 2) |
| Programa poco | [`retos/`](retos/README.md) → [`prompts/lovable.md`](prompts/lovable.md) o [`prompts/v0.md`](prompts/v0.md) | App con link público (Nivel 3) |
| Programa | Clona el repo y abre Claude Code o Codex (ver abajo) | App en Next.js con datos NASA reales |
| Tiene un niño con una idea | [`prompts/mision-cadete.md`](prompts/mision-cadete.md) | Juego espacial con datos reales |

## ¿Qué trae?

| Carpeta | Para qué |
|---|---|
| [`retos/`](retos/README.md) | Los **14 retos 2026** aterrizados a Honduras: persona, datos NASA, 4 pantallas, qué hacer según tu equipo y una semilla de prompt. |
| [`prompts/`](prompts/README.md) | Guías completas de **Google Stitch, Lovable y v0**, el **pulidor de prompts** para ChatGPT/Claude/Gemini, Misión Cadete y cómo **publicar** tu link. |
| [`design-tokens/`](design-tokens/README.md) | 4 temas visuales (`orbita`, `tierra`, `marte`, `cadete`) con contraste validado, listos como CSS (shadcn/Tailwind) o como texto para tu prompt. |
| `.agents/skills/` · `.claude/skills/` | Skills para Codex y Claude Code: las del kit (en español) y 15 de terceros (UI/UX y deploy) fijadas por versión. |
| [`docs/ui-skills.md`](docs/ui-skills.md) | Qué skill de UI/UX usar y cuándo (Vercel, Emil Kowalski, Impeccable, UI UX Pro Max, Anthropic, Addy Osmani). |
| [`examples/`](examples/) | Llamadas reales a APIs de NASA para probar en 1 minuto. |

### Skills del kit

| Skill | Para qué |
|---|---|
| `retos-2026` | Elegir reto y bajarlo a usuario, datos y alcance. |
| `prototipo-4-pantallas` | Construir el happy path: Entrada → Datos NASA → Resultado → Acción. |
| `nasa-data` | Encontrar y consumir datos NASA (POWER, FIRMS, DONKI, EONET, GIBS, Trek, Earthdata…). |
| `tokens-diseno` | Aplicar o crear temas visuales con contraste validado. |
| `prompt-prototipado` | Escribir y pulir el prompt para Stitch, Lovable o v0. |
| `mision-cadete` | Convertir la idea de un niño en un juego o página con datos reales. |
| `deploy-vercel` | Publicar con un link público desde Lovable, v0, Stitch o Next.js, con checklist del demo. Usa `deploy-to-vercel` (oficial de Vercel) para el CLI. |
| `pitch-space-apps` | Pitch y autoevaluación con los 5 criterios oficiales. |

## Arranque rápido (técnicos)

```bash
git clone https://github.com/GDriem/space-apps-starter.git
cd space-apps-starter

# Crea tu app dentro del repo
npx create-next-app@latest app --ts --tailwind --eslint --app --use-npm

# Abre tu agente y pide, por ejemplo:
#   "Usa retos-2026 para el reto Field Shift y construye el prototipo con el tema tierra"
claude    # o: codex
```

Claude Code lee `.claude/skills/` y Codex lee `.agents/skills/`; las skills se activan solas cuando la tarea coincide.

## Arranque rápido (sin programar)

1. Abre la ficha de tu reto en [`retos/`](retos/README.md) y copia la **semilla para el prompt**.
2. Copia el bloque de tu tema desde [`design-tokens/build/`](design-tokens/build/) (`<tema>.prompt.md`).
3. Pega el [pulidor de prompts](prompts/pulidor-de-prompt.md) en ChatGPT, Claude o Gemini junto con tu semilla y tu tema.
4. Lleva el prompt final a Stitch, Lovable o v0 siguiendo su guía en [`prompts/`](prompts/README.md).
5. Publica tu link con [`prompts/publicar.md`](prompts/publicar.md) y revisa el checklist antes del pitch.

## Los 5 criterios del jurado

| Criterio | Pregunta que se hace el jurado | Cómo sumar |
|---|---|---|
| **Impacto** | ¿Qué tan grande es el problema y a cuántos ayuda? | Persona concreta + cifra estimada y defendible. |
| **Creatividad** | ¿Qué tiene de nuevo? | Combina datasets, un usuario nuevo o una interfaz distinta. |
| **Validez** | ¿Tiene base científica, es factible y usable? | Cita fuente y método; link que funcione; di tus límites. |
| **Relevancia** | ¿Responde al reto y usa datos NASA de verdad? | El dataset NASA es el motor y se ve en pantalla. |
| **Presentación** | ¿Se entendió la historia? | Problema → solución → demo → impacto. |

## Recursos oficiales

- Retos 2026: https://www.spaceappschallenge.org/2026/challenges/
- Evento local: https://www.spaceappschallenge.org/2026/local-events/san-pedro-sula/
- NASA Earthdata: https://earthdata.nasa.gov/
- NASA Open APIs: https://api.nasa.gov/

## Créditos y licencias

Las skills de UI/UX de terceros conservan sus licencias (MIT o Apache-2.0) dentro de cada carpeta; origen, commit y adaptaciones están en [`docs/ui-skills.lock.json`](docs/ui-skills.lock.json).
Este kit no está afiliado ni respaldado por NASA. No usa su logo ni su marca.

---
Hecho por Gadi Orellana · Microsoft MVP · Team Gecko · para Space Apps San Pedro Sula 2026.
