# Simulación visual de la parcela · Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar al final de "Tu plan del año" un botón que abre una vista isométrica animada de la parcela a lo largo de los 12 meses del plan.

**Architecture:** La lógica (ciclos de cultivo, reparto de surcos, etapa en cada paso) vive en funciones puras en `app/lib/`, probadas con `node --test`. La vista es SVG en React dentro de un `<dialog>` nativo, animada solo con transiciones CSS de `transform` y `opacity`. El único archivo existente con cambio de comportamiento es `ModuloPlan.tsx` (un botón y el diálogo).

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, `node --test`. Sin dependencias nuevas.

**Spec:** `docs/superpowers/specs/2026-11-15-simulacion-parcela-design.md`

## Global Constraints

- Rama `visual-crop-simulation`. Todos los comandos se corren desde `app/`.
- Sin dependencias nuevas en `app/package.json`.
- No modificar `lib/plan.ts`, `lib/tipos.ts`, `lib/motor.ts`, `data/reglas.json`, `Explorador.tsx` ni la API.
- Interfaz y comentarios en español. Nombres de archivos, funciones y variables en español, como el resto del código.
- Colores solo desde tokens: `var(--decor-hoja)`, `var(--decor-sol)`, `var(--decor-suelo)`, `var(--decor-cielo)`, `var(--primary)`, `var(--highlight)`, `var(--chart-3)`, `var(--card)` y mezclas con `color-mix(in oklab, …)`. Ningún color hexadecimal suelto.
- Solo se animan `transform` y `opacity`.
- El texto en pantalla solo nombra lo que el plan dice (siembra, en el terreno, cosecha). Las etapas intermedias no se rotulan.
- La vista lleva "(simulado)" y la nota "Ilustración de tu plan. No es una predicción."
- En las pruebas, los imports llevan extensión `.ts` (como `tests/plan.test.ts`). En `lib/`, un import de runtime hacia otro archivo de `lib/` también lleva `.ts` (como `plan.ts` importa `./textos.ts`).
- Commits: mensaje corto en una línea, **sin** `Co-Authored-By` ni atribución a Claude.

## Review Focus

1. **Cultivo sin mes de cosecha** (duración de 1 mes, o un plan del backend sin `cosechados`): la planta llega a maduración y desaparece al terminar su último mes, sin error. → Prueba en Task 2.
2. **Id de cultivo desconocido** (el backend agrega uno que no está en los 22): se dibuja con el aspecto genérico y su id como nombre. → Prueba en Task 3.
3. **Cultivo en el terreno sin mes de siembra** (aparece en `cultivos` pero nunca en `sembrados`): cuenta como un ciclo que empieza en el primer mes de su racha. → Prueba en Task 1.
4. **Más cultivos simultáneos que surcos** (9 o más a la vez en "mis cultivos"): todos los carriles tienen al menos un surco. → Prueba en Task 1 (`surcosPara`).
5. **Plan sin ningún cultivo o cerrar a media reproducción:** el terreno se ve en descanso con el texto "Tierra en descanso"; al cerrar se detiene el temporizador y al reabrir empieza desde el inicio. → Revisión manual en Task 7.

---

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| Crear `app/lib/simulacion.ts` | Ciclos, carriles, etapas, rangos de pasos, nivel de lluvia. Puro. |
| Crear `app/lib/aspecto-cultivos.ts` | Las 7 formas, los 22 aspectos, alias y nombres. Puro. |
| Crear `app/tests/simulacion.test.ts`, `app/tests/aspecto-cultivos.test.ts` | Pruebas de lo anterior. |
| Crear `app/components/simulacion/Planta.tsx` | Dibujo SVG de una planta según forma y etapa. |
| Crear `app/components/simulacion/Terreno.tsx` | Rombo isométrico, surcos, plantas y cielo con lluvia. |
| Crear `app/components/simulacion/LineaTiempo.tsx` | Vista, reproducción, barra de meses. |
| Crear `app/components/simulacion/SimulacionParcela.tsx` | El diálogo y el estado del tiempo. |
| Modificar `app/app/globals.css` | Clase `.planta-sim` con su transición y la regla de reducir movimiento (solo se agrega). |
| Modificar `app/components/modulos/ModuloPlan.tsx` | Botón "Ver mi parcela en el año" y montaje del diálogo. |

---

### Task 1: Ciclos y carriles

**Files:**
- Create: `app/lib/simulacion.ts`
- Test: `app/tests/simulacion.test.ts`

**Interfaces:**
- Consumes: `PlanAnual`, `MesPlan` de `lib/tipos.ts`.
- Produces:

```ts
export const PASOS_POR_MES = 4;
export const PASOS_ANIO = 48;
export const SURCOS_BASE = 8;

/** Una siembra de un cultivo, de su primer mes a su último mes en el terreno. */
export interface Ciclo {
  cultivo: string;
  meses: number[];        // 1–12, en orden de tiempo; puede cruzar de 12 a 1
  tieneCosecha: boolean;  // el último mes aparece en `cosechados`
  carril: number;         // 0…numCarriles-1
}

export function ciclosDelPlan(plan: PlanAnual): Ciclo[];
export function numCarriles(ciclos: Ciclo[]): number;   // 0 si no hay ciclos
export function surcosPara(carriles: number): number;   // max(SURCOS_BASE, carriles)
```

