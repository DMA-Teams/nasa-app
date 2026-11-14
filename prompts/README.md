# Prompts para prototipar con Google Stitch, Lovable y v0

Para equipos que **no van a programar** o que quieren un primer prototipo en minutos.
Si usas Claude Code o Codex, no necesitas esta carpeta: el agente usa las skills del repo.

## El camino en 5 pasos (30 minutos)

1. **Elige tu reto** en [`retos/`](../retos/README.md) y copia la "Semilla para el prompt" de su ficha.
2. **Elige tu tema visual** en [`design-tokens/build/`](../design-tokens/build/): abre `<tema>.prompt.md` y copia el bloque.
   `orbita` (oscuro, datos), `tierra` (claro, campo), `marte` (exploración), `cadete` (niños).
3. **Pule el prompt** pegando [`pulidor-de-prompt.md`](pulidor-de-prompt.md) en ChatGPT, Claude o Gemini, junto con tu semilla y tu tema. Te hará unas preguntas y te devolverá el prompt final para tu herramienta.
4. **Pega el prompt final** en tu herramienta siguiendo su guía:
   - [Google Stitch](google-stitch.md): pantallas navegables (Nivel 2). Ideal si nadie programa.
   - [Lovable](lovable.md): app funcional con link público (Nivel 3).
   - [v0 de Vercel](v0.md): app en Next.js con link público (Nivel 3), ideal si alguien sabe algo de código.
5. **Itera con prompts cortos**, uno por cambio. Cada guía trae la secuencia de prompts 2 a 6.
6. **Publica tu link** con [`publicar.md`](publicar.md): en cuanto tengas las 4 pantallas, no al final.

¿Vas a hacer el demo con un niño o tu equipo es de niños? Usa [`mision-cadete.md`](mision-cadete.md).

## Las 6 reglas de un buen primer prompt

1. **Una persona concreta**, no "usuarios": "productor de maíz en Lempira".
2. **Exactamente 4 pantallas**: Entrada → Datos NASA + procesamiento → Resultado → Acción.
3. **El dataset NASA con nombre** y una etiqueta visible "Fuente: …" en la pantalla 2.
4. **Solo el camino feliz**: sin login, sin registro, sin pagos, sin panel de administración.
5. **Lo simulado, marcado**: "botón Enviar alerta (simulado)".
6. **El sistema visual completo** (el bloque del tema) para que no salga "con cara de plantilla".

## Errores que gastan créditos

- Pedir 10 cambios en un solo mensaje: la herramienta hace 6 y rompe 2.
- Escribir "hazlo más bonito": di exactamente qué ("títulos más grandes, más espacio entre tarjetas").
- Regenerar todo cuando algo falla: pide arreglar **una** cosa y describe el error tal cual lo ves.
- Agregar login "porque sí": cuesta horas y no suma puntos.
