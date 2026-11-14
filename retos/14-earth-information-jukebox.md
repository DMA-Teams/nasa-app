# 14 · The Earth Information Jukebox

**Nivel:** Intermedio · Principiante/Juvenil · **Temas:** Artes y multimedia, Ciencias de la Tierra, Software
**Tema visual:** `cadete` u `orbita` · **Brief oficial:** https://www.spaceappschallenge.org/2026/challenges/the-earth-information-jukebox/

## Qué pide NASA

Una experiencia "Earth Jukebox" que genere **sonificaciones dinámicas** a partir de las visualizaciones del Earth Information Center (EIC) de NASA: el usuario elige una visualización y la escucha como paisaje sonoro. Puede ser una herramienta interactiva o una colección curada de audios. Se pueden analizar colores, formas o densidad de píxeles y mapearlos a tono, tempo o instrumentos.

## Bájalo a una persona

- **Persona:** estudiante ciego de secundaria en San Pedro Sula.
- **Situación:** en clase hablan de las corrientes oceánicas y del CO₂ con mapas animados.
- **Dificultad:** toda la ciencia de la Tierra se comunica con imágenes.
- **Consecuencia:** queda excluido de entender el cambio del planeta.

(Este enfoque de accesibilidad sube mucho el **Impacto**.)

## Datos NASA (motor)

| Fuente | Para qué | Acceso |
|---|---|---|
| Galería EIC (Scientific Visualization Studio) | Las visualizaciones a sonificar (frames y videos descargables) | https://svs.gsfc.nasa.gov/gallery/earth-information-center/ |
| Ejemplo de sonificación (Caldwell 73) | Referencia de NASA | https://svs.gsfc.nasa.gov/13786/ |
| Luces nocturnas 2012–2023 | Buena visualización para empezar | https://svs.gsfc.nasa.gov/5313/ |
| Corrientes y temperatura del mar | Visualización con movimiento | https://svs.gsfc.nasa.gov/3912/ |
| CO₂ global (DYAMOND) | Visualización de gases | https://svs.gsfc.nasa.gov/5196/ |

## Las 4 pantallas

1. **Entrada:** elige una visualización de la "rocola" (portadas grandes, navegable con teclado y lector de pantalla).
2. **Procesamiento:** la animación del EIC con la regla de sonificación visible: "más rojo = más agudo; más brillo = más volumen" + "Fuente: NASA EIC / SVS".
3. **Resultado:** el paisaje sonoro sincronizado con los frames y una narración corta de qué estás escuchando.
4. **Acción:** descargar el audio, compartirlo o comparar dos años "de oído".

## Según tu equipo

- **Cadete:** "una rocola que suena como la Tierra".
- **Nivel 3 (Lovable/v0):** Web Audio API o Tone.js: extraer el color promedio por frame con `<canvas>` y mapearlo a notas.
- **Dev:** análisis por regiones del frame (por ejemplo, 8 franjas = 8 voces), escala musical fija para que suene bien y modo accesible completo.

## Semilla para el prompt

```
Reto: The Earth Information Jukebox (NASA Space Apps 2026).
Usuario: [estudiante con discapacidad visual].
Visualizaciones: [luces nocturnas 2012–2023, corrientes oceánicas] del Earth Information Center de NASA (svs.gsfc.nasa.gov).
Regla de sonificación: [color → tono, brillo → volumen, movimiento → tempo], en escala pentatónica.
Momento de valor: "escuchar" cómo crecen las luces de las ciudades con los años.
```

## Trampas comunes

- Ruido en vez de música: usa una escala fija (pentatónica) y un tempo estable.
- Olvidar la accesibilidad: si tu usuario es ciego, la app debe funcionar sin mirar.