Reglas de `ciclosDelPlan`:

- Por cada cultivo (en el orden de `plan.cultivosElegidos`, y después cualquier otro que aparezca en `meses[].cultivos`), tomar las rachas circulares de meses consecutivos en que está en `cultivos`.
- Dentro de una racha, un mes en que el cultivo está en `sembrados` empieza un ciclo nuevo. Una racha sin ningún mes de siembra es un solo ciclo.
- Una racha de 12 meses sin siembra empieza en enero.
- Carriles: ordenar los ciclos por su primer mes (empates: orden de `cultivosElegidos`); cada ciclo toma el primer carril cuyos ciclos no comparten **ningún** mes con él.

- [ ] **Step 1: Escribir las pruebas que fallan**

Crear `app/tests/simulacion.test.ts` con un ayudante `planDe(enTerreno)` igual al de `tests/plan.test.ts` (líneas 6–24), pero que reciba el mapa `mes → { cultivos, sembrados, cosechados }`, y estas pruebas:

```ts
test("maíz may–ago y frijol sep–nov: dos ciclos en el mismo carril", () => {
  const c = ciclosDelPlan(planSeco);
  assert.deepEqual(c.map((x) => [x.cultivo, x.meses, x.carril]), [
    ["maiz", [5, 6, 7, 8], 0],
    ["frijol", [9, 10, 11], 0],
  ]);
  assert.equal(numCarriles(c), 1);
});

test("maíz y sorgo simultáneos van en carriles distintos", () => {
  // maiz y sorgo may–ago, frijol sep–nov
  const c = ciclosDelPlan(planSecoRecomendado);
  assert.equal(numCarriles(c), 2);
  assert.notEqual(c.find((x) => x.cultivo === "maiz")!.carril, c.find((x) => x.cultivo === "sorgo")!.carril);
  assert.equal(c.find((x) => x.cultivo === "frijol")!.carril, 0);
});

test("un ciclo que cruza de diciembre a marzo", () => {
  // maiz sembrado en 12, en el terreno 1 y 2, cosechado en 3; y otro maiz may–ago
  const c = ciclosDelPlan(planLluvioso).filter((x) => x.cultivo === "maiz");
  assert.deepEqual(c.map((x) => x.meses), [[5, 6, 7, 8], [12, 1, 2, 3]]);
});

test("cosecha y siembra en el mismo mes no comparten carril", () => {
  // maiz may–ago, frijol ago–oct
  assert.equal(numCarriles(ciclosDelPlan(planTraslapado)), 2);
});

test("cultivo en el terreno sin mes de siembra cuenta como un ciclo", () => {
  // sorgo en cultivos de 3 a 5, nunca en sembrados
  const [c] = ciclosDelPlan(planSinSiembra);
  assert.deepEqual([c.meses, c.tieneCosecha], [[3, 4, 5], false]);
});

test("plan sin cultivos: sin ciclos y sin carriles", () => {
  assert.deepEqual(ciclosDelPlan(planVacio), []);
  assert.equal(numCarriles([]), 0);
});

test("surcosPara nunca deja un carril sin surco", () => {
  assert.equal(surcosPara(0), 8);
  assert.equal(surcosPara(3), 8);
  assert.equal(surcosPara(11), 11);
});
```

- [ ] **Step 2: Correr y ver que fallan**

Run: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/simulacion.test.ts`
Expected: FAIL, no existe `../lib/simulacion.ts`.

- [ ] **Step 3: Implementar `ciclosDelPlan`, `numCarriles` y `surcosPara` en `app/lib/simulacion.ts`**

Encabezado del archivo, en el estilo de `plan.ts`: un comentario de dos líneas que diga que es la lógica pura de la simulación y que no inventa fechas (solo reordena los meses del plan).

- [ ] **Step 4: Correr y ver que pasan**

Run: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/simulacion.test.ts`
Expected: 7 pruebas PASS.

- [ ] **Step 5: Commit**

```bash
git add app/lib/simulacion.ts app/tests/simulacion.test.ts
git commit -m "feat: ciclos y carriles de la simulación de parcela"
```

---

### Task 2: Etapas, rangos de pasos y lluvia

**Files:**
- Modify: `app/lib/simulacion.ts`
- Test: `app/tests/simulacion.test.ts`

**Interfaces:**
- Consumes: `Ciclo`, `PASOS_POR_MES`, `PASOS_ANIO` de Task 1; `Division` de `lib/tipos.ts`.
- Produces:

