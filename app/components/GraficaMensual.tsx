// Lluvia contra evaporación por mes (promedio 2015–2025). Barras simples con CSS.
"use client";

import type { CSSProperties } from "react";
import { MESES, nombreMesesDificiles } from "@/lib/textos";
import type { MesClima, TipoZona } from "@/lib/tipos";
import { useEnVista } from "@/lib/useEnVista";

interface Props {
  meses: MesClima[];
  /** Meses difíciles (1–12): su columna va sombreada y la leyenda dice por qué. */
  resaltados: number[];
  tipo: TipoZona;
}

export function GraficaMensual({ meses, resaltados, tipo }: Props) {
  const max = Math.max(...meses.map((m) => Math.max(m.lluvia, m.evaporacion)));
  const tope = Math.ceil(max / 100) * 100;
  const [ref, visto] = useEnVista<HTMLElement>();

  return (
    <figure ref={ref} data-visto={visto} className="flex flex-col gap-3 rounded-xl bg-background p-4">
      <figcaption className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-cuerpo font-semibold">Agua de cada mes</span>
        <span className="flex flex-wrap gap-x-3 gap-y-1 text-apoyo">
          <span className="inline-flex items-center gap-1.5"><i className="size-3 rounded-full bg-chart-3" />Llueve</span>
          <span className="inline-flex items-center gap-1.5"><i className="size-3 rounded-full bg-decor-sol" />Se seca</span>
          {resaltados.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <i className="h-3.5 w-3 rounded-t-sm bg-zona-seca/40" />
              {nombreMesesDificiles(tipo)}
            </span>
          )}
        </span>
      </figcaption>
      <div className="relative">
        <span className="absolute -top-1 right-0 text-nota tabular-nums text-muted-foreground">{tope} mm</span>
        <div className="grid h-36 grid-cols-12 items-end gap-1 border-b-2 border-border">
          {meses.map((m, i) => (
            <div
              key={m.mes}
              style={{ "--i": i } as CSSProperties}
              className={`flex h-full items-end justify-center gap-px rounded-t-lg ${resaltados.includes(m.mes) ? "bg-zona-seca/40" : ""}`}
              title={`${MESES[m.mes - 1]}: ${m.lluvia} mm de lluvia, ${m.evaporacion} mm se evaporan`}
            >
              <span className="llenar-y w-[42%] rounded-t-full bg-chart-3" style={{ height: `${(m.lluvia / tope) * 100}%` }} />
              <span className="llenar-y w-[42%] rounded-t-full bg-decor-sol" style={{ height: `${(m.evaporacion / tope) * 100}%` }} />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-12 gap-1 text-center text-nota text-muted-foreground">
        {meses.map((m) => (
          <span key={m.mes} className={resaltados.includes(m.mes) ? "font-semibold text-foreground" : ""}>
            {MESES[m.mes - 1].slice(0, 1)}
          </span>
        ))}
      </div>
      {/* Tabla para lectores de pantalla */}
      <table className="sr-only">
        <caption>Lluvia y evaporación promedio por mes, 2015–2025</caption>
        <thead><tr><th>Mes</th><th>Lluvia (mm)</th><th>Evaporación (mm)</th></tr></thead>
        <tbody>
          {meses.map((m) => (
            <tr key={m.mes}><td>{MESES[m.mes - 1]}</td><td>{m.lluvia}</td><td>{m.evaporacion}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
