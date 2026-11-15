# Surco · Nuevo recorrido: elegir lugar → información o plan anual

> Actualización: la app adopta la marca **Surco** (kit de marca en `Downloads/surco-kit-de-marca`). Donde este documento dice "Milpa" o "Mi Parcela", aplica el tema `surco` y el nombre Surco (ver Task 0b del plan).

Fecha: 14 de noviembre de 2026 · Reto 7: Field Shift · App en `app/`

## Para qué y para quién

Agricultores de pueblo en Honduras, con poca escuela, que usan la app en el celular. Deben poder entenderla casi sin leer. El rediseño visual "Milpa" (tema cálido, dibujos a color, letra grande) ya está hecho en el árbol de trabajo, sin commit todavía: este cambio se construye **encima** de ese rediseño y usa sus piezas (`components/dibujos.tsx`, `components/ui.tsx`, tema `milpa`).

Un compañero del equipo está construyendo el backend y las APIs. **El contrato de datos lo define el frontend en `lib/tipos.ts`, y el backend se ajusta a él.** Mientras la API no exista, la app funciona con datos de respaldo locales.

## El recorrido (decidido por el usuario)

1. **Inicio:** se ve el mapa de Honduras.
2. El usuario elige su lugar de una de estas formas:
   - Lista de **departamentos**; al elegir uno, lista de **municipios** de ese departamento.
   - Botón **"Usar mi ubicación"** (geolocalización).
   - *(Decisión del builder: tocar el mapa sigue funcionando, como hoy.)*
3. Con el lugar elegido, dos caminos:
   - **Ver información del lugar:** clima, altura y lluvia esperada. Al terminar, un botón lleva **directo** a armar el plan.
   - **Armar el plan.**
4. **Armar el plan**, de dos formas:
   - **"Recomiéndame"**: la app elige los cultivos según los datos NASA del lugar.
   - **"Yo elijo mis cultivos"**: el usuario marca lo que siembra y el plan se arma con esos cultivos.
5. **El plan cubre un año** y se puede ver **por trimestres** o **por semestres**.

```
Inicio (mapa + departamento → municipio + "Usar mi ubicación")
   └─ Lugar elegido
        ├─ Ver información ──────────────┐
        │                                 ▼
        └─ Armar mi plan ─► ¿Cómo? ─► [Elijo mis cultivos] ─► Plan del año
                              └─────► [Recomiéndame] ────────► (trimestres | semestres)
```

## Metas, no metas y anti-metas

**Metas**
- El recorrido de arriba funciona de principio a fin en el celular, con o sin internet (respaldo local).
- El plan del año es entendible sin leer mucho: cada periodo con dibujo del cultivo, nombre de los meses y una acción corta.
- Los datos NASA (NASA POWER) se ven en la información del lugar y en el plan (lluvia esperada por periodo), con nombre del dataset y fecha.
- Todo lo inventado se marca "(simulado)" en pantalla (regla 5 de `AGENTS.md`).
- Cambiar los datos de respaldo por la API real solo requiere tocar `lib/api.ts`.

**No metas**
- Login, cuentas, guardar planes en servidor.
- Plan de varios años.
- Precios de mercado reales.

**Anti-metas (fallaría aunque funcione)**
- Que el agricultor tenga que leer párrafos para entender qué sembrar y cuándo.
- Que las pantallas llamen a `fetch` directamente: el compañero del backend tendría que reescribir componentes.
- Presentar datos inventados como reales.

## Decisiones tomadas

### Por el usuario
- El recorrido de 5 puntos de arriba.
- Plan de **un año**, visible **por trimestres o por semestres**.
- Dos formas de armar el plan: recomendación de la app o cultivos elegidos.
- Desde "Ver información" se puede ir directo a armar el plan.
- Se pueden inventar datos donde falten.
- El contrato lo define el frontend en `lib/tipos.ts`; el backend se ajusta.

