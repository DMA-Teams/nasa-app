// Panel de bienvenida: una sola pregunta ("¿Dónde está tu terreno?"), el botón grande,
// buscar, los ejemplos del pitch y, al final, los datos generales de Honduras.
"use client";

import { useState } from "react";
import { buscarLugares } from "@/lib/mapa";
import type { Celda, TipoZona } from "@/lib/tipos";
import { DibujoClima } from "./dibujos";
import { BotonPrimario, IconoBuscar, IconoUbicar } from "./ui";

export interface Ejemplo {
  etiqueta: string;
  detalle: string;
  tipo: TipoZona;
  lat: number;
  lon: number;
}

interface Props {
  celdas: Celda[];
  aviso: string | null;
  buscandoUbicacion: boolean;
  ejemplos: Ejemplo[];
  onElegir: (lat: number, lon: number) => void;
  onUbicarme: () => void;
}

export function PanelInicio({ celdas, aviso, buscandoUbicacion, ejemplos, onElegir, onUbicarme }: Props) {
  const [texto, setTexto] = useState("");
  const resultados = buscarLugares(texto);

  // Datos generales calculados con NASA POWER (promedio 2015–2025)
  const secas = celdas.filter((c) => c.tipo === "seca").length;
  const masLluviosa = celdas.reduce((a, c) => (c.lluviaAnual > a.lluviaAnual ? c : a));
  const masSeca = celdas.reduce((a, c) => (c.lluviaAnual < a.lluviaAnual ? c : a));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[32px] leading-[1.05] font-semibold tracking-[-0.015em] text-balance">¿Dónde está tu terreno?</h1>
        <p className="text-[17px] leading-snug text-muted-foreground">Toca el mapa en ese lugar, o usa el botón verde.</p>
      </div>

      <div className="flex flex-col gap-2.5">
        <BotonPrimario onClick={onUbicarme} disabled={buscandoUbicacion}>
          <IconoUbicar className="size-6" />
          {buscandoUbicacion ? "Buscando dónde estás…" : "Estoy en mi terreno"}
        </BotonPrimario>
        {aviso && (
          <p role="status" className="rounded-2xl bg-zona-seca/35 px-4 py-3 text-base font-semibold">
            {aviso}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="buscar" className="text-base font-semibold">O escribe el nombre de tu pueblo</label>
        <div className="flex h-14 items-center gap-2.5 rounded-2xl border-2 border-border bg-card px-4 transition-colors duration-150 focus-within:border-primary">
          <IconoBuscar className="size-5.5 text-primary" />
          <input
            id="buscar"
            type="search"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Por ejemplo: Gracias"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-muted-foreground"
          />
        </div>
        {resultados.length > 0 && (
          <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border-2 border-border bg-card">
            {resultados.map((r) => (
              <li key={r.etiqueta}>
                <button
                  type="button"
                  onClick={() => {
                    setTexto("");
                    onElegir(r.lat, r.lon);
                  }}
                  className="min-h-12 w-full px-4 py-3 text-left text-[17px] hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                >
                  {r.etiqueta}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <section className="flex flex-col gap-2" aria-labelledby="titulo-ejemplos">
        <h2 id="titulo-ejemplos" className="text-base font-semibold">¿Solo quieres probar? Mira un ejemplo</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {ejemplos.map((e) => (
            <button
              key={e.etiqueta}
              type="button"
              onClick={() => onElegir(e.lat, e.lon)}
              className={`flex min-h-20 items-center gap-2 rounded-2xl px-3 py-2.5 text-left transition-transform duration-150 ease-out-strong active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                e.tipo === "seca" ? "bg-zona-seca/40" : "bg-zona-lluviosa/45"
              }`}
            >
              <DibujoClima tipo={e.tipo} className="size-11" />
              <span className="flex min-w-0 flex-col">
                <span className="font-display text-xl leading-tight font-semibold tracking-[-0.015em]">{e.etiqueta}</span>
                <span className="text-sm leading-tight">{e.detalle}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2 border-t-2 border-dashed border-border pt-4" aria-labelledby="titulo-datos">
        <h2 id="titulo-datos" className="text-base font-semibold">Así llueve en Honduras</h2>
        <ul className="flex flex-col gap-2">
          <Dato valor={`${Math.round((secas / celdas.length) * 100)} %`} texto="del país sufre canícula fuerte" />
          <Dato
            valor={`${masLluviosa.lluviaAnual.toLocaleString("es-HN")} mm`}
            texto={`de lluvia al año en ${masLluviosa.lugar.split(", ")[1]}, donde más llueve`}
          />
          <Dato valor={`${masSeca.lluviaAnual.toLocaleString("es-HN")} mm`} texto={`en ${masSeca.lugar.split(", ")[1]}, la zona más seca`} />
        </ul>
        <p className="text-[13px] text-muted-foreground">
          Clima: NASA POWER, promedio 2015–2025. Imagen: NASA Blue Marble. Relieve: SRTM de NASA.
        </p>
      </section>
    </div>
  );
}

function Dato({ valor, texto }: { valor: string; texto: string }) {
  return (
    <li className="flex items-baseline gap-2.5">
      <span className="w-24 shrink-0 text-right font-mono text-[17px] font-semibold tabular-nums">{valor}</span>
      <span className="text-[15px] leading-snug text-muted-foreground">{texto}</span>
    </li>
  );
}
