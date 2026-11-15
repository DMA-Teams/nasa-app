import { test } from "node:test";
import assert from "node:assert/strict";
import { listaMeses, nombresCultivos } from "../lib/textos.ts";

test("listaMeses une con comas y 'y'", () => {
  assert.equal(listaMeses([7]), "julio");
  assert.equal(listaMeses([7, 8]), "julio y agosto");
  assert.equal(listaMeses([9, 10, 11]), "septiembre, octubre y noviembre");
  assert.equal(listaMeses([]), "");
});

test("nombresCultivos usa los nombres en español", () => {
  assert.equal(nombresCultivos(["maiz", "frijolAbono"]), "Maíz + Frijol abono");
});
