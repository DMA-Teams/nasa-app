// Geometría con GeoJSON: punto dentro de polígono y centros. Sin dependencias.
// Solo importa tipos para que los scripts de Node lo puedan usar.
import type { DepartamentosGeoJSON } from "./tipos";

type Anillo = number[][];
type Poligono = Anillo[];

function dentroDeAnillo(lon: number, lat: number, anillo: Anillo): boolean {
  let dentro = false;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i];
    const [xj, yj] = anillo[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}

function dentroDePoligono(lon: number, lat: number, poligono: Poligono): boolean {
  const [exterior, ...huecos] = poligono;
  return dentroDeAnillo(lon, lat, exterior) && !huecos.some((h) => dentroDeAnillo(lon, lat, h));
}

export function poligonosDe(geometria: { type: string; coordinates: unknown }): Poligono[] {
  return geometria.type === "Polygon" ? [geometria.coordinates as Poligono] : (geometria.coordinates as Poligono[]);
}

export function dentroDeGeometria(lon: number, lat: number, geometria: { type: string; coordinates: unknown }): boolean {
  return poligonosDe(geometria).some((p) => dentroDePoligono(lon, lat, p));
}

/** Nombre del departamento que contiene el punto, o null si está fuera de Honduras. */
export function departamentoDe(departamentos: DepartamentosGeoJSON, lat: number, lon: number): string | null {
  const f = departamentos.features.find((d) => dentroDeGeometria(lon, lat, d.geometry));
  return f ? f.properties.nombre : null;
}

/** Centro aproximado del polígono más grande (para etiquetas). */
export function centroDe(geometria: { type: string; coordinates: unknown }): [number, number] {
  const mayor = poligonosDe(geometria).reduce((a, p) => (p[0].length > a[0].length ? p : a));
  const anillo = mayor[0];
  const lon = anillo.reduce((s, c) => s + c[0], 0) / anillo.length;
  const lat = anillo.reduce((s, c) => s + c[1], 0) / anillo.length;
  return [Math.round(lon * 1000) / 1000, Math.round(lat * 1000) / 1000];
}
