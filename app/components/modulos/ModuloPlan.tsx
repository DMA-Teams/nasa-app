// Plan del año, por trimestres o por semestres, y guardarlo como PDF.
// Cambiar la división solo reagrupa los 12 meses: no se vuelve a pedir nada.
// El PDF usa la impresión del navegador ("Guardar como PDF") con PlanImprimible: sin librerías, también en el celular.
import { agruparPlan } from "@/lib/plan";
import type { CSSProperties } from "react";
import type { Division, PeriodoPlan, PlanAnual } from "@/lib/tipos";
import { DibujoCultivo } from "../dibujos";
import { BotonPrimario, IconoAlerta, IconoDescargar, IconoGota, IconoInfo } from "../ui";

interface Props {
  plan: PlanAnual;
  division: Division;
  onDivision: (d: Division) => void;
  lugar: string; // "Gracias, Lempira": nombre del archivo PDF
}

const DIVISIONES: { id: Division; texto: string }[] = [
  { id: "trimestral", texto: "Por trimestres" },
  { id: "semestral", texto: "Por semestres" },
];

export function ModuloPlan({ plan, division, onDivision, lugar }: Props) {
  const periodos = agruparPlan(plan, division);

  function guardarPdf() {
    // El título de la página es el nombre que el navegador propone para el archivo
    const titulo = document.title;
    document.title = `Plan de siembra - ${lugar}`;
    window.addEventListener("afterprint", () => (document.title = titulo), { once: true });
    window.print();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="font-display text-titulo font-semibold">Tu plan del año</h1>
          <span className="text-apoyo font-semibold text-muted-foreground">(simulado)</span>
        </div>
        <p className="text-cuerpo">{plan.resumen}</p>
      </div>

      <div className="relative grid grid-cols-2 gap-1 rounded-full bg-background p-1" role="group" aria-label="Ver el plan">
        {/* La pastilla verde se desliza hacia la opción elegida */}
        <span
          aria-hidden="true"
          className={`absolute inset-y-1 left-1 w-[calc(50%-0.375rem)] rounded-full bg-primary transition-transform duration-200 ease-out-strong ${
            division === DIVISIONES[0].id ? "" : "translate-x-[calc(100%+0.25rem)]"
          }`}
        />
        {DIVISIONES.map((d) => (
          <button
            key={d.id}
            type="button"
            aria-pressed={division === d.id}
            onClick={() => onDivision(d.id)}
            className={`relative min-h-11 rounded-full text-cuerpo font-semibold transition-[color,background-color] duration-200 ${
              division === d.id ? "text-primary-foreground" : "text-foreground hover:bg-card/70"
            }`}
          >
            {d.texto}
          </button>
        ))}
      </div>

      <ol className="flex flex-col gap-3">
        {periodos.map((p, i) => (
          <Periodo key={p.id} periodo={p} orden={i} />
        ))}
      </ol>

      <BotonPrimario onClick={guardarPdf}>
        <IconoDescargar className="size-6" />
        Guardar como PDF
      </BotonPrimario>

      <div className="flex items-start gap-3 rounded-xl bg-background px-4 py-3.5">
        <IconoInfo className="mt-0.5 size-6 shrink-0 text-primary" />
        <p className="text-cuerpo">
          Esto es una guía. <strong className="font-semibold">Revísala con tu técnico agrícola</strong> antes de sembrar, porque conoce tu suelo y tu terreno.
        </p>
      </div>

      <p className="text-nota text-muted-foreground">
        Lluvia: {plan.fuente.dataset}, promedio {plan.fuente.periodo}, consultado el {plan.fuente.consultado.slice(0, 10)}. Meses de siembra:
        reglas de ejemplo (simulado).
      </p>
    </div>
  );
}

function Periodo({ periodo: p, orden }: { periodo: PeriodoPlan; orden: number }) {
  const vacio = p.cultivos.length === 0;
  return (
    <li
      className={`entrar-lista flex flex-col gap-2.5 rounded-3xl p-4 ${vacio ? "bg-background" : "border-2 border-decor-verde-suave bg-card"}`}
      style={{ "--i": orden } as CSSProperties}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-display text-subtitulo font-semibold">{p.nombre}</span>
        <span className="inline-flex shrink-0 items-center gap-1 text-apoyo font-semibold tabular-nums">
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
        <span className="text-cuerpo leading-snug font-semibold">{p.consejo}</span>
      </div>

      <p className="text-apoyo leading-snug text-muted-foreground">
        <span className="font-semibold text-foreground">¿Por qué? </span>
        {p.porque}
      </p>

      {p.alerta && (
        <span className="flex items-center gap-2 self-start rounded-full bg-decor-maiz-suave px-3 py-1 text-apoyo font-semibold">
          <IconoAlerta className="size-4.5 text-highlight" />
          {p.alerta}
        </span>
      )}

      <span className="text-apoyo text-muted-foreground">
        Tierra cubierta {p.mesesCubierta} de {p.meses.length} meses
      </span>
    </li>
  );
}
