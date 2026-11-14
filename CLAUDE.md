# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Las reglas del proyecto, el mapa de skills y los comandos están en `AGENTS.md` (compartido con Codex y otros agentes):

@AGENTS.md

## Notas para Claude Code

- Claude Code carga las skills desde `.claude/skills/`, que es una **copia generada** de `.agents/skills/`. Edita siempre en `.agents/skills/` y corre `npm run skills:sync`; `npm run check` falla si las copias difieren.
- Hay dos públicos con necesidades distintas:
  - **Devs con Claude Code o Codex:** construyen en Next.js con las skills; asume que saben programar y sé breve.
  - **Juniors con Google Stitch, Lovable o v0:** no ejecutan código; lo que necesitan es un prompt excelente. Para ellos, la parte pesada está en `prompts/` (guía por herramienta y pulidor de prompts) y en `retos/`.
- Cómo encaja todo: `retos/<NN>-*.md` (qué construir y con qué datos) → `design-tokens/` (cómo se ve) → skills `prototipo-4-pantallas` y `prompt-prototipado` (cómo construirlo según la herramienta) → `pitch-space-apps` (cómo contarlo).
- Las 15 skills de terceros (14 de UI/UX y `deploy-to-vercel`) están fijadas en `docs/ui-skills.lock.json`; cuándo usar cada una está en `docs/ui-skills.md`. No las cargues todas a la vez.
- Fuentes de los retos: briefs oficiales en https://www.spaceappschallenge.org/2026/challenges/ (consultados el 14 de noviembre de 2026). Los retos 1 (Abandoned but not Forgotten) y 10 (Earth Analogs) no tienen enlace directo verificado.