```ts
export type Etapa = "preparacion" | "siembra" | "germinacion" | "crecimiento" | "maduracion" | "cosecha" | "rastrojo";

export interface EstadoCiclo {
  etapa: Etapa;
  avanceEtapa: number; // 0–1 dentro de la etapa
}

/** Paso 0 = primera semana de enero; paso 47 = última de diciembre. null = el ciclo no está en el terreno. */
export function estadoEn(ciclo: Ciclo, paso: number): EstadoCiclo | null;

/** Lo que se ve en un carril en un paso: el ciclo activo, o el rastrojo del que acaba de terminar, o null (descanso). */
export function estadoCarril(ciclos: Ciclo[], carril: number, paso: number): { ciclo: Ciclo; estado: EstadoCiclo } | null;

/** Tamaño de la planta, 0–1. */
export function tamanoPlanta(estado: EstadoCiclo): number;

export type Vista = "anual" | Division; // "anual" | "trimestral" | "semestral"
/** Primer y último paso (inclusive) del tramo. `periodo` es el índice 0…n-1; se ignora en "anual". */
export function rangoPasos(vista: Vista, periodo: number): [number, number];

export type NivelLluvia = "poca" | "regular" | "mucha";
export function nivelLluvia(mm: number): NivelLluvia;
```

Reglas de `estadoEn`. Sea `n = ciclo.meses.length` y `k` el paso dentro del ciclo (0 … 4n−1):

| Condición | Etapa | `avanceEtapa` |
|---|---|---|
| `k = 0` | preparacion | 1 |
| `k = 1…3` | siembra | `(k − 1) / 2` |
| últimos 4 pasos y `tieneCosecha` | cosecha | `(j + 1) / 4`, con `j` = 0…3 dentro del mes |
| el resto: `M` pasos intermedios, índice `i` | `i < 0.2·M` germinacion · `i < 0.7·M` crecimiento · si no, maduracion | posición dentro de su tramo, 0–1 |

- Si `tieneCosecha` es falso, los últimos 4 pasos pertenecen al tramo intermedio.
- Si `n = 1` y `tieneCosecha` es verdadero, la cosecha gana: los 4 pasos son cosecha.
- `estadoCarril`: si ningún ciclo del carril está activo, y uno con `tieneCosecha` terminó hace 1 o 2 pasos (contando de forma circular: diciembre → enero), devuelve `{ etapa: "rastrojo", avanceEtapa: 0.5 | 1 }`.
- `tamanoPlanta`: preparacion y siembra 0 · germinacion `0.1 + 0.15·a` · crecimiento `0.3 + 0.6·a` · maduracion, cosecha 1 · rastrojo 0.
- `rangoPasos`: anual `[0, 47]` · semestral `[24p, 24p + 23]` · trimestral `[12p, 12p + 11]`.
- `nivelLluvia`: menos de 60 mm "poca" · menos de 200 mm "regular" · si no, "mucha".

- [ ] **Step 1: Escribir las pruebas que fallan**

```ts
const maiz: Ciclo = { cultivo: "maiz", meses: [5, 6, 7, 8], tieneCosecha: true, carril: 0 };
const paso = (mes: number, semana = 0) => (mes - 1) * 4 + semana;

test("el mes de siembra da preparación y luego siembra", () => {
  assert.equal(estadoEn(maiz, paso(5, 0))!.etapa, "preparacion");
  assert.deepEqual([1, 2, 3].map((s) => estadoEn(maiz, paso(5, s))!.etapa), ["siembra", "siembra", "siembra"]);
});

test("los meses intermedios pasan por germinación, crecimiento y maduración", () => {
  const etapas = Array.from({ length: 8 }, (_, i) => estadoEn(maiz, paso(6) + i)!.etapa);
  assert.deepEqual(etapas, ["germinacion", "germinacion", "crecimiento", "crecimiento", "crecimiento", "crecimiento", "maduracion", "maduracion"]);
});

test("el mes de cosecha da cosecha y avanza hasta 1", () => {
  assert.deepEqual(estadoEn(maiz, paso(8, 0)), { etapa: "cosecha", avanceEtapa: 0.25 });
  assert.deepEqual(estadoEn(maiz, paso(8, 3)), { etapa: "cosecha", avanceEtapa: 1 });
});

test("fuera del ciclo no hay planta", () => {
  assert.equal(estadoEn(maiz, paso(4, 3)), null);
  assert.equal(estadoEn(maiz, paso(9, 0)), null);
});

test("un ciclo que cruza el año se ve en enero", () => {
  const apante: Ciclo = { cultivo: "maiz", meses: [12, 1, 2, 3], tieneCosecha: true, carril: 0 };
  assert.equal(estadoEn(apante, paso(1, 0))!.etapa, "germinacion");
  assert.equal(estadoEn(apante, paso(3, 0))!.etapa, "cosecha");
});

test("ciclo sin cosecha: termina en maduración y no deja rastrojo", () => {
  const sin: Ciclo = { cultivo: "sorgo", meses: [3, 4, 5], tieneCosecha: false, carril: 0 };
  assert.equal(estadoEn(sin, paso(5, 3))!.etapa, "maduracion");
  assert.equal(estadoCarril([sin], 0, paso(6, 0)), null);
});

test("ciclo de un solo mes no falla", () => {
  const uno: Ciclo = { cultivo: "frijol", meses: [9], tieneCosecha: false, carril: 0 };
  assert.equal(estadoEn(uno, paso(9, 0))!.etapa, "preparacion");
  assert.equal(estadoEn(uno, paso(9, 3))!.etapa, "siembra");
});

test("después de la cosecha queda rastrojo dos pasos y luego descanso", () => {
  assert.equal(estadoCarril([maiz], 0, paso(9, 0))!.estado.etapa, "rastrojo");
  assert.equal(estadoCarril([maiz], 0, paso(9, 1))!.estado.etapa, "rastrojo");
  assert.equal(estadoCarril([maiz], 0, paso(9, 2)), null);
});

test("el cultivo siguiente tapa el rastrojo del anterior", () => {
  const frijol: Ciclo = { cultivo: "frijol", meses: [9, 10, 11], tieneCosecha: true, carril: 0 };
  assert.equal(estadoCarril([maiz, frijol], 0, paso(9, 0))!.ciclo.cultivo, "frijol");
});

test("la planta nunca se achica antes de la cosecha", () => {
  const t = Array.from({ length: 12 }, (_, i) => tamanoPlanta(estadoEn(maiz, paso(5) + i)!));
  assert.deepEqual(t, [...t].sort((a, b) => a - b));
});

test("rangos de pasos por vista", () => {
  assert.deepEqual(rangoPasos("anual", 0), [0, 47]);
  assert.deepEqual(rangoPasos("semestral", 1), [24, 47]);
  assert.deepEqual(rangoPasos("trimestral", 2), [24, 35]);
});

test("niveles de lluvia", () => {
  assert.deepEqual([0, 59, 60, 199, 200].map(nivelLluvia), ["poca", "poca", "regular", "regular", "mucha"]);
});
```

