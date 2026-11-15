// Controles de la simulación: qué tramo del año se ve (año, semestres o trimestres), reproducir o pausar,
// y una barra para moverse en el tiempo. La barra es un <input type="range">: funciona con teclado y lector de pantalla.
import { MESES, MESES_LARGOS } from "@/lib/textos";
import { PASOS_POR_MES } from "@/lib/simulacion";
import type { Vista } from "@/lib/simulacion";
import type { ReactNode } from "react";

const VISTAS: { id: Vista; texto: string }[] = [
  { id: "anual", texto: "Año" },
  { id: "semestral", texto: "Semestres" },
  { id: "trimestral", texto: "Trimestres" },
];

interface PropsLineaTiempo {
  vista: Vista;
  onVista: (v: Vista) => void;
  periodos: { id: string; nombre: string }[]; // [] en vista anual
  periodo: number;
  onPeriodo: (i: number) => void;
  paso: number;
  rango: [number, number];
  onPaso: (p: number) => void;
  reproduciendo: boolean;
  onReproducir: () => void; // alterna reproducir / pausar
  onAnterior: () => void;
  onSiguiente: () => void;
  mesesDificiles: number[];
}

function BotonControl({ etiqueta, principal = false, onClick, children }: { etiqueta: string; principal?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      onClick={onClick}
      className={`flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full transition-[transform,background-color,border-color] duration-150 ease-out-strong active:scale-[0.94] ${
        principal ? "bg-primary text-primary-foreground hover:bg-primary-hover" : "border border-border bg-card text-foreground hover:border-primary/40"
      }`}
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}

export function LineaTiempo({
  vista,
  onVista,
  periodos,
  periodo,
  onPeriodo,
  paso,
  rango,
  onPaso,
  reproduciendo,
  onReproducir,
  onAnterior,
  onSiguiente,
  mesesDificiles,
}: PropsLineaTiempo) {
  const [inicio, fin] = rango;
  const primerMes = inicio / PASOS_POR_MES; // índice 0–11
  const cuantosMeses = (fin - inicio + 1) / PASOS_POR_MES;
  const mesActual = Math.floor(paso / PASOS_POR_MES);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-1 rounded-full border border-border bg-card p-1" role="group" aria-label="Ver la parcela por">
        {VISTAS.map((v) => (
          <button
            key={v.id}
            type="button"
            aria-pressed={vista === v.id}
            onClick={() => onVista(v.id)}
            className={`min-h-11 rounded-full text-apoyo transition-[color,background-color] duration-200 ${
              vista === v.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-background"
            }`}
          >
            {v.texto}
          </button>
        ))}
      </div>

      {periodos.length > 0 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Periodo">
          {periodos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={i === periodo}
              onClick={() => onPeriodo(i)}
              className={`min-h-11 flex-1 rounded-full border px-3 text-apoyo whitespace-nowrap transition-[color,background-color,border-color] duration-200 ${
                i === periodo ? "border-primary bg-primary/10 font-semibold text-primary" : "border-border bg-card text-foreground hover:border-primary/40"
              }`}
            >
              {p.nombre}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex shrink-0 items-center gap-1.5">
          <BotonControl etiqueta="Anterior" onClick={onAnterior}>
            <path d="M6 5h2.5v14H6zM19 5.5v13L9.5 12z" />
          </BotonControl>
          <BotonControl etiqueta={reproduciendo ? "Pausar" : "Reproducir"} principal onClick={onReproducir}>
            {reproduciendo ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5v14l11-7z" />}
          </BotonControl>
          <BotonControl etiqueta="Siguiente" onClick={onSiguiente}>
            <path d="M15.5 5H18v14h-2.5zM5 5.5v13l9.5-6.5z" />
          </BotonControl>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <input
            type="range"
            min={inicio}
            max={fin}
            step={1}
            value={paso}
            onChange={(e) => onPaso(Number(e.target.value))}
            aria-label="Momento del año"
            aria-valuetext={MESES_LARGOS[mesActual]}
            className="h-6 w-full accent-primary"
          />
          <div className="grid text-center text-nota text-muted-foreground" style={{ gridTemplateColumns: `repeat(${cuantosMeses}, minmax(0, 1fr))` }} aria-hidden="true">
            {Array.from({ length: cuantosMeses }, (_, i) => {
              const mes = primerMes + i;
              const dificil = mesesDificiles.includes(mes + 1);
              return (
                <span
                  key={mes}
                  className={`rounded-sm ${dificil ? "bg-dificil" : ""} ${mes === mesActual ? "font-semibold text-foreground" : ""}`}
                >
                  {cuantosMeses > 6 ? MESES[mes].slice(0, 1) : MESES[mes]}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
