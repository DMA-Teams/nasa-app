// Pantalla única: mapa real siempre visible + panel que avanza por pasos.
// Inicio → Lugar → (Clima) → ¿Cómo quieres tu plan? → (Tus cultivos) → Plan del año
"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef, useState } from "react";
import departamentosJson from "@/public/fallback/departamentos.json";
import { armarPlan, obtenerClima, obtenerMunicipios } from "@/lib/api";
import { COLOR_ZONA, NOMBRE_ZONA, RAMPA_ALTURA } from "@/lib/colores";
import { departamentoDe } from "@/lib/geo";
import { celdaDePunto } from "@/lib/mapa";
import { municipioMasCercano } from "@/lib/municipios";
import type { CapaMapa, Celda, ClimaZona, CultivoId, DepartamentosGeoJSON, Division, Lugar, ModoPlan, PlanAnual, TipoZona } from "@/lib/tipos";
import { ModuloClima } from "./modulos/ModuloClima";
import { ModuloCultivos } from "./modulos/ModuloCultivos";
import { ModuloPlan } from "./modulos/ModuloPlan";
import { PanelInicio, type Ejemplo } from "./PanelInicio";
import { PanelLugar } from "./PanelLugar";
import { PanelModo } from "./PanelModo";
import { BotonPrimario, ChipZona, IconoAtras, IconoCubo } from "./ui";

// MapLibre necesita el navegador: no se renderiza en el servidor
const MapaReal = dynamic(() => import("./MapaReal").then((m) => m.MapaReal), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-mapa-fondo" aria-hidden="true" />,
});

const departamentos = departamentosJson as DepartamentosGeoJSON;
const NOMBRES_DEPARTAMENTOS = departamentos.features.map((d) => d.properties.nombre).sort((a, b) => a.localeCompare(b, "es"));

type Paso = "inicio" | "lugar" | "info" | "modo" | "cultivos" | "plan";

// Casos del pitch: Lempira (canícula fuerte) y Atlántida (exceso de lluvia)
const EJEMPLOS: Ejemplo[] = [
  { etiqueta: "Lempira", detalle: "Aquí falta agua", tipo: "seca", lat: 14.3, lon: -88.6 },
  { etiqueta: "Atlántida", detalle: "Aquí sobra agua", tipo: "lluviosa", lat: 15.7, lon: -86.9 },
];

