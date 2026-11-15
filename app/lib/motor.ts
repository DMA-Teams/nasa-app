// Motor de rotaciones: cruza el clima de NASA POWER con reglas simples por cultivo.
// Todo es explicable: cada puntaje sale de cobertura del suelo, tolerancia al clima,
// nitrógeno e ingreso, con pesos según lo que el agricultor prioriza.
import reglasJson from "@/data/reglas.json";
import rotacionesJson from "@/data/rotaciones.json";
import { construirPlan } from "./calendario";
import { listaMeses, NOMBRE_CULTIVO } from "./textos";
import type {
  ClimaZona,
  CultivoId,
  EvaluacionRotacion,
  FilaPlan,
  Nivel,
  Prioridad,
  ReglaCultivo,
  Resultado,
  Rotacion,
  Semaforo,
  Temporada,
  PedidoPlan,
  PlanAnual,
  TipoZona,
} from "./tipos";

export const REGLAS = reglasJson.cultivos as ReglaCultivo[];
export const ROTACIONES = rotacionesJson.rotaciones as Rotacion[];
export const RECOMENDADOS = reglasJson.recomendados as Record<TipoZona, CultivoId[]>;

/** Plan del año con el motor local (respaldo mientras no exista POST /api/plan). */
export function armarPlanLocal(pedido: PedidoPlan, clima: ClimaZona): PlanAnual {
  return construirPlan(pedido, clima, REGLAS, RECOMENDADOS);
}

const regla = (id: CultivoId) => REGLAS.find((r) => r.id === id)!;
export const nombreCultivo = (id: CultivoId) => NOMBRE_CULTIVO[id];
export const nombresCultivos = (ids: CultivoId[]) => ids.map(nombreCultivo).join(" + ");

const VALOR_NIVEL: Record<Nivel, number> = { poco: 0, regular: 0.5, bien: 1 };
const VALOR_INGRESO = { bajo: 0.3, medio: 0.6, alto: 1 };

// Cuánto pesa cada factor según la prioridad del agricultor (cada fila suma 1)
const PESOS: Record<Prioridad, { cobertura: number; clima: number; nitrogeno: number; ingreso: number }> = {
  tierra: { cobertura: 0.55, clima: 0.15, nitrogeno: 0.2, ingreso: 0.1 },
  agua: { cobertura: 0.3, clima: 0.5, nitrogeno: 0.1, ingreso: 0.1 },
  dinero: { cobertura: 0.2, clima: 0.3, nitrogeno: 0.1, ingreso: 0.4 },
};

/** Arma la rotación actual a partir de lo que el agricultor dice que siembra. */
export function rotacionActual(cultivos: CultivoId[]): Rotacion {
  const base: CultivoId[] = cultivos.length ? cultivos : ["maiz", "frijol"];
  const primera = base.filter((c) => c !== "frijol");
  const temporada: Temporada = {
    primera: primera.length ? primera : base,
    postrera: base.includes("frijol") ? ["frijol"] : primera,
  };
  return {
    id: "actual",
    nombre: nombresCultivos(base),
    descripcion: "Lo que siembras hoy",
    zonas: ["seca", "equilibrada", "lluviosa"],
    anio1: temporada,
    anio2: temporada,
  };
}

function mesesCubiertos(t: Temporada): number {
  const cubre = (ids: CultivoId[]) => Math.min(6, Math.max(...ids.map((id) => regla(id).mesesCubreSuelo)));
  return Math.min(12, cubre(t.primera) + cubre(t.postrera));
}

/** Qué tan bien aguanta el problema de la zona. Mezclar con un cultivo resistente sirve de seguro. */
function nivelClima(t: Temporada, clima: ClimaZona): number {
  if (clima.tipo === "lluviosa") {
    // Los aguaceros fuertes caen en postrera (octubre–diciembre)
    return Math.max(...t.postrera.map((id) => VALOR_NIVEL[regla(id).toleraEncharcamiento]));
  }
  // La canícula cae en medio de la primera
  return Math.max(...t.primera.map((id) => VALOR_NIVEL[regla(id).toleraSequia]));
}

function nitrogeno(rot: Rotacion): number {
  const todos = [rot.anio1, rot.anio2].flatMap((t) => [...t.primera, ...t.postrera]);
  if (todos.includes("frijolAbono")) return 1;
  return todos.some((id) => regla(id).aportaNitrogeno) ? 0.5 : 0;
}

function aNivel(v: number): Nivel {
  return v >= 0.75 ? "bien" : v >= 0.25 ? "regular" : "poco";
}

function semaforoDe(puntaje: number): Semaforo {
  return puntaje >= 65 ? "verde" : puntaje >= 45 ? "amarillo" : "rojo";
}

