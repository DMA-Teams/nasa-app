# AGENTS.md · Reglas para agentes de código (Codex, Claude Code, Cursor, Copilot)

Este repo es un kit para equipos del **NASA Space Apps Challenge 2026 · San Pedro Sula**. Los equipos lo clonan y crean su app dentro (por defecto en `app/`). Al ayudar a un equipo:

1. **Happy path primero.** 4 pantallas: Entrada → Datos NASA + procesamiento → Resultado → Acción. Sin login, roles, pagos ni panel de administración.
2. **Datos NASA como motor.** Al menos un dataset NASA real (skill `nasa-data`). La UI muestra el nombre del dataset y la fecha. Si quitas los datos, la app deja de funcionar.
3. **Claves en el servidor.** API keys en variables de entorno sin prefijo `NEXT_PUBLIC_`, usadas desde route handlers.
4. **Resiliencia para el demo.** Cache en las llamadas a APIs y JSON de respaldo en `public/fallback/`. Botón "Ver ejemplo" que precarga el caso del pitch.
5. **Honestidad.** Lo simulado se marca "(simulado)" en pantalla.
6. **Stack por defecto:** Next.js (App Router) + TypeScript + Tailwind v4 + shadcn/ui, desplegado en Vercel.
7. **Estilo:** un tema de `design-tokens/build/` desde el inicio (skill `tokens-diseno`). No inventes colores sueltos ni uses el logo de NASA.
8. **Idioma:** interfaz y comentarios en español, salvo que el equipo pida otra cosa.
9. **Criterios del jurado:** Impacto, Creatividad, Validez, Relevancia, Presentación (skill `pitch-space-apps`).

## Qué skill usar

| Situación | Skill |
|---|---|
| Elegir reto o entender uno | `retos-2026` (fichas en `retos/`) |
| Definir alcance y construir la app | `prototipo-4-pantallas` |
| Elegir y consumir datos NASA | `nasa-data` |
| Colores, tipografía y temas | `tokens-diseno` |
| Prompt para Google Stitch, Lovable o v0 | `prompt-prototipado` (guías en `prompts/`) |
| Idea de un niño o demo con niños | `mision-cadete` |
| Publicar con link (cualquier herramienta) | `deploy-vercel` (guía del kit; para la mecánica del CLI usa `deploy-to-vercel`) |
| Pitch y autoevaluación | `pitch-space-apps` |
| Pulir UI y UX | Ver `docs/ui-skills.md` (frontend-ui-engineering, web-design-guidelines, Emil Kowalski, Impeccable, UI UX Pro Max, Vercel React) |

Las skills viven en `.agents/skills/` (Codex). `.claude/skills/` es una copia generada para Claude Code.

## Comandos del kit

```bash
npm run tokens       # regenera design-tokens/build/ desde tokens.json y valida contraste WCAG
npm run skills:sync  # copia .agents/skills → .claude/skills
npm run skills:lock  # recalcula hashes de skills de terceros en docs/ui-skills.lock.json
npm run check        # tokens al día + contraste + hashes del lock + espejo de skills
```

No requieren `npm install` (solo Node 20+). La app del equipo tiene su propio `package.json` dentro de `app/`.

## Al modificar el kit

- Skills: edita en `.agents/skills/`, luego `npm run skills:sync`. No edites skills de terceros salvo para adaptaciones registradas en el lock.
- Tokens: edita `design-tokens/tokens.json`, luego `npm run tokens`. Nunca edites `design-tokens/build/` a mano.
- Fichas de retos (`retos/`): el brief oficial manda; cita la URL de cada recurso.
- Corre `npm run check` antes de hacer commit.