- [ ] **Step 2: Correr y ver que fallan**

Run: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/simulacion.test.ts`
Expected: las 12 pruebas nuevas FAIL (funciones no exportadas); las 7 de Task 1 PASS.

- [ ] **Step 3: Implementar las funciones de este task en `app/lib/simulacion.ts`**

- [ ] **Step 4: Correr y ver que pasan**

Run: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/simulacion.test.ts`
Expected: 19 pruebas PASS.

- [ ] **Step 5: Commit**

```bash
git add app/lib/simulacion.ts app/tests/simulacion.test.ts
git commit -m "feat: etapas, rangos y lluvia de la simulación de parcela"
```

---

### Task 3: Aspecto de los 22 cultivos

**Files:**
- Create: `app/lib/aspecto-cultivos.ts`
- Test: `app/tests/aspecto-cultivos.test.ts`

**Interfaces:**
- Consumes: `NOMBRE_CULTIVO` de `lib/textos.ts`.
- Produces:

```ts
export type Forma = "cana" | "macolla" | "mataBaja" | "rastrera" | "tutor" | "roseta" | "arbusto";
export type Detalle = "mazorca" | "panoja" | "capsulas" | "espiga" | "bulbo" | "vainas" | "flor" | "frutoRedondo" | "frutoLargo" | "cabeza" | "ninguno";

export interface AspectoCultivo {
  nombre: string;       // en español, para la leyenda
  forma: Forma;
  altura: number;       // 0.3–1, relativa a la planta más alta
  hoja: string;         // color CSS (token o color-mix)
  detalle: Detalle;     // lo que aparece en maduración
  colorDetalle: string;
}

export const IDS_CULTIVOS: string[];                       // los 22, en el orden de la tabla
export const ALIAS: Record<string, string>;                // maiz→maize, frijol→beans, sorgo→sorghum, frijolAbono→mucuna
export function aspectoDe(id: string): AspectoCultivo;     // resuelve alias; id desconocido → genérico
export function nombreCultivo(id: string): string;         // NOMBRE_CULTIVO[id] si existe; si no, aspecto.nombre; si es desconocido, el id
```

Constantes de color del archivo (las únicas permitidas):

```ts
const HOJA = "var(--decor-hoja)";
const VERDE = "var(--primary)";
const SOL = "var(--decor-sol)";
const SUELO = "var(--decor-suelo)";
const ROJO = "var(--highlight)";
const CLARO = "var(--card)";
const mezcla = (a: string, b: string, pct: number) => `color-mix(in oklab, ${a} ${pct}%, ${b})`;
```

Los 22 aspectos:

