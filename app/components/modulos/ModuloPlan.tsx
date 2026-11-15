// Plan del año, por trimestres o por semestres, y compartir por WhatsApp.
// Cambiar la división solo reagrupa los 12 meses: no se vuelve a pedir nada.
import { agruparPlan, textoWhatsApp } from "@/lib/plan";
import type { Division, PeriodoPlan, PlanAnual } from "@/lib/tipos";
import { DibujoCultivo } from "../dibujos";
import { IconoAlerta, IconoGota, IconoInfo, IconoMensaje } from "../ui";

interface Props {
  plan: PlanAnual;
  division: Division;
  onDivision: (d: Division) => void;
  lugar: string;
}

const DIVISIONES: { id: Division; texto: string }[] = [
  { id: "trimestral", texto: "Por trimestres" },
  { id: "semestral", texto: "Por semestres" },
];

export function ModuloPlan({ plan, division, onDivision, lugar }: Props) {
  const periodos = agruparPlan(plan, division);
  const enlace = `https://wa.me/?text=${encodeURIComponent(textoWhatsApp(lugar, plan, periodos))}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-baseline gap-2">
          <h2 className="font-display text-[30px] leading-[1.05] font-semibold tracking-[-0.015em]">Tu plan del año</h2>
          <span className="text-sm font-semibold text-muted-foreground">(simulado)</span>
        </div>
        <p className="text-base leading-relaxed">{plan.resumen}</p>
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-full bg-background p-1" role="group" aria-label="Ver el plan">
        {DIVISIONES.map((d) => (
          <button
            key={d.id}
            type="button"
            aria-pressed={division === d.id}
            onClick={() => onDivision(d.id)}
            className={`h-11 rounded-full text-base font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-ring ${
              division === d.id ? "bg-primary text-primary-foreground" : "text-foreground"
            }`}
          >
            {d.texto}
          </button>
        ))}
      </div>

      <ol className="flex flex-col gap-3">
        {periodos.map((p) => (
          <Periodo key={p.id} periodo={p} />
        ))}
      </ol>

      <a
        href={enlace}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-15 items-center justify-center gap-2.5 rounded-2xl bg-primary px-5 font-display text-xl font-semibold text-primary-foreground shadow-[0_4px_0_var(--primary-sombra)] transition-[transform,box-shadow] duration-150 ease-out-strong active:translate-y-1 active:shadow-[0_0_0_var(--primary-sombra)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <IconoMensaje className="size-6" />
        Enviar por WhatsApp
      </a>

      <div className="flex items-start gap-3 rounded-2xl bg-background px-4 py-3.5">
        <IconoInfo className="mt-0.5 size-6 shrink-0 text-primary" />
        <p className="text-base leading-relaxed">
          Esto es una guía. <strong className="font-semibold">Revísala con tu técnico agrícola</strong> antes de sembrar, porque conoce tu suelo y tu terreno.
        </p>
      </div>

      <p className="text-[13px] text-muted-foreground">
        Lluvia: {plan.fuente.dataset}, promedio {plan.fuente.periodo}, consultado el {plan.fuente.consultado.slice(0, 10)}. Meses de siembra:
        reglas de ejemplo (simulado).
      </p>
    </div>
  );
}

function Periodo({ periodo: p }: { periodo: PeriodoPlan }) {
  const vacio = p.cultivos.length === 0;
  return (
    <li className={`flex flex-col gap-2.5 rounded-3xl p-4 ${vacio ? "bg-background" : "border-2 border-decor-verde-suave bg-card"}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-display text-2xl leading-none font-semibold tracking-[-0.015em]">{p.nombre}</span>
        <span className="inline-flex shrink-0 items-center gap-1 font-mono text-sm tabular-nums">
          <IconoGota className="size-4 text-chart-3" />
          {p.lluviaEsperada.toLocaleString("es-HN")} mm
        </span>
      </div>

      <div className="flex items-center gap-3">
        {!vacio && (
          <span className="flex shrink-0 -space-x-2" aria-hidden="true">
            {p.cultivos.map((c) => (
              <span key={c} className="flex size-12 items-center justify-center rounded-full bg-background ring-2 ring-card">
                <DibujoCultivo id={c} className="size-9" />
              </span>
            ))}
          </span>
        )}
        <span className="text-lg leading-snug font-semibold">{p.consejo}</span>
      </div>

      {p.alerta && (
        <span className="flex items-center gap-2 self-start rounded-full bg-decor-maiz-suave px-3 py-1 text-[15px] font-semibold">
          <IconoAlerta className="size-4.5 text-highlight" />
          {p.alerta}
        </span>
      )}

      <span className="text-[15px] text-muted-foreground">
        Tierra cubierta {p.mesesCubierta} de {p.meses.length} meses
      </span>
    </li>
  );
}
