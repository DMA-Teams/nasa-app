// Módulo 4: plan de siembra de 2 años y compartir por WhatsApp.
import { MESES, nombresCultivos, planDeSiembra, textoWhatsApp } from "@/lib/motor";
import type { ClimaZona, Rotacion } from "@/lib/tipos";
import { IconoInfo, IconoMensaje } from "../ui";

const COLUMNAS = [5, 6, 7, 8, 9, 10, 11, 12]; // de mayo a diciembre

interface Props {
  rotacion: Rotacion;
  clima: ClimaZona;
  lugar: string;
}

export function ModuloPlan({ rotacion, clima, lugar }: Props) {
  const plan = planDeSiembra(rotacion);
  const enlace = `https://wa.me/?text=${encodeURIComponent(textoWhatsApp(lugar, rotacion, plan))}`;
  const dificiles = clima.mesesDificiles.filter((m) => COLUMNAS.includes(m));
  const etiquetaDificil = clima.tipo === "lluviosa" ? "Aguaceros: la tierra queda cubierta" : "Canícula: la tierra queda cubierta";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-[26px] leading-tight font-bold">Tu plan de siembra</h2>
        <p className="text-[15px] text-muted-foreground">{rotacion.nombre}</p>
      </div>

      <div className="flex flex-col gap-4 overflow-x-auto rounded-2xl bg-background p-4">
        {[1, 2].map((anio) => (
          <div key={anio} className="flex min-w-[300px] flex-col gap-1.5">
            <span className="text-[13px] font-bold">Año {anio}</span>
            <div className="grid grid-cols-[64px_repeat(8,minmax(0,1fr))] gap-x-0.5 gap-y-1.5 text-[11px]">
              {anio === 1 &&
                COLUMNAS.map((m, i) => (
                  <span
                    key={m}
                    style={{ gridColumn: i + 2, gridRow: 1 }}
                    className={`text-center ${dificiles.includes(m) ? "font-bold text-highlight" : "text-muted-foreground"}`}
                  >
                    {MESES[m - 1]}
                  </span>
                ))}
              {dificiles.map((m) => (
                <span
                  key={`d-${m}`}
                  aria-hidden="true"
                  className="rounded-md bg-zona-seca/35"
                  style={{ gridColumn: COLUMNAS.indexOf(m) + 2, gridRow: anio === 1 ? "2 / 4" : "1 / 3" }}
                />
              ))}
              {plan
                .filter((f) => f.anio === anio)
                .map((f, i) => {
                  const fila = (anio === 1 ? 2 : 1) + i;
                  return [
                    <span key={`t-${f.temporada}`} style={{ gridRow: fila, gridColumn: 1 }} className="self-center text-xs font-semibold capitalize">
                      {f.temporada}
                    </span>,
                    <span
                      key={`b-${f.temporada}`}
                      style={{ gridRow: fila, gridColumn: `${COLUMNAS.indexOf(f.mesInicio) + 2} / ${COLUMNAS.indexOf(f.mesFin) + 3}` }}
                      className={`z-10 my-1 truncate rounded-md px-2 py-1.5 text-xs font-semibold ${
                        f.cultivos.includes("frijolAbono") ? "bg-zona-equilibrada text-primary" : "bg-relieve-medio/60 text-foreground"
                      }`}
                    >
                      {nombresCultivos(f.cultivos)}
                    </span>,
                  ];
                })}
            </div>
          </div>
        ))}
        {dificiles.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <i className="size-3 rounded-sm bg-zona-seca/50" />
            {etiquetaDificil}
          </span>
        )}
      </div>

      <a
        href={enlace}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-14 items-center justify-center gap-2.5 rounded-2xl bg-primary px-5 text-[17px] font-semibold text-primary-foreground transition-transform duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <IconoMensaje className="size-5" />
        Enviar mi plan por WhatsApp
      </a>

      <div className="flex items-start gap-2.5 rounded-xl border border-border px-3.5 py-3">
        <IconoInfo className="mt-0.5 size-5 shrink-0 text-primary" />
        <p className="text-[13px] leading-relaxed">
          Esto es una guía. <strong>Revísala con tu técnico agrícola</strong> antes de sembrar, porque conoce tu suelo y tu terreno.
        </p>
      </div>
    </div>
  );
}