| id | nombre | forma | altura | hoja | detalle | colorDetalle |
|---|---|---|---|---|---|---|
| maize | Maíz | cana | 1 | VERDE | mazorca | SOL |
| sorghum | Sorgo (maicillo) | cana | 0.9 | HOJA | panoja | mezcla(ROJO, SUELO, 55) |
| sesame | Ajonjolí | cana | 0.7 | mezcla(HOJA, SOL, 80) | capsulas | mezcla(SOL, SUELO, 60) |
| rice | Arroz | macolla | 0.5 | mezcla(HOJA, SOL, 70) | espiga | SOL |
| onion | Cebolla | macolla | 0.35 | mezcla(VERDE, CLARO, 75) | bulbo | mezcla(ROJO, CLARO, 45) |
| beans | Frijol | mataBaja | 0.4 | VERDE | vainas | ROJO |
| soybean | Soya | mataBaja | 0.5 | HOJA | vainas | mezcla(SOL, SUELO, 55) |
| peanut | Maní | mataBaja | 0.3 | mezcla(HOJA, SOL, 85) | flor | SOL |
| cowpea | Caupí (frijol de vara) | mataBaja | 0.5 | mezcla(VERDE, HOJA, 50) | vainas | mezcla(HOJA, CLARO, 60) |
| potato | Papa | mataBaja | 0.4 | mezcla(VERDE, SUELO, 85) | flor | CLARO |
| canavalia | Canavalia | mataBaja | 0.6 | VERDE | vainas | HOJA |
| watermelon | Sandía | rastrera | 0.3 | VERDE | frutoRedondo | mezcla(VERDE, SUELO, 70) |
| melon | Melón | rastrera | 0.3 | HOJA | frutoRedondo | mezcla(SOL, CLARO, 60) |
| squash | Ayote | rastrera | 0.35 | mezcla(VERDE, HOJA, 50) | frutoRedondo | mezcla(SOL, ROJO, 65) |
| cucumber | Pepino | rastrera | 0.3 | HOJA | frutoLargo | VERDE |
| sweet_potato | Camote | rastrera | 0.3 | mezcla(VERDE, ROJO, 85) | ninguno | VERDE |
| mucuna | Mucuna (frijol terciopelo) | rastrera | 0.4 | VERDE | ninguno | VERDE |
| tomato | Tomate | tutor | 0.65 | VERDE | frutoRedondo | ROJO |
| sweet_pepper | Chile dulce | tutor | 0.55 | HOJA | frutoLargo | mezcla(VERDE, SOL, 60) |
| cabbage | Repollo | roseta | 0.3 | mezcla(HOJA, CLARO, 70) | cabeza | mezcla(HOJA, CLARO, 45) |
| cassava | Yuca | arbusto | 0.95 | VERDE | ninguno | VERDE |
| pigeon_pea | Gandul (frijol de palo) | arbusto | 0.85 | HOJA | vainas | mezcla(SOL, SUELO, 55) |

Genérico: `{ nombre: <el id>, forma: "mataBaja", altura: 0.45, hoja: HOJA, detalle: "ninguno", colorDetalle: HOJA }`.

- [ ] **Step 1: Escribir las pruebas que fallan**

```ts
const LISTADO = ["maize", "beans", "sorghum", "rice", "peanut", "cowpea", "soybean", "sesame", "cassava", "sweet_potato", "potato",
  "tomato", "sweet_pepper", "onion", "cabbage", "cucumber", "watermelon", "melon", "squash", "mucuna", "canavalia", "pigeon_pea"];

test("los 22 cultivos del listado tienen aspecto propio", () => {
  assert.equal(IDS_CULTIVOS.length, 22);
  assert.deepEqual([...IDS_CULTIVOS].sort(), [...LISTADO].sort());
  for (const id of LISTADO) assert.notEqual(aspectoDe(id).nombre, id);
});

test("no hay dos cultivos que se vean igual", () => {
  const firmas = LISTADO.map((id) => { const a = aspectoDe(id); return [a.forma, a.hoja, a.detalle, a.colorDetalle].join("|"); });
  assert.equal(new Set(firmas).size, 22);
});

test("los ids actuales del plan usan alias", () => {
  assert.equal(aspectoDe("maiz"), aspectoDe("maize"));
  assert.equal(aspectoDe("frijol"), aspectoDe("beans"));
  assert.equal(aspectoDe("sorgo"), aspectoDe("sorghum"));
  assert.equal(aspectoDe("frijolAbono"), aspectoDe("mucuna"));
});

test("los nombres salen del plan cuando existen", () => {
  assert.equal(nombreCultivo("frijolAbono"), "Frijol abono");
  assert.equal(nombreCultivo("cassava"), "Yuca");
});

test("un id desconocido usa el aspecto genérico con su id como nombre", () => {
  assert.equal(aspectoDe("quinoa").forma, "mataBaja");
  assert.equal(nombreCultivo("quinoa"), "quinoa");
});

test("alturas dentro de rango y colores solo de tokens", () => {
  for (const id of LISTADO) {
    const a = aspectoDe(id);
    assert.ok(a.altura >= 0.3 && a.altura <= 1);
    for (const c of [a.hoja, a.colorDetalle]) assert.ok(!c.includes("#") && c.includes("var(--"));
  }
});
```

- [ ] **Step 2: Correr y ver que fallan**

Run: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/aspecto-cultivos.test.ts`
Expected: FAIL, no existe `../lib/aspecto-cultivos.ts`.

- [ ] **Step 3: Implementar `app/lib/aspecto-cultivos.ts`** con la tabla de arriba.

- [ ] **Step 4: Correr y ver que pasan**

Run: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/aspecto-cultivos.test.ts`
Expected: 6 pruebas PASS.

- [ ] **Step 5: Commit**

```bash
git add app/lib/aspecto-cultivos.ts app/tests/aspecto-cultivos.test.ts
git commit -m "feat: aspecto visual de los 22 cultivos"
```

---

### Task 4: Dibujo de una planta

**Files:**
- Create: `app/components/simulacion/Planta.tsx`
- Modify: `app/app/globals.css` (agregar al final)

**Interfaces:**
- Consumes: `AspectoCultivo`, `Forma`, `Detalle` (Task 3); `Etapa`, `EstadoCiclo`, `tamanoPlanta` (Task 2).
- Produces:

