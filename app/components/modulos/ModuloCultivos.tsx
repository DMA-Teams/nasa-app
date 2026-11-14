// Módulo 2: qué siembra hoy y qué le importa más.
import { REGLAS } from "@/lib/motor";
import type { CultivoId, Prioridad } from "@/lib/tipos";
import { IconoCheck, IconoCultivo } from "../ui";

const PRIORIDADES: { id: Prioridad; texto: string }[] = [
  { id: "agua", texto: "Aguantar la sequía" },
  { id: "dinero", texto: "Ganar más" },
  { id: "tierra", texto: "Cuidar mi tierra" },
];

interface Props {
  cultivos: CultivoId[];
  prioridad: Prioridad;
  onCultivos: (c: CultivoId[]) => void;
  onPrioridad: (p: Prioridad) => void;
}

export function ModuloCultivos({ cultivos, prioridad, onCultivos, onPrioridad }: Props) {
  const alternar = (id: CultivoId) =>
    onCultivos(cultivos.includes(id) ? cultivos.filter((c) => c !== id) : [...cultivos, id]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-[26px] leading-tight font-bold">¿Qué siembras hoy?</h2>
        <p className="text-[15px] text-muted-foreground">Toca todos los que siembras.</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {REGLAS.map((r) => {
          const activo = cultivos.includes(r.id);
          return (
            <button
              key={r.id}
              type="button"
              aria-pressed={activo}
              onClick={() => alternar(r.id)}
              className={`relative flex h-24 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 text-base font-semibold transition-[transform,background-color,border-color] duration-150 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                activo ? "border-primary bg-zona-equilibrada/45" : "border-border bg-card"
              }`}
            >
              <IconoCultivo id={r.id} />
              {r.nombre}
              {activo && (
                <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <IconoCheck className="size-3.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-[15px] font-semibold">¿Qué te importa más?</legend>
        <div className="flex flex-wrap gap-2">
          {PRIORIDADES.map((p) => (
            <label
              key={p.id}
              className={`flex min-h-11 cursor-pointer items-center rounded-full border-2 px-4 text-[15px] font-semibold transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring ${
                prioridad === p.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
              }`}
            >
              <input
                type="radio"
                name="prioridad"
                value={p.id}
                checked={prioridad === p.id}
                onChange={() => onPrioridad(p.id)}
                className="sr-only"
              />
              {p.texto}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
