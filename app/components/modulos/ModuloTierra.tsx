// Módulo 3: la salud de la tierra en 3 años, comparando rotaciones (proyección simulada).
import type { Resultado } from "@/lib/tipos";
import { COLOR_SEMAFORO, Foco, TEXTO_SEMAFORO } from "../ui";

interface Props {
  resultado: Resultado;
  elegidaId: string;
  onElegir: (id: string) => void;
}

export function ModuloTierra({ resultado, elegidaId, onElegir }: Props) {
  const elegida = resultado.opciones.find((o) => o.rotacion.id === elegidaId) ?? resultado.opciones[0];
  const { actual } = resultado;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 className="font-display text-[26px] leading-tight font-bold">Tu tierra en 3 años</h2>
        <span className="text-xs font-semibold text-muted-foreground">(simulado)</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Tarjeta titulo="Si sigues igual" semaforo={actual.semaforo} detalle={`Desnuda ${actual.mesesDesnuda} meses al año`} />
        <Tarjeta
          titulo={elegida.esActual ? "Con tu elección" : "Con esta rotación"}
          semaforo={elegida.semaforo}
          detalle={elegida.mesesDesnuda === 0 ? "Cubierta todo el año" : `Desnuda ${elegida.mesesDesnuda} meses al año`}
          destacada
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-[15px] font-semibold">Elige una rotación</legend>
        {resultado.opciones.map((o) => {
          const activa = o.rotacion.id === elegida.rotacion.id;
          return (
            <label
              key={o.rotacion.id}
              className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl bg-card px-3.5 py-2.5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring ${
                activa ? "border-2 border-primary" : "border border-border"
              }`}
            >
              <input type="radio" name="rotacion" className="sr-only" checked={activa} onChange={() => onElegir(o.rotacion.id)} />
              <span aria-hidden="true" className="size-3.5 shrink-0 rounded-full" style={{ background: COLOR_SEMAFORO[o.semaforo] }} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[15px] font-semibold">{o.esActual ? `${o.rotacion.nombre} (lo de hoy)` : o.rotacion.nombre}</span>
                <span className="text-[13px] text-muted-foreground">{o.rotacion.descripcion}</span>
              </span>
              {o.rotacion.id === resultado.sugeridaId && (
                <span className="rounded-full bg-zona-equilibrada/60 px-2 py-0.5 text-[11px] font-bold tracking-wide text-primary uppercase">Sugerida</span>
              )}
            </label>
          );
        })}
      </fieldset>

      <div className="flex flex-col gap-1.5 rounded-xl bg-zona-equilibrada/45 px-3.5 py-3">
        <span className="text-sm font-semibold">¿Por qué?</span>
        <p className="text-[13px] leading-relaxed">{elegida.porque}</p>
        <p className="text-[11px] text-muted-foreground">Dato: {elegida.evidencia}</p>
      </div>

      <p className="text-xs text-muted-foreground">
        La proyección es un índice calculado con reglas por cultivo, no una medición del suelo.
      </p>
    </div>
  );
}

function Tarjeta({ titulo, semaforo, detalle, destacada = false }: { titulo: string; semaforo: Resultado["actual"]["semaforo"]; detalle: string; destacada?: boolean }) {
  return (
    <div className={`flex flex-col gap-2 rounded-2xl bg-background p-3.5 ${destacada ? "border-2 border-primary" : "border border-border"}`}>
      <span className="text-[13px] text-muted-foreground">{titulo}</span>
      <div className="flex items-center gap-2.5">
        <Foco semaforo={semaforo} tam={28} />
        <span className="font-display text-xl font-bold">{TEXTO_SEMAFORO[semaforo]}</span>
      </div>
      <span className="text-[13px]">{detalle}</span>
    </div>
  );
}
