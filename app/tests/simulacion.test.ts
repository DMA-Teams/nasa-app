import { test } from "node:test";
import assert from "node:assert/strict";
import { ciclosDelPlan, estadoCarril, estadoEn, nivelLluvia, numCarriles, rangoPasos, surcosPara, tamanoPlanta } from "../lib/simulacion.ts";
import type { Ciclo } from "../lib/simulacion.ts";
import type { CultivoId, PlanAnual } from "../lib/tipos.ts";

interface MesPrueba {
  cultivos: CultivoId[];
  sembrados?: CultivoId[];
  cosechados?: CultivoId[];
}

function planDe(cultivosElegidos: CultivoId[], enTerreno: Record<number, MesPrueba>): PlanAnual {
  return {
    modo: "mis-cultivos",
    cultivosElegidos,
    tipoZona: "seca",
    meses: Array.from({ length: 12 }, (_, i) => {
      const m = enTerreno[i + 1] ?? { cultivos: [] };
      const sembrados = m.sembrados ?? [];
      const cosechados = m.cosechados ?? [];
      const accion = sembrados.length ? "sembrar" : cosechados.length ? "cosechar" : m.cultivos.length ? "cuidar" : "descansar";
      return { mes: i + 1, cultivos: m.cultivos, sembrados, cosechados, accion, lluvia: (i + 1) * 10, dificil: i + 1 === 7, cubierta: m.cultivos.length > 0 };
    }),
    resumen: "Prueba",
    fuente: { dataset: "NASA POWER", periodo: "2015–2025", consultado: "2026-11-14" },
    simulado: true,
  };
}

// Maíz de mayo a agosto y frijol de septiembre a noviembre
const planSeco = planDe(["maiz", "frijol"], {
  5: { cultivos: ["maiz"], sembrados: ["maiz"] }, 6: { cultivos: ["maiz"] }, 7: { cultivos: ["maiz"] }, 8: { cultivos: ["maiz"], cosechados: ["maiz"] },
  9: { cultivos: ["frijol"], sembrados: ["frijol"] }, 10: { cultivos: ["frijol"] }, 11: { cultivos: ["frijol"], cosechados: ["frijol"] },
});

// Maíz y sorgo juntos de mayo a agosto, y luego frijol
const planSecoRecomendado = planDe(["maiz", "sorgo", "frijol"], {
  5: { cultivos: ["maiz", "sorgo"], sembrados: ["maiz", "sorgo"] }, 6: { cultivos: ["maiz", "sorgo"] }, 7: { cultivos: ["maiz", "sorgo"] },
  8: { cultivos: ["maiz", "sorgo"], cosechados: ["maiz", "sorgo"] },
  9: { cultivos: ["frijol"], sembrados: ["frijol"] }, 10: { cultivos: ["frijol"] }, 11: { cultivos: ["frijol"], cosechados: ["frijol"] },
});

// Maíz dos veces: mayo–agosto y diciembre–marzo (cruza el año)
const planLluvioso = planDe(["maiz"], {
  1: { cultivos: ["maiz"] }, 2: { cultivos: ["maiz"] }, 3: { cultivos: ["maiz"], cosechados: ["maiz"] },
  5: { cultivos: ["maiz"], sembrados: ["maiz"] }, 6: { cultivos: ["maiz"] }, 7: { cultivos: ["maiz"] }, 8: { cultivos: ["maiz"], cosechados: ["maiz"] },
  12: { cultivos: ["maiz"], sembrados: ["maiz"] },
});

// El frijol se siembra el mismo mes en que se cosecha el maíz
const planTraslapado = planDe(["maiz", "frijol"], {
  5: { cultivos: ["maiz"], sembrados: ["maiz"] }, 6: { cultivos: ["maiz"] }, 7: { cultivos: ["maiz"] },
  8: { cultivos: ["maiz", "frijol"], cosechados: ["maiz"], sembrados: ["frijol"] },
  9: { cultivos: ["frijol"] }, 10: { cultivos: ["frijol"], cosechados: ["frijol"] },
});

const planSinSiembra = planDe(["sorgo"], { 3: { cultivos: ["sorgo"] }, 4: { cultivos: ["sorgo"] }, 5: { cultivos: ["sorgo"] } });
const planVacio = planDe([], {});

test("maíz may–ago y frijol sep–nov: dos ciclos en el mismo carril", () => {
  const c = ciclosDelPlan(planSeco);
  assert.deepEqual(c.map((x) => [x.cultivo, x.meses, x.carril]), [
    ["maiz", [5, 6, 7, 8], 0],
    ["frijol", [9, 10, 11], 0],
  ]);
  assert.equal(numCarriles(c), 1);
});

test("maíz y sorgo simultáneos van en carriles distintos", () => {
  const c = ciclosDelPlan(planSecoRecomendado);
  assert.equal(numCarriles(c), 2);
  assert.notEqual(c.find((x) => x.cultivo === "maiz")!.carril, c.find((x) => x.cultivo === "sorgo")!.carril);
  assert.equal(c.find((x) => x.cultivo === "frijol")!.carril, 0);
});

test("un ciclo que cruza de diciembre a marzo", () => {
  const c = ciclosDelPlan(planLluvioso).filter((x) => x.cultivo === "maiz");
  assert.deepEqual(c.map((x) => x.meses), [[5, 6, 7, 8], [12, 1, 2, 3]]);
});

