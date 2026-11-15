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
        <h1 className="font-display text-titulo font-semibold">¿Qué siembras?</h1>
        <p className="text-apoyo text-muted-foreground">Toca todos los que siembras.</p>
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
              className={`relative flex min-h-28 flex-col items-center justify-center gap-1.5 rounded-2xl border bg-card px-2 py-3 text-cuerpo leading-tight transition-[transform,border-color] duration-150 ease-out-strong active:scale-[0.98] ${
                activo ? "border-primary" : "border-border hover:border-primary/40"
              }`}
            >
              <DibujoCultivo id={r.id} className={`size-12 transition-transform duration-200 ease-out-strong ${activo ? "scale-110" : ""}`} />
              {NOMBRE_CULTIVO[r.id]}
              {activo && (
                <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground transition-[scale,opacity] duration-200 ease-out-strong starting:scale-50 starting:opacity-0">
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
