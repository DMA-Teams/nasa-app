// "Datos de tu lugar": botón que despliega el clima, la altura y la lluvia con más detalle.
// Cerrado muestra un resumen corto; abierto, una fila por dato con su explicación.
"use client";

import { useId, useState } from "react";
import { NOMBRE_RELIEVE, NOMBRE_ZONA } from "@/lib/colores";
import { relieveDe } from "@/lib/clima";
import { listaMeses, MESES_LARGOS } from "@/lib/textos";
import type { ClimaZona, Lugar } from "@/lib/tipos";
import type { ReactNode } from "react";
import { DibujoClima } from "./dibujos";
import { IconoGota, IconoMontana, IconoSol } from "./ui";

interface Props {
  lugar: Lugar;
  clima: ClimaZona | null;
  altura: number | null; // del modelo de elevación; si no hay, se usa el promedio de NASA POWER
}

const EXPLICA_ZONA = {
  seca: "En julio llueve mucho menos que en junio y septiembre: es la canícula.",
  equilibrada: "La lluvia es bastante pareja; la canícula se siente poco.",
  lluviosa: "Llueve más de 2,000 mm al año; a fin de año caen aguaceros fuertes.",
};

const EXPLICA_RELIEVE = {
  bajo: "Tierra baja y caliente, como la costa y los valles.",
  medio: "Ni muy alto ni muy bajo: clima templado.",
  montana: "Tierra alta y fresca; la lluvia arrastra más el suelo en las laderas.",
};

export function DatosLugar({ lugar, clima, altura }: Props) {
  const [abierto, setAbierto] = useState(false);
  const idDetalle = useId();
  const metros = altura ?? clima?.elevacion ?? lugar.celda.elevacion;
  const tipo = clima?.tipo ?? lugar.celda.tipo;
  const lluvia = clima?.lluviaAnual ?? lugar.celda.lluviaAnual;
  const relieve = relieveDe(metros);

  const masLluvioso = clima?.meses.reduce((a, b) => (b.lluvia > a.lluvia ? b : a));
  const masSeco = clima?.meses.reduce((a, b) => (b.lluvia < a.lluvia ? b : a));
  const masCaliente = clima?.meses.reduce((a, b) => (b.tempMax > a.tempMax ? b : a));

  return (
    <section className="overflow-hidden rounded-3xl bg-background">
      <button
        type="button"
        aria-expanded={abierto}
        aria-controls={idDetalle}
        onClick={() => setAbierto(!abierto)}
        className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left focus-visible:-outline-offset-2"
      >
        <DibujoClima tipo={tipo} className="size-10" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-cuerpo leading-tight font-semibold">Datos de tu lugar</span>
          <span className="truncate text-apoyo text-muted-foreground">
            {NOMBRE_ZONA[tipo]} · {metros.toLocaleString("es-HN")} m · {lluvia.toLocaleString("es-HN")} mm al año
          </span>
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          aria-hidden="true"
          className={`size-6 shrink-0 text-primary transition-transform duration-200 ease-out-strong ${abierto ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* grid-rows 0fr → 1fr anima la altura sin medirla */}
      <div
        id={idDetalle}
        className={`grid transition-[grid-template-rows] duration-300 ease-out-strong ${abierto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden" inert={!abierto}>
          <dl className="flex flex-col gap-1 px-3 pb-4">
            <Dato
              icono={<DibujoClima tipo={tipo} className="size-7" />}
              titulo="Clima"
              valor={NOMBRE_ZONA[tipo]}
              detalle={
                clima && clima.mesesDificiles.length
                  ? `${EXPLICA_ZONA[tipo]} Meses difíciles: ${listaMeses(clima.mesesDificiles)}.`
                  : EXPLICA_ZONA[tipo]
              }
            />
            <Dato
              icono={<IconoMontana className="size-6 text-muted-foreground" />}
              titulo="Altura"
              valor={`${metros.toLocaleString("es-HN")} m · ${NOMBRE_RELIEVE[relieve]}`}
              detalle={`${EXPLICA_RELIEVE[relieve]} ${altura === null ? "Es el promedio de la zona." : "Medida en tu punto exacto."}`}
            />
            <Dato
              icono={<IconoGota className="size-6 text-chart-3" />}
              titulo="Lluvia esperada"
              valor={`${lluvia.toLocaleString("es-HN")} mm al año`}
              detalle={
                masLluvioso && masSeco
                  ? `Llueve más en ${MESES_LARGOS[masLluvioso.mes - 1]} (${masLluvioso.lluvia} mm) y menos en ${MESES_LARGOS[masSeco.mes - 1]} (${masSeco.lluvia} mm).`
                  : "Promedio de 2015 a 2025."
              }
            />
            {masCaliente && (
              <Dato
                icono={<IconoSol className="size-6 text-highlight" />}
                titulo="Calor"
                valor={`Hasta ${Math.round(masCaliente.tempMax)} °C`}
                detalle={`Es el promedio de las tardes más calientes, en ${MESES_LARGOS[masCaliente.mes - 1]}.`}
              />
            )}
          </dl>
          <p className="px-4 pb-4 text-nota text-muted-foreground">
            {clima
              ? `Fuente: ${clima.dataset}, promedio ${clima.periodo.inicio.slice(0, 4)}–${clima.periodo.fin.slice(0, 4)}.`
              : "Consultando NASA POWER…"}
          </p>
        </div>
      </div>
    </section>
  );
}

function Dato({ icono, titulo, valor, detalle }: { icono: ReactNode; titulo: string; valor: string; detalle: string }) {
  return (
    <div className="flex gap-3 rounded-xl bg-card p-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background">{icono}</span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <dt className="text-apoyo text-muted-foreground">{titulo}</dt>
        <dd className="text-cuerpo leading-snug font-semibold">{valor}</dd>
        <dd className="text-apoyo leading-snug">{detalle}</dd>
      </div>
    </div>
  );
}
