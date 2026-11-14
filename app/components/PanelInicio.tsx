// Panel de bienvenida: buscar, datos generales de Honduras y "Ubicarme".
"use client";

import { useState } from "react";
import { buscarLugares } from "@/lib/mapa";
import type { Celda } from "@/lib/tipos";
import { BotonPrimario, IconoBuscar, IconoUbicar } from "./ui";

export interface Ejemplo {
  etiqueta: string;
  detalle: string;
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
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold text-balance">Conoce el clima de tu tierra</h1>
        <p className="text-[15px] text-muted-foreground">
          Toca en el mapa el lugar donde está tu terreno, o búscalo. Usamos 11 años de datos de NASA.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="buscar" className="sr-only">Buscar municipio o departamento</label>
        <div className="flex h-12 items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 focus-within:outline-2 focus-within:outline-ring">
          <IconoBuscar className="size-5 text-muted-foreground" />
          <input
            id="buscar"
            type="search"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Busca tu municipio o departamento"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </div>
        {resultados.length > 0 && (
          <ul className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
            {resultados.map((r) => (
              <li key={r.etiqueta}>
                <button
                  type="button"
                  onClick={() => {
                    setTexto("");
                    onElegir(r.lat, r.lon);
                  }}
                  className="w-full px-4 py-3 text-left text-[15px] hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                >
                  {r.etiqueta}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <BotonPrimario onClick={onUbicarme} disabled={buscandoUbicacion}>
          <IconoUbicar className="size-5" />
          {buscandoUbicacion ? "Buscando tu ubicación…" : "Ubicarme en el mapa"}
        </BotonPrimario>
        {aviso && <p role="status" className="rounded-xl bg-muted px-3.5 py-2.5 text-sm">{aviso}</p>}
      </div>

      <section className="flex flex-col gap-2" aria-labelledby="titulo-datos">
        <h2 id="titulo-datos" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Honduras en datos</h2>
        <div className="grid grid-cols-3 gap-2">
          <Dato valor={`${Math.round((secas / celdas.length) * 100)} %`} texto="del país sufre canícula fuerte" />
          <Dato valor={`${masLluviosa.lluviaAnual.toLocaleString("es-HN")} mm`} texto={`de lluvia al año en ${masLluviosa.lugar.split(", ")[1]}`} />
          <Dato valor={`${masSeca.lluviaAnual.toLocaleString("es-HN")} mm`} texto={`en ${masSeca.lugar.split(", ")[1]}, la zona más seca`} />
        </div>
      </section>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">¿Primera vez? Prueba un ejemplo</span>
        <div className="grid grid-cols-2 gap-2">
          {ejemplos.map((e) => (
            <button
              key={e.etiqueta}
              type="button"
              onClick={() => onElegir(e.lat, e.lon)}
              className="flex min-h-16 flex-col items-start justify-center rounded-xl border border-border bg-card px-3.5 py-2.5 text-left transition-transform duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-ring"
            >
              <span className="text-[15px] font-semibold">{e.etiqueta}</span>
              <span className="text-[13px] text-muted-foreground">{e.detalle}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Clima: NASA POWER, promedio 2015–2025. Imagen: NASA Blue Marble. Relieve: SRTM de NASA.
      </p>
    </div>
  );
}

function Dato({ valor, texto }: { valor: string; texto: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-xl border border-border bg-card p-2.5">
      <span className="font-display text-base font-bold tabular-nums">{valor}</span>
      <span className="text-[11px] leading-tight text-muted-foreground">{texto}</span>
    </div>
  );
}
