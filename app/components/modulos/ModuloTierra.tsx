// Módulo 3: la salud de la tierra en 3 años, comparando rotaciones (proyección simulada).
import type { Resultado } from "@/lib/tipos";
import { Carita } from "../dibujos";
import { IconoCheck, TEXTO_SEMAFORO } from "../ui";

interface Props {
  resultado: Resultado;
  elegidaId: string;
  onElegir: (id: string) => void;
}

export function ModuloTierra({ resultado, elegidaId, onElegir }: Props) {
  const elegida = resultado.opciones.find((o) => o.rotacion.id === elegidaId) ?? resultado.opciones[0];
  const { actual } = resultado;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 className="font-display text-[30px] leading-[1.05] font-semibold tracking-[-0.015em]">Tu tierra en 3 años</h2>
        <span className="text-sm font-semibold text-muted-foreground">(simulado)</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Tarjeta titulo="Si sigues igual" semaforo={actual.semaforo} detalle={`Desnuda ${actual.mesesDesnuda} meses al año`} />
        <Tarjeta
          titulo={elegida.esActual ? "Con tu elección" : "Si cambias"}
          semaforo={elegida.semaforo}
          detalle={elegida.mesesDesnuda === 0 ? "Cubierta todo el año" : `Desnuda ${elegida.mesesDesnuda} meses al año`}
          destacada
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2.5 font-display text-[22px] leading-tight font-semibold tracking-[-0.015em]">Elige cómo sembrar</legend>
        {resultado.opciones.map((o) => {
          const activa = o.rotacion.id === elegida.rotacion.id;
          return (
            <label
              key={o.rotacion.id}
              className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border-[3px] px-3.5 py-2.5 transition-[background-color,border-color] duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring ${
                activa ? "border-primary bg-zona-equilibrada/45" : "border-transparent bg-background"
              }`}
            >
              <input type="radio" name="rotacion" className="sr-only" checked={activa} onChange={() => onElegir(o.rotacion.id)} />
              <Carita semaforo={o.semaforo} className="size-9" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[17px] leading-snug font-semibold">{o.esActual ? `${o.rotacion.nombre} (lo de hoy)` : o.rotacion.nombre}</span>
                <span className="text-[15px] leading-snug text-muted-foreground">{o.rotacion.descripcion}</span>
                {o.rotacion.id === resultado.sugeridaId && (
                  <span className="mt-1 inline-flex items-center gap-1 self-start rounded-full bg-primary px-2.5 py-0.5 text-[13px] font-semibold text-primary-foreground">
                    <IconoCheck className="size-3.5" />
                    La mejor para ti
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </fieldset>

      <div className="flex flex-col gap-1.5 rounded-2xl bg-background px-4 py-3.5">
        <span className="text-[17px] font-semibold">¿Por qué?</span>
        <p className="text-base leading-relaxed">{elegida.porque}</p>
        <p className="text-[13px] text-muted-foreground">Dato: {elegida.evidencia}</p>
      </div>

      <p className="text-[13px] text-muted-foreground">
        La proyección es un índice calculado con reglas por cultivo, no una medición del suelo.
      </p>
    </div>
  );
}

function Tarjeta({ titulo, semaforo, detalle, destacada = false }: { titulo: string; semaforo: Resultado["actual"]["semaforo"]; detalle: string; destacada?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center gap-1.5 rounded-3xl border-[3px] p-3.5 text-center ${
        destacada ? "border-primary bg-card" : "border-transparent bg-background"
      }`}
    >
      <span className="text-[15px] font-semibold text-muted-foreground">{titulo}</span>
      {/* La key repite la entrada cuando cambia el color: se nota que la elección cambió el resultado */}
      <Carita key={semaforo} semaforo={semaforo} className="entrar-paso size-16" />
      <span className="font-display text-2xl leading-none font-semibold tracking-[-0.015em]">{TEXTO_SEMAFORO[semaforo]}</span>
      <span className="text-[15px] leading-snug">{detalle}</span>
    </div>
  );
}
