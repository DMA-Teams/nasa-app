// Reglas por cultivo (data/reglas.json) y el plan con el motor local.
// La lógica vive en lib/calendario.ts (pura, con pruebas); aquí solo se cargan los datos.
import reglasJson from "@/data/reglas.json";
import { construirPlan } from "./calendario";
import type { ClimaZona, CultivoId, PedidoPlan, PlanAnual, ReglaCultivo, TipoZona } from "./tipos";

export const REGLAS = reglasJson.cultivos as ReglaCultivo[];
export const RECOMENDADOS = reglasJson.recomendados as Record<TipoZona, CultivoId[]>;

/** Plan del año con el motor local (respaldo mientras no exista POST /api/plan). */
export function armarPlanLocal(pedido: PedidoPlan, clima: ClimaZona): PlanAnual {
  return construirPlan(pedido, clima, REGLAS, RECOMENDADOS);
}
