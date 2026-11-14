---
name: nasa-data
description: Encuentra y consume datos de NASA para un proyecto de Space Apps (clima, lluvia, incendios, eventos naturales, imágenes satelitales). Úsala cuando el equipo necesite elegir un dataset NASA, llamar una API de NASA, mostrar datos NASA en un mapa o gráfica, o justificar la fuente de datos ante el jurado.
---

# Datos NASA para Space Apps

Objetivo: que los datos NASA sean el **motor** del prototipo (criterio *Relevancia*), no un adorno.

## 1. Elige el dataset según el problema

| Necesitas… | Usa | Clave API | Por qué es buena para hackathon |
|---|---|---|---|
| Clima por coordenada (lluvia, temperatura, viento, radiación solar) | **NASA POWER** | No | REST simple, JSON, diario/mensual, desde 1981 |
| Incendios activos | **FIRMS** | MAP_KEY gratis | CSV por área y días, casi tiempo real |
| Eventos naturales (tormentas, volcanes, incendios, inundaciones) | **EONET v3** | No | JSON con coordenadas, ideal para mapas |
| Imagen satelital de fondo en un mapa | **GIBS (WMTS)** | No | Tiles listos para Leaflet/Mapbox |
| Buscar cualquier colección (GPM IMERG, MODIS, Landsat, SMAP…) | **CMR / Earthdata Search** | No para buscar; login Earthdata para descargar | Catálogo oficial |
| Foto astronómica del día, asteroides, Marte | **api.nasa.gov** | `DEMO_KEY` para pruebas | Divertido para demos |

Primero revisa los **recursos que trae el reto oficial**: suelen indicar el dataset esperado. La ficha de cada reto en `retos/` ya los resume.

### Datos por reto 2026 (detalle en `retos/<NN>-*.md`)

| Reto | Motor de datos | Acceso más rápido |
|---|---|---|
| 1 Abandoned but not Forgotten | NASA Image and Video Library, NSSDCA | `https://images-api.nasa.gov/search?q=...` (sin clave) |
| 2 Trend Detective | NASA POWER mensual, Giovanni, AppEEARS | POWER `temporal/monthly/point` |
| 3 Junior Astronaut | DONKI (avisos de llamaradas, CME, GST), RadLab | `https://api.nasa.gov/DONKI/notifications?type=FLR&...` o `.../DONKI/CME?...` (el 14/11/2026 `DONKI/FLR` daba 404) |
| 4 Lunar Landing Site | JPL Horizons, Moon Trek, LROC Quickmap | `https://ssd.jpl.nasa.gov/api/horizons.api` |
| 5 Health Monitoring | Riesgos HRP, OSDR | Contenido de referencia; datos del astronauta simulados |
| 6 Dancing with the SARs | NISAR vía ASF Vertex | Preprocesar offline un área pequeña |
| 7 Field Shift | NASA POWER (AG), SMAP, NDVI MODIS/Landsat, ECOSTRESS | POWER diario + AppEEARS |
| 8 Flame in Freefall | NASA PSI (combustión) | Corpus curado en JSON |
| 9 MODIS/VIIRS Hot Spots | FIRMS (MODIS + VIIRS) | Descarga histórica por país + API por área |
| 10 Earth Analogs | SRTM, MODIS, POWER, Mars/Moon Trek | AppEEARS + Trek |
| 11 Martian Map | Mars Trek, USGS, Perseverance raw | Capas WMTS de Mars Trek |
| 12 Planet X / SPHEREx | IRSA SPHEREx, Gaia | Recortes precalculados con los notebooks de IRSA |
| 13 Mission Design Game | CubeSat 101, Mission Viz | Valores en JSON con fuente |
| 14 Earth Jukebox | Earth Information Center (SVS) | Frames/videos de svs.gsfc.nasa.gov |

## 2. Llamadas listas (coordenadas de San Pedro Sula: lat 15.50, lon -88.03)

### NASA POWER (lluvia y temperatura diaria)
```
GET https://power.larc.nasa.gov/api/temporal/daily/point
    ?parameters=PRECTOTCORR,T2M,RH2M
    &community=AG
    &latitude=15.50&longitude=-88.03
    &start=20260101&end=20260131
    &format=JSON
```
- `PRECTOTCORR` = precipitación corregida (mm/día), `T2M` = temperatura a 2 m (°C), `RH2M` = humedad relativa (%).
- Valor `-999` significa sin dato: fíltralo.

### EONET (eventos naturales abiertos)
```
GET https://eonet.gsfc.nasa.gov/api/v3/events?status=open&category=wildfires&limit=50
GET https://eonet.gsfc.nasa.gov/api/v3/events?status=open&bbox=-89.5,17.5,-83.0,12.9
```

### FIRMS (incendios en Honduras, últimos días)
```
GET https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/VIIRS_SNPP_NRT/-89.4,12.9,-83.1,16.5/2
```
- Pide tu MAP_KEY gratis en el sitio de FIRMS. Guárdala en `.env` como `FIRMS_MAP_KEY`, nunca en el código.

### GIBS (capa satelital para Leaflet)
```
https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/{YYYY-MM-DD}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg
```

### CMR (buscar colecciones)
```
GET https://cmr.earthdata.nasa.gov/search/collections.json?keyword=GPM%20IMERG&page_size=5
```

## 3. Reglas al integrar

1. Llama a la API **desde el servidor** (route handler de Next.js o función serverless) si usa clave. Nunca expongas claves en el navegador.
2. **Cachea** las respuestas (por ejemplo `fetch(url, { next: { revalidate: 3600 } })`): el wifi del evento puede fallar.
3. Guarda un **JSON de respaldo** en `public/fallback/` con una respuesta real, y úsalo si la API falla durante el demo.
4. Muestra en la UI **el nombre del dataset y la fecha** de los datos ("Fuente: NASA POWER, enero 2026"). Eso suma *Validez* y *Relevancia*.
5. Si un dato es simulado, márcalo como "simulado" en pantalla. La honestidad suma con el jurado.

## 4. Cómo justificarlo en el pitch

Plantilla de una frase:
> "Usamos **[dataset]** de NASA, que mide **[variable]** con **[resolución/frecuencia]**, para **[qué calcula tu app]**."

Ejemplo:
> "Usamos NASA POWER, que da lluvia diaria por coordenada desde 1981, para comparar la lluvia de hoy con el histórico de cada finca."
