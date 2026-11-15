import { textoRazon, type PronosticoMes, type RazonPlan, type Tono } from "@/lib/razones";
import { MESES } from "@/lib/textos";

const COLOR_TONO: Record<Tono, string> = {
  bien: "bg-primary",
  atencion: "bg-[var(--decor-sol)]",
  info: "bg-muted-foreground/50",
};

const pct = (v: number) => Math.round(v * 100);

function Razones({ razones }: { razones: RazonPlan[] }) {
  const textos = razones.flatMap((r) => {
    const t = textoRazon(r);
    return t ? [t] : [];
  });
  if (!textos.length) return null;
  return (
    <ul className="flex flex-col gap-2">
      {textos.map((t) => (
        <li key={t.texto} className="flex items-start gap-2.5 text-apoyo leading-snug">
          <span aria-hidden="true" className={`mt-1.5 size-2.5 shrink-0 rounded-full ${COLOR_TONO[t.tono]}`} />
          <span>{t.texto}</span>
        </li>
      ))}
    </ul>
  );
}

function Pronostico({ meses }: { meses: PronosticoMes[] }) {
  if (!meses.length) return null;
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="flex flex-col gap-0.5">
        <span className="text-cuerpo font-medium">Pronóstico de lluvia</span>
        <span className="text-nota text-muted-foreground">
          Probabilidad de que llueva menos de lo normal, lo normal o más de lo normal. Fuente: ECMWF SEAS5.
        </span>
      </figcaption>
      <div className="flex flex-wrap gap-3 text-nota text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <i className="size-2.5 rounded-sm bg-[var(--decor-sol)]" />
          Más seco
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="size-2.5 rounded-sm bg-border" />
          Normal
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="size-2.5 rounded-sm bg-[var(--chart-3)]" />
          Más lluvioso
        </span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {meses.map((m) => (
          <li key={`${m.anio}-${m.mes}`} className="grid grid-cols-[3.5rem_1fr_4.5rem] items-center gap-2 text-nota tabular-nums">
            <span>
              {MESES[m.mes - 1]} {String(m.anio).slice(2)}
            </span>
            <span
              className="flex h-3 overflow-hidden rounded-full"
              role="img"
              aria-label={`${MESES[m.mes - 1]}: ${pct(m.seco)} % más seco, ${pct(m.normal)} % normal, ${pct(m.lluvioso)} % más lluvioso`}
            >
              <span className="bg-[var(--decor-sol)]" style={{ width: `${pct(m.seco)}%` }} />
              <span className="bg-border" style={{ width: `${pct(m.normal)}%` }} />
              <span className="bg-[var(--chart-3)]" style={{ width: `${pct(m.lluvioso)}%` }} />
            </span>
            <span className="text-right text-muted-foreground">{pct(m.seco)} % seco</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

export function ExplicacionPlan({ razones, pronostico }: { razones: RazonPlan[]; pronostico: PronosticoMes[] }) {
  if (!razones.length && !pronostico.length) return null;
  return (
    <section className="flex flex-col gap-4 border-t border-border pt-4" aria-labelledby="por-que-plan">
      <h2 id="por-que-plan" className="font-display text-subtitulo font-semibold">
        Lo que encontró el cálculo
      </h2>
      <Razones razones={razones} />
      <Pronostico meses={pronostico} />
    </section>
  );
}
