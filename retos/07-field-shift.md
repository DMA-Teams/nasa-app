# 7 · Field Shift: Adapting Farms with NASA Data

**Nivel:** Avanzado · Intermedio · **Temas:** Artes y multimedia, Ciencias de la Tierra, Software
**Tema visual:** `tierra` · **Brief oficial:** https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/

## Qué pide NASA

Una herramienta de apoyo a decisiones que combine observaciones de la Tierra de NASA con información local de suelo, cultivos y prioridades del agricultor para **explorar estrategias de rotación de cultivos** que mejoren la salud del suelo y la resiliencia. El brief sugiere comparar al menos tres rotaciones (incluida la actual) y explicar por qué se sugiere cada una, qué evidencia la respalda, qué beneficios da, qué información falta y qué riesgos deben revisar expertos locales.

## Bájalo a una persona

- **Persona:** productor de maíz y frijol en el Corredor Seco (por ejemplo, Lempira o Choluteca).
- **Situación:** la canícula (veranillo de julio–agosto) es cada vez más larga e incierta.
- **Dificultad:** siembra lo mismo de siempre y no sabe qué alternativas aguantan mejor la sequía o mejoran su suelo.
- **Consecuencia:** pierde la primera cosecha y su suelo se degrada cada año.

Opciones locales para comparar: maíz-frijol tradicional, maíz con sorgo (tolera sequía), maíz con frijol abono/mucuna como cobertura, y el sistema agroforestal Quesungual (originario de Lempira).

## Datos NASA (motor)

| Fuente                    | Para qué                                                             | Acceso                                                                                                                                                                             |
| ------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NASA POWER (comunidad AG) | Lluvia, temperatura, evapotranspiración y radiación diaria por finca | `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR,T2M_MAX,EVPTRNS&community=AG&latitude=14.30&longitude=-88.60&start=20150101&end=20251231&format=JSON` |
| SMAP                      | Humedad del suelo                                                    | Vía AppEEARS: https://appeears.earthdatacloud.nasa.gov/                                                                                                                            |
| MODIS / Landsat (NDVI)    | Estrés de la vegetación por temporada                                | AppEEARS o https://earthexplorer.usgs.gov/                                                                                                                                         |
| GPM IMERG                 | Lluvia satelital de alta resolución                                  | https://gpm.nasa.gov/data                                                                                                                                                          |
| ECOSTRESS                 | Estrés térmico y evapotranspiración                                  | https://ecostress.jpl.nasa.gov/data                                                                                                                                                |
| SRTM                      | Pendiente (riesgo de erosión)                                        | https://www.earthdata.nasa.gov/data/instruments/srtm                                                                                                                               |
| FAO GAEZ                  | Aptitud de cultivos (fuera de EE. UU.)                               | https://gaez.fao.org                                                                                                                                                               |

Los recursos de suelo del brief (SSURGO, Web Soil Survey) son de EE. UU.; para Honduras usa FAO GAEZ o SoilGrids y dilo.

## Las 4 pantalla

1. **Entrada:** el productor marca su parcela y elige su rotación actual y su prioridad (agua, ingreso, suelo).
2. **Procesamiento:** calendario de lluvia y canícula de los últimos 10 años en su punto (NASA POWER), meses con suelo desnudo y estrés.
3. **Resultado:** 3 rotaciones comparadas en tarjetas: uso de agua, cobertura del suelo, riesgo, por qué y con qué evidencia.
4. **Acción:** plan de siembra por temporada (primera / postrera) para hablar con su técnico agrícola.

## Según tu equipo

- **Nivel 2 (Stitch):** las 3 tarjetas de comparación en móvil, tema `tierra`.
- **Nivel 3 (Lovable/v0):** NASA POWER en vivo + reglas simples por cultivo en JSON.
- **Dev:** índice de déficit hídrico (lluvia − evapotranspiración) por quincena, cruce con el calendario de cada rotación y explicación generada desde el cálculo.

## Semilla para el prompt

```
Reto: Field Shift: Adapting Farms with NASA Data (NASA Space Apps 2026).
Usuario: productor de [maíz y frijol] en [municipio del Corredor Seco], Honduras.
Rotaciones a comparar: [actual], [alternativa 1], [alternativa 2].
Datos: NASA POWER (PRECTOTCORR, T2M_MAX, EVPTRNS) diario 2015–2025 en su parcela.
Momento de valor: ver qué rotación deja su suelo cubierto durante la canícula.
```

## Trampas comunes

- Recomendar como si fueras agrónomo: es una herramienta de exploración, no reemplaza al técnico (el brief lo pide).
- Datos de EE. UU. aplicados a Honduras sin decirlo.
