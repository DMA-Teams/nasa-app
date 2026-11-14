# Mi Parcela

Rotación de cultivos para pequeños agricultores de Honduras, con datos de NASA POWER.
NASA Space Apps Challenge 2026 · Reto 7: Field Shift.

## Arrancar

```bash
npm install
npm run dev        # http://localhost:3000
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (lo mismo que corre Vercel) |
| `npm run lint` · `npm run typecheck` | Revisar antes de hacer push |
| `npm run datos` | Vuelve a bajar NASA POWER para los 41 cuadros y regenera `celdas.json` y `departamentos.json` en `public/fallback/` |
| `npm run departamentos` | Solo regenera `departamentos.json` (clima por departamento) |

No hace falta ninguna API key: NASA POWER es abierta.

## Cómo funciona

Una sola pantalla: el mapa siempre visible y un panel que avanza por pasos.

```
Inicio (mapa 3D, capas clima/altura) → Estás aquí → 1 Clima → 2 Cultivos → 3 Tierra → 4 Plan
```

## Mapa del código

| Archivo | Qué es | Dueño |
|---|---|---|
| `lib/tipos.ts` | **El contrato de datos.** Si lo cambias, avisa a todos. | Todos |
| `components/Explorador.tsx` | Estado de la app y navegación entre pasos | A |
| `components/MapaReal.tsx` | Mapa MapLibre: satélite NASA, relieve 3D, departamentos, capas | A |
| `lib/colores.ts` | Colores del mapa (derivados de los tokens del tema Tierra) | A |
| `lib/geo.ts` | Punto dentro de polígono (¿en qué departamento cayó el toque?) | B |
| `scripts/generar-departamentos.ts` | Asigna a cada departamento el clima de los cuadros que caen dentro | B |
| `components/Panel*.tsx`, `components/modulos/*` | Paneles de cada paso | A |
| `components/ui.tsx` | Botones, chips, íconos | A |
| `app/api/clima/route.ts` | `GET /api/clima?lat=&lon=`: NASA POWER en vivo, cache de días y respaldo | B |
| `lib/clima.ts` | Convierte NASA POWER en el clima de una zona (pura, la usan la API y el script) | B |
| `lib/mapa.ts` | Cuadrícula, contorno de Honduras y lugares de referencia | B |
| `scripts/generar-celdas.ts` | Genera `public/fallback/celdas.json` | B |
| `lib/motor.ts` | Puntaje de rotaciones, semáforo, "por qué" y plan | C |
| `data/reglas.json`, `data/rotaciones.json` | Reglas por cultivo y rotaciones posibles | C |

## Mapa

- **Imagen satelital:** NASA Blue Marble vía [NASA GIBS](https://gibs.earthdata.nasa.gov) (sin key, hasta zoom 8).
- **Relieve 3D y capa Altura:** Mapzen Terrain Tiles en AWS (incluye SRTM de NASA). La altura del punto elegido sale de aquí cuando el 3D está activo.
- **Departamentos:** geoBoundaries HND ADM1 (OpenStreetMap, ODbL), en `scripts/fuentes/`.
- MapLibre 6 dibuja en un worker: `predev`/`prebuild` lo copian a `public/maplibre/` (ignorado por git).
- Sin internet no cargan la imagen ni el relieve, pero los departamentos y todos los datos siguen funcionando.

## Datos

- **NASA POWER** (comunidad AG), diario 2015–2025: `PRECTOTCORR` (lluvia), `EVPTRNS` (evaporación), `T2M_MAX` (temperatura). La altura de cada cuadro también viene de NASA POWER.
- `EVPTRNS` viene en **MJ/m²/día**: se divide entre 2.45 para tenerlo en mm (`lib/clima.ts`).
- NASA POWER trabaja en cuadros de 0.5° × 0.625°, así que algunos cuadros vecinos del mapa comparten dato.
- Tipo de zona: **lluviosa** si llueven 2,000 mm o más al año; **seca** si en julio llueve menos del 70 % que en junio y septiembre (canícula); **equilibrada** el resto.
- Respaldo: si NASA POWER no responde, la API usa `public/fallback/celdas.json`. Para probarlo: `/api/clima?lat=14.25&lon=-88.75&respaldo=1`.

## Lo que es simulado

- La proyección "Tu tierra en 3 años" es un índice de reglas, no una medición. La pantalla lo dice.
- Los valores de `data/reglas.json` son iniciales: revisarlos con FAO ECOCROP o un técnico y citar la fuente.

## Pendientes sugeridos

- **A:** pulir en el celular (etiquetas de departamentos al alejar, tamaño del panel).
- **B:** revisar los nombres de lugar; imagen satelital con más detalle para zoom alto.
- **C:** revisar reglas con fuentes; temporadas propias para la zona norte (apante); textos del pitch.
