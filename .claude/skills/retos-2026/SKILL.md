---
name: retos-2026
description: Ayuda a un equipo de NASA Space Apps 2026 a elegir uno de los 14 retos oficiales y a bajarlo a una persona concreta, un dataset NASA, 4 pantallas y un alcance realista para su nivel (niño, sin código, mixto o dev). Úsala cuando el equipo pregunte qué reto elegir, qué pide un reto, qué datos usar para un reto o cómo empezar el proyecto de un reto específico.
---

# Retos Space Apps 2026

Las fichas de los 14 retos están en `retos/` en la raíz del repo; el índice con nivel, tema visual y herramienta sugerida está en `retos/README.md`. Lee **solo** la ficha del reto que aplica.

## Si el equipo aún no elige reto

Pregunta, en una sola tanda: ¿alguien programa?, ¿qué les apasiona (Tierra, Luna/Marte, juegos, salud, arte)?, ¿cuántas horas quedan? Luego recomienda 2 retos del índice con una razón cada uno. No presentes los 14.

## Cuando ya hay reto

1. Lee `retos/<NN>-<slug>.md`.
2. Con el equipo, completa la ficha de arranque de la skill `prototipo-4-pantallas` (usuario, dolor, dato NASA, momento de valor, real vs. simulado). Usa la sección "Bájalo a una persona" de la ficha como ejemplo, no como respuesta obligatoria.
3. Confirma el dataset con la skill `nasa-data` y haz **una** llamada real antes de diseñar pantallas.
4. Elige el tema visual que sugiere la ficha (skill `tokens-diseno`).
5. Según la herramienta:
   - Claude Code / Codex: construye con `prototipo-4-pantallas`.
   - Stitch / Lovable / v0: genera el prompt con `prompt-prototipado`.
   - Niño: `mision-cadete`.

## Reglas

- El brief oficial manda. Si la ficha y el brief difieren, sigue el brief y avisa. Las fichas 1 y 10 no tienen enlace directo verificado: pide al equipo abrir el brief desde https://www.spaceappschallenge.org/2026/challenges/.
- Los recursos de varios retos son de EE. UU. (suelos USDA, PRISM). Para Honduras, propone alternativas globales y dilo en la interfaz.
- Recorta alcance sin piedad: un dataset, una región, un periodo, un momento de valor.