### Por Claude (revisables)
- **Periodos:** trimestres fijos del calendario: Ene–Mar, Abr–Jun, Jul–Sep, Oct–Dic. Semestres: Ene–Jun, Jul–Dic.
- **Trimestral o semestral** es un selector de dos botones **en la pantalla del plan** (no un paso aparte). Arranca en **trimestral**. Cambiarlo solo reagrupa el mismo plan, sin recalcular.
- **Se elimina** el paso "Tu tierra en 3 años" (caritas y comparación de rotaciones) y el plan de 2 años. La idea de "tierra cubierta" sobrevive como un dato dentro de cada periodo ("la tierra queda cubierta" / "la tierra queda desnuda").
- **Se elimina** la pregunta "¿Qué te importa más?" (prioridad). La recomendación se basa solo en el clima del lugar. `Prioridad` sale del contrato.
- **Municipios:** datos reales si se pueden obtener (ver Datos); si no, lista inventada marcada "(simulado)".
- **Cultivos:** se mantienen los 4 de hoy (maíz, frijol, sorgo, frijol abono). No se agregan más en este cambio.
- **Compartir por WhatsApp** se mantiene en la pantalla del plan, con el texto adaptado al plan anual.

## Contrato de datos (`lib/tipos.ts`)

Se agregan o cambian estos tipos. Los que no se mencionan (`Celda`, `ResumenPower`, `MesClima`, `ClimaZona`, `DepartamentosGeoJSON`, `ReglaCultivo`, etc.) quedan igual.

```ts
/** Un municipio de Honduras. `centro` es el punto que se usa para pedir el clima. */
export interface Municipio {
  id: string;            // código oficial si existe (p. ej. "HN0401"), si no un slug
  nombre: string;        // "Gracias"
  departamento: string;  // igual que PropiedadesDepartamento.nombre
  lat: number;
  lon: number;
}

/** El lugar elegido por cualquiera de los 3 caminos. Reemplaza a Punto. */
export interface Lugar {
  lat: number;
  lon: number;
  departamento: string;
  municipio: string | null;        // desde ubicación o mapa: el municipio más cercano de ese departamento; null solo si no hay datos
  origen: "lista" | "ubicacion" | "mapa";
  celda: Celda;                    // cuadro NASA POWER más cercano (respaldo)
}

export type ModoPlan = "recomendado" | "mis-cultivos";
export type Division = "trimestral" | "semestral";
export type AccionPeriodo = "sembrar" | "cuidar" | "cosechar" | "cubrir" | "descansar";

/** Un mes del plan: la unidad base. Los periodos se arman agrupando meses. */
export interface MesPlan {
  mes: number;                     // 1–12
  cultivos: CultivoId[];           // lo que está en el terreno ese mes ([] = nada)
  accion: AccionPeriodo;
  lluvia: number;                  // mm, promedio NASA POWER 2015–2025 del lugar
  dificil: boolean;                // canícula o aguacero (ClimaZona.mesesDificiles)
  cubierta: boolean;               // la tierra tiene algo sembrado o abono
}

/** Un trimestre o semestre ya agrupado, listo para pintar. */
export interface PeriodoPlan {
  id: string;                      // "T1".."T4" o "S1","S2"
  nombre: string;                  // "Ene – Mar"
  meses: number[];                 // [1, 2, 3]
  cultivos: CultivoId[];           // unión de los cultivos de sus meses
  accionPrincipal: AccionPeriodo;
  consejo: string;                 // 1 frase corta, en lenguaje sencillo
  lluviaEsperada: number;          // mm, suma de los meses
  alerta: string | null;           // "Canícula en julio" / "Aguaceros fuertes"
  mesesCubierta: number;           // cuántos de sus meses la tierra queda cubierta
}

export interface PlanAnual {
  modo: ModoPlan;
  cultivosElegidos: CultivoId[];   // en "recomendado", los que eligió la app
  meses: MesPlan[];                // siempre 12, enero a diciembre
  resumen: string;                 // 1–2 frases: por qué este plan para este lugar
  fuente: { dataset: string; periodo: string; consultado: string };
  simulado: true;                  // el calendario de cultivos sale de reglas inventadas
}
```

