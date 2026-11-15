// Plan del año, por trimestres o por semestres, y guardarlo como PDF.
// Cambiar la división solo reagrupa los 12 meses: no se vuelve a pedir nada.
// El PDF usa la impresión del navegador ("Guardar como PDF") con PlanImprimible: sin librerías, también en el celular.
import { agruparPlan } from "@/lib/plan";
import { useId, useState, type CSSProperties } from "react";
import type { Division, PeriodoPlan, PlanAnual } from "@/lib/tipos";
import { CalendarioCultivos } from "../CalendarioCultivos";
import { ExplicacionPlan } from "./ExplicacionPlan";
import { DibujoCultivo } from "../dibujos";
import { SimulacionParcela } from "../simulacion/SimulacionParcela";
import { BotonPrimario, BotonSecundario, IconoAlerta, IconoDescargar, IconoGota, IconoInfo, IconoMapa, IconoParcela } from "../ui";

interface Props {
  plan: PlanAnual;
  division: Division;
  onDivision: (d: Division) => void;
  /** Periodo que el mapa está pintando ("T1", "S2"…). */
  periodoElegido: string | null;
  /** Tocar un periodo de la lista lo pinta en el mapa (lluvia de esos meses). */
  onPeriodo: (id: string) => void;
  lugar: string; // "Gracias, Lempira": nombre del archivo PDF
}

const DIVISIONES: { id: Division; texto: string }[] = [
  { id: "trimestral", texto: "Por trimestres" },
  { id: "semestral", texto: "Por semestres" },
];

export function ModuloPlan({ plan, division, onDivision, periodoElegido, onPeriodo, lugar }: Props) {
  const periodos = agruparPlan(plan, division);
  const [detallesAbiertos, setDetallesAbiertos] = useState(false);
  const idDetalles = useId();
  const corte = plan.resumen.indexOf(". ");
  const titular = corte === -1 ? plan.resumen : plan.resumen.slice(0, corte + 1);
  const detalleResumen = corte === -1 ? "" : plan.resumen.slice(corte + 2);
  const [simulacionAbierta, setSimulacionAbierta] = useState(false);

  function guardarPdf() {
    // El título de la página es el nombre que el navegador propone para el archivo
    const titulo = document.title;
    document.title = `Plan de siembra - ${lugar}`;
    window.addEventListener("afterprint", () => (document.title = titulo), { once: true });
    window.print();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="font-display text-titulo font-semibold">Tu plan del año</h1>
          {plan.simulado && <span className="text-apoyo text-muted-foreground">(simulado)</span>}
        </div>
        <p className="text-cuerpo font-medium text-pretty">{titular}</p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <button
          type="button"
          aria-expanded={detallesAbiertos}
          aria-controls={idDetalles}
          onClick={() => setDetallesAbiertos(!detallesAbiertos)}
          className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left focus-visible:-outline-offset-2"
        >
          <IconoInfo className="size-5 shrink-0 text-primary" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-cuerpo leading-tight font-semibold">{detallesAbiertos ? "Ocultar detalles" : "¿Por qué este plan?"}</span>
            <span className="text-apoyo text-muted-foreground">Calendario de siembra, riesgos y pronóstico de lluvia</span>
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            aria-hidden="true"
            className={`size-5 shrink-0 text-muted-foreground transition-transform duration-200 ease-out-strong ${detallesAbiertos ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <div
          id={idDetalles}
          className={`grid transition-[grid-template-rows] duration-300 ease-out-strong ${detallesAbiertos ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        >
          <div className="overflow-hidden" inert={!detallesAbiertos}>
            <div className="flex flex-col gap-5 border-t border-border px-4 py-4">
              {detalleResumen && <p className="text-apoyo text-muted-foreground">{detalleResumen}</p>}
              <CalendarioCultivos plan={plan} />
              {plan.explicacion && <ExplicacionPlan razones={plan.explicacion.razones} pronostico={plan.explicacion.pronostico} />}
            </div>
          </div>
        </div>
      </section>

      <div className="relative grid grid-cols-2 gap-1 rounded-full border border-border bg-card p-1" role="group" aria-label="Ver el plan">
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
            className={`relative min-h-11 rounded-full text-apoyo transition-[color,background-color] duration-200 ${
              division === d.id ? "text-primary-foreground" : "text-foreground hover:bg-background"
            }`}
          >
            {d.texto}
          </button>
        ))}
      </div>

      {/* Lista con divisores: sin tarjetas, el aire y una línea de 1 px separan cada periodo.
          Cada periodo se puede tocar: el mapa pinta la lluvia de esos meses. */}
      <div className="flex flex-col gap-2">
        <p className="text-nota text-muted-foreground">Toca un periodo para ver su lluvia en el mapa.</p>
        <ol className="flex flex-col divide-y divide-border border-y border-border">
          {periodos.map((p, i) => (
            <Periodo key={p.id} periodo={p} orden={i} elegido={p.id === periodoElegido} onElegir={() => onPeriodo(p.id)} />
          ))}
        </ol>
      </div>

      {/* La parcela dibujada a lo largo del año: solo usa lo que el plan ya trae */}
      <BotonSecundario onClick={() => setSimulacionAbierta(true)}>
        <IconoParcela className="size-5" />
        Ver mi parcela en el año
      </BotonSecundario>

      <BotonPrimario onClick={guardarPdf}>
        <IconoDescargar className="size-5" />
        Guardar como PDF
      </BotonPrimario>

      <p className="flex items-start gap-2.5 text-apoyo text-muted-foreground">
        <IconoInfo className="mt-0.5 size-5 shrink-0" />
        <span>
          Esto es una guía. <strong className="font-normal text-foreground">Revísala con tu técnico agrícola</strong> antes de sembrar, porque conoce tu suelo y tu terreno.
        </span>
      </p>

      <p className="text-nota text-muted-foreground">
        Lluvia: {plan.fuente.dataset}, promedio {plan.fuente.periodo}, consultado el {plan.fuente.consultado.slice(0, 10)}. Meses de siembra:{" "}
        {plan.simulado ? "reglas de ejemplo (simulado)." : "calculados con el balance de agua de cada cultivo (FAO-56 y FAO-33)."}
      </p>

      <SimulacionParcela plan={plan} lugar={lugar} abierta={simulacionAbierta} onCerrar={() => setSimulacionAbierta(false)} />
    </div>
  );
}

