# Surco

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
Inicio (mapa + departamento → municipio, "Usar mi ubicación" o tocar el mapa)
  └─ Lugar elegido
       ├─ Ver cómo es el clima aquí ─┐
       │                              ▼
       └─ Armar mi plan ─► ¿Cómo? ─► Recomiéndame ─────────────► Plan del año
                                  └► Yo elijo mis cultivos ─────► (trimestres | semestres)
```

## Mapa del código

| Archivo | Qué es | Dueño |
|---|---|---|
| `lib/tipos.ts` | **El contrato de datos.** Si lo cambias, avisa a todos. | Todos |
| `components/Explorador.tsx` | Estado de la app y navegación entre pasos | A |
| `components/MapaReal.tsx` | Mapa MapLibre: satélite NASA, relieve 3D, departamentos, capas | A |
| `lib/colores.ts` | Colores del mapa (derivados de los tokens del tema Surco) | A |
| `lib/geo.ts` | Punto dentro de polígono (¿en qué departamento cayó el toque?) | B |
| `scripts/generar-departamentos.ts` | Asigna a cada departamento el clima de los cuadros que caen dentro | B |
| `components/Panel*.tsx`, `components/modulos/*` | Paneles de cada paso | A |
| `components/ui.tsx` | Botones, chips, íconos | A |
| `app/api/clima/route.ts` | `GET /api/clima?lat=&lon=`: NASA POWER en vivo, cache de días y respaldo | B |
| `lib/clima.ts` | Convierte NASA POWER en el clima de una zona (pura, la usan la API y el script) | B |
| `lib/mapa.ts` | Cuadrícula, contorno de Honduras y lugares de referencia | B |
| `scripts/generar-celdas.ts` | Genera `public/fallback/celdas.json` | B |
| `lib/api.ts` | **Única puerta a los datos**: municipios, clima y plan, con respaldo local | B |
| `lib/calendario.ts` | Motor del plan: pone cada cultivo en sus meses según la zona (puro) | C |
| `lib/plan.ts` | Agrupa el plan en trimestres o semestres, con el consejo y el porqué de cada periodo (puro) | C |
| `lib/municipios.ts` | Municipios de un departamento y el más cercano a un punto (puro) | B |
| `lib/textos.ts` | Meses y nombres de cultivos | Todos |
| `lib/motor.ts` | Reglas cargadas del JSON y el plan con el motor local | C |
| `data/reglas.json` | Calendario de siembra por cultivo y zona, y cultivos recomendados por zona | C |
| `tests/` | Pruebas de las funciones puras: `npm test` | Todos |

## Contrato con el backend

Los tipos están en `lib/tipos.ts` y son el contrato: la API devuelve esos objetos tal cual. Las pantallas solo usan `lib/api.ts`; para conectar un endpoint, pon su bandera en `USAR_API` en `true`. Si la API falla, la app usa el respaldo local.

| Endpoint | Pide | Devuelve | Bandera | Respaldo |
|---|---|---|---|---|
| `GET /api/municipios?departamento=<nombre>` | nombre igual al de `departamentos.json` | `Municipio[]` | `USAR_API.municipios` | `public/fallback/municipios.json` |
| `GET /api/clima?lat=&lon=` | punto en Honduras | `ClimaZona` | siempre activa (ya existe) | `public/fallback/celdas.json` |
| `POST /api/plan` | JSON `PedidoPlan` | `PlanAnual` | `USAR_API.plan` | `lib/calendario.ts` con el clima del punto |

- `PlanAnual.meses` trae siempre **12 `MesPlan`**, de enero a diciembre. La API **no** agrupa: la app arma los trimestres o semestres con `agruparPlan` (`lib/plan.ts`), así que cambiar la vista no hace otra petición.
- `PedidoPlan.modo`: `"recomendado"` (la API elige los cultivos, `cultivos` llega vacío) o `"mis-cultivos"` (al menos un cultivo).
- `PlanAnual.simulado` es `true` mientras el calendario salga de reglas inventadas.

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

- El calendario de siembra de `data/reglas.json` (meses de siembra y duración por cultivo y zona) es inventado: revisarlo con FAO ECOCROP o un técnico y citar la fuente. El plan lo marca "(simulado)".
- `public/fallback/municipios.json` es una lista inventada de 105 municipios (cabeceras reales, coordenadas aproximadas). Para la lista completa, usar geoBoundaries HND ADM2 y poner `MUNICIPIOS_SIMULADOS` en `false` (`lib/municipios.ts`).

## Pendientes sugeridos

- **A:** pulir en el celular (etiquetas de departamentos al alejar, tamaño del panel).
- **B:** revisar los nombres de lugar; imagen satelital con más detalle para zoom alto.
- **C:** revisar reglas con fuentes; temporadas propias para la zona norte (apante); textos del pitch.
