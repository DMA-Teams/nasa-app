// "Yo elijo mis cultivos": qué siembra hoy. El plan se arma con lo que marque.
import { REGLAS } from "@/lib/motor";
import { NOMBRE_CULTIVO } from "@/lib/textos";
import type { CultivoId } from "@/lib/tipos";
import { DibujoCultivo } from "../dibujos";
import { BotonPrimario, IconoCheck } from "../ui";

interface Props {
  cultivos: CultivoId[];
  onCultivos: (c: CultivoId[]) => void;
  onVerPlan: () => void;
}

export function ModuloCultivos({ cultivos, onCultivos, onVerPlan }: Props) {
  const alternar = (id: CultivoId) =>
    onCultivos(cultivos.includes(id) ? cultivos.filter((c) => c !== id) : [...cultivos, id]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-[30px] leading-[1.05] font-semibold tracking-[-0.015em]">¿Qué siembras?</h2>
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
                activo ? "border-primary bg-decor-verde-suave" : "border-transparent bg-background"
              }`}
            >
              <DibujoCultivo id={r.id} className={`size-16 transition-transform duration-200 ease-out-strong ${activo ? "scale-110" : ""}`} />
              {NOMBRE_CULTIVO[r.id]}
              {activo && (
                <span className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <IconoCheck className="size-4" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <BotonPrimario onClick={onVerPlan} disabled={cultivos.length === 0}>
        {cultivos.length === 0 ? "Marca al menos uno" : "Ver mi plan"}
      </BotonPrimario>
    </div>
  );
}
