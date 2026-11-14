# 2 · Be An Earth System Trend Detective!

**Nivel:** Avanzado · **Temas:** Ciencias de la Tierra, Software
**Tema visual:** `orbita` · **Brief oficial:** https://www.spaceappschallenge.org/2026/challenges/earth-system-trend-detective/

## Qué pide NASA

Elegir variables medidas por misiones NASA o producidas por sus modelos, visualizar cómo cambian en el tiempo y decir **qué cambia, dónde, cuánto y si el cambio es estadísticamente significativo** (t-test, Mann-Kendall, etc.). Ojo: la misma variable puede subir en una región y bajar en otra.

## Bájalo a una persona

- **Persona:** técnico municipal de gestión de riesgo en Choluteca (Corredor Seco).
- **Situación:** cada año le preguntan si "está lloviendo menos que antes".
- **Dificultad:** solo tiene opiniones y algunos datos sueltos de estación.
- **Consecuencia:** los planes de agua y siembra se basan en percepciones, no en evidencia.

Historia ganadora: **comparar dos regiones de Honduras** (Caribe húmedo vs. Corredor Seco) donde la lluvia o la temperatura tienden en direcciones distintas.

## Datos NASA (motor)

| Fuente | Para qué | Acceso |
|---|---|---|
| NASA POWER | Lluvia, temperatura y humedad mensual por punto desde 1981 | `https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=PRECTOTCORR,T2M&community=AG&latitude=13.30&longitude=-87.19&start=1981&end=2025&format=JSON` |
| Giovanni | Series de tiempo de áreas (GPM IMERG, MERRA-2, MODIS) exportables a CSV | https://giovanni.gsfc.nasa.gov/ (requiere login Earthdata) |
| AppEEARS | Extraer MODIS/VIIRS/SMAP por punto o polígono | https://appeears.earthdatacloud.nasa.gov/ |
| Hydrology Time Series (GES DISC) | Series hidrológicas listas | https://disc.gsfc.nasa.gov/information/tools?title=Hydrology%20Time%20Series |

Empieza con NASA POWER (no necesita clave). Precalcula y guarda los resultados en JSON: no hagas estadística en el navegador durante el demo.

## Las 4 pantallas

1. **Entrada:** elige variable, región (mapa) y periodo.
2. **Procesamiento:** serie de tiempo + anomalías + línea de tendencia. Nombre del dataset y método visibles.
3. **Resultado:** "La lluvia en Choluteca bajó X mm/década (Mann-Kendall p = 0.03, significativa)". Comparación con la otra región.
4. **Acción:** descargar ficha PDF/PNG para el plan municipal o compartir el hallazgo.

## Según tu equipo

- **Nivel 2 (Stitch):** pantallas con datos reales precalculados por alguien del equipo en una hoja de cálculo.
- **Nivel 3 (v0):** API route a NASA POWER + Recharts + Mann-Kendall en el servidor.
- **Dev:** Python (pandas + `pymannkendall`) para precalcular, mapa de pendientes significativas con máscara, explicación en lenguaje natural **generada desde los números calculados**, nunca inventada.

## Semilla para el prompt

```
Reto: Be An Earth System Trend Detective! (NASA Space Apps 2026).
Usuario: [técnico de riesgo en (municipio)].
Variable: [PRECTOTCORR lluvia mensual de NASA POWER] en [región A] vs [región B], 1981–2025.
Método: pendiente de Sen + prueba Mann-Kendall (p < 0.05).
Momento de valor: ver que la misma variable sube en una región y baja en la otra, con su significancia.
```

## Trampas comunes

- Diez variables a medias: elige una y hazla rigurosa.
- Ignorar la estacionalidad: usa anomalías mensuales o Mann-Kendall estacional.
- Confundir "significativo" con "grande": muestra la magnitud y el p-valor por separado.
