# Skills de UI y UX: cuál usar y cuándo

Para equipos que construyen con **Claude Code** o **Codex**. Las mismas skills están en `.agents/skills/` (Codex) y `.claude/skills/` (Claude Code), fijadas por commit en [`ui-skills.lock.json`](ui-skills.lock.json).

## Prioridad en un hackathon

1. El flujo de 4 pantallas funciona de principio a fin.
2. Los datos NASA reales se ven en la pantalla 2.
3. Funciona en el celular y es accesible (teclado, contraste, foco).
4. Se ve intencional (tokens aplicados, jerarquía clara).
5. Movimiento y detalles finos.

No saltes a 4 o 5 si 1–3 no están. **Para de pulir 6 horas antes de entregar.** No cargues todas las skills a la vez: se duplican y a veces se contradicen.

## Mapa de skills

| Momento | Skill | Origen | Para qué |
|---|---|---|---|
| Construir pantallas | `frontend-ui-engineering` | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | Componentes, layout responsive, accesibilidad WCAG, estado. |
| Escribir React/Next | `vercel-react-best-practices` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Rendimiento: data fetching, bundle, renders. |
| Dirección visual | `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills) | Solo cuando se pida un rediseño o un look nuevo. Respeta el tema de `design-tokens/`. |
| Revisión rápida antes del demo | `web-design-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Revisa archivos contra las Web Interface Guidelines de Vercel. Descarga las reglas, así que necesita internet. |
| Interacción y acabado | `emil-design-eng` | [emilkowalski/skills](https://github.com/emilkowalski/skills) | Referencia principal de controles, tacto y calidad percibida. |
| Agregar animación | `animate` | Emil Kowalski | Movimiento con propósito; easing y duraciones correctas. |
| Revisar animaciones | `review-animations` | Emil Kowalski | Auditar el movimiento existente. |
| Quitar animación | `remove-animations` | Emil Kowalski | Acciones frecuentes que deben ser instantáneas. |
| Animación lenta o con tirones | `animation-performance` | Emil Kowalski | `transform`/`opacity`, capas, jank. |
| Se usa en celular | `mobile-native` | Emil Kowalski | Gestos, tamaños táctiles, sensación nativa. |
| Probar con contenido extremo | `break-ui` | Emil Kowalski | Textos largos, cifras enormes, listas vacías. |
| Explorar variantes | `prototype` | Emil Kowalski | Varias versiones de **un** componente con un selector visual. Solo se invoca a mano (`/prototype`). |
| Auditar o criticar una pantalla | `impeccable` | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | `audit` y `critique` por ruta o componente; `polish` solo si se pide. |
| Consultar patrones | `ui-ux-pro-max` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Buscador local de patrones de UX, tipografía y stacks (requiere Python 3). |

Fuera de UI, el lock también fija `deploy-to-vercel` (Vercel), que la skill `deploy-vercel` del kit usa para la mecánica del CLI.

Skills propias del kit relacionadas: `tokens-diseno` (temas y contraste), `prototipo-4-pantallas` (alcance), `prompt-prototipado` (Stitch, Lovable y v0).

## Conflictos conocidos

- **Movimiento:** Pro Max desaconseja cambios instantáneos en general; Emil recomienda quitar la animación en acciones repetidas. Decide según el uso real: nada de demoras en lo que el usuario hace muchas veces.
- **Estética:** `frontend-design` empuja a looks distintivos; en este kit el tema de `design-tokens/` manda. Un cambio de identidad requiere pedirlo explícitamente.
- **Catálogos:** Pro Max sugiere sistemas visuales completos; no generes uno nuevo por pantalla.

## Seguridad y configuración

- **Impeccable** incluye un launcher que descarga su motor (versión fijada `0.1.19`, verificado con SHA-256) en la primera ejecución. El launcher de este repo fija `IMPECCABLE_LIVE_COPY_AGENT=chat`: el modo Live sin ese valor puede iniciar un agente de línea de comandos externo con sandbox y aprobaciones desactivados. Mantenlo en `chat` u `off`. La telemetría está desactivada en `.impeccable/config.json`.
- **web-design-guidelines** descarga sus reglas desde GitHub en cada revisión.
- Ninguna de estas skills agrega dependencias al proyecto por sí sola. Cualquier librería nueva (Motion, etc.) debe justificarse por la tarea.

## Mantenimiento

- Edita o agrega skills **solo** en `.agents/skills/` y corre `npm run skills:sync` para copiarlas a `.claude/skills/`.
- Para actualizar una skill de terceros: revisa el diff del proveedor, copia el commit elegido, conserva licencias y adaptaciones, actualiza `commit` en el lock y corre `npm run skills:lock`.
- `npm run check` verifica los hashes del lock, el espejo de `.claude/skills/` y los tokens.

Adaptaciones locales registradas en el lock: la ruta del buscador en `ui-ux-pro-max/SKILL.md` y el comentario del launcher `impeccable/scripts/impeccable`. Las demás copias son idénticas a su commit de origen.
