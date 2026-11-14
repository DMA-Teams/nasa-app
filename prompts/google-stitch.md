# Google Stitch (Nivel 2: pantallas navegables)

Ideal si tu equipo **no programa**. Stitch genera diseños de interfaz desde texto o desde una imagen; luego los exportas a Figma o a código.

## Antes de empezar

- Decide si es **app móvil** o **web**. Para Space Apps recomiendo móvil: el jurado lo abre en su celular y se ve más "producto".
- ¿Tienen un boceto en papel (Nivel 1)? **Tómale foto y súbela** junto con el prompt: Stitch respeta mucho mejor la estructura.
- Ten listo el bloque de tu tema: `design-tokens/build/<tema>.prompt.md`.

## Prompt inicial

Stitch entiende **pantallas**, no lógica. Describe qué se ve, con textos reales.

```
Diseña una app móvil en español para el NASA Space Apps Challenge 2026, reto "[nombre del reto]".
Nombre de la app: [nombre]. Propuesta de valor: "Ayudamos a [usuario] a [resultado] sin [dolor]".
Usuario: [persona concreta y lugar].

Pantalla 1 · Entrada — "[título]"
- [componente principal: mapa para marcar la parcela / buscador / selector de destino]
- [1–2 campos máximo], botón principal "[texto del botón]".

Pantalla 2 · Datos NASA — "[título]"
- [gráfica de línea / mapa / calendario] de [variable] de [periodo].
- Etiqueta visible: "Fuente: [dataset], NASA · datos de [fecha]".
- [2–3 indicadores pequeños con valores de ejemplo realistas].

Pantalla 3 · Resultado — "[título]"
- Indicador grande: "[ej. Riesgo alto]" con color y texto (no solo color).
- Explicación de 2 líneas: "[por qué]".

Pantalla 4 · Acción — "[título]"
- Botón principal "[acción]" [(simulado) si aplica] y resumen de lo que pasará.
- Opción secundaria "[compartir / descargar]".

[PEGA AQUÍ EL BLOQUE DEL TEMA VISUAL]
```

## Prompts de iteración (uno a la vez)

Stitch funciona mejor con cambios **pequeños y por pantalla**:

1. `En la pantalla 2, haz la gráfica el doble de alta y pon la etiqueta de fuente debajo, en texto secundario.`
2. `En la pantalla 3, el indicador de riesgo debe ocupar el ancho completo y verse en 2 segundos.`
3. `Usa en todas las pantallas la misma barra superior con el nombre de la app y un paso "1 de 4".`
4. `Cambia los textos de ejemplo por estos datos reales: [pega 3–4 valores reales de tu dataset].`
5. `Revisa contraste: el texto secundario debe leerse bien sobre las tarjetas.`

## Después de generar

1. Revisa que las 4 pantallas usen los mismos colores y la misma tipografía. Si una se desvió, pide: `Aplica a la pantalla X exactamente el estilo de la pantalla 1.`
2. **Exporta a Figma** y conecta las pantallas como prototipo (botón de pantalla 1 → pantalla 2, etc.). Ese link navegable es tu demo.
3. Si alguien del equipo programa, exporta el código y llévalo a v0 o a Claude Code para conectarlo a datos reales (Nivel 3).
4. Para el pitch, pon **datos reales** en las pantallas aunque estén escritos a mano: el jurado valora ver la cifra real del dataset.

## Si algo sale mal

- Diseño genérico: el bloque del tema no se pegó completo o le pediste demasiadas cosas a la vez.
- Inventó pantallas extra: `Elimina todo excepto las 4 pantallas descritas.`
- Textos en inglés: `Todos los textos visibles deben estar en español de Honduras.`
