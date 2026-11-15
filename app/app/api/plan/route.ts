import type { NextRequest } from "next/server";
import { ErrorBackend, pedirBackend } from "@/lib/backend";
import { apiDeCultivo, CULTIVOS } from "@/lib/cultivos";
import { planDesdeApi, PlanApiInvalido, type PlanApi } from "@/lib/planApi";
import type { CultivoId, PedidoPlan } from "@/lib/tipos";

const IDS = new Set<string>(CULTIVOS.map((c) => c.id));
const MAXIMO_CULTIVOS = 4;

function leerPedido(cuerpo: unknown): PedidoPlan | null {
  const p = cuerpo as Partial<PedidoPlan> | null;
  if (!p || !Number.isFinite(p.lat) || !Number.isFinite(p.lon)) return null;
  if (p.modo !== "recomendado" && p.modo !== "mis-cultivos") return null;
  const cultivos = Array.isArray(p.cultivos) ? p.cultivos : [];
  if (!cultivos.every((c) => typeof c === "string" && IDS.has(c))) return null;
  if (p.modo === "mis-cultivos" && (cultivos.length === 0 || cultivos.length > MAXIMO_CULTIVOS)) return null;
  return { lat: p.lat as number, lon: p.lon as number, modo: p.modo, cultivos: cultivos as CultivoId[] };
}

function rutaDelPlan(pedido: PedidoPlan): string {
  const q = new URLSearchParams({ lat: pedido.lat.toFixed(4), lon: pedido.lon.toFixed(4) });
  if (pedido.modo === "mis-cultivos") q.set("currentRotation", [...new Set(pedido.cultivos)].map(apiDeCultivo).join(","));
  return `/v1/plan?${q}`;
}

export async function POST(request: NextRequest) {
  const pedido = leerPedido(await request.json().catch(() => null));
  if (!pedido) return Response.json({ error: "Pedido inválido: lat, lon, modo y cultivos (1 a 4 en mis-cultivos)" }, { status: 400 });

  try {
    const ip = request.headers.get("x-forwarded-for");
    const plan = await pedirBackend<PlanApi>(rutaDelPlan(pedido), ip);
    return Response.json(planDesdeApi(plan, pedido));
  } catch (err) {
    console.error("[api/plan] backend:", (err as Error).message);
    if (err instanceof ErrorBackend) return Response.json({ error: err.tipo || "error del backend" }, { status: err.status });
    if (err instanceof PlanApiInvalido) return Response.json({ error: err.message }, { status: 502 });
    return Response.json({ error: "El servidor de datos no respondió" }, { status: 502 });
  }
}
