// Genera public/fallback/departamentos.json: los 18 departamentos con su clima de NASA POWER.
// Cada departamento promedia la lluvia y la altura de los cuadros que caen dentro.
// Uso (desde app/, después de npm run datos): npm run departamentos
//
// Límites: geoBoundaries HND ADM1 (OpenStreetMap, licencia ODbL), versión simplificada.
import fs from "node:fs";
import path from "node:path";
import { clasificarZona, relieveDe } from "../lib/clima.ts";
import { centroDe, dentroDeGeometria, poligonosDe } from "../lib/geo.ts";
import type { Celda, DepartamentosGeoJSON } from "../lib/tipos.ts";

const raiz = path.resolve(import.meta.dirname, "..");
const fuente = JSON.parse(fs.readFileSync(path.join(raiz, "scripts", "fuentes", "geoboundaries-hnd-adm1.geojson"), "utf8"));
const celdas: Celda[] = JSON.parse(fs.readFileSync(path.join(raiz, "public", "fallback", "celdas.json"), "utf8"));
const NOMBRES: Record<string, string> = { "Bay Islands": "Islas de la Bahía" };

// 3 decimales (~110 m): el mapa llega hasta el zoom 9, donde un píxel mide ~300 m, así que no se nota.
// Al redondear, muchos puntos seguidos quedan iguales: se quitan. Un anillo conserva al menos 4 puntos (cerrado).
type Punto = [number, number];
const esPunto = (v: unknown): v is Punto => Array.isArray(v) && typeof v[0] === "number";
const esAnillo = (v: unknown): v is Punto[] => Array.isArray(v) && esPunto(v[0]);
function redondear(v: unknown): unknown {
  if (esAnillo(v)) {
    const puntos = v.map(([x, y]) => [Math.round(x * 1e3) / 1e3, Math.round(y * 1e3) / 1e3] as Punto);
    const sinRepetir = puntos.filter((p, i) => i === 0 || p[0] !== puntos[i - 1][0] || p[1] !== puntos[i - 1][1]);
    return sinRepetir.length >= 4 ? sinRepetir : puntos;
  }
  return (v as unknown[]).map(redondear);
}

const salida: DepartamentosGeoJSON = { type: "FeatureCollection", features: [] };

for (const f of fuente.features) {
  const nombre = NOMBRES[f.properties.shapeName] ?? f.properties.shapeName;
  const centro = centroDe(f.geometry);
  let dentro = celdas.filter((c) => dentroDeGeometria(c.lon, c.lat, f.geometry));
  if (dentro.length === 0) {
    // Departamento pequeño (o islas): el cuadro más cercano a su centro
    const cercana = celdas.reduce((a, c) =>
      (c.lon - centro[0]) ** 2 + (c.lat - centro[1]) ** 2 < (a.lon - centro[0]) ** 2 + (a.lat - centro[1]) ** 2 ? c : a,
    );
    dentro = [cercana];
  }
  const lluvias = Array.from({ length: 12 }, (_, m) =>
    Math.round(dentro.reduce((s, c) => s + c.resumen.mensual[m].lluvia, 0) / dentro.length),
  );
  const elevacion = Math.round(dentro.reduce((s, c) => s + c.elevacion, 0) / dentro.length);

  salida.features.push({
    type: "Feature",
    properties: {
      nombre,
      tipo: clasificarZona(lluvias),
      relieve: relieveDe(elevacion),
      elevacion,
      lluviaAnual: lluvias.reduce((a, b) => a + b, 0),
      centro,
    },
    geometry: { type: f.geometry.type, coordinates: redondear(f.geometry.coordinates) as number[][][] },
  });
  console.log(`${nombre.padEnd(20)} ${dentro.length} cuadros · ${clasificarZona(lluvias)} · ${elevacion} m · ${poligonosDe(f.geometry).length} polígonos`);
}

const destino = path.join(raiz, "public", "fallback", "departamentos.json");
fs.writeFileSync(destino, JSON.stringify(salida));
console.log(`Listo → ${path.relative(raiz, destino)} (${Math.round(fs.statSync(destino).size / 1024)} KB)`);
