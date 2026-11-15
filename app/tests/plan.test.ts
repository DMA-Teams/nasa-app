import { test } from "node:test";
import assert from "node:assert/strict";
import { agruparPlan, textoWhatsApp } from "../lib/plan.ts";
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
    return { mes: i + 1, cultivos, accion, lluvia: (i + 1) * 10, dificil: i + 1 === 7, cubierta: cultivos.length > 0 };
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

test("texto de WhatsApp lleva periodos y aviso", () => {
  const texto = textoWhatsApp("Gracias, Lempira", plan, agruparPlan(plan, "trimestral"));
  assert.match(texto, /Gracias, Lempira \(Surco\)/);
  assert.match(texto, /Ene – Mar/);
  assert.match(texto, /\(simulado\)/);
  assert.match(texto, /técnico agrícola/);
});
