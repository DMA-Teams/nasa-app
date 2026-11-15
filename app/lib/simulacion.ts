// Lógica de la simulación visual de la parcela: qué cultivo ocupa cada surco y en qué etapa se ve en cada momento.
// Funciones puras (las usan la pantalla y las pruebas). No inventa fechas: solo reordena los meses del plan.
import type { Division, PlanAnual } from "./tipos";

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

/** Lo que se ve en un carril en un paso: su ciclo activo, o el de un vecino si el carril le queda libre, o el rastrojo del que acaba de terminar, o null (descanso). */
export function estadoCarril(ciclos: Ciclo[], carril: number, paso: number): { ciclo: Ciclo; estado: EstadoCiclo } | null {
  const delCarril = ciclos.filter((c) => c.carril === carril);
  for (const ciclo of delCarril) {
    const estado = estadoEn(ciclo, paso);
    if (estado) return { ciclo, estado };
  }
  // Si este carril queda libre durante todo el ciclo de un cultivo vecino, ese cultivo también lo ocupa:
  // así un cultivo que va solo (frijol después de maíz y sorgo) llena la parcela y no deja surcos vacíos.
  for (const vecino of ciclos) {
    if (vecino.carril === carril) continue;
    const estado = estadoEn(vecino, paso);
    if (estado && delCarril.every((c) => !c.meses.some((m) => vecino.meses.includes(m)))) return { ciclo: vecino, estado };
  }
  for (const ciclo of delCarril) {
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
