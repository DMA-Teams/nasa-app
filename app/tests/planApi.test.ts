import { test } from "node:test";
import assert from "node:assert/strict";
import { planDesdeApi, PlanApiInvalido, type PlanApi, type RotacionApi, type SiembraApi } from "../lib/planApi.ts";
import type { PedidoPlan } from "../lib/tipos.ts";

const LLUVIA_POR_MES = [5, 5, 10, 40, 150, 250, 120, 130, 260, 200, 60, 15];

const siembra = (cropId: string, sowDate: string, harvestDate: string, extra: Partial<SiembraApi> = {}): SiembraApi => ({
  cropId,
  role: "harvest",
  sowDate,
  harvestDate,
  relay: false,
  lossProbability: 0.04,
  ...extra,
});

const rotacion = (id: string, kind: RotacionApi["kind"], plantings: SiembraApi[], total: number): RotacionApi => ({
  id,
  kind,
  name: `Rotación ${id}`,
  feasible: true,
  plantings,
  scores: { total, water: 90, soil: 80 },
});

const maizFrijol = [
  siembra("maize", "2027-05-01", "2027-09-03"),
  siembra("beans", "2027-08-16", "2027-11-20", { relay: true, lossProbability: 0.17 }),
];

function respuesta(rotaciones: RotacionApi[], best: string): PlanApi {
  return {
    municipality: { name: "La Esperanza", departmentName: "Intibucá" },
    generatedAt: "2026-11-15T16:00:00Z",
    site: {
      fortnights: LLUVIA_POR_MES.flatMap((lluvia, i) => [
        { month: i + 1, precipitationP50Mm: lluvia / 2 },
        { month: i + 1, precipitationP50Mm: lluvia / 2 },
      ]),
    },
    evaluation: { best, rotations: rotaciones },
  };
}

const recomendado: PedidoPlan = { lat: 14.29, lon: -88.14, modo: "recomendado", cultivos: [] };
const misCultivos: PedidoPlan = { lat: 14.29, lon: -88.14, modo: "mis-cultivos", cultivos: ["maiz", "frijol"] };

