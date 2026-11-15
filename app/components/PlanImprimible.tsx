// Documento del plan para "Guardar como PDF": solo existe al imprimir (la app se oculta).
// Diseñado para hoja carta o A4: encabezado de marca, resumen, un recuadro por periodo, aviso y fuente.
import { NOMBRE_ZONA } from "@/lib/colores";
import { agruparPlan } from "@/lib/plan";
import { MESES, NOMBRE_CULTIVO, nombreMesesDificiles } from "@/lib/textos";
import type { Division, PeriodoPlan, PlanAnual } from "@/lib/tipos";
import { DibujoCultivo } from "./dibujos";
import { IconoAlerta } from "./ui";

interface Props {
  plan: PlanAnual;
  division: Division;
  lugar: string;
}

export function PlanImprimible({ plan, division, lugar }: Props) {
  const periodos = agruparPlan(plan, division);
  const hoy = new Date().toLocaleDateString("es-HN", { day: "numeric", month: "long", year: "numeric" });
  const lluviaAnual = plan.meses.reduce((s, m) => s + m.lluvia, 0);
  const maxLluvia = Math.max(...plan.meses.map((m) => m.lluvia));

  return (
    <article className="hidden text-[10pt] leading-snug text-foreground print:block">
      <header className="flex items-end justify-between gap-6 border-b-2 border-primary pb-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- para imprimir basta un <img> */}
        <img src="/marca/surco-horizontal-color.svg" alt="Surco" width={115} height={36} />
        <div className="text-right">
          <h1 className="text-[18pt] leading-tight font-semibold tracking-[-0.015em]">Plan de siembra del año</h1>
          <p className="text-[10pt] text-muted-foreground">
            {lugar} · {hoy}
          </p>
        </div>
      </header>

      <section className="mt-4 grid grid-cols-[1fr_auto] items-start gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-[8.5pt] font-semibold tracking-wide text-primary">
            {plan.modo === "recomendado" ? "Recomendado por Surco" : "Con tus cultivos"} · {plan.cultivosElegidos.map((c) => NOMBRE_CULTIVO[c]).join(", ")}
          </p>
          <p className="rounded-xl bg-decor-verde-suave px-3.5 py-2.5">{plan.resumen}</p>
        </div>
        <dl className="grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5 text-[10pt]">
          <dt className="text-muted-foreground">Clima</dt>
          <dd className="font-semibold">{NOMBRE_ZONA[plan.tipoZona]}</dd>
          <dt className="text-muted-foreground">Lluvia al año</dt>
          <dd className="font-semibold tabular-nums">{lluviaAnual.toLocaleString("es-HN")} mm</dd>
        </dl>
      </section>

      {/* Lluvia de cada mes: los meses difíciles van marcados */}
      <section className="mt-4 break-inside-avoid">
        <div className="mb-1.5 flex items-baseline justify-between gap-4">
          <h2 className="text-[10pt] font-semibold">Lluvia de cada mes (mm)</h2>
          {plan.meses.some((m) => m.dificil) && (
            <span className="flex items-center gap-1.5 text-[8.5pt] text-muted-foreground">
              <i className="inline-block size-2.5 rounded-sm bg-highlight" />
              {nombreMesesDificiles(plan.tipoZona)}
            </span>
          )}
        </div>
        <div className="grid grid-cols-12 gap-1">
          {plan.meses.map((m) => (
            <div key={m.mes} className="flex flex-col items-center gap-0.5">
              <div className="flex h-12 w-full items-end rounded-sm bg-background">
                <div
                  className={`w-full rounded-sm ${m.dificil ? "bg-highlight" : "bg-chart-3"}`}
                  style={{ height: `${Math.max(4, (m.lluvia / maxLluvia) * 100)}%` }}
                />
              </div>
              <span className={`text-[8.5pt] ${m.dificil ? "font-semibold" : "text-muted-foreground"}`}>{MESES[m.mes - 1]}</span>
              <span className="text-[8.5pt] tabular-nums">{m.lluvia}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-[12pt] font-semibold">{division === "trimestral" ? "Qué hacer cada trimestre" : "Qué hacer cada semestre"}</h2>
        <div className="grid grid-cols-2 gap-3">
          {periodos.map((p) => (
            <Periodo key={p.id} periodo={p} />
          ))}
        </div>
      </section>

      <footer className="mt-5 flex flex-col gap-1.5 border-t border-border pt-3 text-[8.5pt]">
        <p>
          <strong className="font-semibold">Esto es una guía.</strong> Revísala con tu técnico agrícola antes de sembrar, porque conoce tu suelo y tu terreno.
        </p>
        <p className="text-muted-foreground">
          Lluvia: {plan.fuente.dataset}, promedio {plan.fuente.periodo}, consultado el {plan.fuente.consultado.slice(0, 10)}. Meses de siembra: reglas de
          ejemplo (simulado). Hecho con Surco, con datos de NASA.
        </p>
      </footer>
    </article>
  );
}

function Periodo({ periodo: p }: { periodo: PeriodoPlan }) {
  const vacio = p.cultivos.length === 0;
  return (
    <div className={`flex break-inside-avoid flex-col gap-1.5 rounded-xl border-2 p-3 ${vacio ? "border-border bg-background" : "border-decor-verde-suave"}`}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[12pt] font-semibold tracking-[-0.015em]">{p.nombre}</span>
        <span className="text-[8.5pt] text-muted-foreground tabular-nums">{p.lluviaEsperada.toLocaleString("es-HN")} mm de lluvia</span>
      </div>
      <div className="flex items-center gap-2">
        {p.cultivos.map((c) => (
          <DibujoCultivo key={c} id={c} className="size-7" />
        ))}
        <span className="font-semibold">{p.consejo}</span>
      </div>
      <p className="text-[10pt]">{p.porque}</p>
      {p.alerta && (
        <p className="flex items-center gap-1 self-start rounded-full bg-decor-maiz-suave px-2.5 py-0.5 text-[8.5pt] font-semibold">
          <IconoAlerta className="size-3 text-highlight" />
          {p.alerta}
        </p>
      )}
      <p className="text-[8.5pt] text-muted-foreground">
        Tierra cubierta {p.mesesCubierta} de {p.meses.length} meses
      </p>
    </div>
  );
}