test("cosecha y siembra en el mismo mes no comparten carril", () => {
  assert.equal(numCarriles(ciclosDelPlan(planTraslapado)), 2);
});

test("cultivo en el terreno sin mes de siembra cuenta como un ciclo", () => {
  const [c] = ciclosDelPlan(planSinSiembra);
  assert.deepEqual([c.meses, c.tieneCosecha], [[3, 4, 5], false]);
});

test("plan sin cultivos: sin ciclos y sin carriles", () => {
  assert.deepEqual(ciclosDelPlan(planVacio), []);
  assert.equal(numCarriles([]), 0);
});

test("surcosPara nunca deja un carril sin surco", () => {
  assert.equal(surcosPara(0), 8);
  assert.equal(surcosPara(3), 8);
  assert.equal(surcosPara(11), 11);
});

// ---------- Etapas ----------
const maiz: Ciclo = { cultivo: "maiz", meses: [5, 6, 7, 8], tieneCosecha: true, carril: 0 };
const paso = (mes: number, semana = 0) => (mes - 1) * 4 + semana;

test("el mes de siembra da preparación y luego siembra", () => {
  assert.equal(estadoEn(maiz, paso(5, 0))!.etapa, "preparacion");
  assert.deepEqual([1, 2, 3].map((s) => estadoEn(maiz, paso(5, s))!.etapa), ["siembra", "siembra", "siembra"]);
});

test("los meses intermedios pasan por germinación, crecimiento y maduración", () => {
  const etapas = Array.from({ length: 8 }, (_, i) => estadoEn(maiz, paso(6) + i)!.etapa);
  assert.deepEqual(etapas, ["germinacion", "germinacion", "crecimiento", "crecimiento", "crecimiento", "crecimiento", "maduracion", "maduracion"]);
});

test("el mes de cosecha da cosecha y avanza hasta 1", () => {
  assert.deepEqual(estadoEn(maiz, paso(8, 0)), { etapa: "cosecha", avanceEtapa: 0.25 });
  assert.deepEqual(estadoEn(maiz, paso(8, 3)), { etapa: "cosecha", avanceEtapa: 1 });
});

test("fuera del ciclo no hay planta", () => {
  assert.equal(estadoEn(maiz, paso(4, 3)), null);
  assert.equal(estadoEn(maiz, paso(9, 0)), null);
});

test("un ciclo que cruza el año se ve en enero", () => {
  const apante: Ciclo = { cultivo: "maiz", meses: [12, 1, 2, 3], tieneCosecha: true, carril: 0 };
  assert.equal(estadoEn(apante, paso(1, 0))!.etapa, "germinacion");
  assert.equal(estadoEn(apante, paso(3, 0))!.etapa, "cosecha");
});

test("ciclo sin cosecha: termina en maduración y no deja rastrojo", () => {
  const sin: Ciclo = { cultivo: "sorgo", meses: [3, 4, 5], tieneCosecha: false, carril: 0 };
  assert.equal(estadoEn(sin, paso(5, 3))!.etapa, "maduracion");
  assert.equal(estadoCarril([sin], 0, paso(6, 0)), null);
});

test("ciclo de un solo mes no falla", () => {
  const uno: Ciclo = { cultivo: "frijol", meses: [9], tieneCosecha: false, carril: 0 };
  assert.equal(estadoEn(uno, paso(9, 0))!.etapa, "preparacion");
  assert.equal(estadoEn(uno, paso(9, 3))!.etapa, "siembra");
});

test("después de la cosecha queda rastrojo dos pasos y luego descanso", () => {
  assert.equal(estadoCarril([maiz], 0, paso(9, 0))!.estado.etapa, "rastrojo");
  assert.equal(estadoCarril([maiz], 0, paso(9, 1))!.estado.etapa, "rastrojo");
  assert.equal(estadoCarril([maiz], 0, paso(9, 2)), null);
});

test("el cultivo siguiente tapa el rastrojo del anterior", () => {
  const frijol: Ciclo = { cultivo: "frijol", meses: [9, 10, 11], tieneCosecha: true, carril: 0 };
  assert.equal(estadoCarril([maiz, frijol], 0, paso(9, 0))!.ciclo.cultivo, "frijol");
});

test("la planta nunca se achica antes de la cosecha", () => {
  const t = Array.from({ length: 12 }, (_, i) => tamanoPlanta(estadoEn(maiz, paso(5) + i)!));
  assert.deepEqual(t, [...t].sort((a, b) => a - b));
});

test("rangos de pasos por vista", () => {
  assert.deepEqual(rangoPasos("anual", 0), [0, 47]);
  assert.deepEqual(rangoPasos("semestral", 1), [24, 47]);
  assert.deepEqual(rangoPasos("trimestral", 2), [24, 35]);
});

test("niveles de lluvia", () => {
  assert.deepEqual([0, 59, 60, 199, 200].map(nivelLluvia), ["poca", "poca", "regular", "regular", "mucha"]);
});

test("un cultivo que va solo ocupa también los surcos que quedaron libres", () => {
  // En septiembre–noviembre el sorgo ya salió: su carril lo usa el frijol, no se queda vacío
  const c = ciclosDelPlan(planSecoRecomendado);
  assert.equal(estadoCarril(c, 1, paso(10, 0))!.ciclo.cultivo, "frijol");
  assert.equal(estadoCarril(c, 1, paso(6, 0))!.ciclo.cultivo, "sorgo");
  assert.equal(estadoCarril(c, 1, paso(2, 0)), null);
});
