import { PRIORIDAD_ACCION } from "./calendario.ts";
import { clasificarZona, mesesDificiles } from "./clima.ts";
import { cultivoDeApi, esCobertura, NOMBRE_CULTIVO } from "./cultivos.ts";
import { pronosticoDesdeApi, type RazonPlan } from "./razones.ts";
import type { AccionPeriodo, CultivoId, MesPlan, PedidoPlan, PlanAnual } from "./tipos";

export interface SiembraApi {
  cropId: string;
  role: "harvest" | "cover";
  sowDate: string;
  harvestDate: string;
  relay: boolean;
  lossProbability: number;
}

export interface RotacionApi {
  id: string;
  kind: "current" | "template" | "generated";
  name: string;
  feasible: boolean;
  mulch?: boolean;
  plantings: SiembraApi[];
  scores: { total: number; water: number; soil: number };
  reasons?: { code: string; crop?: string; value: number }[];
}

export interface PronosticoApi {
  below: number;
  normal: number;
  above: number;
}

export interface PlanApi {
  municipality: { name: string; departmentName: string };
  generatedAt: string;
  site: { fortnights: { month: number; precipitationP50Mm: number }[]; forecastByPlanMonth?: (PronosticoApi | null)[] };
  evaluation: { start?: string; best: string; rotations: RotacionApi[] };
}

const RAZONES_INTERNAS = new Set(["low_confidence_parameters"]);

function razonesDe(rotacion: RotacionApi): RazonPlan[] {
  return (rotacion.reasons ?? [])
    .filter((r) => !RAZONES_INTERNAS.has(r.code))
    .map((r) => ({ codigo: r.code, cultivo: r.crop ? cultivoDeApi(r.crop) : null, valor: r.value }));
}

export class PlanApiInvalido extends Error {}

const PERIODO_CLIMA = "1996–2025";
const DATASET = "NASA POWER, SoilGrids y pronóstico ECMWF SEAS5";
const MESES_POR_ANIO = 12;

function mesYAnio(fecha: string): { anio: number; mes: number } {
  const [anio, mes] = fecha.split("-").map(Number);
  if (!Number.isInteger(anio) || !Number.isInteger(mes)) throw new PlanApiInvalido(`fecha inválida: ${fecha}`);
  return { anio, mes };
}

function mesesEntre(desde: string, hasta: string): number[] {
  const a = mesYAnio(desde);
  const b = mesYAnio(hasta);
  const total = Math.min((b.anio - a.anio) * MESES_POR_ANIO + (b.mes - a.mes) + 1, MESES_POR_ANIO);
  return Array.from({ length: Math.max(total, 1) }, (_, i) => ((a.mes - 1 + i) % MESES_POR_ANIO) + 1);
}

function lluviaMensual(plan: PlanApi): number[] {
  const meses = Array<number>(MESES_POR_ANIO).fill(0);
  for (const q of plan.site.fortnights) meses[q.month - 1] += q.precipitationP50Mm;
  return meses.map((v) => Math.round(v));
}

function cultivoDe(s: SiembraApi): CultivoId {
  const id = cultivoDeApi(s.cropId);
  if (!id) throw new PlanApiInvalido(`cultivo desconocido: ${s.cropId}`);
  return id;
}

function sinCultivosDesconocidos(r: RotacionApi): boolean {
  return r.plantings.every((s) => cultivoDeApi(s.cropId) !== null);
}

export function rotacionElegida(plan: PlanApi, modo: PedidoPlan["modo"]): RotacionApi {
  const rotaciones = plan.evaluation.rotations;
  if (modo === "mis-cultivos") {
    const actual = rotaciones.find((r) => r.kind === "current");
    if (!actual) throw new PlanApiInvalido("la API no devolvió la rotación actual");
    return actual;
  }
  const mejor = rotaciones.find((r) => r.id === plan.evaluation.best);
  if (mejor && sinCultivosDesconocidos(mejor)) return mejor;
  const alternativa = rotaciones
    .filter((r) => r.feasible && r.plantings.length > 0 && sinCultivosDesconocidos(r))
    .sort((a, b) => b.scores.total - a.scores.total)[0];
  if (!alternativa) throw new PlanApiInvalido("la API no devolvió una rotación que la app sepa mostrar");
  return alternativa;
}

