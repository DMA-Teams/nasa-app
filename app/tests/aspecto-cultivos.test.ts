import { test } from "node:test";
import assert from "node:assert/strict";
import { aspectoDe, IDS_CULTIVOS, nombreCultivo } from "../lib/aspecto-cultivos.ts";

const LISTADO = ["maize", "beans", "sorghum", "rice", "peanut", "cowpea", "soybean", "sesame", "cassava", "sweet_potato", "potato",
  "tomato", "sweet_pepper", "onion", "cabbage", "cucumber", "watermelon", "melon", "squash", "mucuna", "canavalia", "pigeon_pea"];

test("los 22 cultivos del listado tienen aspecto propio", () => {
  assert.equal(IDS_CULTIVOS.length, 22);
  assert.deepEqual([...IDS_CULTIVOS].sort(), [...LISTADO].sort());
  for (const id of LISTADO) assert.notEqual(aspectoDe(id).nombre, id);
});

test("no hay dos cultivos que se vean igual", () => {
  const firmas = LISTADO.map((id) => {
    const a = aspectoDe(id);
    return [a.forma, a.hoja, a.detalle, a.colorDetalle].join("|");
  });
  assert.equal(new Set(firmas).size, 22);
});

test("los ids actuales del plan usan alias", () => {
  assert.equal(aspectoDe("maiz"), aspectoDe("maize"));
  assert.equal(aspectoDe("frijol"), aspectoDe("beans"));
  assert.equal(aspectoDe("sorgo"), aspectoDe("sorghum"));
  assert.equal(aspectoDe("frijolAbono"), aspectoDe("mucuna"));
});

test("los nombres salen del plan cuando existen", () => {
  assert.equal(nombreCultivo("frijolAbono"), "Frijol abono");
  assert.equal(nombreCultivo("cassava"), "Yuca");
});

test("un id desconocido usa el aspecto genérico con su id como nombre", () => {
  assert.equal(aspectoDe("quinoa").forma, "mataBaja");
  assert.equal(nombreCultivo("quinoa"), "quinoa");
});

test("alturas dentro de rango y colores solo de tokens", () => {
  for (const id of LISTADO) {
    const a = aspectoDe(id);
    assert.ok(a.altura >= 0.3 && a.altura <= 1);
    for (const c of [a.hoja, a.colorDetalle]) assert.ok(!c.includes("#") && c.includes("var(--"));
  }
});

test("los 22 cultivos de la app tienen su dibujo propio en la simulación", async () => {
  const { CULTIVOS } = await import("../lib/cultivos.ts");
  for (const c of CULTIVOS) assert.notEqual(aspectoDe(c.id).nombre, c.id, `${c.id} cae en el dibujo genérico`);
});