```tsx
interface PropsPlanta {
  aspecto: AspectoCultivo;
  estado: EstadoCiclo;
  x: number;            // punto de la base en el SVG del terreno
  y: number;
  cosechada: boolean;   // en etapa "cosecha": esta planta ya se retiró
}
export function Planta(props: PropsPlanta): JSX.Element;

/** La misma planta adulta en un SVG propio de 24×24, para la leyenda. */
export function PlantaLeyenda({ id, className }: { id: string; className?: string }): JSX.Element;
```

Reglas de dibujo:

- Cada planta es un `<g transform="translate(x y)">` con tres capas hijas, todas con la clase `planta-sim`:
  1. **Montículo** (elipse de `var(--decor-suelo)` más clara): visible en siembra y germinación.
  2. **Cuerpo** (la forma): `style={{ transform: scale(t) }}` con `t = tamanoPlanta(estado) × aspecto.altura`; `t = 0` si `cosechada`.
  3. **Detalle** (fruto, espiga, vaina…): dentro del cuerpo, `opacity` 0 hasta maduración, donde vale `avanceEtapa`; 1 en cosecha.
  4. **Rastrojo** (dos trazos cortos color `color-mix(in oklab, var(--decor-sol) 50%, var(--decor-suelo))`): `opacity` 1 si `cosechada` o etapa rastrojo (multiplicada por `1 − avanceEtapa/2` en rastrojo).
- Las 7 formas se dibujan en una caja de 20 de ancho × 28 de alto con la base en `(0, 0)` y creciendo hacia `y` negativa. Una función por forma (`Cana`, `Macolla`, `MataBaja`, `Rastrera`, `Tutor`, `Roseta`, `Arbusto`), cada una con 2 a 4 `<path>` como máximo, en el trazo redondeado de `dibujos.tsx`.
- `Rastrera` no crece hacia arriba: se extiende a lo ancho (escala desde el centro de la base).
- En maduración, las formas `cana` y `macolla` mezclan el color de hoja 30% hacia `var(--decor-sol)` (se secan). Las demás no cambian de color.

CSS a agregar al final de `globals.css`:

```css
/* Simulación de la parcela: las plantas crecen desde la base entre un paso y otro */
.planta-sim {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  transition: transform 380ms var(--ease-out-strong), opacity 380ms ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .planta-sim {
    transition: none;
  }
}
```

- [ ] **Step 1: Agregar el CSS a `app/app/globals.css`**

- [ ] **Step 2: Implementar `Planta` y `PlantaLeyenda` en `app/components/simulacion/Planta.tsx`**

- [ ] **Step 3: Verificar tipos y lint**

Run: `npm run typecheck` y `npm run lint`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add app/components/simulacion/Planta.tsx app/app/globals.css
git commit -m "feat: dibujo de plantas por forma y etapa"
```

---

### Task 5: Terreno isométrico

**Files:**
- Create: `app/components/simulacion/Terreno.tsx`

**Interfaces:**
- Consumes: `Ciclo`, `estadoCarril`, `numCarriles`, `surcosPara`, `NivelLluvia` (Tasks 1–2); `aspectoDe` (Task 3); `Planta` (Task 4).
- Produces:

```tsx
interface PropsTerreno {
  ciclos: Ciclo[];
  paso: number;                // 0–47
  lluvia: NivelLluvia;
  dificil: boolean;            // mes difícil: el cielo usa el tono de aviso
  descripcion: string;         // texto alternativo del mes actual
  className?: string;
}
export function Terreno(props: PropsTerreno): JSX.Element;
```

Reglas:

- `<svg viewBox="0 0 400 280" role="img" aria-label={descripcion}>`.
- `S = surcosPara(numCarriles(ciclos))` surcos y `P = 10` plantas por surco.
- Proyección de la planta en surco `s`, posición `p`:
  `x = 200 + (p − s) × (160 / max(S, P))`, `y = 110 + (p + s) × (80 / max(S, P))`.
- El rombo de tierra cubre esas posiciones con un margen de una celda, color `var(--decor-suelo)`, con un borde inferior más oscuro (`color-mix` con `var(--foreground)` al 20%) que da el grosor del terreno. No cambia nunca de forma ni de posición.
- Cada surco es una línea a lo largo de `p`, un tono más oscuro que la tierra. En carriles en descanso (sin `estadoCarril`) la línea va al 40% de opacidad.
- El surco `s` pertenece al carril `s mod numCarriles`. Si no hay carriles, solo se dibuja la tierra.
- Las plantas se dibujan ordenadas por `p + s` ascendente (las de atrás primero).
- Variación fija: cada planta desplaza su base hasta ±2 px según un hash entero de `(s, p)`; el mismo hash, normalizado a 0–1, decide `cosechada`: en etapa cosecha, la planta está cosechada si `hash01 < avanceEtapa`.
- La `key` de cada `<Planta>` es `` `${s}-${p}` `` (no incluye el cultivo), para que la transición CSS se mantenga cuando un cultivo releva a otro.
- Cielo, arriba del rombo: nube de `var(--decor-cielo)` con 0, 3 o 7 gotas de `var(--chart-3)` según `lluvia` ("poca", "regular", "mucha"). Con `dificil`, un sol de `var(--decor-sol)` si la lluvia es "poca".

- [ ] **Step 1: Implementar `Terreno` en `app/components/simulacion/Terreno.tsx`**

- [ ] **Step 2: Verificar tipos y lint**

Run: `npm run typecheck` y `npm run lint`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add app/components/simulacion/Terreno.tsx
git commit -m "feat: terreno isométrico de la simulación"
```

