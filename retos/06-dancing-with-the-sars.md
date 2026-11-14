# 6 · Dancing with the SARs

**Nivel:** Avanzado · Intermedio · **Temas:** Ciencias de la Tierra
**Tema visual:** `orbita` · **Brief oficial:** https://www.spaceappschallenge.org/2026/challenges/dancing-with-the-sars/

## Qué pide NASA

Una aplicación interactiva que use datos de **radar de apertura sintética (SAR) de la misión NASA-ISRO NISAR** para rastrear y visualizar uno o más tipos de cambio en la superficie: humedales, incendios, terremotos, agricultura, glaciares, subsidencia.

## Bájalo a una persona

- **Persona:** coordinadora de emergencias de un municipio del Valle de Sula.
- **Situación:** durante una tormenta tropical, el cielo está cubierto por días.
- **Dificultad:** los satélites ópticos no ven a través de las nubes; no sabe qué zonas ya están inundadas.
- **Consecuencia:** los albergues y rescates se dirigen a ciegas (como pasó con Eta e Iota en 2020).

**El radar ve a través de las nubes y de noche.** Esa es la historia: una crecida del Ulúa o del Chamelecón vista por radar.

## Datos NASA (motor)

| Fuente | Para qué | Acceso |
|---|---|---|
| ASF Vertex | Buscar y descargar productos NISAR por área y fecha | https://search.asf.alaska.edu/ (login Earthdata) |
| Guía de usuario NISAR | Qué producto usar (GCOV, GUNW…) | https://nisar-docs.asf.alaska.edu/ |
| Earthdata Search | Alternativa para buscar colecciones | https://search.earthdata.nasa.gov/search |
| Intro a SAR (Earthdata) | Explicar el método al jurado | https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/sar |
| ARSET | Tutoriales de inundación con SAR | https://appliedsciences.nasa.gov/get-involved/training |

Los archivos SAR son pesados: **procesa offline** un área pequeña (antes vs. después), exporta a GeoTIFF o PNG reproyectado y sirve eso en el mapa.

## Las 4 pantallas

1. **Entrada:** elige el municipio o dibuja un área y una fecha del evento.
2. **Procesamiento:** mapa con el control "antes / después" del radar y la máscara de agua detectada + "Fuente: NISAR (NASA-ISRO) vía ASF".
3. **Resultado:** km² inundados, comunidades y escuelas dentro de la mancha.
4. **Acción:** lista de prioridades para rescate o un mapa para compartir con protección civil.

## Según tu equipo

- **Nivel 3 (v0):** mapa Leaflet con capas PNG precalculadas y un slider.
- **Dev:** Python (`asf_search`, `rasterio`), umbral de retrodispersión para el agua, comparación de dos fechas; documenta el umbral como método.

## Semilla para el prompt

```
Reto: Dancing with the SARs (NASA Space Apps 2026).
Usuario: [coordinadora de emergencias en (municipio)].
Cambio a visualizar: [inundación / deforestación / subsidencia] en [lugar], [fecha antes] vs [fecha después].
Datos: NISAR (NASA-ISRO SAR) desde ASF Vertex, procesado a máscara de agua.
Momento de valor: ver la mancha de inundación aunque el cielo esté nublado.
```

## Trampas comunes

- Descargar escenas completas durante el hackathon: elige un área pequeña desde el inicio.
- Explicar SAR con fórmulas: explícalo con la analogía "el radar es una linterna que atraviesa nubes".
