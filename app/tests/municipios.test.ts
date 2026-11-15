import { test } from "node:test";
import assert from "node:assert/strict";
import { municipioMasCercano, municipiosDe } from "../lib/municipios.ts";
import type { Municipio } from "../lib/tipos.ts";

const todos: Municipio[] = [
  { id: "a", nombre: "Gracias", departamento: "Lempira", lat: 14.59, lon: -88.58 },
  { id: "b", nombre: "Erandique", departamento: "Lempira", lat: 14.24, lon: -88.47 },
  { id: "c", nombre: "La Esperanza", departamento: "Intibucá", lat: 14.31, lon: -88.18 },
];

test("municipiosDe filtra por departamento y ordena por nombre", () => {
  assert.deepEqual(municipiosDe(todos, "Lempira").map((m) => m.nombre), ["Erandique", "Gracias"]);
});

test("municipiosDe de un departamento sin datos da lista vacía", () => {
  assert.deepEqual(municipiosDe(todos, "Colón"), []);
});

test("municipioMasCercano se queda dentro del departamento", () => {
  // La Esperanza está más cerca del punto, pero es de Intibucá
  assert.equal(municipioMasCercano(todos, "Lempira", 14.3, -88.25)?.nombre, "Erandique");
});

test("municipioMasCercano da null si el departamento no tiene municipios", () => {
  assert.equal(municipioMasCercano(todos, "Colón", 15.7, -86), null);
});
