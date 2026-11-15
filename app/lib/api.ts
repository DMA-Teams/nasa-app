// Única puerta a los datos. Las pantallas solo importan de aquí.
// Hoy: respaldo local. Cuando el backend tenga su endpoint, poner su bandera en true
// (ver "Contrato con el backend" en README.md). Si la API falla, se usa el respaldo.
import celdasJson from "@/public/fallback/celdas.json";
import municipiosJson from "@/public/fallback/municipios.json";
import { construirClima } from "./clima";
import { celdaDePunto } from "./mapa";
import { armarPlanLocal } from "./motor";
import { municipiosDe } from "./municipios";
import type { Celda, ClimaZona, Municipio, PedidoPlan, PlanAnual } from "./tipos";

export const USAR_API = { municipios: false, plan: false };

const celdas = celdasJson as Celda[];
const municipios = municipiosJson as Municipio[];
const FECHA_RESPALDO = "2026-11-14"; // cuándo se generó celdas.json

const abortado = (signal?: AbortSignal) => signal?.aborted === true;

async function pedirJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`${url} respondió ${res.status}`);
  return res.json() as Promise<T>;
}

export async function obtenerMunicipios(departamento: string): Promise<Municipio[]> {
  if (USAR_API.municipios) {
    try {
      return await pedirJson<Municipio[]>(`/api/municipios?departamento=${encodeURIComponent(departamento)}`);
    } catch (err) {
      console.error("[api] municipios: usando respaldo:", (err as Error).message);
    }
  }
  return municipiosDe(municipios, departamento);
}

export async function obtenerClima(lat: number, lon: number, signal?: AbortSignal): Promise<ClimaZona> {
  try {
    return await pedirJson<ClimaZona>(`/api/clima?lat=${lat.toFixed(3)}&lon=${lon.toFixed(3)}`, { signal });
  } catch (err) {
    if (abortado(signal)) throw err;
    // Sin conexión con nuestra API: el cuadro de NASA POWER más cercano, guardado en el respaldo
    const celda = celdaDePunto(celdas, lat, lon);
    return construirClima(celda.lat, celda.lon, celda.resumen, "respaldo", FECHA_RESPALDO);
  }
}

export async function armarPlan(pedido: PedidoPlan, signal?: AbortSignal): Promise<PlanAnual> {
  if (USAR_API.plan) {
    try {
      return await pedirJson<PlanAnual>("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido),
        signal,
      });
    } catch (err) {
      if (abortado(signal)) throw err;
      console.error("[api] plan: usando el motor local:", (err as Error).message);
    }
  }
  return armarPlanLocal(pedido, await obtenerClima(pedido.lat, pedido.lon, signal));
}
