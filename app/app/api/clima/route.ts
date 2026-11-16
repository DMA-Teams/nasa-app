// GET /api/clima?lat=14.25&lon=-88.75
// Clima de una zona con NASA POWER en vivo. Si la API no responde (o con ?respaldo=1),
// usa el resumen guardado del cuadro en public/fallback/celdas.json.
import { cacheLife } from "next/cache";
import type { NextRequest } from "next/server";
import celdasJson from "@/public/fallback/celdas.json";
import { construirClima, resumirPower, urlPower } from "@/lib/clima";
import { celdaDePunto, enRectanguloHonduras } from "@/lib/mapa";
import type { Celda, ResumenPower } from "@/lib/tipos";

const celdas = celdasJson as Celda[];
const FECHA_RESPALDO = "2026-11-14"; // cuándo se generó celdas.json (npm run datos)

// Cache de días: los promedios 2015–2025 no cambian y el demo no depende del wifi.
// Se guarda el resumen (pocos KB), no la respuesta cruda de NASA POWER.
async function resumenDePower(lat: number, lon: number): Promise<ResumenPower> {
  "use cache";
  cacheLife("days");
  // 10 s: el navegador espera 12 s antes de usar su propio respaldo (lib/api.ts)
  const res = await fetch(urlPower(lat, lon), { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`NASA POWER respondió ${res.status}`);
  return resumirPower(await res.json());
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  // Redondeo a 3 decimales (~100 m): evita que cada decimal distinto cree otra entrada
  // de cache y otra llamada a NASA POWER (su cuadrícula es de 0.5°, no se pierde nada).
  const lat = Math.round(Number(params.get("lat")) * 1000) / 1000;
  const lon = Math.round(Number(params.get("lon")) * 1000) / 1000;
  if (!enRectanguloHonduras(lat, lon)) {
    return Response.json({ error: "Envía lat y lon de un punto en Honduras" }, { status: 400 });
  }

  if (params.get("respaldo") !== "1") {
    try {
      const resumen = await resumenDePower(lat, lon);
      return Response.json(construirClima(lat, lon, resumen, "en-vivo", new Date().toISOString()));
    } catch (err) {
      console.error("[api/clima] usando respaldo:", (err as Error).message);
    }
  }

  const celda = celdaDePunto(celdas, lat, lon);
  return Response.json(construirClima(celda.lat, celda.lon, celda.resumen, "respaldo", FECHA_RESPALDO));
}
