// "Así llueve en Honduras": tres datos del país con NASA POWER (promedio 2015–2025),
// en tarjetas con dibujo y barras para comparar de un vistazo.
import type { Celda } from "@/lib/tipos";
import { DibujoClima } from "./dibujos";

/** 2.83 → "casi 3 veces"; 3.2 → "más de 3 veces" */
function veces(razon: number): string {
  const entero = Math.round(razon);
  return razon < entero ? `casi ${entero} veces` : razon > entero ? `más de ${entero} veces` : `${entero} veces`;
}

export function HondurasEnDatos({ celdas }: { celdas: Celda[] }) {
  const porcentajeSeco = Math.round((celdas.filter((c) => c.tipo === "seca").length / celdas.length) * 100);
  const masLluviosa = celdas.reduce((a, c) => (c.lluviaAnual > a.lluviaAnual ? c : a));
  const masSeca = celdas.reduce((a, c) => (c.lluviaAnual < a.lluviaAnual ? c : a));
  const departamento = (c: Celda) => c.lugar.split(", ")[1];

  return (
    <section className="flex flex-col gap-3 border-t-2 border-dashed border-border pt-5" aria-labelledby="titulo-datos">
      <div className="flex flex-col gap-0.5">
        <h2 id="titulo-datos" className="font-display text-[22px] leading-tight font-semibold tracking-[-0.015em]">
          Así llueve en Honduras
        </h2>
        <p className="text-[15px] text-muted-foreground">Promedio de 2015 a 2025, con datos de NASA.</p>
      </div>

      <div className="flex items-center gap-4 rounded-3xl bg-decor-maiz-suave p-4">
        <DibujoClima tipo="seca" className="size-14" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <p className="leading-tight">
            <span className="block text-[34px] leading-none font-semibold tracking-[-0.02em] tabular-nums">{porcentajeSeco} %</span>
            <span className="text-base">del país sufre canícula fuerte en julio</span>
          </p>
          <div className="h-2.5 overflow-hidden rounded-full bg-card" aria-hidden="true">
            <div className="h-full rounded-full bg-decor-sol" style={{ width: `${porcentajeSeco}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Extremo
          tipo="lluviosa"
          mm={masLluviosa.lluviaAnual}
          maximo={masLluviosa.lluviaAnual}
          lugar={departamento(masLluviosa)}
          texto="donde más llueve"
          fondo="bg-zona-lluviosa/35"
        />
        <Extremo
          tipo="seca"
          mm={masSeca.lluviaAnual}
          maximo={masLluviosa.lluviaAnual}
          lugar={departamento(masSeca)}
          texto="donde menos llueve"
          fondo="bg-background"
        />
      </div>

      <p className="text-[15px] leading-snug">
        En {departamento(masLluviosa)} llueve <strong className="font-semibold">{veces(masLluviosa.lluviaAnual / masSeca.lluviaAnual)} más</strong> que en{" "}
        {departamento(masSeca)}. Por eso cada lugar necesita su propio plan.
      </p>

      <p className="text-[13px] text-muted-foreground">Clima: NASA POWER. Imagen: NASA Blue Marble. Relieve: SRTM de NASA.</p>
    </section>
  );
}

interface PropsExtremo {
  tipo: "lluviosa" | "seca";
  mm: number;
  maximo: number;
  lugar: string;
  texto: string;
  fondo: string;
}

function Extremo({ tipo, mm, maximo, lugar, texto, fondo }: PropsExtremo) {
  return (
    <div className={`flex flex-col gap-2 rounded-3xl p-4 ${fondo}`}>
      <DibujoClima tipo={tipo} className="size-10" />
      <p className="flex flex-col">
        <span className="text-2xl leading-none font-semibold tracking-[-0.015em] tabular-nums">{mm.toLocaleString("es-HN")} mm</span>
        <span className="mt-1 text-[13px] text-muted-foreground">de lluvia al año</span>
      </p>
      {/* Barra comparada con el lugar más lluvioso */}
      <div className="h-2 overflow-hidden rounded-full bg-card" aria-hidden="true">
        <div className="h-full rounded-full bg-chart-3" style={{ width: `${(mm / maximo) * 100}%` }} />
      </div>
      <p className="leading-tight">
        <span className="block text-base font-semibold">{lugar}</span>
        <span className="text-sm text-muted-foreground">{texto}</span>
      </p>
    </div>
  );
}
