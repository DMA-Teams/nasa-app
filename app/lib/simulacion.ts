// Lógica de la simulación visual de la parcela: qué cultivo ocupa cada surco y en qué etapa se ve en cada momento.
// Funciones puras (las usan la pantalla y las pruebas). No inventa fechas: solo reordena los meses del plan.
import { nombreCultivo } from "./aspecto-cultivos.ts";
import { CULTIVOS } from "./cultivos.ts";
import { MESES_LARGOS } from "./textos.ts";
import type { Division, MesPlan, PlanAnual } from "./tipos";

export const PASOS_POR_MES = 4;
export const PASOS_ANIO = 48;
export const SURCOS_BASE = 8;

/** Una siembra de un cultivo, de su primer mes a su último mes en el terreno. */
export interface Ciclo {
  cultivo: string;
  meses: number[]; // 1–12, en orden de tiempo; puede cruzar de 12 a 1
  tieneCosecha: boolean; // el último mes aparece en `cosechados`
  carril: number; // 0…numCarriles-1
}

/** Los ciclos del plan, ordenados por su primer mes, cada uno con su carril. */
export function ciclosDelPlan(plan: PlanAnual): Ciclo[] {
  const ids: string[] = [...plan.cultivosElegidos];
  for (const m of plan.meses) for (const id of m.cultivos) if (!ids.includes(id)) ids.push(id);
  const tiene = (lista: string[], id: string) => lista.includes(id);

  const ciclos: Ciclo[] = [];
  for (const id of ids) {
    const presente = plan.meses.map((m) => tiene(m.cultivos, id));
    if (!presente.some(Boolean)) continue;
    // Un ciclo empieza donde se siembra, o donde el cultivo aparece sin haber estado el mes anterior
    const empieza = presente.map((p, i) => p && (tiene(plan.meses[i].sembrados, id) || !presente[(i + 11) % 12]));
    if (!empieza.some(Boolean)) empieza[0] = true; // todo el año en el terreno y sin siembra: empieza en enero

    for (let inicio = 0; inicio < 12; inicio++) {
      if (!empieza[inicio]) continue;
      const meses = [inicio + 1];
      for (let i = 1; i < 12; i++) {
        const mes = (inicio + i) % 12; // da la vuelta al año: diciembre → enero
        if (!presente[mes] || empieza[mes]) break;
        meses.push(mes + 1);
      }
      ciclos.push({ cultivo: id, meses, tieneCosecha: tiene(plan.meses[meses.at(-1)! - 1].cosechados, id), carril: 0 });
    }
  }

  // Orden estable: por primer mes; en empates queda el orden de los cultivos elegidos
  ciclos.sort((a, b) => a.meses[0] - b.meses[0]);

  // Cada ciclo toma el primer carril donde ningún otro ciclo comparte un mes con él
  const carriles: Ciclo[][] = [];
  for (const ciclo of ciclos) {
    const libre = carriles.findIndex((ocupantes) => ocupantes.every((o) => !o.meses.some((m) => ciclo.meses.includes(m))));
    ciclo.carril = libre === -1 ? carriles.length : libre;
    (carriles[ciclo.carril] ??= []).push(ciclo);
  }
  return ciclos;
}

/** Cuántos carriles hacen falta: el máximo de cultivos que el plan tiene a la vez. */
export function numCarriles(ciclos: Ciclo[]): number {
  return ciclos.reduce((max, c) => Math.max(max, c.carril + 1), 0);
}

/** Surcos del terreno: 8, o más si hay más carriles, para que ninguno se quede sin surco. */
export function surcosPara(carriles: number): number {
  return Math.max(SURCOS_BASE, carriles);
}

// ---------- Etapas ----------
// El plan solo fija el mes de siembra y el de cosecha. Lo demás (preparación, germinación, crecimiento,
// maduración) es una transición genérica repartida dentro de la duración real del ciclo, sin agregar meses.

export type Etapa = "preparacion" | "siembra" | "germinacion" | "crecimiento" | "maduracion" | "cosecha" | "rastrojo";

export interface EstadoCiclo {
  etapa: Etapa;
  avanceEtapa: number; // 0–1 dentro de la etapa
}

