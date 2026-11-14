---
name: prompt-prototipado
description: Escribe y pule el prompt inicial (y los prompts de iteración) para generar el prototipo de Space Apps en Google Stitch, Lovable o v0, con el reto, el usuario, el dataset NASA, las 4 pantallas y los tokens de diseño ya integrados. Úsala cuando un equipo vaya a usar Stitch, Lovable o v0, pida "hazme el prompt", quiera mejorar un prompt que no le dio buen resultado o necesite el siguiente prompt para corregir algo.
---

# Prompt para herramientas de prototipado

El primer prompt decide el 80 % del resultado. Tu trabajo es entregar un prompt **completo, concreto y en español** que el equipo solo tenga que pegar.

## Entradas (pregunta solo lo que falte, máximo 4 preguntas)

| Dato | De dónde sale |
|---|---|
| Reto | `retos/<NN>-<slug>.md` (skill `retos-2026`) |
| Usuario, dolor, momento de valor | Ficha de arranque de `prototipo-4-pantallas` |
| Dataset NASA y endpoint exacto | Skill `nasa-data` (prueba la URL antes de ponerla en el prompt) |
| Herramienta | Stitch, Lovable o v0 |
| Tema visual | `design-tokens/build/<tema>.prompt.md` (o `<tema>.css` para v0) |

## Proceso

1. Lee la guía de la herramienta: `prompts/google-stitch.md`, `prompts/lovable.md` o `prompts/v0.md`. Usa su plantilla de prompt inicial.
2. Rellena **todos** los corchetes. Textos reales en español, nada de lorem ipsum ni "usuario X".
3. Pega el bloque completo del tema al final (en v0, el CSS completo si cabe).
4. Si la herramienta llama a una API, incluye una muestra real de la respuesta (3–5 registros) para los datos de respaldo. Consíguela tú con una llamada real.
5. Entrega, en este orden:
   - La propuesta de valor en una frase.
   - El **prompt inicial** en un bloque de código.
   - Los **5 prompts de iteración** de la guía, ya adaptados al proyecto.
   - El checklist de revisión (abajo).
   - Si la herramienta es Lovable o v0: además, la versión para Stitch como plan B.

## Diferencias por herramienta

- **Stitch:** solo describe lo que se ve (layout, componentes, textos, estados). Nada de APIs ni lógica. Una sección por pantalla. Indica móvil o web.
- **Lovable:** app completa con rutas, flujo, endpoint, forma del JSON, respaldo y reglas del proyecto para su conocimiento persistente. Prohíbe explícitamente login y base de datos de usuarios.
- **v0:** Next.js App Router + TypeScript + Tailwind v4 + shadcn/ui, route handler en el servidor con cache, claves sin `NEXT_PUBLIC_`, y las variables de `<tema>.css` en `globals.css`.

## Checklist del resultado (entrégalo al equipo)

- [ ] Son exactamente 4 pantallas y se recorren sin escribir nada raro.
- [ ] La pantalla 2 muestra datos NASA con "Fuente: …" y fecha.
- [ ] Lo simulado dice "(simulado)".
- [ ] Se ve bien en un celular de 375 px.
- [ ] Colores y tipografía son los del tema en todas las pantallas.

## Cuando el resultado salió mal

Pide al equipo una captura o el texto del error. Responde con **un** prompt corto que arregle una sola cosa y diga qué conservar ("mantén exactamente los estilos actuales"). Si la herramienta entró en ciclo, recomienda revertir al último estado bueno y dividir el cambio.
