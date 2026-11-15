# Plan anual (elegir lugar → información o plan) · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar la marca Surco y cambiar la app al recorrido nuevo: elegir lugar (departamento → municipio, ubicación o mapa) → ver información del lugar o armar un plan de un año (recomendado o con mis cultivos), visible por trimestres o semestres.

**Architecture:** La lógica del plan vive en funciones puras sin imports de runtime (`lib/textos.ts`, `lib/calendario.ts`, `lib/plan.ts`, `lib/municipios.ts`), probadas con `node --test` (Node 24 ejecuta TypeScript directo). `lib/api.ts` es la única puerta a los datos: hoy usa respaldo local, mañana la API del compañero. `components/Explorador.tsx` sigue siendo la pantalla única con mapa + panel por pasos.

**Tech Stack:** Next.js 16.4 (App Router), React 19.3, TypeScript, Tailwind v4, MapLibre 6, `node:test` (sin dependencias nuevas).

**Spec:** `docs/superpowers/specs/2026-11-14-plan-anual-design.md`

## Global Constraints

- Interfaz y comentarios en español. Frases cortas y sencillas: el usuario es un agricultor con poca escuela.
- Todo lo inventado se marca "(simulado)" en pantalla. Datos NASA visibles con nombre del dataset y fecha.
- Marca **Surco** (kit en `C:\Users\Home\Downloads\surco-kit-de-marca\surco-kit-de-marca\`, guía en `GUIA-DE-MARCA.md`): nombre "Surco", tema `surco` de `design-tokens/` (Task 0b), tipografía Inter. Piezas existentes: `components/ui.tsx` y `components/dibujos.tsx`. No inventar colores sueltos.
- Reglas de la guía: el maíz (`#F2B134`) nunca va como texto, solo como relleno, y cubre menos del 10 % de la pantalla; el logo no se estira, ni se rota, ni se recolorea, ni lleva sombras; usar siempre los archivos del kit.
- Sin dependencias nuevas. Sin claves en el cliente.
- Antes de escribir un route handler, leer `app/node_modules/next/dist/docs/` (ver `app/AGENTS.md`).
- Accesible: `<label>` en selectores, foco visible, objetivos táctiles ≥ 44 px, plan legible a 360 px sin scroll horizontal.
- Comandos desde `app/`: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`. Desde la raíz: `npm run check`.
- Mensajes de commit terminan con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Cultivo que cruza el fin de año** (maíz de apante sembrado en diciembre en zona lluviosa): debe aparecer en diciembre y en enero–marzo, no cortarse ni desbordar a un mes 13. → prueba en Task 3.
2. **Cultivo que cruza dos trimestres** (maíz mayo–agosto): aparece en T2 y en T3, y en ambos semestres si aplica. → prueba en Task 4.
3. **"Mis cultivos" con un solo cultivo** (solo frijol): el plan sale con muchos meses "descansar", no truena, y el resumen sugiere frijol abono para cubrir. → prueba en Task 3.
4. **Ubicación o toque cerca de la frontera entre departamentos:** el municipio resuelto debe ser del departamento donde cayó el punto, aunque uno del departamento vecino esté más cerca. → prueba en Task 2.
5. **Cambiar de departamento después de elegir municipio:** el selector de municipio se vacía y no queda un municipio de otro departamento. → verificación manual en Task 6.

---

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `app/lib/tipos.ts` | Contrato (modificar): tipos nuevos; al final se quitan los viejos |
| `app/lib/textos.ts` | **Nuevo.** `MESES`, `MESES_LARGOS`, `listaMeses`, `NOMBRE_CULTIVO`, `nombresCultivos` (sin imports de runtime) |
| `app/lib/calendario.ts` | **Nuevo.** `construirPlan(...)`: `PedidoPlan` + `ClimaZona` → `PlanAnual` |
| `app/lib/plan.ts` | **Nuevo.** `agruparPlan`, `textoWhatsApp` |
| `app/lib/municipios.ts` | **Nuevo.** `municipiosDe`, `municipioMasCercano` |
| `app/lib/motor.ts` | Se reduce a `REGLAS` (desde JSON) y `armarPlanLocal` |
| `app/lib/api.ts` | **Nuevo.** `obtenerMunicipios`, `obtenerClima`, `armarPlan` |
| `app/data/reglas.json` | Calendario por cultivo y zona, recomendados por zona |
| `app/data/rotaciones.json` | **Se borra** (lo reemplaza `recomendados` en reglas.json) |
| `app/scripts/generar-municipios.ts` | **Nuevo.** Genera `public/fallback/municipios.json` |
| `app/tests/*.test.ts` | **Nuevo.** Pruebas con `node:test` |
| `app/components/*` | Pantallas del recorrido nuevo |
| `app/README.md` | Sección "Contrato con el backend" |

---

### Task 0: Guardar la base

- [x] El usuario ya hizo commit del rediseño Milpa (`f75db0e`).
- [ ] **Commit del spec y este plan:** `git add docs/superpowers && git commit -m "Spec y plan del plan anual"`

---

### Task 0b: Marca Surco

Reemplaza la identidad "Mi Parcela" (tema Milpa, Baloo 2 + Atkinson) por la marca Surco. Se hace antes que las pantallas nuevas para que nazcan con la marca.

**Files:**
- Modify: `design-tokens/tokens.json` (tema nuevo `surco`; `milpa` se queda en el kit), `design-tokens/README.md` (fila del tema), `app/app/globals.css`, `app/app/layout.tsx`, `app/lib/colores.ts`, `app/components/Explorador.tsx` (encabezado), `app/components/dibujos.tsx` (comentario), `app/lib/motor.ts` (texto de WhatsApp), `app/README.md`, y los componentes con `font-extrabold`
- Create: `app/public/marca/` (logos), `app/public/` (íconos web y manifiesto)
- Replace: `app/app/favicon.ico`

**Tema `surco` en `tokens.json`** (mismo formato que `milpa`, `radius: "md"`, fuentes `display` y `body` = Inter, `google: "Inter:wght@400;600"`):

| Token | Valor | Origen |
|---|---|---|
| background | `#F5F1E6` | Arena |
| surface | `#FFFFFF` | surface-raised de la marca |
| surfaceRaised | `#EDE7D8` | derivado de Arena |
| border | `#DDD6C6` | line |
| foreground | `#1C2420` | Tierra |
| muted | `#56615B` | ink-muted |
| brand / brandForeground | `#155E4B` / `#FFFFFF` | Verde Surco / on-verde |
| highlight / highlightForeground | `#9C5B0A` / `#FFFFFF` | maíz tostado (el maíz puro no pasa contraste como ícono ni texto) |
| success / warning / danger | `#155E4B` / `#8A5A00` / `#B3261E` | |
| chart | `["#155E4B", "#9C5B0A", "#1D6FB8", "#7A4FB5", "#56615B"]` | |
| risk low / medium / high | `#155E4B` / `#8A5A00` / `#B3261E` | |
| decor | `sol: "#F2B134"`, `cielo: "#BFE3F2"`, `hoja: "#4E9A6F"`, `suelo: "#8A5A2B"`, `maiz-suave: "#FBEBC6"`, `verde-suave: "#DCEBE3"` | sol = Maíz; suaves de la marca |

Si `npm run tokens` marca algún par con `MAL`, oscurecer solo ese color hasta que pase (no tocar Verde, Tierra ni Arena).

- [ ] **Step 1: Agregar el tema y regenerar** — Run (raíz): `npm run tokens`. Expected: "Tema Surco" con todos los pares en `ok`.

- [ ] **Step 2: Aplicar el tema en la app**
  - `globals.css`: reemplazar el bloque `:root` + `@theme inline` por el de `design-tokens/build/surco.css`, conservando los extras de la app (`--zona-*`, `--relieve-*`, `--mapa-*`, `--primary-sombra`, las animaciones, el bloque de MapLibre). `--font-display` y `--font-sans` apuntan a `var(--font-inter)`.
  - `layout.tsx`: `Inter` de `next/font/google` (pesos 400 y 600, variable `--font-inter`) en lugar de Baloo 2 y Atkinson; `title: "Surco"`; `themeColor: "#155E4B"`; `metadata.icons` (favicon.svg, apple-touch-icon.png) y `metadata.manifest = "/site.webmanifest"`.
  - Títulos: donde haya `font-display … font-extrabold`, usar `font-semibold tracking-[-0.015em]` (guía: Inter 600 con espaciado negativo). El botón primario también pasa a `font-semibold`.
  - `lib/colores.ts`: los `TOKENS` toman los hex del tema `surco`; comentario apunta a `design-tokens/build/surco.css`.
  - Lo destacado en maíz va como fondo `bg-decor-maiz-suave` con texto `text-foreground`, nunca texto en `#F2B134`.

- [ ] **Step 3: Logos e íconos**
  - Copiar desde `logos/web/` a `app/public/`: `favicon.svg`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `maskable-512.png`, `site.webmanifest`. `favicon.ico` reemplaza a `app/app/favicon.ico`.
  - Copiar a `app/public/marca/`: `horizontal/surco-horizontal-color.svg` y `simbolo/surco-simbolo-color.svg`.
  - Encabezado de `Explorador` en el paso `inicio`: la píldora blanca con `next/image` de `surco-horizontal-color.svg`, `alt="Surco"`, alto 32 px (≥ 96 px de ancho), con el espacio libre de la guía (¼ de la altura del símbolo) y debajo la línea "Qué sembrar, con datos de NASA". Se quita el ícono de brote y el texto "Mi Parcela".

- [ ] **Step 4: Nombre en textos** — "Mi Parcela" → "Surco" en `app/README.md`, en `lib/motor.ts` (WhatsApp) y en cualquier otro texto visible (`grep -rn "Mi Parcela" app --include=*.ts --include=*.tsx --include=*.md` sin resultados, salvo `node_modules`).

- [ ] **Step 5: Verificar**
  Run (en `app/`): `npm run typecheck && npm run lint && npm run build`, y en la raíz `npm run check`.
  Expected: sin errores; "Contraste correcto". En el navegador: logo nítido en el encabezado y favicon de Surco en la pestaña.

- [ ] **Step 6: Commit** — `git commit -m "Marca Surco: tema, Inter, logo e íconos"`

---

### Task 1: Pruebas, textos compartidos y contrato nuevo

**Files:**
- Modify: `app/package.json` (script `test`), `app/tsconfig.json` (excluir `tests`)
- Create: `app/lib/textos.ts`, `app/tests/textos.test.ts`
- Modify: `app/lib/tipos.ts` (solo agregar), `app/lib/motor.ts`, `app/components/GraficaMensual.tsx`, `app/components/modulos/ModuloClima.tsx` (importar de `textos`)

**Interfaces:**
- Produces:
  - `MESES: string[]` ("Ene"…"Dic"), `MESES_LARGOS: string[]`, `listaMeses(meses: number[]): string`
  - `NOMBRE_CULTIVO: Record<CultivoId, string>` (`maiz: "Maíz"`, `frijol: "Frijol"`, `sorgo: "Sorgo"`, `frijolAbono: "Frijol abono"`), `nombresCultivos(ids: CultivoId[]): string` (une con " + ")
  - En `tipos.ts`: `Municipio`, `Lugar`, `ModoPlan`, `Division`, `AccionPeriodo`, `MesPlan`, `PeriodoPlan`, `PlanAnual`, `PedidoPlan`, copiados del spec, con **un campo extra** en `PlanAnual`: `tipoZona: TipoZona` (lo necesita `agruparPlan` para decir "Canícula" o "Aguaceros").

- [ ] **Step 1: Configurar el runner**

En `app/package.json`: `"test": "node --test \"tests/*.test.ts\""`. En `app/tsconfig.json`, agregar `"tests"` a `exclude` (las pruebas importan con extensión `.ts`, como `scripts/`).

- [ ] **Step 2: Escribir la prueba que falla**

`app/tests/textos.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { listaMeses, nombresCultivos } from "../lib/textos.ts";

test("listaMeses une con comas y 'y'", () => {
  assert.equal(listaMeses([7]), "julio");
  assert.equal(listaMeses([7, 8]), "julio y agosto");
  assert.equal(listaMeses([9, 10, 11]), "septiembre, octubre y noviembre");
  assert.equal(listaMeses([]), "");
});

test("nombresCultivos usa los nombres en español", () => {
  assert.equal(nombresCultivos(["maiz", "frijolAbono"]), "Maíz + Frijol abono");
});
```

- [ ] **Step 3: Correr y ver que falla**

Run: `npm test`
Expected: FAIL, no encuentra `../lib/textos.ts`.

- [ ] **Step 4: Crear `lib/textos.ts`** moviendo `MESES`, `MESES_LARGOS` y `listaMeses` desde `motor.ts`, y agregando `NOMBRE_CULTIVO` y `nombresCultivos`. Solo `import type`. En `motor.ts`, `GraficaMensual.tsx` y `ModuloClima.tsx`, importar de `@/lib/textos`.

- [ ] **Step 5: Agregar los tipos nuevos a `lib/tipos.ts`** (sin quitar los viejos todavía).

- [ ] **Step 6: Verificar**

Run: `npm test && npm run typecheck && npm run lint`
Expected: 2 pruebas PASS; sin errores.

- [ ] **Step 7: Commit** — `git commit -m "Textos compartidos, contrato del plan anual y pruebas con node:test"`

---

### Task 2: Municipios

**Files:**
- Create: `app/scripts/generar-municipios.ts`, `app/scripts/fuentes/geoboundaries-hnd-adm2.geojson`, `app/public/fallback/municipios.json`, `app/lib/municipios.ts`, `app/tests/municipios.test.ts`
- Modify: `app/package.json` (script `municipios`)

**Interfaces:**
- Consumes: `Municipio` (Task 1); `centroDe`, `dentroDeGeometria` de `lib/geo.ts`
- Produces:
  - `municipiosDe(todos: Municipio[], departamento: string): Municipio[]` ordenados por nombre (`localeCompare` con `"es"`)
  - `municipioMasCercano(todos: Municipio[], departamento: string, lat: number, lon: number): Municipio | null`, el más cercano **dentro de ese departamento**, `null` si el departamento no tiene municipios
  - `public/fallback/municipios.json`: `Municipio[]`
  - `MUNICIPIOS_SIMULADOS: boolean` exportado de `lib/municipios.ts` (`false` si salió de geoBoundaries)

- [ ] **Step 1: Escribir las pruebas que fallan**

`app/tests/municipios.test.ts`, con una lista pequeña fija en la prueba:

```ts
const todos: Municipio[] = [
  { id: "a", nombre: "Gracias", departamento: "Lempira", lat: 14.59, lon: -88.58 },
  { id: "b", nombre: "Erandique", departamento: "Lempira", lat: 14.24, lon: -88.47 },
  { id: "c", nombre: "La Esperanza", departamento: "Intibucá", lat: 14.31, lon: -88.18 },
];
```

- `municipiosDe(todos, "Lempira")` → nombres `["Erandique", "Gracias"]`.
- `municipiosDe(todos, "Colón")` → `[]`.
- `municipioMasCercano(todos, "Lempira", 14.3, -88.25)?.nombre` → `"Erandique"`. **La Esperanza está más cerca, pero es de otro departamento** (Review Focus 4).
- `municipioMasCercano(todos, "Colón", 15.7, -86)` → `null`.

- [ ] **Step 2: Correr y ver que falla** — Run: `npm test`. Expected: FAIL, no existe `lib/municipios.ts`.

- [ ] **Step 3: Implementar `lib/municipios.ts`** (solo `import type` de `./tipos`; la constante `MUNICIPIOS_SIMULADOS` se fija en el Step 5).

- [ ] **Step 4: Correr** — Run: `npm test`. Expected: PASS.

- [ ] **Step 5: Obtener los datos**

**Pedir confirmación al usuario antes de descargar.** Fuente: `https://www.geoboundaries.org/api/current/gbOpen/HND/ADM2/`, que es JSON con el campo `simplifiedGeometryGeoJSON` (URL del GeoJSON simplificado). Guardarlo en `scripts/fuentes/geoboundaries-hnd-adm2.geojson`.

`scripts/generar-municipios.ts` (mismo estilo que `generar-departamentos.ts`, imports con `.ts`):
- Por cada municipio: `centroDe(geometria)` da `[lon, lat]`; el departamento es el de `public/fallback/departamentos.json` cuya geometría contiene el centro (`dentroDeGeometria`), y si ninguno la contiene, el de centro más cercano.
- `id` = `shapeID` de geoBoundaries; `lat` y `lon` a 4 decimales.
- Escribe `public/fallback/municipios.json` e imprime el conteo por departamento.
- Script npm: `"municipios": "node scripts/generar-municipios.ts"`.

**Si el usuario no autoriza o la descarga falla:** escribir a mano `public/fallback/municipios.json` con 4–6 municipios por cada uno de los 18 departamentos (nombres reales de cabeceras, coordenadas aproximadas, `id` = slug), y poner `MUNICIPIOS_SIMULADOS = true`. Los nombres de departamento deben ser **idénticos** a los de `departamentos.json` (por ejemplo "Islas de la Bahía").

- [ ] **Step 6: Verificar**

Run: `npm run municipios` (solo si hubo descarga) y luego `node -e "const m=require('./public/fallback/municipios.json'); console.log(m.length, new Set(m.map(x=>x.departamento)).size)"`.
Expected: con geoBoundaries ~298 municipios y 18 departamentos; con la lista simulada ≥ 72 y 18.

- [ ] **Step 7: Commit** — `git commit -m "Municipios de Honduras: datos de respaldo y búsqueda por departamento"`

---

### Task 3: Calendario del plan (motor)

**Files:**
- Modify: `app/data/reglas.json`, `app/lib/tipos.ts` (`ReglaCultivo`), `app/lib/motor.ts`
- Create: `app/lib/calendario.ts`, `app/tests/calendario.test.ts`

**Interfaces:**
- Consumes: tipos de Task 1; `listaMeses`, `nombresCultivos` de `lib/textos.ts`
- Produces:
  - `ReglaCultivo` (sin `nombre`, ahora en `NOMBRE_CULTIVO`) gana `siembra: Record<TipoZona, number[]>`, `duracionMeses: number` y `nota?: Partial<Record<TipoZona, string>>`
  - `reglas.json` gana `recomendados: Record<TipoZona, CultivoId[]>`
  - `construirPlan(pedido: PedidoPlan, clima: ClimaZona, reglas: ReglaCultivo[], recomendados: Record<TipoZona, CultivoId[]>): PlanAnual`; lanza `RangeError("Elige al menos un cultivo")` si `modo === "mis-cultivos"` y `cultivos` está vacío
  - En `motor.ts`: `REGLAS`, `RECOMENDADOS` y `armarPlanLocal(pedido: PedidoPlan, clima: ClimaZona): PlanAnual`

**Valores de `reglas.json`** (inventados; la nota del archivo ya dice "simulado"):

| Cultivo | siembra seca | siembra equilibrada | siembra lluviosa | duracionMeses |
|---|---|---|---|---|
| maiz | [5] | [5] | [5, 12] | 4 |
| frijol | [9] | [9] | [5] | 3 |
| sorgo | [5] | [5] | [9] | 4 |
| frijolAbono | [5] | [5] | [5] | 6 |

`nota.lluviosa` de frijol: `"El frijol va en primera para que no lo agarren los aguaceros de fin de año."`
`recomendados`: `seca: ["maiz", "sorgo", "frijol"]`, `equilibrada: ["maiz", "frijolAbono", "frijol"]`, `lluviosa: ["frijol", "maiz", "frijolAbono"]`.

**Algoritmo de `construirPlan`:**
1. `cultivosElegidos` = `recomendados[clima.tipo]` si es recomendado; si no, `pedido.cultivos` sin repetidos.
2. Para cada cultivo y cada mes de siembra `s` de `siembra[clima.tipo]`, ocupa los meses `s … s + duracionMeses − 1` dando la vuelta al año (`((s − 1 + i) % 12) + 1`). Ese mes de siembra es "sembrar" y el último mes ocupado es "cosechar" para ese cultivo.
3. `accion` de cada mes, por prioridad: `sembrar` > `cosechar` > `cuidar` (hay un cultivo que no es frijol abono) > `cubrir` (solo frijol abono) > `descansar` (nada).
4. `lluvia` = `clima.meses[m − 1].lluvia`; `dificil` = `clima.mesesDificiles.includes(m)`; `cubierta` = hay al menos un cultivo.
5. `resumen` en 1–2 frases: el problema de la zona con `listaMeses(clima.mesesDificiles)` y las `nota` que apliquen. Si es "mis-cultivos", no incluye frijol abono y hay menos de 8 meses cubiertos, agrega: `"Puedes sembrar frijol abono para cubrir la tierra cuando queda sola."`
6. `fuente` = `{ dataset: clima.dataset, periodo: "2015–2025" (de clima.periodo), consultado: clima.consultado }`, `tipoZona: clima.tipo`, `simulado: true`.

- [ ] **Step 1: Escribir las pruebas que fallan**

`app/tests/calendario.test.ts`. El clima sale de los datos reales: lee `public/fallback/celdas.json` con `fs`, toma la celda de Lempira (seca) y la de Atlántida (lluviosa) con `celdaDePunto(celdas, 14.3, -88.6)` y `celdaDePunto(celdas, 15.7, -86.9)` (importar `../lib/mapa.ts`) y arma `construirClima(c.lat, c.lon, c.resumen, "respaldo", "2026-11-14")` (`../lib/clima.ts`). `reglas.json` también se lee con `fs`. Antes de usarlos, comprobar que `clima.tipo` es `"seca"` y `"lluviosa"`.

- `test("siempre 12 meses, de enero a diciembre")`: `plan.meses.map(m => m.mes)` es `[1..12]`.
- `test("recomendado en zona seca usa maíz, sorgo y frijol")`: `cultivosElegidos` es `["maiz","sorgo","frijol"]`; el mes 5 tiene `accion === "sembrar"` e incluye `"maiz"` y `"sorgo"`; el mes 9 incluye `"frijol"`.
- `test("maíz de apante cruza el fin de año en zona lluviosa")` (Review Focus 1): con mis-cultivos `["maiz"]` en Atlántida, los meses 12, 1, 2 y 3 incluyen `"maiz"`, el 12 es `"sembrar"` y el 3 es `"cosechar"`.
- `test("frijol en zona lluviosa se mueve a primera y lo explica")`: con mis-cultivos `["frijol"]` en Atlántida, el mes 5 incluye `"frijol"`, ningún mes entre 10 y 12 lo incluye, y `resumen` contiene `"primera"`.
- `test("un solo cultivo: meses en descanso y sugerencia de frijol abono")` (Review Focus 3): con mis-cultivos `["frijol"]` en Lempira, al menos 6 meses son `"descansar"` y `resumen` contiene `"frijol abono"`.
- `test("lluvia y meses difíciles vienen del clima NASA")`: para todo `m`, `plan.meses[m-1].lluvia === clima.meses[m-1].lluvia` y `dificil` coincide con `clima.mesesDificiles`.
- `test("mis-cultivos vacío lanza RangeError")`: `assert.throws(..., RangeError)`.

- [ ] **Step 2: Correr y ver que falla** — Run: `npm test`. Expected: FAIL, no existe `lib/calendario.ts`.

- [ ] **Step 3: Implementar** `reglas.json`, `ReglaCultivo` y `lib/calendario.ts` (solo `import type` y `./textos.ts`). Reducir `motor.ts` a `REGLAS`, `RECOMENDADOS` y `armarPlanLocal`. Las funciones viejas (`evaluar`, `planDeSiembra`, `textoWhatsApp` viejo, `rotacionActual`) se borran en Task 6, cuando dejen de usarse; mientras tanto, mantenerlas compilando. En `ModuloCultivos.tsx`, cambiar `r.nombre` por `NOMBRE_CULTIVO[r.id]`.

- [ ] **Step 4: Correr** — Run: `npm test && npm run typecheck`. Expected: todo PASS, sin errores.

- [ ] **Step 5: Commit** — `git commit -m "Motor del plan anual: calendario por cultivo y zona"`

---

### Task 4: Agrupar por trimestre o semestre, y texto para WhatsApp

**Files:**
- Create: `app/lib/plan.ts`, `app/tests/plan.test.ts`

**Interfaces:**
- Consumes: `PlanAnual`, `PeriodoPlan`, `Division` (Task 1); `MESES`, `listaMeses`, `nombresCultivos` (Task 1)
- Produces:
  - `agruparPlan(plan: PlanAnual, division: Division): PeriodoPlan[]`
  - `textoWhatsApp(lugar: string, plan: PlanAnual, periodos: PeriodoPlan[]): string`

**Reglas:**
- Trimestral: `[[1,2,3],[4,5,6],[7,8,9],[10,11,12]]`, ids `T1`…`T4`. Semestral: `[[1..6],[7..12]]`, ids `S1`, `S2`.
- `nombre` = `"Ene – Mar"` (`MESES` del primer y último mes, separados por espacio, raya y espacio).
- `cultivos` = unión de los cultivos de sus meses, en orden de primera aparición.
- `accionPrincipal`, misma prioridad que en Task 3.
- `consejo` en una frase según `accionPrincipal`: sembrar → `"Siembra " + nombresCultivos(...)`, cosechar → `"Cosecha " + …`, cuidar → `"Cuida tu " + …`, cubrir → `"El frijol abono cubre la tierra"`, descansar → `"La tierra descansa"`. Los nombres de cultivo van en minúscula dentro de la frase.
- `lluviaEsperada` = suma redondeada.
- `alerta` = `null` si no hay meses difíciles; si los hay, `"Aguaceros fuertes en " + listaMeses(...)` para `tipoZona === "lluviosa"` y `"Canícula en " + listaMeses(...)` para las demás.
- `mesesCubierta` = cuántos meses tienen `cubierta`.
- `textoWhatsApp`: `"Mi plan de siembra para <lugar> (Surco):"`, una línea `• <nombre>: <consejo>` por periodo, y al final `"Hecho con datos de NASA POWER. Es una guía (simulado): lo reviso con mi técnico agrícola antes de sembrar."`

- [ ] **Step 1: Escribir las pruebas que fallan**

`app/tests/plan.test.ts` con un `PlanAnual` fijo construido en la prueba: maíz en los meses 5–8 (5 "sembrar", 8 "cosechar"), frijol en 9–11, el resto vacío; `mesesDificiles` = 7; `tipoZona: "seca"`.

- `test("trimestral da 4 periodos con nombres")`: ids `["T1","T2","T3","T4"]`, `nombre` del primero `"Ene – Mar"`.
- `test("semestral da 2 periodos")`: ids `["S1","S2"]`, `nombre` del segundo `"Jul – Dic"`.
- `test("un cultivo que cruza trimestres aparece en ambos")` (Review Focus 2): T2 y T3 incluyen `"maiz"`; T3 incluye `"maiz"` y `"frijol"`.
- `test("acción principal y consejo")`: T1 es `"descansar"` con consejo `"La tierra descansa"`; T2 es `"sembrar"` y su consejo contiene `"maíz"`.
- `test("alerta de canícula solo donde hay mes difícil")`: T3 alerta `"Canícula en julio"`; T1 `null`.
- `test("lluvia esperada suma los meses")`: con lluvias fijas por mes, `lluviaEsperada` de T1 = suma de los meses 1–3.
- `test("texto de WhatsApp lleva periodos y aviso")`: contiene `"Ene – Mar"`, `"(simulado)"` y `"técnico agrícola"`.

- [ ] **Step 2: Correr y ver que falla** — Run: `npm test`. Expected: FAIL, no existe `lib/plan.ts`.

- [ ] **Step 3: Implementar `lib/plan.ts`.**

- [ ] **Step 4: Correr** — Run: `npm test`. Expected: PASS.

- [ ] **Step 5: Commit** — `git commit -m "Plan por trimestres o semestres y texto para WhatsApp"`

---

### Task 5: Capa de acceso a datos y contrato documentado

**Files:**
- Create: `app/lib/api.ts`
- Modify: `app/README.md` (sección "Contrato con el backend")

**Interfaces:**
- Consumes: `municipiosDe` (Task 2), `armarPlanLocal` (Task 3), `construirClima`, `celdaDePunto`, `celdas.json`, `municipios.json`
- Produces (las pantallas solo importan esto):
  - `obtenerMunicipios(departamento: string): Promise<Municipio[]>`
  - `obtenerClima(lat: number, lon: number, signal?: AbortSignal): Promise<ClimaZona>`
  - `armarPlan(pedido: PedidoPlan, signal?: AbortSignal): Promise<PlanAnual>`
  - `const USAR_API = { municipios: false, plan: false }`: el compañero pone `true` cuando su endpoint exista. El clima ya usa `/api/clima`.

**Comportamiento:**
- `obtenerMunicipios`: si `USAR_API.municipios`, hace `GET /api/municipios?departamento=` y, si falla, usa el respaldo; si no, `municipiosDe(municipios.json, departamento)` directo.
- `obtenerClima`: lo que hoy hace `Explorador.elegirPunto`, que pasa aquí: `GET /api/clima` y, si falla y la señal no fue abortada, `construirClima` con la celda de respaldo.
- `armarPlan`: si `USAR_API.plan`, hace `POST /api/plan` con JSON y, si falla, sigue al respaldo; el respaldo es `obtenerClima` + `armarPlanLocal`. **No se crea `app/api/plan/route.ts`** (el spec lo deja opcional, y así no hay un 404 en cada plan).
- Si `signal` está abortada, se propaga el `AbortError`; no cae al respaldo.

- [ ] **Step 1: Implementar `lib/api.ts`.**

- [ ] **Step 2: Documentar en `app/README.md`** los tres endpoints (método, query o body, tipo de respuesta y dónde está el tipo en `lib/tipos.ts`), la bandera `USAR_API` y que la API devuelve 12 `MesPlan`, no periodos. Actualizar la tabla "Mapa del código" con los archivos nuevos y el flujo de la sección "Cómo funciona".

- [ ] **Step 3: Verificar** — Run: `npm run typecheck && npm run lint`. Expected: sin errores.

- [ ] **Step 4: Commit** — `git commit -m "Capa de datos con respaldo local y contrato para el backend"`

---

### Task 6: Pantallas del recorrido nuevo

**Files:**
- Modify: `app/components/Explorador.tsx`, `app/components/PanelInicio.tsx`, `app/components/MapaReal.tsx`, `app/components/modulos/ModuloCultivos.tsx`, `app/components/modulos/ModuloPlan.tsx`, `app/lib/tipos.ts`, `app/lib/motor.ts`, `app/lib/mapa.ts`
- Create: `app/components/PanelLugar.tsx` (reemplaza a `PanelUbicacion.tsx`), `app/components/PanelModo.tsx`
- Delete: `app/components/PanelUbicacion.tsx`, `app/components/modulos/ModuloTierra.tsx`, `app/data/rotaciones.json`

**Interfaces:**
- Consumes: `lib/api.ts` (Task 5), `agruparPlan`, `textoWhatsApp` (Task 4), `municipioMasCercano` y `MUNICIPIOS_SIMULADOS` (Task 2), `departamentoDe` y `poligonosDe` (`lib/geo.ts`), `ModuloClima` (sin cambios)
- Produces: `type Paso = "inicio" | "lugar" | "info" | "modo" | "cultivos" | "plan"` en `Explorador.tsx`

**Pantallas** (contenido exacto en la tabla "Pantallas" del spec):
- **`PanelInicio`:** quitar el buscador de texto (y `buscarLugares` de `lib/mapa.ts`). Agregar dos `<select>` nativos con `<label>` visible, de 56 px de alto: "Departamento" (los 18 de `departamentos.json`, por nombre) y "Municipio" (deshabilitado hasta elegir departamento; se llena con `obtenerMunicipios`; "(simulado)" en la etiqueta si `MUNICIPIOS_SIMULADOS`). **Cambiar de departamento vacía el municipio.** Elegir municipio llama a `onElegir(lat, lon, "lista")`. Botón "Usar mi ubicación". Pista "o toca tu terreno en el mapa". Se conservan los ejemplos y "Así llueve en Honduras". Props nuevas: `onDepartamento(nombre: string | null)` para que el mapa se acerque.
- **`MapaReal`:** el prop `punto: Punto | null` pasa a `lugar: Lugar | null`. Prop nuevo `departamentoEnfocado: string | null`: al cambiar, `fitBounds` al rectángulo de los polígonos del departamento (`poligonosDe`), con el mismo `margen(m)`, y marca su borde con la capa `dep-seleccion`.
- **`Explorador`:**
  - `elegirLugar(lat, lon, origen, departamento?)` arma `Lugar`; el municipio sale de la lista o de `municipioMasCercano`, y la `celda` de `celdaDePunto`.
  - El clima se pide con `obtenerClima` (con `AbortController`, como hoy).
  - Estado: `modo: ModoPlan | null`, `cultivos: CultivoId[]` (arranca vacío), `division: Division` (arranca `"trimestral"`), `plan: PlanAnual | null`.
  - El plan se pide con `armarPlan` al entrar a `plan`.
  - La barra de 4 pasos se reemplaza por una línea "Paso N de M" con el nombre del paso y un botón "Atrás" que vuelve al paso anterior real. Desde `plan`, vuelve a `cultivos` si el modo es "mis-cultivos" y a `modo` si es recomendado; desde `info`, vuelve a `lugar`.
  - Los ejemplos entran con origen `"lista"`.
- **`PanelLugar`:** `Escena`, "Tu terreno está en", "<municipio>, <departamento>" (si no hay municipio, solo el departamento), chips de zona, altura y lluvia. Dos botones: primario "Armar mi plan" y secundario grande "Ver cómo es el clima aquí". Abajo, "Elegir otro lugar".
- **`info`:** `ModuloClima` tal cual, con botón primario "Armar mi plan" que va a `modo`.
- **`PanelModo`:** "¿Cómo quieres tu plan?", con dos tarjetas grandes con dibujo:
  - "Recomiéndame": "La app elige con los datos de NASA" → `plan`.
  - "Yo elijo mis cultivos": "Tú dices qué siembras" → `cultivos`.
- **`ModuloCultivos`:** quitar la prioridad (props `prioridad` y `onPrioridad`). Botón "Ver mi plan", deshabilitado sin cultivos.
- **`ModuloPlan`** (reescribir):
  - Props `{ plan: PlanAnual; division: Division; onDivision: (d: Division) => void; lugar: string }`.
  - Selector de dos botones "Por trimestres" / "Por semestres" (`aria-pressed`). "Tu plan del año" con "(simulado)".
  - `plan.resumen`, y una tarjeta por `PeriodoPlan`: `nombre` grande, `DibujoCultivo` de cada cultivo, `consejo`, `lluviaEsperada` en `font-mono` ("<n> mm de lluvia"), `alerta` con `IconoAlerta` si existe, y "Tierra cubierta <mesesCubierta> de <meses.length> meses".
  - Botón WhatsApp con `textoWhatsApp`, aviso del técnico y fuente NASA (`plan.fuente`).
- **Limpieza:** borrar de `tipos.ts` `Punto`, `Prioridad`, `EvaluacionRotacion`, `Resultado`, `FilaPlan`, `Rotacion` y `Temporada`; de `motor.ts`, todo lo que no sea `REGLAS`, `RECOMENDADOS` y `armarPlanLocal`; de `ui.tsx`, lo que quede sin uso (`TEXTO_SEMAFORO` y `Semaforo` si nadie los usa); de `dibujos.tsx`, `Carita` si queda sin uso.

- [ ] **Step 1: Implementar** las pantallas y la limpieza descritas arriba.

- [ ] **Step 2: Verificación automática**

Run (en `app/`): `npm test && npm run typecheck && npm run lint && npm run build`
Expected: todas las pruebas PASS; build sin errores.

- [ ] **Step 3: Verificación manual en el navegador** (`npm run dev`, ventana de 390×844 y de escritorio):
  1. Elegir "Lempira" → el mapa se acerca → elegir un municipio → pantalla Lugar con municipio y departamento.
  2. Elegir otro municipio, cambiar a "Atlántida": el selector de municipio queda vacío y solo muestra los de Atlántida (Review Focus 5).
  3. "Ver cómo es el clima aquí" → gráfica y fuente NASA → "Armar mi plan" lleva a `modo`.
  4. "Recomiéndame" → plan con 4 trimestres; "Por semestres" → 2 periodos, sin nueva petición (pestaña Red).
  5. "Atrás" → `modo` → "Yo elijo mis cultivos" → solo Frijol → plan con periodos en descanso y la sugerencia de frijol abono.
  6. Tocar el mapa en otro departamento → Lugar con el municipio más cercano de ese departamento.
  7. DevTools sin conexión → elegir un municipio → la info y el plan funcionan con respaldo.
  8. A 360 px de ancho: ninguna tarjeta del plan provoca scroll horizontal.

- [ ] **Step 4: Desde la raíz** — Run: `npm run check`. Expected: "Contraste correcto" y "Skills correctas".

- [ ] **Step 5: Commit** — `git commit -m "Recorrido nuevo: departamento y municipio, información del lugar y plan anual"`