/** Paso 0 = primera semana de enero; paso 47 = última de diciembre. null = el ciclo no está en el terreno. */
export function estadoEn(ciclo: Ciclo, paso: number): EstadoCiclo | null {
  const indiceMes = ciclo.meses.indexOf(Math.floor(paso / PASOS_POR_MES) + 1);
  if (indiceMes === -1) return null;
  const total = ciclo.meses.length * PASOS_POR_MES;
  const k = indiceMes * PASOS_POR_MES + (paso % PASOS_POR_MES);

  const inicioCosecha = ciclo.tieneCosecha ? total - PASOS_POR_MES : total;
  if (k >= inicioCosecha) return { etapa: "cosecha", avanceEtapa: (k - inicioCosecha + 1) / PASOS_POR_MES };
  if (k === 0) return { etapa: "preparacion", avanceEtapa: 1 };
  if (k < PASOS_POR_MES) return { etapa: "siembra", avanceEtapa: (k - 1) / 2 };

  // Pasos intermedios: 20% germinación, 50% crecimiento, 30% maduración
  const intermedios = inicioCosecha - PASOS_POR_MES;
  const i = k - PASOS_POR_MES;
  const finGerminacion = Math.ceil(intermedios * 0.2);
  const finCrecimiento = Math.ceil(intermedios * 0.7);
  if (i < finGerminacion) return { etapa: "germinacion", avanceEtapa: i / finGerminacion };
  if (i < finCrecimiento) return { etapa: "crecimiento", avanceEtapa: (i - finGerminacion) / (finCrecimiento - finGerminacion) };
  return { etapa: "maduracion", avanceEtapa: (i - finCrecimiento + 1) / (intermedios - finCrecimiento) };
}

const PASOS_RASTROJO = 2;

/**
 * Lo que se ve en un carril en un paso: un ciclo activo, o el rastrojo del que acaba de terminar, o null (descanso).
 * Un carril muestra sus propios ciclos y, además, los de un vecino cuando el carril queda libre durante todo ese ciclo:
 * así un cultivo que va solo (frijol después de maíz y sorgo) llena la parcela y no deja surcos vacíos.
 */
export function estadoCarril(ciclos: Ciclo[], carril: number, paso: number): { ciclo: Ciclo; estado: EstadoCiclo } | null {
  const propios = ciclos.filter((c) => c.carril === carril);
  const prestados = ciclos.filter((c) => c.carril !== carril && propios.every((p) => !p.meses.some((m) => c.meses.includes(m))));
  const visibles = [...propios, ...prestados];

  for (const ciclo of visibles) {
    const estado = estadoEn(ciclo, paso);
    if (estado) return { ciclo, estado };
  }
  for (const ciclo of visibles) {
    if (!ciclo.tieneCosecha) continue;
    const ultimoPaso = ciclo.meses.at(-1)! * PASOS_POR_MES - 1;
    const pasados = (paso - ultimoPaso + PASOS_ANIO) % PASOS_ANIO; // circular: diciembre → enero
    if (pasados >= 1 && pasados <= PASOS_RASTROJO) return { ciclo, estado: { etapa: "rastrojo", avanceEtapa: pasados / PASOS_RASTROJO } };
  }
  return null;
}

/** Tamaño de la planta, de 0 (nada) a 1 (adulta). */
export function tamanoPlanta({ etapa, avanceEtapa }: EstadoCiclo): number {
  if (etapa === "germinacion") return 0.1 + 0.15 * avanceEtapa;
  if (etapa === "crecimiento") return 0.3 + 0.6 * avanceEtapa;
  if (etapa === "maduracion" || etapa === "cosecha") return 1;
  return 0;
}

// ---------- Tiempo y lluvia ----------

export type Vista = "anual" | Division;

/** Primer y último paso (inclusive) del tramo. `periodo` es el índice 0…n-1; se ignora en "anual". */
export function rangoPasos(vista: Vista, periodo: number): [number, number] {
  if (vista === "anual") return [0, PASOS_ANIO - 1];
  const largo = vista === "semestral" ? PASOS_ANIO / 2 : PASOS_ANIO / 4;
  return [periodo * largo, periodo * largo + largo - 1];
}