function accionDelMes(cultivos: CultivoId[], sembrados: CultivoId[], cosechados: CultivoId[]): AccionPeriodo {
  const acciones = new Set<AccionPeriodo>();
  if (sembrados.length) acciones.add("sembrar");
  if (cosechados.length) acciones.add("cosechar");
  if (cultivos.some((c) => !esCobertura(c))) acciones.add("cuidar");
  if (cultivos.some(esCobertura)) acciones.add("cubrir");
  return PRIORIDAD_ACCION.find((a) => acciones.has(a)) ?? "descansar";
}

function porcentaje(v: number): number {
  return Math.round(v * 100);
}

export function nombreRotacion(rotacion: RotacionApi): string {
  const texto = rotacion.plantings
    .map((s, i) => {
      const cultivo = NOMBRE_CULTIVO[cultivoDe(s)];
      if (i === 0) return cultivo;
      return s.relay ? `con ${cultivo.toLowerCase()} en relevo` : `y luego ${cultivo.toLowerCase()}`;
    })
    .join(" ");
  const conMulch = rotacion.mulch ? `${texto}, con rastrojo sobre la tierra (Quesungual)` : texto;
  return rotacion.kind === "current" ? `Tus cultivos: ${conMulch.toLowerCase()}` : conMulch;
}

function resumenDe(plan: PlanApi, rotacion: RotacionApi): string {
  const cosechas = rotacion.plantings.filter((s) => s.role === "harvest");
  const riesgo = porcentaje(Math.max(0, ...cosechas.map((s) => s.lossProbability)));
  const nombre = nombreRotacion(rotacion);
  const partes = [
    `${nombre}. Calculado con 30 años de clima de la NASA para ${plan.municipality.name} (${plan.municipality.departmentName}).`,
    cosechas.length ? `Riesgo de perder la cosecha por falta de agua: ${riesgo} %.` : "",
    `Cuidado del agua ${Math.round(rotacion.scores.water)} y del suelo ${Math.round(rotacion.scores.soil)}, de 100.`,
  ];
  rotacion.plantings.forEach((s, i) => {
    if (!s.relay || i === 0) return;
    const anfitrion = NOMBRE_CULTIVO[cultivoDe(rotacion.plantings[i - 1])].toLowerCase();
    partes.push(`${NOMBRE_CULTIVO[cultivoDe(s)]} se siembra entre el ${anfitrion} antes de cosecharlo.`);
  });
  return partes.filter(Boolean).join(" ");
}

export function planDesdeApi(plan: PlanApi, pedido: PedidoPlan): PlanAnual {
  const rotacion = rotacionElegida(plan, pedido.modo);
  const lluvias = lluviaMensual(plan);
  const tipoZona = clasificarZona(lluvias);
  const dificiles = mesesDificiles(lluvias, tipoZona);

  const enTerreno: CultivoId[][] = Array.from({ length: MESES_POR_ANIO }, () => []);
  const sembrados: CultivoId[][] = Array.from({ length: MESES_POR_ANIO }, () => []);
  const cosechados: CultivoId[][] = Array.from({ length: MESES_POR_ANIO }, () => []);

  for (const s of rotacion.plantings) {
    const id = cultivoDe(s);
    for (const mes of mesesEntre(s.sowDate, s.harvestDate)) {
      if (!enTerreno[mes - 1].includes(id)) enTerreno[mes - 1].push(id);
    }
    sembrados[mesYAnio(s.sowDate).mes - 1].push(id);
    cosechados[mesYAnio(s.harvestDate).mes - 1].push(id);
  }

  const meses: MesPlan[] = enTerreno.map((cultivos, i) => ({
    mes: i + 1,
    cultivos,
    sembrados: sembrados[i],
    cosechados: cosechados[i],
    accion: accionDelMes(cultivos, sembrados[i], cosechados[i]),
    lluvia: lluvias[i],
    dificil: dificiles.includes(i + 1),
    cubierta: cultivos.length > 0,
  }));

  return {
    modo: pedido.modo,
    cultivosElegidos: [...new Set(rotacion.plantings.map(cultivoDe))],
    tipoZona,
    meses,
    resumen: resumenDe(plan, rotacion),
    fuente: { dataset: DATASET, periodo: PERIODO_CLIMA, consultado: plan.generatedAt },
    simulado: false,
    explicacion: {
      razones: razonesDe(rotacion),
      pronostico: plan.evaluation.start && plan.site.forecastByPlanMonth ? pronosticoDesdeApi(plan.evaluation.start, plan.site.forecastByPlanMonth) : [],
    },
  };
}
