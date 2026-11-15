import { NOMBRE_CULTIVO } from "./cultivos.ts";
import type { CultivoId } from "./cultivos.ts";

export interface RazonPlan {
  codigo: string;
  cultivo: CultivoId | null;
  valor: number;
}

export interface PronosticoMes {
  mes: number;
  anio: number;
  seco: number;
  normal: number;
  lluvioso: number;
}

export type Tono = "bien" | "atencion" | "info";

export interface TextoRazon {
  texto: string;
  tono: Tono;
}

const RIESGO_ALTO = 0.3;
const RIESGO_BAJO = 0.15;
const EROSION_BAJA = 0.5;

const pct = (v: number) => `${Math.round(v * 100)} %`;

function quien(r: RazonPlan): string {
  return r.cultivo ? NOMBRE_CULTIVO[r.cultivo] : "El plan";
}

export function textoRazon(r: RazonPlan): TextoRazon | null {
  switch (r.codigo) {
    case "loss_probability":
      return {
        texto: `${quien(r)}: riesgo de perder la cosecha por falta de agua de ${pct(r.valor)}.`,
        tono: r.valor >= RIESGO_ALTO ? "atencion" : r.valor <= RIESGO_BAJO ? "bien" : "info",
      };
    case "expected_relative_yield":
      return { texto: `${quien(r)}: rinde en promedio el ${pct(r.valor)} de lo que daría con agua suficiente.`, tono: "info" };
    case "canicula_during_flowering":
      return {
        texto: `${quien(r)}: la canícula coincide con la floración en ${pct(r.valor)} de los años parecidos.`,
        tono: r.valor >= RIESGO_ALTO ? "atencion" : "info",
      };
    case "heat_stress_days":
      return { texto: `${quien(r)}: ${r.valor.toFixed(1)} días de calor fuerte por temporada, en promedio.`, tono: r.valor >= 5 ? "atencion" : "info" };
    case "irrigation_required_mm":
      return { texto: `${quien(r)}: necesita unos ${Math.round(r.valor)} mm de riego.`, tono: "info" };
    case "low_suitability":
      return { texto: `${quien(r)}: el clima del lugar no es el ideal para este cultivo.`, tono: "atencion" };
    case "no_viable_sowing_window":
      return { texto: `${quien(r)}: no hay una fecha de siembra segura este año.`, tono: "atencion" };
    case "bare_soil_rainy_months":
      return r.valor === 0
        ? { texto: "La tierra queda cubierta en todos los meses de lluvia.", tono: "bien" }
        : { texto: `La tierra queda desnuda ${r.valor} ${r.valor === 1 ? "mes" : "meses"} de lluvia: se lava más el suelo.`, tono: "atencion" };
    case "relative_erosion":
      return {
        texto: `Erosión: ${pct(r.valor)} de la que tendría un terreno sin cubrir.`,
        tono: r.valor <= EROSION_BAJA ? "bien" : "atencion",
      };
    case "nitrogen_balance_kg_ha":
      return r.valor >= 0
        ? { texto: `La tierra gana unos ${Math.round(r.valor)} kg de nitrógeno por hectárea al año.`, tono: "bien" }
        : { texto: `La tierra pierde unos ${Math.round(-r.valor)} kg de nitrógeno por hectárea al año.`, tono: "atencion" };
    case "family_repeated":
      return { texto: "Se repite la misma familia de cultivos: conviene alternar.", tono: "atencion" };
    case "forecast_weighted":
      return { texto: `El cálculo da más peso a los años que se parecen al pronóstico de los próximos ${r.valor} meses.`, tono: "info" };
    default:
      return null;
  }
}

export function pronosticoDesdeApi(inicio: string, porMes: ({ below: number; normal: number; above: number } | null)[]): PronosticoMes[] {
  const [anio, mes] = inicio.split("-").map(Number);
  return porMes.flatMap((p, i) => {
    if (!p) return [];
    const indice = mes - 1 + i;
    return [{ mes: (indice % 12) + 1, anio: anio + Math.floor(indice / 12), seco: p.below, normal: p.normal, lluvioso: p.above }];
  });
}