function explicar(rot: Rotacion, clima: ClimaZona, mesesDesnuda: number): string {
  const todos = new Set([rot.anio1, rot.anio2].flatMap((t) => [...t.primera, ...t.postrera]));
  const m = clima.meses;
  const partes: string[] = [];

  if (clima.tipo === "lluviosa") {
    const max = Math.max(...m.map((x) => x.lluvia));
    partes.push(`En ${listaMeses(clima.mesesDificiles) || "los meses más lluviosos"} llueven hasta ${max} mm al mes.`);
  } else if (clima.tipo === "seca") {
    const ref = Math.round((m[5].lluvia + m[8].lluvia) / 2);
    partes.push(`En julio llueven ${m[6].lluvia} mm, contra ${ref} mm en junio y septiembre.`);
  } else {
    partes.push(`Aquí la lluvia es pareja: ${clima.lluviaAnual} mm al año, sin una canícula fuerte.`);
  }

  if (rot.id === "actual") {
    partes.push(`Entre cosechas la tierra queda desnuda unos ${mesesDesnuda} meses al año.`);
  } else {
    if (todos.has("sorgo") && clima.tipo !== "lluviosa") partes.push("El sorgo aguanta la canícula: si el maíz sufre, el sorgo sigue en pie.");
    if (todos.has("frijolAbono")) {
      partes.push(
        clima.tipo === "lluviosa"
          ? "El frijol abono frena el golpe de la lluvia y evita que se lave la tierra."
          : "El frijol abono cubre la tierra en los meses secos y le deja nitrógeno al siguiente cultivo.",
      );
    }
    if (rot.id === "frijol-primera") partes.push("El frijol se cosecha antes de los aguaceros de fin de año.");
  }
  if (clima.relieve === "montana" && mesesDesnuda <= 3) partes.push("En montaña la lluvia arrastra más la tierra, por eso cubrirla vale doble.");
  return partes.join(" ");
}

export function evaluarRotacion(rot: Rotacion, clima: ClimaZona, prioridad: Prioridad): EvaluacionRotacion {
  const pesos = PESOS[prioridad];
  const cubiertos = (mesesCubiertos(rot.anio1) + mesesCubiertos(rot.anio2)) / 2;
  const climaValor = (nivelClima(rot.anio1, clima) + nivelClima(rot.anio2, clima)) / 2;
  const primeras = [...rot.anio1.primera, ...rot.anio2.primera];
  const ingreso = primeras.reduce((a, id) => a + VALOR_INGRESO[regla(id).ingreso], 0) / primeras.length;

  const puntaje = Math.round(
    100 * (pesos.cobertura * (cubiertos / 12) + pesos.clima * climaValor + pesos.nitrogeno * nitrogeno(rot) + pesos.ingreso * ingreso),
  );
  const mesesDesnuda = Math.round(12 - cubiertos);

  return {
    rotacion: rot,
    esActual: rot.id === "actual",
    semaforo: semaforoDe(puntaje),
    puntaje,
    mesesDesnuda,
    aguantaClima: aNivel(climaValor),
    porque: explicar(rot, clima, mesesDesnuda),
    evidencia: `NASA POWER · PRECTOTCORR y EVPTRNS · promedio 2015–2025 · ${clima.lat.toFixed(2)}, ${clima.lon.toFixed(2)}`,
  };
}

/** Compara lo que siembra hoy con las 2 mejores rotaciones para su zona. */
export function evaluar(clima: ClimaZona, cultivos: CultivoId[], prioridad: Prioridad): Resultado {
  const actual = evaluarRotacion(rotacionActual(cultivos), clima, prioridad);
  const candidatas = ROTACIONES.filter((r) => r.zonas.includes(clima.tipo))
    .map((r) => evaluarRotacion(r, clima, prioridad))
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, 2);
  return {
    actual,
    opciones: [...candidatas, actual],
    sugeridaId: candidatas[0]?.rotacion.id ?? actual.rotacion.id,
    proyeccionSimulada: true,
  };
}

export function planDeSiembra(rot: Rotacion): FilaPlan[] {
  return [
    { anio: 1, temporada: "primera", cultivos: rot.anio1.primera, mesInicio: 5, mesFin: 8 },
    { anio: 1, temporada: "postrera", cultivos: rot.anio1.postrera, mesInicio: 9, mesFin: 12 },
    { anio: 2, temporada: "primera", cultivos: rot.anio2.primera, mesInicio: 5, mesFin: 8 },
    { anio: 2, temporada: "postrera", cultivos: rot.anio2.postrera, mesInicio: 9, mesFin: 12 },
  ];
}

export function textoWhatsApp(lugar: string, rot: Rotacion, plan: FilaPlan[]): string {
  const filas = plan.map((f) => `• Año ${f.anio}, ${f.temporada}: ${nombresCultivos(f.cultivos)}`).join("\n");
  return (
    `Mi plan de siembra para ${lugar} (Surco):\n${rot.nombre}\n${filas}\n\n` +
    "Hecho con datos de NASA POWER. Es una guía: lo reviso con mi técnico agrícola antes de sembrar."
  );
}
