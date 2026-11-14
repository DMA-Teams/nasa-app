# 9 · Harmonization of MODIS and VIIRS Hot Spots

**Nivel:** Avanzado · Intermedio · **Temas:** Ciencias de la Tierra, Software
**Tema visual:** `tierra` u `orbita` · **Brief oficial:** https://www.spaceappschallenge.org/2026/challenges/modis-and-viirs-hot-spots/

## Qué pide NASA

Dos partes: (1) **armonizar** los focos de calor de MODIS (desde 2000) y VIIRS (desde 2012, más detalle) para que el sensor de origen ya no importe, y (2) una **app web con un calendario de actividad de quemas** desde inicios de los 2000 hasta hoy, donde el usuario elige región y fechas y descarga análisis y visualizaciones.

## Bájalo a una persona

- **Persona:** técnico regional del ICF (Instituto de Conservación Forestal) en Olancho.
- **Situación:** cada temporada seca (febrero–mayo) hay quemas agrícolas e incendios en pinares, y humo que llega a SPS y Tegucigalpa.
- **Dificultad:** no puede comparar este año con años anteriores, porque los datos de MODIS y VIIRS no son comparables tal cual.
- **Consecuencia:** las brigadas se planifican tarde y sin saber qué semanas son críticas.

## Datos NASA (motor)

| Fuente | Para qué | Acceso |
|---|---|---|
| FIRMS | Focos MODIS y VIIRS (archivo histórico y casi tiempo real) | https://www.earthdata.nasa.gov/data/tools/firms |
| FIRMS API por área | Focos recientes por bounding box | `https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/VIIRS_SNPP_NRT/-89.4,12.9,-83.1,16.5/2` |
| FIRMS descarga por país | Histórico de Honduras por año y sensor (CSV) | Sección "Download" de FIRMS (archivo por país) |

**Método de armonización sugerido** (explícalo en el pitch): agrega ambos sensores a una cuadrícula común (por ejemplo, celdas de 0.1° por día), filtra por confianza y calcula un factor de conversión VIIRS→MODIS por región y mes en los años en que ambos se superponen (2012 en adelante).

## Las 4 pantallas

1. **Entrada:** elige departamento o dibuja un área y un rango de años.
2. **Procesamiento:** calendario tipo "heatmap" (semanas × años) con focos armonizados + "Fuente: NASA FIRMS (MODIS + VIIRS armonizados)".
3. **Resultado:** semanas críticas, anomalía de este año contra el promedio y tendencia.
4. **Acción:** descargar CSV/PNG o reporte para planificar brigadas.

## Según tu equipo

- **Nivel 3 (v0):** calendario con datos precalculados para Honduras y FIRMS en vivo para "esta semana".
- **Dev:** pipeline en Python (pandas/geopandas) para armonizar, validación en años de superposición y API de agregados.

## Semilla para el prompt

```
Reto: Harmonization of MODIS and VIIRS Hot Spots (NASA Space Apps 2026).
Usuario: [técnico del ICF en (departamento)].
Datos: focos MODIS (2001–2025) y VIIRS (2012–2025) de NASA FIRMS para Honduras, armonizados por celda y semana.
Momento de valor: ver en un calendario que [semana X de abril] es la más crítica desde 2001, y si este año va peor.
```

## Trampas comunes

- Mezclar sensores sin explicar el ajuste: la armonización ES el reto.
- Usar el API por área para 20 años: descarga el archivo histórico.
- Contar focos ≠ hectáreas quemadas: dilo como límite.
