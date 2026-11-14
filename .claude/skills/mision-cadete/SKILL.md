---
name: mision-cadete
description: Convierte la idea de un niño (un juego sandbox espacial, un mapa, un museo, una rocola) en un prototipo alineado a un reto de NASA Space Apps 2026 con datos reales de NASA, sin cambiar la idea del niño. Úsala cuando un niño o un equipo juvenil proponga una idea, para el demo en vivo con un niño o cuando pidan "un juego del espacio para niños".
---

# Misión Cadete

La idea del niño es sagrada: no la corrijas ni la "mejores" hacia otra cosa. Tu trabajo es **conectarla** con un reto y con un dato real de NASA, y construirla para que un niño la use.

## 1. Encaja la idea en un reto

Usa la tabla de `prompts/mision-cadete.md` → "Paso 1". Si la idea no encaja, elige el reto más cercano de `retos/README.md` y explica la conexión en una frase que el niño entienda.

## 2. Elige un dato NASA que el niño pueda "tocar"

Debe aparecer en el juego como algo que pasa, no como una tabla: una tormenta solar real (DONKI) que golpea la base, una foto real del rover, el mapa real de Marte, un foco de incendio real. Muéstralo con un cartel "Dato real de NASA".

## 3. Construye

- **Lovable / v0:** genera el prompt con la plantilla de `prompts/mision-cadete.md` (palabras del niño entre comillas, tema `cadete`).
- **Claude Code / Codex:** construye directamente en Next.js con el tema `cadete` (`design-tokens/build/cadete.css`):
  - Juego sandbox: estado en un reducer simple, ciclo "elegir → pasa algo → consecuencia explicada → recompensa". Canvas o DOM según la idea; DOM es suficiente casi siempre.
  - Datos NASA precargados en `public/data/*.json` (el wifi del demo puede fallar) y una función que los lea.
  - Botones de 56 px o más, máximo 2 líneas de texto por mensaje, sonido opcional con botón de silencio, `prefers-reduced-motion` respetado.
  - Sin login, sin registro, sin datos personales.

## 4. Itera con el niño

Un cambio a la vez, con sus palabras. Después de cada cambio, déjalo jugar antes de seguir.

## Reglas

- Solo nombre de pila. Nunca apellido, escuela, ubicación ni foto del niño en prompts o en el código.
- Cada consecuencia del juego debe ser científicamente verdadera, aunque esté simplificada.
- Si es para el demo del escenario, ten una versión ya generada como plan B (ver `prompts/demo-nino-8-anios.md`).
