// MapLibre 6 dibuja el mapa en un worker que debe servirse como archivo propio.
// Se copia a public/maplibre/ antes de `dev` y `build` (ver package.json).
import fs from "node:fs";
import path from "node:path";

const raiz = path.resolve(import.meta.dirname, "..");
const origen = path.join(raiz, "node_modules", "maplibre-gl", "dist", "maplibre-gl-worker.mjs");
const destino = path.join(raiz, "public", "maplibre", "maplibre-gl-worker.mjs");
fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.copyFileSync(origen, destino);
