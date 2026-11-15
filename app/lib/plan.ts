// Agrupa los 12 meses del plan en trimestres o semestres, y arma el texto para WhatsApp.
// Funciones puras: cambiar de trimestral a semestral no vuelve a pedir nada al servidor.
import { PRIORIDAD_ACCION } from "./calendario.ts";
import { listaMeses, MESES, NOMBRE_CULTIVO } from "./textos.ts";
import type { AccionPeriodo, CultivoId, Division, PeriodoPlan, PlanAnual } from "./tipos";

const GRUPOS: Record<Division, { prefijo: string; meses: number[][] }> = {
  trimestral: { prefijo: "T", meses: [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]] },
  semestral: { prefijo: "S", meses: [[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12]] },
};

/** ["maiz", "sorgo"] → "maíz y sorgo" (en minúscula, para ir dentro de una frase) */
function enFrase(ids: CultivoId[]): string {
  const nombres = ids.map((id) => NOMBRE_CULTIVO[id].toLowerCase());
  return nombres.length <= 1 ? (nombres[0] ?? "") : `${nombres.slice(0, -1).join(", ")} y ${nombres.at(-1)}`;
}

function consejoDe(accion: AccionPeriodo, cultivos: CultivoId[]): string {
  const sinAbono = cultivos.filter((c) => c !== "frijolAbono");
  switch (accion) {
    case "sembrar":
      return `Siembra ${enFrase(cultivos)}`;
    case "cosechar":
      return `Cosecha ${enFrase(sinAbono.length ? sinAbono : cultivos)}`;
    case "cuidar":
      return `Cuida tu ${enFrase(sinAbono)}`;
    case "cubrir":
      return "El frijol abono cubre la tierra";
    case "descansar":
      return "La tierra descansa";
  }
}

export function agruparPlan(plan: PlanAnual, division: Division): PeriodoPlan[] {
  const { prefijo, meses: grupos } = GRUPOS[division];
  return grupos.map((numeros, i) => {
    const meses = plan.meses.filter((m) => numeros.includes(m.mes));
    const cultivos = [...new Set(meses.flatMap((m) => m.cultivos))];
    const accionPrincipal = PRIORIDAD_ACCION.find((a) => meses.some((m) => m.accion === a)) ?? "descansar";
    // El consejo nombra solo lo que se siembra o se cosecha en el periodo, no todo lo que está en el terreno
    const deMeses = (f: (m: (typeof meses)[number]) => CultivoId[]) => [...new Set(meses.flatMap(f))];
    const cultivosAccion =
      accionPrincipal === "sembrar" ? deMeses((m) => m.sembrados) : accionPrincipal === "cosechar" ? deMeses((m) => m.cosechados) : cultivos;
    const dificiles = meses.filter((m) => m.dificil).map((m) => m.mes);
    return {
      id: `${prefijo}${i + 1}`,
      nombre: `${MESES[numeros[0] - 1]} – ${MESES[numeros.at(-1)! - 1]}`,
      meses: numeros,
      cultivos,
      accionPrincipal,
      consejo: consejoDe(accionPrincipal, cultivosAccion),
      lluviaEsperada: Math.round(meses.reduce((s, m) => s + m.lluvia, 0)),
      alerta: dificiles.length
        ? `${plan.tipoZona === "lluviosa" ? "Aguaceros fuertes" : "Canícula"} en ${listaMeses(dificiles)}`
        : null,
      mesesCubierta: meses.filter((m) => m.cubierta).length,
    };
  });
}

export function textoWhatsApp(lugar: string, plan: PlanAnual, periodos: PeriodoPlan[]): string {
  const filas = periodos.map((p) => `• ${p.nombre}: ${p.consejo}`).join("\n");
  return (
    `Mi plan de siembra para ${lugar} (Surco):\n${filas}\n\n${plan.resumen}\n\n` +
    "Hecho con datos de NASA POWER. Es una guía (simulado): lo reviso con mi técnico agrícola antes de sembrar."
  );
}
