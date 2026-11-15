import { test } from "node:test";
import assert from "node:assert/strict";
import { pronosticoDesdeApi, textoRazon } from "../lib/razones.ts";

test("cada razón conocida da un texto con tono", () => {
  assert.deepEqual(textoRazon({ codigo: "loss_probability", cultivo: "frijol", valor: 0.17 }), {
    texto: "Frijol: riesgo de perder la cosecha por falta de agua de 17 %.",
    tono: "info",
  });
  assert.equal(textoRazon({ codigo: "loss_probability", cultivo: "maiz", valor: 0.4 })?.tono, "atencion");
  assert.equal(textoRazon({ codigo: "nitrogen_balance_kg_ha", cultivo: null, valor: 120.5 })?.tono, "bien");
  assert.match(textoRazon({ codigo: "nitrogen_balance_kg_ha", cultivo: null, valor: -15.5 })!.texto, /pierde unos 16 kg/);
  assert.equal(textoRazon({ codigo: "bare_soil_rainy_months", cultivo: null, valor: 0 })?.tono, "bien");
});

test("una razón desconocida no se muestra", () => {
  assert.equal(textoRazon({ codigo: "algo_nuevo", cultivo: null, valor: 1 }), null);
});

test("el pronóstico salta los meses sin dato y cruza el año", () => {
  const meses = pronosticoDesdeApi("2026-11-15", [null, { below: 0.5, normal: 0.3, above: 0.2 }, null, { below: 0.1, normal: 0.8, above: 0.1 }]);
  assert.deepEqual(meses.map((m) => `${m.mes}/${m.anio}`), ["12/2026", "2/2027"]);
});
