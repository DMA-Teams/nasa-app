// Panel de bienvenida: una sola pregunta ("¿Dónde está tu terreno?"), departamento → municipio,
// el botón de ubicación, los ejemplos del pitch y, al final, los datos generales de Honduras.
"use client";

import { useRef, useState } from "react";
import { obtenerMunicipios } from "@/lib/api";
import { MUNICIPIOS_SIMULADOS } from "@/lib/municipios";
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
  "h-14 w-full appearance-none rounded-xl border-2 border-border bg-card px-4 pr-12 text-[17px] transition-colors duration-150 focus:border-primary disabled:opacity-50";

function Flecha() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-primary">
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
        <h1 className="font-display text-[32px] leading-[1.05] font-semibold tracking-[-0.015em] text-balance">¿Dónde está tu terreno?</h1>
        <p className="text-[17px] leading-snug text-muted-foreground">Elige tu departamento y tu municipio, o toca tu terreno en el mapa.</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="departamento" className="text-base font-semibold">Departamento</label>
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
          <label htmlFor="municipio" className="text-base font-semibold">
            Municipio{MUNICIPIOS_SIMULADOS && <span className="font-normal text-muted-foreground"> (simulado)</span>}
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
          <IconoUbicar className="size-6" />
          {buscandoUbicacion ? "Buscando dónde estás…" : "Usar mi ubicación"}
        </BotonPrimario>
        {aviso && (
          <p role="status" className="rounded-xl bg-decor-maiz-suave px-4 py-3 text-base font-semibold">
            {aviso}
          </p>
        )}
      </div>

      <section className="flex flex-col gap-2" aria-labelledby="titulo-ejemplos">
        <h2 id="titulo-ejemplos" className="text-base font-semibold">¿Solo quieres probar? Mira un ejemplo</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {ejemplos.map((e) => (
            <button
              key={e.etiqueta}
              type="button"
              onClick={() => onElegir(e.lat, e.lon, "lista")}
              className={`flex min-h-20 items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-transform duration-150 ease-out-strong active:scale-[0.97] ${
                e.tipo === "seca" ? "bg-decor-maiz-suave" : "bg-zona-lluviosa/45"
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

      <HondurasEnDatos celdas={celdas} />
    </div>
  );
}
