import { CULTIVOS, GRUPOS_CULTIVO, MAXIMO_CULTIVOS_ROTACION } from "@/lib/cultivos";
import type { CultivoId } from "@/lib/tipos";
import { DibujoCultivo } from "../dibujos";
import { BotonPrimario } from "../ui";

interface Props {
  cultivos: CultivoId[];
  onCultivos: (c: CultivoId[]) => void;
  onVerPlan: () => void;
}

export function ModuloCultivos({ cultivos, onCultivos, onVerPlan }: Props) {
  const lleno = cultivos.length >= MAXIMO_CULTIVOS_ROTACION;
  const alternar = (id: CultivoId) =>
    onCultivos(cultivos.includes(id) ? cultivos.filter((c) => c !== id) : lleno ? cultivos : [...cultivos, id]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-titulo font-semibold">¿Qué siembras?</h1>
        <p className="text-apoyo text-muted-foreground">
          Toca hasta {MAXIMO_CULTIVOS_ROTACION} cultivos en el orden en que los siembras durante el año.
        </p>
      </div>

      {GRUPOS_CULTIVO.map(({ grupo, nombre }) => (
        <section key={grupo} className="flex flex-col gap-2" aria-label={nombre}>
          <h2 className="text-apoyo font-medium text-muted-foreground">{nombre}</h2>
          <div className="grid grid-cols-3 gap-2">
            {CULTIVOS.filter((c) => c.grupo === grupo).map((c) => {
              const orden = cultivos.indexOf(c.id) + 1;
              const activo = orden > 0;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={activo}
                  disabled={!activo && lleno}
                  onClick={() => alternar(c.id)}
                  className={`relative flex min-h-24 flex-col items-center justify-center gap-1 rounded-2xl border bg-card px-1.5 py-2 text-apoyo leading-tight transition-[transform,border-color,opacity] duration-150 ease-out-strong active:scale-[0.98] disabled:opacity-40 ${
                    activo ? "border-primary" : "border-border hover:border-primary/40"
                  }`}
                >
                  <DibujoCultivo id={c.id} className={`size-10 transition-transform duration-200 ease-out-strong ${activo ? "scale-110" : ""}`} />
                  {c.nombre}
                  {activo && (
                    <span
                      aria-label={`Siembra número ${orden}`}
                      className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-primary text-nota font-semibold text-primary-foreground transition-[scale,opacity] duration-200 ease-out-strong starting:scale-50 starting:opacity-0"
                    >
                      {orden}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <BotonPrimario onClick={onVerPlan} disabled={cultivos.length === 0}>
        {cultivos.length === 0 ? "Marca al menos uno" : "Ver mi plan"}
      </BotonPrimario>
    </div>
  );
}
