// Genera public/fallback/celdas.json: el clima de NASA POWER de cada cuadro de Honduras.
// Uso (desde app/): npm run datos
// Las respuestas crudas se guardan en scripts/.cache/ para no volver a bajarlas.
//
// Nota: NASA POWER trabaja en cuadros de 0.5° × 0.625°, así que algunos cuadros vecinos
// de nuestra cuadrícula de 0.5° reciben el mismo dato. Es esperado.
import fs from "node:fs";
import path from "node:path";
import { clasificarZona, relieveDe, resumirPower, urlPower } from "../lib/clima.ts";
import { centrosDeCuadricula, lugarMasCercano } from "../lib/mapa.ts";
import type { Celda } from "../lib/tipos.ts";

const raiz = path.resolve(import.meta.dirname, "..");
const cache = path.join(raiz, "scripts", ".cache");
const salida = path.join(raiz, "public", "fallback", "celdas.json");
fs.mkdirSync(cache, { recursive: true });
fs.mkdirSync(path.dirname(salida), { recursive: true });

async function bajar(lat: number, lon: number) {
  const archivo = path.join(cache, `${lat}_${lon}.json`);
  if (fs.existsSync(archivo)) return JSON.parse(fs.readFileSync(archivo, "utf8"));
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const res = await fetch(urlPower(lat, lon));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      fs.writeFileSync(archivo, JSON.stringify(json));
      return json;
    } catch (err) {
      console.error(`  ${lat},${lon} intento ${intento}: ${(err as Error).message}`);
      await new Promise((r) => setTimeout(r, 2000 * intento));
    }
  }
  throw new Error(`No se pudo bajar ${lat},${lon}`);
}

const centros = centrosDeCuadricula();
const celdas: Celda[] = [];
const cola = [...centros];

// 4 descargas a la vez para no saturar la API
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (cola.length) {
      const { lat, lon } = cola.shift()!;
      const resumen = resumirPower(await bajar(lat, lon));
      const lluvias = resumen.mensual.map((m) => m.lluvia);
      celdas.push({
        id: `${lat}_${lon}`,
        lat,
        lon,
        lugar: lugarMasCercano(lat, lon),
        tipo: clasificarZona(lluvias),
        relieve: relieveDe(resumen.elevacion),
        elevacion: resumen.elevacion,
        lluviaAnual: lluvias.reduce((a, b) => a + b, 0),
        resumen,
      });
      console.log(`${celdas.length}/${centros.length}  ${lat}, ${lon}`);
    }
  }),
);

celdas.sort((a, b) => b.lat - a.lat || a.lon - b.lon);
fs.writeFileSync(salida, JSON.stringify(celdas));
const conteo = Object.groupBy(celdas, (c) => c.tipo);
console.log(
  `Listo: ${celdas.length} cuadros → ${path.relative(raiz, salida)}`,
  Object.fromEntries(Object.entries(conteo).map(([k, v]) => [k, v?.length])),
);