interface PropsPeriodo {
  periodo: PeriodoPlan;
  orden: number;
  /** Es el periodo que pinta el mapa. */
  elegido: boolean;
  onElegir: () => void;
}

// Todo el periodo es un botón (solo con <span>, que es lo que un botón admite adentro).
// Elegido: el nombre en verde y "En el mapa", sin caja de color.
function Periodo({ periodo: p, orden, elegido, onElegir }: PropsPeriodo) {
  return (
    <li className="entrar-lista" style={{ "--i": orden } as CSSProperties}>
      <button
        type="button"
        aria-pressed={elegido}
        onClick={onElegir}
        className="-mx-2 flex w-[calc(100%+1rem)] flex-col gap-2 rounded-lg px-2 py-4 text-left transition-colors duration-150 hover:bg-background/60"
      >
        <span className="flex w-full items-baseline justify-between gap-3">
          <span className={`font-display text-subtitulo font-semibold ${elegido ? "text-primary" : ""}`}>{p.nombre}</span>
          <span className="inline-flex shrink-0 items-center gap-3">
            {elegido && (
              <span className="inline-flex items-center gap-1 text-nota text-primary">
                <IconoMapa className="size-4" />
                En el mapa
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-apoyo font-semibold tabular-nums">
              <IconoGota className="size-4 text-muted-foreground" />
              {p.lluviaEsperada.toLocaleString("es-HN")} mm
            </span>
          </span>
        </span>

        <span className="flex items-center gap-2">
          {p.cultivos.length > 0 && (
            <span className="flex shrink-0 gap-0.5" aria-hidden="true">
              {p.cultivos.map((c) => (
                <DibujoCultivo key={c} id={c} className="size-6" />
              ))}
            </span>
          )}
          <span className="text-cuerpo leading-snug">{p.consejo}</span>
        </span>

        <span className="block text-apoyo leading-snug text-muted-foreground">¿Por qué? {p.porque}</span>

        {p.alerta && (
          <span className="flex items-center gap-2 self-start rounded-full bg-aviso px-3 py-1 text-apoyo">
            <IconoAlerta className="size-4 text-highlight" />
            {p.alerta}
          </span>
        )}

        <span className="block text-nota text-muted-foreground">
          Tierra cubierta {p.mesesCubierta} de {p.meses.length} meses
        </span>
      </button>
    </li>
  );
}