export type NivelLluvia = "poca" | "regular" | "mucha";

/** Qué tanto llueve en un mes, para dibujar el cielo (el número en mm siempre se muestra aparte). */
export function nivelLluvia(mm: number): NivelLluvia {
  return mm < 60 ? "poca" : mm < 200 ? "regular" : "mucha";
}

// ---------- Textos del mes y arranque ----------

const SE_CORTA = CULTIVOS.filter((c) => c.cobertura).flatMap((c) => [c.id, c.api]) as string[];
const lista = (ids: string[]) => ids.map(nombreCultivo).join(", ");

/** Lo que el plan dice de un mes, en frases cortas. Solo siembra, cosecha o corte, y lo que hay en el terreno. */
export function lineasDelMes(mes: MesPlan): string[] {
  const cosechados = mes.cosechados.filter((id) => !SE_CORTA.includes(id));
  const cortados = mes.cosechados.filter((id) => SE_CORTA.includes(id));
  const lineas: string[] = [];
  if (mes.sembrados.length > 0) lineas.push(`Se siembra: ${lista(mes.sembrados)}`);
  if (cosechados.length > 0) lineas.push(`Se cosecha: ${lista(cosechados)}`);
  if (cortados.length > 0) lineas.push(`Se corta: ${lista(cortados)}`);
  lineas.push(mes.cultivos.length > 0 ? `En el terreno: ${lista(mes.cultivos)}` : "Tierra en descanso");
  return lineas;
}

/** Dónde arranca la simulación: el primer mes con algo en el terreno, para no abrir con la tierra vacía. */
export function pasoInicial(plan: PlanAnual): number {
  const primero = plan.meses.findIndex((m) => m.cultivos.length > 0);
  return Math.max(primero, 0) * PASOS_POR_MES;
}

// ---------- Qué pasa con cada cultivo en un mes ----------

export interface SituacionCultivo {
  id: string;
  tipo: "siembra" | "cosecha" | "terreno" | "fuera";
  texto: string; // "Se siembra este mes", "En el terreno · se cosecha en agosto", "Ya salió del terreno"…
}

/** Para cada cultivo del plan, qué le pasa en un mes (1–12). Solo usa los meses de siembra y cosecha que el plan trae. */
export function situacionCultivos(plan: PlanAnual, ciclos: Ciclo[], mes: number): SituacionCultivo[] {
  const datos = plan.meses[mes - 1];
  const tiene = (lista: string[], id: string) => lista.includes(id);
  const seSiembraEn = (c: Ciclo) => tiene(plan.meses[c.meses[0] - 1].sembrados, c.cultivo);
  const ids = [...new Set(ciclos.map((c) => c.cultivo))];

  return ids.map((id): SituacionCultivo => {
    const verbo = SE_CORTA.includes(id) ? "corta" : "cosecha";
    const propios = ciclos.filter((c) => c.cultivo === id);
    const actual = propios.find((c) => c.meses.includes(mes));

    if (actual) {
      if (tiene(datos.sembrados, id)) return { id, tipo: "siembra", texto: "Se siembra este mes" };
      if (tiene(datos.cosechados, id)) return { id, tipo: "cosecha", texto: `Se ${verbo} este mes` };
      const fin = actual.tieneCosecha ? ` · se ${verbo} en ${MESES_LARGOS[actual.meses.at(-1)! - 1]}` : "";
      return { id, tipo: "terreno", texto: `En el terreno${fin}` };
    }

    // Fuera del terreno: la siguiente siembra de este año, si el plan la tiene
    const siguiente = propios.filter((c) => c.meses[0] > mes && seSiembraEn(c)).sort((a, b) => a.meses[0] - b.meses[0])[0];
    if (siguiente) return { id, tipo: "fuera", texto: `Se siembra en ${MESES_LARGOS[siguiente.meses[0] - 1]}` };
    const yaSalio = propios.some((c) => c.meses[0] <= c.meses.at(-1)! && c.meses.at(-1)! < mes);
    return { id, tipo: "fuera", texto: yaSalio ? "Ya salió del terreno" : "Fuera del terreno" };
  });
}
