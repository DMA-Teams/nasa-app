// Panel de bienvenida: una sola pregunta ("¿Dónde está tu terreno?"), departamento → municipio,
// el botón de ubicación, los ejemplos del pitch y, al final, los datos generales de Honduras.
"use client";

import { useRef, useState } from "react";
import { obtenerMunicipios } from "@/lib/api";
import type { Celda, Lugar, Municipio, TipoZona } from "@/lib/tipos";
import { DibujoClima } from "./dibujos";
import { HondurasEnDatos } from "./HondurasEnDatos";
import { BotonPrimario, IconoUbicar } from "./ui";

export interface Ejemplo {
  etiqueta: string;
  detalle: string;
  tipo: TipoZona;
  lat: number;
  lon: number;
}

interface Props {
  celdas: Celda[];
  departamentos: string[];
  aviso: string | null;
  buscandoUbicacion: boolean;
  ejemplos: Ejemplo[];
  onDepartamento: (nombre: string | null) => void;
  onElegir: (lat: number, lon: number, origen: Lugar["origen"], departamento?: string | null, municipio?: string) => void;
  onUbicarme: () => void;
}

// <select> nativo: en el celular abre la lista del sistema, que el usuario ya conoce
const ESTILO_SELECT =
  "h-13 w-full appearance-none rounded-xl border border-border bg-card px-4 pr-12 text-cuerpo transition-colors duration-150 focus:border-primary disabled:opacity-50";

function Flecha() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-muted-foreground">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function PanelInicio({ celdas, departamentos, aviso, buscandoUbicacion, ejemplos, onDepartamento, onElegir, onUbicarme }: Props) {
  const [departamento, setDepartamento] = useState("");
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const pedido = useRef("");

  async function elegirDepartamento(nombre: string) {
    // Al cambiar de departamento se vacía el municipio: nunca queda uno de otro departamento
    setDepartamento(nombre);
    setMunicipios([]);
    onDepartamento(nombre || null);
    pedido.current = nombre;
    if (!nombre) return;
    const lista = await obtenerMunicipios(nombre);
    if (pedido.current === nombre) setMunicipios(lista);
  }

  function elegirMunicipio(id: string) {
    const m = municipios.find((x) => x.id === id);
    if (m) onElegir(m.lat, m.lon, "lista", m.departamento, m.nombre);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-titulo font-semibold text-balance">¿Dónde está tu terreno?</h1>
        <p className="text-apoyo leading-snug text-muted-foreground">Elige tu departamento y tu municipio, o toca tu terreno en el mapa.</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="departamento" className="text-apoyo text-muted-foreground">Departamento</label>
          <div className="relative">
            <select id="departamento" value={departamento} onChange={(e) => elegirDepartamento(e.target.value)} className={ESTILO_SELECT}>
              <option value="">Elige tu departamento</option>
              {departamentos.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <Flecha />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="municipio" className="text-apoyo text-muted-foreground">
            Municipio{municipios.some((m) => m.simulado) && <span> (simulado)</span>}
          </label>
          <div className="relative">
            <select
              id="municipio"
              // La key reinicia el selector cuando cambia el departamento
              key={departamento}
              defaultValue=""
              disabled={!departamento || municipios.length === 0}
              onChange={(e) => elegirMunicipio(e.target.value)}
              className={ESTILO_SELECT}
            >
              <option value="">{departamento ? "Elige tu municipio" : "Primero elige el departamento"}</option>
              {municipios.map((m) => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
            <Flecha />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <BotonPrimario onClick={onUbicarme} disabled={buscandoUbicacion}>
          <IconoUbicar className="size-5" />
          {buscandoUbicacion ? "Buscando dónde estás…" : "Usar mi ubicación"}
        </BotonPrimario>
        {aviso && (
          <p className="rounded-xl bg-aviso px-4 py-3 text-apoyo transition-[translate,opacity] duration-200 ease-out-strong starting:-translate-y-1 starting:opacity-0">
            {aviso}
          </p>
        )}
      </div>

      <section className="flex flex-col gap-2" aria-labelledby="titulo-ejemplos">
        <h2 id="titulo-ejemplos" className="text-apoyo text-muted-foreground">¿Solo quieres probar? Mira un ejemplo</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {ejemplos.map((e) => (
            <button
              key={e.etiqueta}
              type="button"
              onClick={() => onElegir(e.lat, e.lon, "lista")}
              // Tarjeta blanca con borde fino: el dibujo del clima ya dice si es seco o lluvioso
              className="flex min-h-16 items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition-[transform,border-color] duration-150 ease-out-strong hover:border-primary/40 active:scale-[0.98]"
            >
              <DibujoClima tipo={e.tipo} className="size-8" />
              <span className="flex min-w-0 flex-col">
                <span className="text-cuerpo leading-tight font-semibold">{e.etiqueta}</span>
                <span className="text-nota leading-tight text-muted-foreground">{e.detalle}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <HondurasEnDatos celdas={celdas} />
    </div>
  );
}
