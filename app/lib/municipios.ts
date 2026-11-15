// Municipios por departamento. Funciones puras: la lista llega por parámetro
// (de public/fallback/municipios.json o de la API del backend).
import type { Municipio } from "./tipos";

/** true: municipios.json es una lista inventada (cabeceras reales, coordenadas aproximadas). Se marca "(simulado)". */
export const MUNICIPIOS_SIMULADOS = true;

export function municipiosDe(todos: Municipio[], departamento: string): Municipio[] {
  return todos.filter((m) => m.departamento === departamento).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

/** El municipio más cercano al punto, buscando solo dentro del departamento donde cayó. */
export function municipioMasCercano(todos: Municipio[], departamento: string, lat: number, lon: number): Municipio | null {
  const distancia = (m: Municipio) => (m.lat - lat) ** 2 + (m.lon - lon) ** 2;
  return municipiosDe(todos, departamento).reduce<Municipio | null>((mejor, m) => (!mejor || distancia(m) < distancia(mejor) ? m : mejor), null);
}