---

### Task 6: Línea de tiempo y diálogo

**Files:**
- Create: `app/components/simulacion/LineaTiempo.tsx`
- Create: `app/components/simulacion/SimulacionParcela.tsx`

**Interfaces:**
- Consumes: todo lo de Tasks 1–5; `agruparPlan` de `lib/plan.ts`; `MESES`, `MESES_LARGOS` de `lib/textos.ts`; `BotonSecundario`, `IconoAtras`, `IconoGota` de `components/ui.tsx`.
- Produces:

```tsx
// SimulacionParcela.tsx  ("use client")
interface PropsSimulacion {
  plan: PlanAnual;
  division: Division;     // la que el usuario tenía en el plan: vista inicial
  lugar: string;
  abierta: boolean;
  onCerrar: () => void;
}
export function SimulacionParcela(props: PropsSimulacion): JSX.Element;

// LineaTiempo.tsx
interface PropsLineaTiempo {
  vista: Vista;
  onVista: (v: Vista) => void;
  periodos: { id: string; nombre: string }[];   // [] en vista anual
  periodo: number;
  onPeriodo: (i: number) => void;
  paso: number;
  rango: [number, number];
  onPaso: (p: number) => void;
  reproduciendo: boolean;
  onReproducir: () => void;                     // alterna reproducir / pausar
  onAnterior: () => void;
  onSiguiente: () => void;
  mesesDificiles: number[];
}
export function LineaTiempo(props: PropsLineaTiempo): JSX.Element;
```

Comportamiento de `SimulacionParcela`:

- Un `<dialog>` con `ref`; un efecto llama `showModal()` cuando `abierta` pasa a verdadero y `close()` cuando pasa a falso. El evento `close` del diálogo (Esc incluido) llama `onCerrar`. Clases: pantalla completa (`h-dvh w-dvw max-h-none max-w-none`), `bg-background text-foreground`, `print:hidden`.
- Estado: `vista` (inicial = `division`), `periodo` (inicial 0), `paso` (inicial = inicio del rango), `reproduciendo` (inicial `false`).
- `ciclos = useMemo(() => ciclosDelPlan(plan), [plan])`.
- Al abrir: `vista = division`, `periodo = 0`, `paso` al inicio del rango, y empieza a reproducir salvo que `matchMedia("(prefers-reduced-motion: reduce)")` coincida.
- Reproducción: `setInterval` de 400 ms que suma 1 a `paso`; al llegar al final del rango se detiene. El efecto limpia el intervalo al pausar, al cerrar y al desmontar.
- Reproducir estando en el final del rango vuelve primero al inicio.
- Mover la barra, o tocar ⏮ ⏭, pausa.
- Cambiar de vista conserva el mes: el nuevo `periodo` es el que contiene el `paso` actual.
- ⏮ ⏭: en vista anual mueven al primer paso del mes anterior o siguiente (sin salir de 0–47); en las otras vistas cambian de periodo (sin dar la vuelta) y dejan `paso` en su inicio.

Textos exactos:

| Dónde | Texto |
|---|---|
| Botón de cierre | `Volver al plan` (con `IconoAtras`) |
| Título (`<h2>`) | `Tu parcela en el año` + `<span>` apagado `(simulado)` |
| Subtítulo | `{lugar}` |
| Indicador, vista anual | `{Mes largo con mayúscula inicial}` |
| Indicador, otras vistas | `{Mes} · {nombre del periodo}` — ej. `Junio · Abr – Jun` |
| Línea de siembra (si hay) | `Se siembra: {nombres}` |
| Línea de cosecha (si hay) | `Se cosecha: {nombres}` |
| Línea de terreno (si hay) | `En el terreno: {nombres}` |
| Si `MesPlan.cultivos` está vacío | `Tierra en descanso` |
| Lluvia | `Lluvia: {mm con toLocaleString("es-HN")} mm` (con `IconoGota`) |
| Vistas | `Año` · `Semestres` · `Trimestres` |
| `aria-label` de los controles | `Anterior` · `Reproducir` / `Pausar` · `Siguiente` · barra: `Momento del año` |
| Leyenda | `PlantaLeyenda` + `nombreCultivo(id)` por cada cultivo con algún ciclo |
| Nota | `Ilustración de tu plan. No es una predicción.` |
| Fuente | `Lluvia: {dataset}, promedio {periodo}, consultado el {consultado.slice(0, 10)}. Meses de siembra: reglas de ejemplo (simulado).` |

