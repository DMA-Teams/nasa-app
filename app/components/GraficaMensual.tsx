// Lluvia contra evaporación por mes (promedio 2015–2025). Barras simples con CSS.
import { MESES } from "@/lib/motor";
import type { MesClima } from "@/lib/tipos";

export function GraficaMensual({ meses, resaltados }: { meses: MesClima[]; resaltados: number[] }) {
  const max = Math.max(...meses.map((m) => Math.max(m.lluvia, m.evaporacion)));
  const tope = Math.ceil(max / 100) * 100;

  return (
    <figure className="flex flex-col gap-3 rounded-2xl bg-background p-4">
      <figcaption className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-base font-bold">Agua de cada mes</span>
        <span className="flex gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5"><i className="size-3 rounded-full bg-chart-3" />Llueve</span>
          <span className="inline-flex items-center gap-1.5"><i className="size-3 rounded-full bg-decor-sol" />Se seca</span>
        </span>
      </figcaption>
      <div className="relative">
        <span className="absolute -top-1 right-0 font-mono text-[11px] text-muted-foreground">{tope} mm</span>
        <div className="grid h-36 grid-cols-12 items-end gap-1 border-b-2 border-border">
          {meses.map((m) => (
            <div
              key={m.mes}
              className={`flex h-full items-end justify-center gap-px rounded-t-lg ${resaltados.includes(m.mes) ? "bg-zona-seca/40" : ""}`}
              title={`${MESES[m.mes - 1]}: ${m.lluvia} mm de lluvia, ${m.evaporacion} mm se evaporan`}
            >
              <span className="w-[42%] rounded-t-full bg-chart-3" style={{ height: `${(m.lluvia / tope) * 100}%` }} />
              <span className="w-[42%] rounded-t-full bg-decor-sol" style={{ height: `${(m.evaporacion / tope) * 100}%` }} />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-12 gap-1 text-center text-[13px] text-muted-foreground">
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
