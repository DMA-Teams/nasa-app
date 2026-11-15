import { test } from "node:test";
import assert from "node:assert/strict";
import { ciclosDelPlan, numCarriles, surcosPara } from "../lib/simulacion.ts";
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
