import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { construirPlan } from "../lib/calendario.ts";
import { construirClima } from "../lib/clima.ts";
import { celdaDePunto } from "../lib/mapa.ts";
import type { Celda, CultivoId, ReglaCultivo, TipoZona } from "../lib/tipos.ts";

const celdas: Celda[] = JSON.parse(fs.readFileSync(new URL("../public/fallback/celdas.json", import.meta.url), "utf8"));
const datos = JSON.parse(fs.readFileSync(new URL("../data/reglas.json", import.meta.url), "utf8"));
const reglas = datos.cultivos as ReglaCultivo[];
const recomendados = datos.recomendados as Record<TipoZona, CultivoId[]>;

const climaDe = (lat: number, lon: number) => {
  const c = celdaDePunto(celdas, lat, lon);
  return construirClima(c.lat, c.lon, c.resumen, "respaldo", "2026-11-14");
};
const lempira = climaDe(14.3, -88.6);
const atlantida = climaDe(15.7, -86.9);
const plan = (clima: typeof lempira, modo: "recomendado" | "mis-cultivos", cultivos: CultivoId[] = []) =>
  construirPlan({ lat: clima.lat, lon: clima.lon, modo, cultivos }, clima, reglas, recomendados);
const conCultivo = (p: ReturnType<typeof plan>, id: CultivoId) => p.meses.filter((m) => m.cultivos.includes(id)).map((m) => m.mes);

test("los climas de prueba son de zona seca y lluviosa", () => {
  assert.equal(lempira.tipo, "seca");
  assert.equal(atlantida.tipo, "lluviosa");
});

test("siempre 12 meses, de enero a diciembre", () => {
  assert.deepEqual(plan(lempira, "recomendado").meses.map((m) => m.mes), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
});

test("recomendado en zona seca usa maíz, sorgo y frijol", () => {
  const p = plan(lempira, "recomendado");
  assert.deepEqual(p.cultivosElegidos, ["maiz", "sorgo", "frijol"]);
  assert.equal(p.meses[4].accion, "sembrar");
  assert.ok(p.meses[4].cultivos.includes("maiz") && p.meses[4].cultivos.includes("sorgo"));
  assert.ok(p.meses[8].cultivos.includes("frijol"));
});

test("maíz de apante cruza el fin de año en zona lluviosa", () => {
  const p = plan(atlantida, "mis-cultivos", ["maiz"]);
  for (const m of [12, 1, 2, 3]) assert.ok(p.meses[m - 1].cultivos.includes("maiz"), `mes ${m}`);
  assert.equal(p.meses[11].accion, "sembrar");
  assert.equal(p.meses[2].accion, "cosechar");
});

test("frijol en zona lluviosa se mueve a primera y lo explica", () => {
  const p = plan(atlantida, "mis-cultivos", ["frijol"]);
  const meses = conCultivo(p, "frijol");
  assert.ok(meses.includes(5));
  assert.ok(!meses.some((m) => m >= 10));
  assert.match(p.resumen, /primera/);
});

test("un solo cultivo: meses en descanso y sugerencia de frijol abono", () => {
  const p = plan(lempira, "mis-cultivos", ["frijol"]);
  assert.ok(p.meses.filter((m) => m.accion === "descansar").length >= 6);
  assert.match(p.resumen, /frijol abono/);
});

test("lluvia y meses difíciles vienen del clima NASA", () => {
  const p = plan(lempira, "recomendado");
  for (const m of p.meses) {
    assert.equal(m.lluvia, lempira.meses[m.mes - 1].lluvia);
    assert.equal(m.dificil, lempira.mesesDificiles.includes(m.mes));
  }
  assert.equal(p.tipoZona, "seca");
  assert.equal(p.simulado, true);
});

test("mis-cultivos vacío lanza RangeError", () => {
  assert.throws(() => plan(lempira, "mis-cultivos", []), RangeError);
});
