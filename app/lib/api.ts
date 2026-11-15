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

// Con wifi malo (el del evento, o datos móviles en el campo) un fetch puede quedarse colgado sin fallar.
// Pasado este tiempo se usa el respaldo. Es menor que la espera de /api/clima a NASA POWER (10 s) más un margen.
const ESPERA_MAXIMA_MS = 12000;

/** La señal del usuario (cancelar) unida a un tiempo límite. */
function conLimite(signal?: AbortSignal): AbortSignal | undefined {
  // AbortSignal.any falta en navegadores viejos: ahí solo queda la cancelación
  if (typeof AbortSignal.any !== "function" || typeof AbortSignal.timeout !== "function") return signal;
  const limite = AbortSignal.timeout(ESPERA_MAXIMA_MS);
  return signal ? AbortSignal.any([signal, limite]) : limite;
}

async function pedirJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, signal: conLimite(init?.signal ?? undefined) });
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

/** Una respuesta 200 con forma rara (proxy del wifi, versión vieja del servidor) no debe romper las pantallas. */
function esClima(v: unknown): v is ClimaZona {
  const c = v as Partial<ClimaZona> | null;
  return (
    !!c &&
    (c.tipo === "seca" || c.tipo === "equilibrada" || c.tipo === "lluviosa") &&
    Array.isArray(c.meses) &&
    c.meses.length === 12 &&
    c.meses.every((m) => Number.isFinite(m?.lluvia) && Number.isFinite(m?.evaporacion)) &&
    Array.isArray(c.mesesDificiles)
  );
}

export async function obtenerClima(lat: number, lon: number, signal?: AbortSignal): Promise<ClimaZona> {
  try {
    const clima = await pedirJson<unknown>(`/api/clima?lat=${lat.toFixed(3)}&lon=${lon.toFixed(3)}`, { signal });
    if (!esClima(clima)) throw new Error("/api/clima devolvió datos incompletos");
    return clima;
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