Se eliminan del contrato: `Punto` (reemplazado por `Lugar`), `Prioridad`, `EvaluacionRotacion`, `Resultado`, `FilaPlan`. `Rotacion` y `Temporada` pueden quedarse si el motor las sigue usando internamente.

Los periodos **no** viajan en la API: la API devuelve los 12 `MesPlan` y el frontend agrupa con una función pura `agruparPlan(plan: PlanAnual, division: Division): PeriodoPlan[]` en `lib/plan.ts`. Así cambiar de trimestral a semestral no hace otra petición, y el backend solo tiene que calcular meses.

## Capa de acceso (`lib/api.ts`)

Único lugar que sabe de dónde vienen los datos. Las pantallas solo importan de aquí.

```ts
export async function obtenerMunicipios(departamento: string): Promise<Municipio[]>;
export async function obtenerClima(lat: number, lon: number, signal?: AbortSignal): Promise<ClimaZona>;
export async function armarPlan(pedido: PedidoPlan, signal?: AbortSignal): Promise<PlanAnual>;

export interface PedidoPlan {   // también va en lib/tipos.ts
  lat: number;
  lon: number;
  modo: ModoPlan;
  cultivos: CultivoId[];        // vacío si modo = "recomendado"
}
```

Cada función intenta la API y, si falla o no existe, usa el respaldo local. Endpoints que el backend debe implementar (y que este cambio deja funcionando con respaldo):

| Endpoint | Respuesta | Respaldo hoy |
|---|---|---|
| `GET /api/municipios?departamento=<nombre>` | `Municipio[]` | `public/fallback/municipios.json` filtrado |
| `GET /api/clima?lat=&lon=` | `ClimaZona` | ya existe; respaldo `celdas.json` |
| `POST /api/plan` con `PedidoPlan` | `PlanAnual` | motor local `lib/motor.ts` con el `ClimaZona` del lugar |

Para el respaldo de `/api/plan` no hace falta crear el route handler: `armarPlan` puede pedir el clima con `obtenerClima` y correr el motor local. Si el builder prefiere crear `app/api/plan/route.ts` que use el mismo motor, también vale, siempre que la pantalla no cambie.

Documentar estos tres endpoints y los tipos en `app/README.md` (sección "Contrato con el backend") para el compañero.

## Datos

### Municipios
- **Preferido:** geoBoundaries HND **ADM2** (municipios), misma fuente que los departamentos (`scripts/fuentes/geoboundaries-hnd-adm1.geojson`, licencia ODbL). Un script `scripts/generar-municipios.ts` calcula el centro de cada municipio, le asigna departamento con `lib/geo.ts` (punto dentro del polígono ADM1) y escribe `public/fallback/municipios.json` (solo `Municipio[]`, sin polígonos, para que pese poco). Guardar el GeoJSON fuente en `scripts/fuentes/`.
- **Si no se puede descargar:** lista inventada con al menos 4–6 municipios por departamento (los 18), con coordenadas aproximadas a la cabecera. En ese caso la lista muestra "(simulado)" en pantalla.

### Calendario de cultivos (inventado, marcado "(simulado)")
Ampliar `data/reglas.json` con, por cultivo:
- `mesesSiembra`: meses en que se siembra según tipo de zona (`seca`, `equilibrada`, `lluviosa`).
- `duracionMeses`: cuánto dura en el terreno.
- Referencia hondureña: **primera** se siembra en mayo–junio, **postrera** en agosto–septiembre, **apante** (solo zonas lluviosas del norte y Atlántico) en noviembre–diciembre. Enero–abril es verano: en zonas secas la tierra descansa o queda con frijol abono.

### Motor (`lib/motor.ts`)
Reescribir la salida para producir `PlanAnual`:
- **"mis-cultivos":** coloca cada cultivo elegido en su temporada según el tipo de zona; si un cultivo no conviene en esa zona (p. ej. frijol en postrera en zona lluviosa), lo mueve a la temporada segura y lo dice en el `consejo`. Si quedan meses sin nada, sugiere frijol abono para cubrir y lo marca como sugerencia.
- **"recomendado":** elige la mejor combinación para la zona reutilizando las rotaciones de `data/rotaciones.json` (año 1) y las reglas de tolerancia ya existentes.
- `lluvia` y `dificil` de cada mes salen del `ClimaZona` (datos NASA reales).
- `resumen` en una o dos frases sencillas, como las de hoy en `explicar()`.

