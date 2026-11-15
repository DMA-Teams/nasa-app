import { test } from "node:test";
import assert from "node:assert/strict";
import { lluviaPromedio, RAMPA_LLUVIA } from "../lib/colores.ts";

// Lluvia de Lempira por mes (mm), como sale en public/fallback/departamentos.json
const lempira = [55, 42, 102, 43, 163, 241, 128, 165, 227, 176, 123, 118];

test("lluviaPromedio: promedio por mes de los meses del periodo", () => {
  assert.equal(lluviaPromedio(lempira, [1, 2, 3]), 66); // (55 + 42 + 102) / 3
  assert.equal(lluviaPromedio(lempira, [7, 8, 9]), 173);
  assert.equal(lluviaPromedio(lempira, []), 0);
});

test("RAMPA_LLUVIA sube de menos a más lluvia", () => {
  const cortes = RAMPA_LLUVIA.map(([mm]) => mm);
  assert.deepEqual(cortes, [...cortes].sort((a, b) => a - b));
  assert.equal(new Set(RAMPA_LLUVIA.map(([, c]) => c)).size, RAMPA_LLUVIA.length);
});
