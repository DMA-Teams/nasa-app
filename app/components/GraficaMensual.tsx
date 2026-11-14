// Lluvia contra evaporación por mes (promedio 2015–2025). Barras simples con CSS.
import { MESES } from "@/lib/motor";
import type { MesClima } from "@/lib/tipos";

export function GraficaMensual({ meses, resaltados }: { meses: MesClima[]; resaltados: number[] }) {
  const max = Math.max(...meses.map((m) => Math.max(m.lluvia, m.evaporacion)));
  const tope = Math.ceil(max / 100) * 100;

  return (
    <figure className="flex flex-col gap-2.5 rounded-2xl bg-background p-4">
      <figcaption className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold">Promedio por mes, en mm</span>
        <span className="flex gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-sm bg-chart-3" />Lluvia</span>
          <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-sm bg-highlight" />Se evapora</span>
        </span>
      </figcaption>
      <div className="relative">
        <span className="absolute -top-1 right-0 font-mono text-[10px] text-muted-foreground">{tope}</span>
        <div className="grid h-32 grid-cols-12 items-end gap-1 border-b border-border">
          {meses.map((m) => (
            <div
              key={m.mes}
              className={`flex h-full items-end justify-center gap-px rounded-t ${resaltados.includes(m.mes) ? "bg-zona-seca/35" : ""}`}
              title={`${MESES[m.mes - 1]}: ${m.lluvia} mm de lluvia, ${m.evaporacion} mm se evaporan`}
            >
              <span className="w-[38%] rounded-t-sm bg-chart-3" style={{ height: `${(m.lluvia / tope) * 100}%` }} />
              <span className="w-[38%] rounded-t-sm bg-highlight" style={{ height: `${(m.evaporacion / tope) * 100}%` }} />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-12 gap-1 text-center text-[11px] text-muted-foreground">
        {meses.map((m) => (
          <span key={m.mes} className={resaltados.includes(m.mes) ? "font-bold text-foreground" : ""}>
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