## Pantallas

Todo sigue en la pantalla única de `components/Explorador.tsx`: mapa siempre visible y panel que avanza. Pasos (`Paso`):

| Paso | Contenido |
|---|---|
| `inicio` | Título "¿Dónde está tu terreno?". Selector **Departamento** (lista de los 18) y, al elegir, selector **Municipio**: `<select>` nativos con etiqueta visible y 56 px de alto (en el celular abren el selector del sistema, que el usuario ya conoce). Botón grande "Usar mi ubicación". Pista: "o toca el mapa". Ejemplos Lempira / Atlántida y "Así llueve en Honduras" se conservan abajo. Al elegir departamento, el mapa se acerca a él. |
| `lugar` | Escena del clima, nombre del municipio y departamento, chips (zona, altura, lluvia al año). Dos botones grandes: **"Ver cómo es el clima aquí"** y **"Armar mi plan"**. "Elegir otro lugar". |
| `info` | Lo que hoy es `ModuloClima`: título sencillo, gráfica mensual, peor año, altura y lluvia esperada del año. Fuente NASA visible. Botón principal **"Armar mi plan"**. |
| `modo` | "¿Cómo quieres tu plan?" Dos tarjetas grandes con dibujo: **"Recomiéndame"** (la app elige) y **"Yo elijo mis cultivos"**. |
| `cultivos` | Solo si eligió sus cultivos. Las tarjetas con dibujo de `ModuloCultivos` (sin la pregunta de prioridad). Botón "Ver mi plan", deshabilitado si no hay ninguno marcado. |
| `plan` | Selector **Por trimestres / Por semestres**. Resumen en una frase. Una tarjeta por periodo: nombre de meses grande, dibujos de los cultivos, acción ("Siembra", "Cuida", "Cosecha", "Cubre la tierra", "Descansa"), consejo, lluvia esperada en mm, alerta si hay mes difícil, indicador "tierra cubierta X de Y meses". "(simulado)" junto al título. Botón "Enviar por WhatsApp" y el aviso de revisar con el técnico agrícola. Fuente NASA abajo. |

- "Atrás" vuelve al paso anterior real (de `plan` a `cultivos` o a `modo`; de `info` a `lugar`).
- La barra de 4 pasos con íconos de hoy se reemplaza por un indicador que tenga sentido para dos caminos. *Decisión del builder*, con la condición de que el agricultor siempre sepa dónde está y cómo volver.
- Mientras se pide el clima o el plan, el mensaje de carga de hoy ("Preguntando a NASA POWER…").

## Restricciones

- Reglas de `AGENTS.md`: español, datos NASA visibles con nombre y fecha, "(simulado)" en lo inventado, tema de `design-tokens/` (Milpa), sin logo de NASA, sin claves en el cliente.
- Next.js 16 del proyecto: leer `app/node_modules/next/dist/docs/` antes de escribir route handlers o APIs nuevas (ver `app/AGENTS.md`).
- Sin dependencias nuevas.
- Accesible: selectores con `<label>`, foco visible, objetivos táctiles ≥ 44 px, el plan legible a 360 px de ancho sin scroll horizontal.
- Antes de terminar: `npm run typecheck`, `npm run lint` y `npm run build` en `app/`; `npm run check` en la raíz.

## Lo que queda al builder

- Componentes y nombres de archivo de las pantallas nuevas (respetando el estilo de los existentes).
- Cómo agrupar meses en periodos cuando un cultivo cruza dos trimestres (debe aparecer en ambos).
- Textos exactos de consejos y acciones, siempre en frases cortas y sencillas.
- El indicador de progreso para dos caminos.
- Si `/api/plan` se implementa como route handler o solo en `lib/api.ts`.
