import { test } from "node:test";
import assert from "node:assert/strict";
import { listaMeses, nombreMesesDificiles, nombresCultivos } from "../lib/textos.ts";

test("nombreMesesDificiles: aguaceros en zona lluviosa, canícula en las demás", () => {
  assert.equal(nombreMesesDificiles("lluviosa"), "Meses de aguaceros fuertes");
  assert.equal(nombreMesesDificiles("seca"), "Meses de canícula");
  assert.equal(nombreMesesDificiles("equilibrada"), "Meses de canícula");
});

test("listaMeses une con comas y 'y'", () => {
  assert.equal(listaMeses([7]), "julio");
  assert.equal(listaMeses([7, 8]), "julio y agosto");
  assert.equal(listaMeses([9, 10, 11]), "septiembre, octubre y noviembre");
  assert.equal(listaMeses([]), "");
});

test("nombresCultivos usa los nombres en español", () => {
  assert.equal(nombresCultivos(["maiz", "frijolAbono"]), "Maíz + Frijol abono");
});
