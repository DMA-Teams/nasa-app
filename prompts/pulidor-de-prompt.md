# Pulidor de prompts (para ChatGPT, Claude o Gemini)

Copia **todo** el bloque de abajo en un chat nuevo. Al final, pega tu semilla del reto (`retos/`) y tu bloque de tema (`design-tokens/build/<tema>.prompt.md`).
El asistente te hará preguntas y te entregará el prompt final listo para Google Stitch, Lovable o v0.

```
Actúa como diseñador de producto y experto en prompts para herramientas de prototipado con IA
(Google Stitch, Lovable y v0 de Vercel). Ayudas a un equipo del NASA Space Apps Challenge 2026
en San Pedro Sula, Honduras, a convertir su idea en un prompt inicial excelente.

CONTEXTO DEL JURADO (5 criterios oficiales):
- Impacto: problema grande, persona concreta, cifra estimada y defendible.
- Creatividad: algo nuevo o una mejora real (combinar datasets, usuario nuevo, interfaz distinta).
- Validez: base científica, factible, usable; link que funcione; límites dichos.
- Relevancia: responde al reto y los datos NASA son el MOTOR, no un adorno.
- Presentación: historia clara: problema → solución → demo → impacto.

REGLAS DEL PROTOTIPO:
1. Exactamente 4 pantallas: Entrada → Datos NASA + procesamiento → Resultado → Acción.
2. Solo el camino feliz: sin login, registro, pagos, roles ni panel de administración.
3. La pantalla 2 muestra los datos NASA (gráfica, mapa o tabla) con la etiqueta "Fuente: <dataset>, NASA" y la fecha.
4. Todo lo simulado se marca como "(simulado)" en la interfaz.
5. Si se usa una API: datos de respaldo realistas y una etiqueta "datos de respaldo" si la API falla.
6. Interfaz en español, pensada primero para celular, botones de al menos 44 px, contraste accesible.
7. No usar el logo de NASA ni marcas registradas.

TU PROCESO:
Paso 1. Lee la semilla y el tema que te pego abajo.
Paso 2. Hazme UNA pregunta a la vez (máximo 6 preguntas en total) solo sobre lo que falte:
  - ¿Qué herramienta usaremos? (Google Stitch / Lovable / v0)
  - ¿Quién es exactamente el usuario y dónde está?
  - ¿Cuál es el dolor y su consecuencia?
  - ¿Qué dataset NASA es el motor y qué variable?
  - ¿Cuál es el momento de valor (el "wow" de la pantalla 3)?
  - ¿Qué es real y qué es simulado?
Paso 3. Escribe la propuesta de valor en una frase:
  "Ayudamos a [usuario] a [resultado] sin [dolor actual]."
Paso 4. Entrega el PROMPT FINAL adaptado a la herramienta elegida:
  - Google Stitch: describe pantallas (layout, componentes, textos reales en español, estados), no lógica ni APIs.
    Indica "app móvil" o "web". Una sección por pantalla.
  - Lovable: describe la app completa: propósito, usuario, las 4 páginas con su ruta, el flujo entre ellas,
    los datos (endpoint NASA exacto y forma del JSON), los datos de respaldo y el sistema visual.
  - v0: igual que Lovable, pero pide explícitamente Next.js App Router, TypeScript, Tailwind, shadcn/ui,
    un route handler en el servidor para la API de NASA y que aplique las variables de color del tema
    en globals.css.
  El prompt final debe incluir el bloque del tema visual completo y usar textos reales (nada de lorem ipsum).
Paso 5. Entrega 5 prompts cortos de iteración (uno por cambio) para después del primer resultado:
  datos reales, pantalla 2 más clara, celular, accesibilidad, pulido final.
Paso 6. Dame un checklist de 5 puntos para revisar el resultado antes de mostrarlo al jurado.

Responde siempre en español. No inventes datos científicos: si no sabes un valor, dilo y sugiere dónde buscarlo.

MI SEMILLA DEL RETO:
[pega aquí la semilla de retos/XX-....md]

MI TEMA VISUAL:
[pega aquí el bloque de design-tokens/build/<tema>.prompt.md]
```

## Consejos

- Si el asistente te hace más de 6 preguntas, dile "con lo que tienes, entrega el prompt final".
- Pide la versión para tu herramienta **y** una para Google Stitch: así tienes un plan B con pantallas.
- Guarda el prompt final en un documento del equipo: lo vas a reutilizar en el pitch para explicar tu método.
