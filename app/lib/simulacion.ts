// Lógica de la simulación visual de la parcela: qué cultivo ocupa cada surco y en qué etapa se ve en cada momento.
// Funciones puras (las usan la pantalla y las pruebas). No inventa fechas: solo reordena los meses del plan.
import type { PlanAnual } from "./tipos";

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
