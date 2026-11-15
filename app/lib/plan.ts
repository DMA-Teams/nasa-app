// Agrupa los 12 meses del plan en trimestres o semestres, con el consejo y el porqué de cada periodo.
// Funciones puras: cambiar de trimestral a semestral no vuelve a pedir nada al servidor.
import { PRIORIDAD_ACCION } from "./calendario.ts";
import { listaMeses, MESES, MESES_LARGOS, NOMBRE_CULTIVO } from "./textos.ts";
import type { AccionPeriodo, CultivoId, Division, MesPlan, PeriodoPlan, PlanAnual, TipoZona } from "./tipos";

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
      // El frijol abono no se cosecha: se corta y se incorpora a la tierra
      return sinAbono.length ? `Cosecha ${enFrase(sinAbono)}` : "Corta el frijol abono y déjalo en la tierra";
    case "cuidar":
      return `Cuida tu ${enFrase(sinAbono)}`;
    case "cubrir":
      return "El frijol abono cubre la tierra";
    case "descansar":
      return "La tierra descansa";
  }
}

/** Por qué se siembra ese cultivo en ese mes, en la zona del lugar (la primera regla que aplique). */
function razonCultivo(id: CultivoId, mes: number, zona: TipoZona): string | null {
  if (id === "maiz" && mes === 12) return "Es la siembra de apante: aquí todavía llueve en diciembre.";
  if (id === "frijol" && zona === "lluviosa") return "El frijol va en primera para no sufrir los aguaceros de fin de año.";
  if (id === "frijol" && mes >= 8) return "El frijol va en postrera, después de la canícula.";
  if (id === "sorgo" && zona !== "lluviosa") return "El sorgo aguanta la canícula si el maíz sufre.";
  if (id === "frijolAbono") return "El frijol abono cubre la tierra y la alimenta.";
  return null;
}

/** Explicación corta de la acción del periodo, con la lluvia de NASA del lugar. */
function porqueDe(accion: AccionPeriodo, meses: MesPlan[], cultivos: CultivoId[], zona: TipoZona, lluvia: number): string {
  switch (accion) {
    case "sembrar": {
      const m = meses.find((x) => x.sembrados.length)!;
      const extra = m.sembrados.map((id) => razonCultivo(id, m.mes, zona)).find((r) => r);
      return [`Se siembra en ${MESES_LARGOS[m.mes - 1]} porque ya llueve (${m.lluvia} mm ese mes).`, extra].filter(Boolean).join(" ");
    }
    case "cosechar": {
      const conCosecha = meses.filter((x) => x.cosechados.some((c) => c !== "frijolAbono"));
      if (!conCosecha.length) {
        const m = meses.find((x) => x.cosechados.length)!;
        return `En ${MESES_LARGOS[m.mes - 1]} el frijol abono ya creció: cortado, sirve de abono para la tierra.`;
      }
      const listos = [...new Set(conCosecha.flatMap((x) => x.cosechados))].filter((c) => c !== "frijolAbono");
      const quienes = listos.map((c) => `el ${NOMBRE_CULTIVO[c].toLowerCase()}`);
      const sujeto = quienes.length > 1 ? `${quienes.slice(0, -1).join(", ")} y ${quienes.at(-1)}` : quienes[0];
      return `Se cosecha en ${listaMeses(conCosecha.map((x) => x.mes))}: ${sujeto} ya ${listos.length > 1 ? "terminaron" : "terminó"} su ciclo.`;
    }
    case "cuidar":
      return cultivos.includes("frijolAbono")
        ? "Las plantas están creciendo y el frijol abono protege la tierra: limpia la maleza."
        : "Las plantas están creciendo: limpia la maleza y revisa que no haya plagas.";
    case "cubrir":
      return "El frijol abono protege la tierra del sol y de la lluvia fuerte.";
    case "descansar":
      return lluvia < 50 * meses.length
        ? `Llueve poco (${lluvia} mm en estos meses): no conviene sembrar.`
        : "Buen momento para preparar la tierra para la próxima siembra.";
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
    const lluviaEsperada = Math.round(meses.reduce((s, m) => s + m.lluvia, 0));
    return {
      id: `${prefijo}${i + 1}`,
      nombre: `${MESES[numeros[0] - 1]} – ${MESES[numeros.at(-1)! - 1]}`,
      meses: numeros,
      cultivos,
      accionPrincipal,
      consejo: consejoDe(accionPrincipal, cultivosAccion),
      porque: porqueDe(accionPrincipal, meses, cultivos, plan.tipoZona, lluviaEsperada),
      lluviaEsperada,
      alerta: dificiles.length
        ? `${plan.tipoZona === "lluviosa" ? "Aguaceros fuertes" : "Canícula"} en ${listaMeses(dificiles)}`
        : null,
      mesesCubierta: meses.filter((m) => m.cubierta).length,
    };
  });
}
