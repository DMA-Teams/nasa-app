// Módulo 2: qué siembra hoy y qué le importa más.
import { REGLAS } from "@/lib/motor";
import type { CultivoId, Prioridad } from "@/lib/tipos";
import { DibujoCultivo } from "../dibujos";
import { IconoBrote, IconoCheck, IconoGota, IconoMoneda } from "../ui";

const PRIORIDADES = [
  { id: "agua", texto: "Aguantar la sequía", Icono: IconoGota },
  { id: "dinero", texto: "Ganar más", Icono: IconoMoneda },
  { id: "tierra", texto: "Cuidar mi tierra", Icono: IconoBrote },
] as const satisfies readonly { id: Prioridad; texto: string; Icono: typeof IconoGota }[];

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-[30px] leading-[1.05] font-semibold tracking-[-0.015em]">¿Qué siembras hoy?</h2>
        <p className="text-[17px] text-muted-foreground">Toca todos los que siembras.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {REGLAS.map((r) => {
          const activo = cultivos.includes(r.id);
          return (
            <button
              key={r.id}
              type="button"
              aria-pressed={activo}
              onClick={() => alternar(r.id)}
              className={`relative flex min-h-32 flex-col items-center justify-center gap-1 rounded-3xl border-[3px] px-2 py-3 text-[17px] leading-tight font-semibold transition-[transform,background-color,border-color] duration-150 ease-out-strong active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                activo ? "border-primary bg-zona-equilibrada/45" : "border-transparent bg-background"
              }`}
            >
              <DibujoCultivo id={r.id} className={`size-16 transition-transform duration-200 ease-out-strong ${activo ? "scale-110" : ""}`} />
              {r.nombre}
              {activo && (
                <span className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <IconoCheck className="size-4" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2.5 font-display text-[22px] leading-tight font-semibold tracking-[-0.015em]">¿Qué te importa más?</legend>
        {PRIORIDADES.map(({ id, texto, Icono }) => {
          const activa = prioridad === id;
          return (
            <label
              key={id}
              className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-[3px] px-4 text-[17px] font-semibold transition-[background-color,border-color] duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring ${
                activa ? "border-primary bg-zona-equilibrada/45" : "border-transparent bg-background"
              }`}
            >
              <input type="radio" name="prioridad" value={id} checked={activa} onChange={() => onPrioridad(id)} className="sr-only" />
              <Icono className={`size-6 shrink-0 ${activa ? "text-primary" : "text-muted-foreground"}`} />
              <span className="flex-1">{texto}</span>
              {activa && (
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <IconoCheck className="size-4" />
                </span>
              )}
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}
