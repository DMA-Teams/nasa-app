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

// 4 decimales (~10 m) bastan para dibujar y reducen el archivo a la mitad
const redondear = (v: unknown): unknown => (Array.isArray(v) ? v.map(redondear) : Math.round((v as number) * 1e4) / 1e4);

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