export function Explorador({ celdas }: { celdas: Celda[] }) {
  // historial: los pasos por los que pasó, para que "Atrás" vuelva al paso real anterior
  const [historial, setHistorial] = useState<Paso[]>(["inicio"]);
  const paso = historial.at(-1)!;
  const [capa, setCapa] = useState<CapaMapa>("clima");
  const [inclinado, setInclinado] = useState(true);
  const [departamentoEnfocado, setDepartamentoEnfocado] = useState<string | null>(null);
  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [altura, setAltura] = useState<number | null>(null);
  const [clima, setClima] = useState<ClimaZona | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [cultivos, setCultivos] = useState<CultivoId[]>([]);
  const [division, setDivision] = useState<Division>("trimestral");
  const [plan, setPlan] = useState<PlanAnual | null>(null);
  const peticionClima = useRef<AbortController | null>(null);
  const peticionPlan = useRef<AbortController | null>(null);
  // Sube con cada lugar elegido: una ubicación que llega tarde no pisa lo que el usuario ya eligió
  const turno = useRef(0);

  const irA = (p: Paso) => setHistorial((h) => [...h, p]);
  const atras = () => (historial.length <= 2 ? volverAlMapa() : setHistorial((h) => h.slice(0, -1)));

  async function elegirLugar(lat: number, lon: number, origen: Lugar["origen"], departamento?: string | null, municipio?: string) {
    const dep = departamento ?? departamentoDe(departamentos, lat, lon);
    if (!dep) {
      setAviso("Ese punto está fuera de Honduras. Toca dentro del país.");
      return;
    }
    turno.current++;
    setAviso(null);
    setLugar({ lat, lon, departamento: dep, municipio: municipio ?? null, origen, celda: celdaDePunto(celdas, lat, lon) });
    setDepartamentoEnfocado(dep);
    setAltura(null);
    setClima(null);
    setPlan(null);
    setHistorial(["inicio", "lugar"]);

    peticionPlan.current?.abort();
    peticionClima.current?.abort();
    const control = new AbortController();
    peticionClima.current = control;
    // Desde la ubicación o el mapa no sabemos el municipio: el más cercano dentro del departamento
    if (!municipio) {
      obtenerMunicipios(dep).then((lista) => {
        const cercano = municipioMasCercano(lista, dep, lat, lon);
        if (cercano && !control.signal.aborted) setLugar((l) => (l && l.lat === lat && l.lon === lon ? { ...l, municipio: cercano.nombre } : l));
      });
    }
    try {
      setClima(await obtenerClima(lat, lon, control.signal));
    } catch {
      // Petición cancelada porque eligió otro lugar: no hay nada que mostrar
    }
  }

  function ubicarme() {
    if (!navigator.geolocation) {
      setAviso("Tu teléfono no comparte la ubicación. Elige tu departamento o toca tu terreno en el mapa.");
      return;
    }
    setBuscandoUbicacion(true);
    const miTurno = turno.current;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBuscandoUbicacion(false);
        if (miTurno !== turno.current) return; // mientras tanto eligió otro lugar
        const { latitude, longitude } = pos.coords;
        if (departamentoDe(departamentos, latitude, longitude)) {
          elegirLugar(latitude, longitude, "ubicacion");
        } else {
          elegirLugar(EJEMPLOS[0].lat, EJEMPLOS[0].lon, "lista");
          setAviso("Estás fuera de Honduras, así que te mostramos el ejemplo de Lempira.");
        }
      },
      () => {
        setBuscandoUbicacion(false);
        if (miTurno !== turno.current) return;
        setAviso("No pudimos ver tu ubicación. Elige tu departamento o toca tu terreno en el mapa.");
      },
      { timeout: 10000 },
    );
  }

  async function verPlan(modo: ModoPlan) {
    if (!lugar) return;
    irA("plan");
    setPlan(null);
    peticionPlan.current?.abort();
    const control = new AbortController();
    peticionPlan.current = control;
    try {
      setPlan(await armarPlan({ lat: lugar.lat, lon: lugar.lon, modo, cultivos: modo === "recomendado" ? [] : cultivos }, control.signal));
    } catch {
      // Cancelada: el usuario volvió atrás o pidió otro plan
    }
  }

  function volverAlMapa() {
    peticionClima.current?.abort();
    peticionPlan.current?.abort();
    setHistorial(["inicio"]);
    setAviso(null);
    setLugar(null);
    setClima(null);
    setPlan(null);
    setDepartamentoEnfocado(null);
  }

  const nombreLugar = lugar ? (lugar.municipio ? `${lugar.municipio}, ${lugar.departamento}` : lugar.departamento) : "";
  const tipoZona = clima?.tipo ?? lugar?.celda.tipo;

  return (
    <main className="flex h-dvh flex-col bg-background md:flex-row">
      {/* Mapa */}
      <section className="relative min-h-0 flex-1 overflow-hidden bg-mapa-fondo" aria-label="Mapa">
        <MapaReal
          departamentos={departamentos}
          capa={capa}
          inclinado={inclinado}
          lugar={lugar}
          departamentoEnfocado={departamentoEnfocado}
          onTocar={(lat, lon, dep) => elegirLugar(lat, lon, "mapa", dep)}
          onAltura={setAltura}
        />

        <header className="pointer-events-none absolute top-0 left-0 z-10 flex items-center gap-3 p-4">
          {paso === "inicio" ? (
            // Espacio libre alrededor del logo: ¼ de la altura del símbolo (guía de marca)
            <div className="pointer-events-auto flex flex-col gap-1 rounded-2xl bg-card px-3 py-2.5 shadow-[0_3px_0_rgb(28_36_32/0.2)]">
              <Image src="/marca/surco-horizontal-color.svg" alt="Surco" width={102} height={32} priority />
              <span className="text-[13px] leading-tight text-muted-foreground">Qué sembrar, con datos de NASA</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={volverAlMapa}
              className="pointer-events-auto flex h-12 items-center gap-1.5 rounded-full bg-card pr-5 pl-3.5 text-[17px] font-semibold shadow-[0_3px_0_rgb(28_36_32/0.2)] transition-transform duration-150 ease-out-strong active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-ring"
            >
              <IconoAtras className="size-5" />
              Mapa
            </button>
          )}
        </header>

        <div className="pointer-events-none absolute bottom-7 left-3 z-10 md:bottom-4 md:left-4">
          <div className="pointer-events-auto flex flex-wrap gap-1.5" aria-label="Leyenda">
            {capa === "clima" ? (
              (Object.keys(NOMBRE_ZONA) as TipoZona[]).map((z) => <Leyenda key={z} color={COLOR_ZONA[z]} texto={NOMBRE_ZONA[z]} />)
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-[13px] font-semibold shadow-sm">
                0 m
                <i
                  className="h-2.5 w-24 rounded-full"
                  style={{ background: `linear-gradient(to right, ${RAMPA_ALTURA.map(([, c]) => c).join(", ")})` }}
                />
                2,500 m
              </span>
            )}
          </div>
        </div>

        {/* Celular: arriba a la derecha, en columna. Computadora: abajo a la derecha. */}
        <div className="absolute top-14 right-3 z-10 md:top-auto md:right-4 md:bottom-4">
          <div className="flex flex-col items-end gap-1.5 md:flex-row">
            <div className="flex flex-col rounded-3xl bg-card p-1 shadow-sm md:flex-row md:rounded-full" role="group" aria-label="Capa del mapa">
              {(["clima", "altura"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={capa === c}
                  onClick={() => setCapa(c)}
                  className={`h-10 rounded-full px-4 text-[15px] font-semibold capitalize transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-ring ${
                    capa === c ? "bg-primary text-primary-foreground" : "text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-pressed={inclinado}
              onClick={() => setInclinado(!inclinado)}
              className="flex h-12 items-center gap-1.5 rounded-full bg-card px-4 text-[15px] font-semibold shadow-sm focus-visible:outline-2 focus-visible:outline-ring"
            >
              <IconoCubo className="size-4.5" />
              {inclinado ? "3D" : "Plano"}
            </button>
          </div>
        </div>
      </section>

      {/* Panel */}
      <aside className="relative z-20 -mt-6 max-h-[60dvh] w-full overflow-y-auto rounded-t-[28px] bg-card shadow-[0_-8px_24px_rgb(28_36_32/0.2)] md:mt-0 md:max-h-none md:w-[460px] md:rounded-none md:shadow-[-8px_0_24px_rgb(28_36_32/0.16)]">
        <div className="mx-auto mt-2.5 h-1.5 w-12 rounded-full bg-border md:hidden" aria-hidden="true" />
        {/* La key hace que el contenido entre suave cada vez que cambia el paso */}
        <div key={paso} className="entrar-paso flex flex-col gap-5 p-5 pb-8 md:p-7">
          {paso === "inicio" && (
            <PanelInicio
              celdas={celdas}
              departamentos={NOMBRES_DEPARTAMENTOS}
              aviso={aviso}
              buscandoUbicacion={buscandoUbicacion}
              ejemplos={EJEMPLOS}
              onDepartamento={setDepartamentoEnfocado}
              onElegir={elegirLugar}
              onUbicarme={ubicarme}
            />
          )}

          {paso === "lugar" && lugar && (
            <PanelLugar
              lugar={lugar}
              nombre={nombreLugar}
              clima={clima}
              altura={altura}
              aviso={aviso}
              onInfo={() => irA("info")}
              onPlan={() => irA("modo")}
              onCambiar={volverAlMapa}
            />
          )}

          {paso !== "inicio" && paso !== "lugar" && lugar && (
            <>
              {/* Dónde estoy y cómo vuelvo: siempre arriba del panel */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={atras}
                  className="flex h-11 items-center gap-1 rounded-full bg-background pr-4 pl-2.5 text-base font-semibold transition-transform duration-150 ease-out-strong active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <IconoAtras className="size-5" />
                  Atrás
                </button>
                <span className="min-w-0 truncate text-[15px] font-semibold">{nombreLugar}</span>
                {tipoZona && <ChipZona tipo={tipoZona} />}
              </div>

              {paso === "info" &&
                (clima ? (
                  <>
                    <ModuloClima clima={clima} />
                    <BotonPrimario onClick={() => irA("modo")}>Armar mi plan</BotonPrimario>
                  </>
                ) : (
                  <Cargando />
                ))}
              {paso === "modo" && (
                <PanelModo
                  onRecomendado={() => verPlan("recomendado")}
                  onMisCultivos={() => irA("cultivos")}
                />
              )}
              {paso === "cultivos" && (
                <ModuloCultivos cultivos={cultivos} onCultivos={setCultivos} onVerPlan={() => verPlan("mis-cultivos")} />
              )}
              {paso === "plan" &&
                (plan ? <ModuloPlan plan={plan} division={division} onDivision={setDivision} lugar={nombreLugar} /> : <Cargando />)}
            </>
          )}
        </div>
      </aside>
    </main>
  );
}

function Cargando() {
  return (
    <p role="status" className="animate-pulse py-10 text-center text-[17px] font-semibold text-muted-foreground">
      Preguntando a NASA POWER cómo llueve aquí…
    </p>
  );
}

function Leyenda({ color, texto }: { color: string; texto: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-[13px] font-semibold shadow-sm">
      <i className="size-3.5 rounded-full" style={{ background: color }} />
      {texto}
    </span>
  );
}
