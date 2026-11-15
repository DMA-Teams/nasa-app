import { test } from "node:test";
import assert from "node:assert/strict";
import { agruparPlan } from "../lib/plan.ts";
import type { AccionPeriodo, CultivoId, PlanAnual } from "../lib/tipos.ts";

// Maíz de mayo a agosto, frijol de septiembre a noviembre, julio difícil (canícula)
const enTerreno: Record<number, [CultivoId[], AccionPeriodo]> = {
  5: [["maiz"], "sembrar"], 6: [["maiz"], "cuidar"], 7: [["maiz"], "cuidar"], 8: [["maiz"], "cosechar"],
  9: [["frijol"], "sembrar"], 10: [["frijol"], "cuidar"], 11: [["frijol"], "cosechar"],
};
const plan: PlanAnual = {
  modo: "recomendado",
  cultivosElegidos: ["maiz", "frijol"],
  tipoZona: "seca",
  meses: Array.from({ length: 12 }, (_, i) => {
    const [cultivos, accion] = enTerreno[i + 1] ?? [[], "descansar"];
    const sembrados = accion === "sembrar" ? cultivos : [];
    const cosechados = accion === "cosechar" ? cultivos : [];
    return { mes: i + 1, cultivos, sembrados, cosechados, accion, lluvia: (i + 1) * 10, dificil: i + 1 === 7, cubierta: cultivos.length > 0 };
  }),
  resumen: "Prueba",
  fuente: { dataset: "NASA POWER", periodo: "2015–2025", consultado: "2026-11-14" },
  simulado: true,
};

test("trimestral da 4 periodos con nombres", () => {
  const p = agruparPlan(plan, "trimestral");
  assert.deepEqual(p.map((x) => x.id), ["T1", "T2", "T3", "T4"]);
  assert.equal(p[0].nombre, "Ene – Mar");
});

test("semestral da 2 periodos", () => {
  const p = agruparPlan(plan, "semestral");
  assert.deepEqual(p.map((x) => x.id), ["S1", "S2"]);
  assert.equal(p[1].nombre, "Jul – Dic");
});

test("un cultivo que cruza trimestres aparece en ambos", () => {
  const [, t2, t3] = agruparPlan(plan, "trimestral");
  assert.ok(t2.cultivos.includes("maiz"));
  assert.deepEqual(t3.cultivos, ["maiz", "frijol"]);
});

test("acción principal y consejo", () => {
  const [t1, t2] = agruparPlan(plan, "trimestral");
  assert.equal(t1.accionPrincipal, "descansar");
  assert.equal(t1.consejo, "La tierra descansa");
  assert.equal(t2.accionPrincipal, "sembrar");
  assert.match(t2.consejo, /maíz/);
});

test("alerta de canícula solo donde hay mes difícil", () => {
  const [t1, , t3] = agruparPlan(plan, "trimestral");
  assert.equal(t3.alerta, "Canícula en julio");
  assert.equal(t1.alerta, null);
});

test("alerta de aguaceros en zona lluviosa", () => {
  const [, , t3] = agruparPlan({ ...plan, tipoZona: "lluviosa" }, "trimestral");
  assert.equal(t3.alerta, "Aguaceros fuertes en julio");
});

test("lluvia esperada suma los meses y cuenta los meses cubiertos", () => {
  const [t1, t2] = agruparPlan(plan, "trimestral");
  assert.equal(t1.lluviaEsperada, 10 + 20 + 30);
  assert.equal(t1.mesesCubierta, 0);
  assert.equal(t2.mesesCubierta, 2);
});

test("el consejo de siembra solo nombra lo que se siembra ese periodo", () => {
  // Frijol abono sembrado en mayo sigue en el terreno en septiembre, cuando se siembra el frijol
  const conAbono: PlanAnual = {
    ...plan,
    meses: plan.meses.map((m) => {
      if (m.mes === 5) return { ...m, cultivos: ["frijolAbono"], accion: "sembrar", sembrados: ["frijolAbono"], cosechados: [] };
      if (m.mes >= 6 && m.mes <= 8) return { ...m, cultivos: ["frijolAbono"], accion: "cubrir", sembrados: [], cosechados: [] };
      if (m.mes === 9) return { ...m, cultivos: ["frijolAbono", "frijol"], accion: "sembrar", sembrados: ["frijol"], cosechados: [] };
      return { ...m, cultivos: [], accion: "descansar", sembrados: [], cosechados: [] };
    }),
  };
  const [, , t3] = agruparPlan(conAbono, "trimestral");
  assert.equal(t3.consejo, "Siembra frijol");
});

test("cada periodo explica por qué, con los datos del lugar", () => {
  const [t1, t2, t3, t4] = agruparPlan(plan, "trimestral");
  assert.equal(t1.porque, "Llueve poco (60 mm en estos meses): no conviene sembrar.");
  assert.equal(t2.porque, "Se siembra en mayo porque ya llueve (50 mm ese mes).");
  assert.match(t3.porque, /^Se siembra en septiembre porque ya llueve \(90 mm ese mes\)\. /);
  assert.match(t3.porque, /postrera/);
  assert.match(t4.porque, /noviembre/);
});

test("el frijol abono no se cosecha: se corta y se deja en la tierra", () => {
  const soloAbono: PlanAnual = {
    ...plan,
    meses: plan.meses.map((m) =>
      m.mes === 10
        ? { ...m, cultivos: ["frijolAbono"], sembrados: [], cosechados: ["frijolAbono"], accion: "cosechar" }
        : { ...m, cultivos: [], sembrados: [], cosechados: [], accion: "descansar" },
    ),
  };
  const t4 = agruparPlan(soloAbono, "trimestral")[3];
  assert.equal(t4.consejo, "Corta el frijol abono y déjalo en la tierra");
  assert.match(t4.porque, /abono/);
});

test("la explicación de cosecha nombra todos los cultivos y meses del periodo", () => {
  const dos: PlanAnual = {
    ...plan,
    meses: plan.meses.map((m) =>
      m.mes === 7
        ? { ...m, cultivos: ["frijol", "maiz"], sembrados: [], cosechados: ["frijol"], accion: "cosechar" }
        : m.mes === 8
          ? { ...m, cultivos: ["maiz"], sembrados: [], cosechados: ["maiz"], accion: "cosechar" }
          : { ...m, cultivos: [], sembrados: [], cosechados: [], accion: "descansar" },
    ),
  };
  const t3 = agruparPlan(dos, "trimestral")[2];
  assert.equal(t3.porque, "Se cosecha en julio y agosto: el frijol y el maíz ya terminaron su ciclo.");
});