test("convierte la mejor rotación en 12 meses de enero a diciembre", () => {
  const plan = planDesdeApi(respuesta([rotacion("current", "current", maizFrijol, 79)], "current"), recomendado);

  assert.equal(plan.meses.length, 12);
  assert.deepEqual(plan.meses.map((m) => m.mes), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  assert.deepEqual(plan.cultivosElegidos, ["maiz", "frijol"]);
  assert.equal(plan.simulado, false);
  assert.deepEqual(plan.meses.map((m) => m.lluvia), LLUVIA_POR_MES);
});

test("el frijol en relevo comparte meses con el maíz y se siembra en agosto", () => {
  const plan = planDesdeApi(respuesta([rotacion("current", "current", maizFrijol, 79)], "current"), recomendado);
  const mes = (n: number) => plan.meses[n - 1];

  assert.deepEqual(mes(5).sembrados, ["maiz"]);
  assert.equal(mes(5).accion, "sembrar");
  assert.deepEqual(mes(8).cultivos, ["maiz", "frijol"]);
  assert.deepEqual(mes(8).sembrados, ["frijol"]);
  assert.deepEqual(mes(9).cosechados, ["maiz"]);
  assert.deepEqual(mes(11).cosechados, ["frijol"]);
  assert.equal(mes(1).accion, "descansar");
  assert.equal(mes(1).cubierta, false);
  assert.match(plan.resumen, /Frijol se siembra entre el maíz/);
  assert.match(plan.resumen, /^Tus cultivos: maíz con frijol en relevo\./);
  assert.match(plan.resumen, /17 %/);
});

test("un abono verde que cruza el año cubre la tierra en diciembre y enero", () => {
  const conMucuna = [
    siembra("maize", "2027-05-01", "2027-10-15"),
    siembra("mucuna", "2027-06-01", "2028-01-30", { role: "cover", relay: true, lossProbability: 0 }),
  ];
  const plan = planDesdeApi(respuesta([rotacion("t1", "template", conMucuna, 95)], "t1"), recomendado);

  assert.equal(plan.meses[11].accion, "cubrir");
  assert.deepEqual(plan.meses[0].cultivos, ["frijolAbono"]);
  assert.deepEqual(plan.meses[0].cosechados, ["frijolAbono"]);
});

test("un cultivo de más de un año ocupa los 12 meses", () => {
  const gandul = [siembra("pigeon_pea", "2027-11-01", "2028-11-01", { role: "cover" })];
  const plan = planDesdeApi(respuesta([rotacion("g", "generated", gandul, 85)], "g"), recomendado);

  assert.ok(plan.meses.every((m) => m.cultivos.includes("gandul")));
});

test("mis cultivos muestra la rotación actual aunque otra tenga mejor puntaje", () => {
  const otra = rotacion("t1", "template", [siembra("sorghum", "2027-05-01", "2027-09-19")], 97);
  const plan = planDesdeApi(respuesta([rotacion("current", "current", maizFrijol, 79), otra], "t1"), misCultivos);

  assert.deepEqual(plan.cultivosElegidos, ["maiz", "frijol"]);
  assert.equal(plan.modo, "mis-cultivos");
});

test("recomendado salta la mejor si trae un cultivo que la app no conoce", () => {
  const rara = rotacion("x", "generated", [siembra("quinoa", "2027-05-01", "2027-09-01")], 99);
  const buena = rotacion("t1", "template", [siembra("sorghum", "2027-05-01", "2027-09-19")], 97);
  const plan = planDesdeApi(respuesta([rara, buena], "x"), recomendado);

  assert.deepEqual(plan.cultivosElegidos, ["sorgo"]);
});

test("mis cultivos con un cultivo desconocido es un error que activa el respaldo", () => {
  const rara = rotacion("current", "current", [siembra("quinoa", "2027-05-01", "2027-09-01")], 50);

  assert.throws(() => planDesdeApi(respuesta([rara], "current"), misCultivos), PlanApiInvalido);
});

test("el nombre de la rotación usa los nombres de la app, no los del backend", () => {
  const conMucuna = { ...rotacion("t1", "template", [siembra("maize", "2027-05-01", "2027-10-15"), siembra("mucuna", "2027-06-01", "2028-01-30", { role: "cover", relay: true })], 95), name: "Maíz con mucuna en relevo" };
  const secuencia = rotacion("g", "generated", [siembra("sesame", "2027-12-01", "2028-03-20"), siembra("mucuna", "2027-07-01", "2027-10-30", { role: "cover" })], 90);
  const quesungual = { ...rotacion("q", "template", maizFrijol, 84), mulch: true };

  assert.match(planDesdeApi(respuesta([conMucuna], "t1"), recomendado).resumen, /^Maíz con frijol abono en relevo\./);
  assert.match(planDesdeApi(respuesta([secuencia], "g"), recomendado).resumen, /^Ajonjolí y luego frijol abono\./);
  assert.match(planDesdeApi(respuesta([quesungual], "q"), recomendado).resumen, /Quesungual/);
  assert.match(planDesdeApi(respuesta([rotacion("current", "current", maizFrijol, 79)], "current"), misCultivos).resumen, /^Tus cultivos: maíz con frijol en relevo\./);
  assert.doesNotMatch(planDesdeApi(respuesta([conMucuna], "t1"), recomendado).resumen, /mucuna/i);
});

test("trae las razones sin las internas y el pronóstico con su mes de calendario", () => {
  const conRazones: RotacionApi = {
    ...rotacion("current", "current", maizFrijol, 79),
    reasons: [
      { code: "loss_probability", crop: "beans", value: 0.17 },
      { code: "low_confidence_parameters", crop: "beans", value: 2 },
      { code: "nitrogen_balance_kg_ha", value: -15.5 },
    ],
  };
  const api = respuesta([conRazones], "current");
  api.evaluation.start = "2026-11-15";
  api.site.forecastByPlanMonth = [null, { below: 0.6, normal: 0.38, above: 0.02 }, { below: 0.9, normal: 0.1, above: 0 }];

  const plan = planDesdeApi(api, misCultivos);

  assert.deepEqual(plan.explicacion?.razones.map((r) => r.codigo), ["loss_probability", "nitrogen_balance_kg_ha"]);
  assert.equal(plan.explicacion?.razones[0].cultivo, "frijol");
  assert.deepEqual(plan.explicacion?.pronostico.map((p) => [p.mes, p.anio]), [[12, 2026], [1, 2027]]);
});
