// Calendario de siembra: qué cultivo va en el terreno cada mes, cuándo se siembra y cuándo se cosecha.
// Una fila por cultivo y los 12 meses de lado a lado, con los meses difíciles sombreados (igual que "Agua de cada mes").
// Solo reordena los meses del plan (lib/plan.ts → filasCalendario): no pide nada al servidor.
import { NOMBRE_ZONA } from "@/lib/colores";
import { filasCalendario } from "@/lib/plan";
import { listaMeses, MESES, NOMBRE_CULTIVO, nombreMesesDificiles } from "@/lib/textos";
import type { EstadoCalendario, FilaCalendario, PlanAnual } from "@/lib/tipos";
import { DibujoCultivo } from "./dibujos";

/** Marca de cosecha: un triángulo con borde claro para que se distinga sobre la barra verde. */
function Cosecha({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" className={`text-highlight ${className}`} aria-hidden="true">
      <path d="M7 1.5L12.5 11.5H1.5Z" fill="currentColor" stroke="var(--card)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function Siembra({ className = "size-3.5" }: { className?: string }) {
  return <span className={`block rounded-full bg-primary ring-2 ring-card ${className}`} aria-hidden="true" />;
}

/** Un mes de una fila. La barra empieza en el centro del mes de siembra y termina en el centro del de cosecha. */
function Celda({ estado }: { estado: EstadoCalendario }) {
  if (!estado) return <span />;
  const barra =
    estado === "siembra" ? "left-1/2 right-0 rounded-l-full" : estado === "cosecha" ? "left-0 right-1/2 rounded-r-full" : "inset-x-0";
  return (
    <span className="relative flex h-9 items-center justify-center print:h-6">
      <span className={`absolute top-1/2 h-2.5 -translate-y-1/2 bg-primary print:h-2 ${barra}`} />
      {estado === "siembra" && <Siembra className="relative size-3.5 print:size-2.5" />}
      {estado === "cosecha" && <Cosecha className="relative size-4 print:size-3" />}
    </span>
  );
}

/** "Maíz: se siembra en mayo y diciembre; se cosecha en agosto y marzo." Para lectores de pantalla. */
function describir(fila: FilaCalendario): { siembra: string; cosecha: string } {
  const meses = (estado: EstadoCalendario) => fila.meses.flatMap((e, i) => (e === estado ? [i + 1] : []));
  return { siembra: listaMeses(meses("siembra")) || "—", cosecha: listaMeses(meses("cosecha")) || "—" };
}

export function CalendarioCultivos({ plan }: { plan: PlanAnual }) {
  const filas = filasCalendario(plan);
  const dificiles = plan.meses.filter((m) => m.dificil).map((m) => m.mes);
  if (filas.length === 0) return null;

  return (
    <figure className="flex flex-col gap-3 rounded-xl bg-background p-4 print:gap-1.5 print:bg-transparent print:p-0">
      <figcaption className="flex flex-col gap-2 print:flex-row print:items-baseline print:justify-between">
        <span className="text-cuerpo font-semibold print:text-[10pt]">Calendario de siembra</span>
        <span className="flex flex-wrap gap-x-3 gap-y-1 text-apoyo print:text-[8.5pt] print:text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Siembra className="size-3 print:size-2.5" />
            Siembra
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="h-2 w-4 rounded-full bg-primary" />
            En el terreno
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Cosecha className="size-4 print:size-3" />
            {filas.some((f) => f.id === "frijolAbono") ? "Cosecha o corte" : "Cosecha"}
          </span>
          {dificiles.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <i className="h-3.5 w-3 rounded-t-sm bg-zona-seca/40" />
              {nombreMesesDificiles(plan.tipoZona)}
            </span>
          )}
        </span>
      </figcaption>

      <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-x-2 print:grid-cols-[7rem_minmax(0,1fr)]" aria-hidden="true">
        {/* Nombres de los cultivos */}
        <div className="flex flex-col">
          {filas.map((f) => (
            <span key={f.id} className="flex h-9 items-center gap-1.5 text-apoyo leading-tight font-semibold print:h-6 print:text-[9pt]">
              <DibujoCultivo id={f.id} className="size-6 shrink-0 print:size-4" />
              {NOMBRE_CULTIVO[f.id]}
            </span>
          ))}
        </div>

        {/* Los 12 meses: columnas sombreadas detrás, filas de barras delante */}
        <div className="relative">
          <div className="absolute inset-0 grid grid-cols-12">
            {plan.meses.map((m) => (
              <span key={m.mes} className={m.dificil ? "rounded-t-lg bg-zona-seca/40" : ""} />
            ))}
          </div>
          <div className="relative flex flex-col">
            {filas.map((f) => (
              <div key={f.id} className="grid grid-cols-12">
                {f.meses.map((estado, i) => (
                  <Celda key={i} estado={estado} />
                ))}
              </div>
            ))}
          </div>
        </div>

        <span />
        <div className="grid grid-cols-12 pt-1 text-center text-nota text-muted-foreground print:text-[8pt]">
          {MESES.map((nombre, i) => (
            <span key={nombre} className={dificiles.includes(i + 1) ? "font-semibold text-foreground" : ""}>
              {nombre.slice(0, 1)}
            </span>
          ))}
        </div>
      </div>

      {/* Lo mismo en texto, para lectores de pantalla */}
      <table className="sr-only">
        <caption>
          Calendario de siembra ({NOMBRE_ZONA[plan.tipoZona].toLowerCase()}): cuándo se siembra y se cosecha cada cultivo
        </caption>
        <thead>
          <tr>
            <th>Cultivo</th>
            <th>Se siembra en</th>
            <th>Se cosecha en</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => {
            const { siembra, cosecha } = describir(f);
            return (
              <tr key={f.id}>
                <td>{NOMBRE_CULTIVO[f.id]}</td>
                <td>{siembra}</td>
                <td>{cosecha}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </figure>
  );
}
