# 11 · Interplanetary Survival Guide: Martian Map

**Nivel:** Intermedio · **Temas:** Exploración humana, Marte, Planetas y Lunas, Software
**Tema visual:** `marte` · **Brief oficial:** https://www.spaceappschallenge.org/2026/challenges/interplanetary-survival-guide-martian-map/

## Qué pide NASA

Un mapa, herramienta o interfaz que un astronauta en Marte usaría durante una caminata de exploración (Marswalk), combinando información de varias misiones científicas de NASA: ruta y destino, condiciones del momento, seguridad y objetivos científicos. Sugiere incluir **al menos tres tipos de datos** (óptico, térmico, espectral, topográfico, geofísico...).

## Bájalo a una persona

- **Persona:** astronauta que sale a explorar el Monte Sharp (donde Curiosity estudió las formaciones "boxwork" en 2025).
- **Situación:** tiene 4 horas de oxígeno y un objetivo científico.
- **Dificultad:** la información está repartida en decenas de capas y misiones.
- **Consecuencia:** elige una ruta peligrosa o vuelve sin la muestra.

## Datos NASA (motor)

| Fuente | Para qué | Acceso |
|---|---|---|
| Mars Trek (JPL) | Capas de relieve (MOLA), imágenes (CTX, HiRISE), mineralogía | https://trek.nasa.gov/mars/ (WMTS: copia la URL de la capa desde la herramienta) |
| USGS mapas geológicos de Marte | Unidades geológicas | https://astrogeology-usgs.hub.arcgis.com/pages/interactive-maps-mars |
| Imágenes crudas de Perseverance | Vista del suelo en el destino | https://mars.nasa.gov/mars2020/multimedia/raw-images/ |
| Ruta propuesta de Curiosity | Referencia de cómo se ve un mapa de ruta | https://science.nasa.gov/resource/curiositys-proposed-path-up-mount-sharp/ |

## Las 4 pantallas

1. **Entrada:** elige el objetivo científico y el punto de partida (base o rover).
2. **Procesamiento:** mapa con 3 capas conmutables (relieve, imagen, mineralogía/térmica) y la ruta trazada + fuentes por capa.
3. **Resultado:** ruta recomendada: distancia, pendiente máxima, tiempo y consumo de oxígeno estimado, y puntos de interés.
4. **Acción:** "iniciar Marswalk": checklist y modo navegación paso a paso.

## Según tu equipo

- **Cadete:** "un mapa de Marte para explorar con mi astronauta y encontrar rocas raras".
- **Nivel 3 (Lovable/v0):** Leaflet con mosaicos de Mars Trek y waypoints dibujados a mano.
- **Dev:** ruta de menor costo sobre la pendiente del DEM (A* sobre la cuadrícula), con el oxígeno como restricción.

## Semilla para el prompt

```
Reto: Interplanetary Survival Guide: Martian Map (NASA Space Apps 2026).
Usuario: astronauta en [Monte Sharp / cráter Jezero] con [4 horas] de oxígeno.
Capas: relieve MOLA, imagen CTX/HiRISE y [mineralogía o térmica] de Mars Trek.
Momento de valor: ver la ruta segura hacia el objetivo con su pendiente y consumo de oxígeno.
```

## Trampas comunes

- Mapa bonito sin decisión: debe responder "¿por dónde voy y por qué?".
- Proyecciones: usa capas en la misma proyección que tu librería de mapas.
