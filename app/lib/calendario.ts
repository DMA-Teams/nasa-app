// Motor del plan anual: pone cada cultivo en sus meses según el tipo de zona
// y le pega a cada mes la lluvia de NASA POWER. Función pura (la usan la app y las pruebas).
// El calendario de siembra sale de reglas inventadas: el plan siempre va marcado como simulado.
import { listaMeses } from "./textos.ts";
import type { AccionPeriodo, ClimaZona, CultivoId, MesPlan, PedidoPlan, PlanAnual, ReglaCultivo, TipoZona } from "./tipos";

// Si en un mes pasan varias cosas, se muestra la más importante
export const PRIORIDAD_ACCION: AccionPeriodo[] = ["sembrar", "cosechar", "cuidar", "cubrir", "descansar"];

const SUGERENCIA_ABONO = "Puedes sembrar frijol abono para cubrir la tierra cuando queda sola.";

export function construirPlan(
  pedido: PedidoPlan,
  clima: ClimaZona,
  reglas: ReglaCultivo[],
  recomendados: Record<TipoZona, CultivoId[]>,
): PlanAnual {
  if (pedido.modo === "mis-cultivos" && pedido.cultivos.length === 0) throw new RangeError("Elige al menos un cultivo");
  const zona = clima.tipo;
  const elegidos = pedido.modo === "recomendado" ? recomendados[zona] : [...new Set(pedido.cultivos)];

  // Qué hay en el terreno cada mes, y qué se hace (índice 0 = enero)
  const enTerreno: CultivoId[][] = Array.from({ length: 12 }, () => []);
  const acciones: Set<AccionPeriodo>[] = Array.from({ length: 12 }, () => new Set());
  const notas: string[] = [];

  for (const id of elegidos) {
    const regla = reglas.find((r) => r.id === id);
    if (!regla) continue;
    for (const siembra of regla.siembra[zona]) {
      for (let i = 0; i < regla.duracionMeses; i++) {
        const mes = (siembra - 1 + i) % 12; // da la vuelta al año: diciembre → enero
        if (!enTerreno[mes].includes(id)) enTerreno[mes].push(id);
        if (i === 0) acciones[mes].add("sembrar");
        else if (i === regla.duracionMeses - 1) acciones[mes].add("cosechar");
        else acciones[mes].add(id === "frijolAbono" ? "cubrir" : "cuidar");
      }
    }
    const nota = regla.nota?.[zona];
    if (nota) notas.push(nota);
  }

  const meses: MesPlan[] = enTerreno.map((cultivos, i) => {
    const accion = PRIORIDAD_ACCION.find((a) => acciones[i].has(a)) ?? "descansar";
    return {
      mes: i + 1,
      cultivos,
      accion,
      lluvia: clima.meses[i].lluvia,
      dificil: clima.mesesDificiles.includes(i + 1),
      cubierta: cultivos.length > 0,
    };
  });

  const cubiertos = meses.filter((m) => m.cubierta).length;
  const partes = [problemaDeZona(clima), ...notas];
  if (pedido.modo === "mis-cultivos" && !elegidos.includes("frijolAbono") && cubiertos < 8) partes.push(SUGERENCIA_ABONO);

  return {
    modo: pedido.modo,
    cultivosElegidos: elegidos,
    tipoZona: zona,
    meses,
    resumen: partes.join(" "),
    fuente: {
      dataset: clima.dataset,
      periodo: `${clima.periodo.inicio.slice(0, 4)}–${clima.periodo.fin.slice(0, 4)}`,
      consultado: clima.consultado,
    },
    simulado: true,
  };
}

function problemaDeZona(clima: ClimaZona): string {
  const meses = listaMeses(clima.mesesDificiles);
  if (clima.tipo === "seca") return `Aquí falta agua en ${meses || "julio"}: el plan siembra antes y después de la canícula.`;
  if (clima.tipo === "lluviosa") return `Aquí llueve fuerte en ${meses || "fin de año"}: el plan evita tener frijol en esos meses.`;
  return "Aquí la lluvia es pareja: se puede sembrar en primera y en postrera.";
}