- Los nombres se unen con `, ` usando `nombreCultivo`.
- Las líneas de siembra, cosecha, terreno y lluvia salen del `MesPlan` del mes de `paso` (`Math.floor(paso / 4)`), y van en un contenedor `aria-live="polite"` que solo se actualiza cuando **no** está reproduciendo.
- `descripcion` del `Terreno`: el indicador más las líneas del mes, en una sola frase.

`LineaTiempo`:

- Selector de vista: tres botones con `aria-pressed`, mismo estilo de pastilla que el selector de divisiones de `ModuloPlan.tsx` (líneas 52–75), en tres columnas.
- En vistas semestral y trimestral, una fila de chips con el `nombre` de cada periodo (`aria-pressed` en el actual); tocarlos llama `onPeriodo`.
- Controles ⏮ ▶/⏸ ⏭: botones redondos de `min-h-11 min-w-11`, con iconos SVG en línea del mismo trazo que `components/ui.tsx`.
- Barra: `<input type="range" min={rango[0]} max={rango[1]} step={1} value={paso}>` con `aria-valuetext` = nombre del mes. Debajo, las iniciales de los meses del rango en una cuadrícula; los difíciles con fondo `bg-dificil` y en negrita, como en `CalendarioCultivos.tsx`.

Disposición: en celular, una columna con el terreno arriba (ocupa el alto libre) y los controles abajo. Desde `lg`, terreno a la izquierda y columna de controles de ancho fijo a la derecha.

- [ ] **Step 1: Implementar `LineaTiempo.tsx`**

- [ ] **Step 2: Implementar `SimulacionParcela.tsx`**

- [ ] **Step 3: Verificar tipos y lint**

Run: `npm run typecheck` y `npm run lint`
Expected: sin errores (en especial, ninguna advertencia de `react-hooks`).

- [ ] **Step 4: Commit**

```bash
git add app/components/simulacion/LineaTiempo.tsx app/components/simulacion/SimulacionParcela.tsx
git commit -m "feat: diálogo y línea de tiempo de la simulación"
```

---

### Task 7: Integración en el plan y verificación

**Files:**
- Modify: `app/components/modulos/ModuloPlan.tsx`

**Interfaces:**
- Consumes: `SimulacionParcela` (Task 6); `BotonSecundario` de `components/ui.tsx`.
- Produces: nada nuevo; las props de `ModuloPlan` no cambian.

Cambios en `ModuloPlan.tsx`:

- Agregar `"use client";` al inicio si el archivo no lo tiene (usa `useState`).
- `const [simulacionAbierta, setSimulacionAbierta] = useState(false);`
- Justo **antes** del `BotonPrimario` de "Guardar como PDF":

```tsx
<BotonSecundario onClick={() => setSimulacionAbierta(true)}>
  <IconoParcela className="size-5" />
  Ver mi parcela en el año
</BotonSecundario>
```

- `IconoParcela`: un icono nuevo en `components/ui.tsx`, junto a los demás y con el mismo patrón: un rombo con dos surcos (`<path d="M12 4l9 5-9 5-9-5 9-5z" /><path d="M7.5 11.5l9 5M3 14l9 5 9-5" />`).
- Al final del `<div>` raíz: `<SimulacionParcela plan={plan} division={division} lugar={lugar} abierta={simulacionAbierta} onCerrar={() => setSimulacionAbierta(false)} />`.
- Nada más del archivo cambia.

- [ ] **Step 1: Hacer los cambios en `ModuloPlan.tsx` y agregar `IconoParcela` a `ui.tsx`**

- [ ] **Step 2: Verificación automática completa**

Run, desde `app/`: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`
Expected: todas las pruebas PASS (las anteriores más 25 nuevas), sin errores de lint ni de tipos, build correcto.

Run, desde la raíz del repo: `npm run check`
Expected: pasa.

- [ ] **Step 3: Revisión manual en el navegador**

Run: `npm run dev`, abrir la app, usar "Ver ejemplo" hasta llegar a "Tu plan del año". Comprobar cada punto en ancho de celular (390 px) y de escritorio:

1. El plan se ve igual que antes; el botón nuevo está encima de "Guardar como PDF".
2. Al abrir, la simulación arranca sola en la división que estaba elegida en el plan.
3. Las tres vistas reproducen su tramo y se detienen al final; ⏮ ⏭ y la barra pausan.
4. El terreno no cambia de forma ni de lugar; el frijol nace en los surcos donde estuvo el maíz.
5. Los textos del mes coinciden con el calendario de siembra del plan.
6. Esc y "Volver al plan" cierran; al reabrir empieza desde el inicio; el plan y el mapa siguen como estaban.
7. Cerrar a media reproducción y esperar 5 s: no hay errores en la consola.
8. Con "reducir movimiento" activo: no arranca sola y los pasos cambian sin transición.
9. Con teclado: Tab recorre los controles dentro del diálogo y las flechas mueven la barra.
10. "Guardar como PDF" sigue dando el mismo PDF, sin la simulación.
11. En modo "mis cultivos" con un solo cultivo: los meses sin cultivo dicen "Tierra en descanso".

- [ ] **Step 4: Commit**

```bash
git add app/components/modulos/ModuloPlan.tsx app/components/ui.tsx
git commit -m "feat: botón Ver mi parcela en el año en el plan"
```
