// Pantalla única: mapa real siempre visible + panel que avanza por pasos.
// Inicio → Estás aquí → 1 Clima → 2 Cultivos → 3 Tierra → 4 Plan
"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import departamentosJson from "@/public/fallback/departamentos.json";
import { construirClima } from "@/lib/clima";
import { COLOR_ZONA, NOMBRE_ZONA, RAMPA_ALTURA } from "@/lib/colores";
import { departamentoDe } from "@/lib/geo";
import { celdaDePunto, puebloMasCercano } from "@/lib/mapa";
import { evaluar } from "@/lib/motor";
import type { CapaMapa, Celda, ClimaZona, CultivoId, DepartamentosGeoJSON, Prioridad, Punto, TipoZona } from "@/lib/tipos";
import { ModuloClima } from "./modulos/ModuloClima";
import { ModuloCultivos } from "./modulos/ModuloCultivos";
import { ModuloPlan } from "./modulos/ModuloPlan";
import { ModuloTierra } from "./modulos/ModuloTierra";
import { PanelInicio, type Ejemplo } from "./PanelInicio";
import { PanelUbicacion } from "./PanelUbicacion";
import { BotonPrimario, BotonSecundario, ChipZona, IconoAtras, IconoBrote, IconoCalendario, IconoCapas, IconoCheck, IconoCubo, IconoSol } from "./ui";

// MapLibre necesita el navegador: no se renderiza en el servidor
const MapaReal = dynamic(() => import("./MapaReal").then((m) => m.MapaReal), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-mapa-fondo" aria-hidden="true" />,
});

const departamentos = departamentosJson as DepartamentosGeoJSON;

type Paso = "inicio" | "ubicacion" | "clima" | "cultivos" | "tierra" | "plan";
const MODULOS = [
  { paso: "clima", etiqueta: "Clima", Icono: IconoSol },
  { paso: "cultivos", etiqueta: "Cultivos", Icono: IconoBrote },
  { paso: "tierra", etiqueta: "Tierra", Icono: IconoCapas },
  { paso: "plan", etiqueta: "Plan", Icono: IconoCalendario },
] as const;

// Casos del pitch: Lempira (canícula fuerte) y Atlántida (exceso de lluvia)
const EJEMPLOS: Ejemplo[] = [
  { etiqueta: "Lempira", detalle: "Aquí falta agua", tipo: "seca", lat: 14.3, lon: -88.6 },
  { etiqueta: "Atlántida", detalle: "Aquí sobra agua", tipo: "lluviosa", lat: 15.7, lon: -86.9 },
];

export function Explorador({ celdas }: { celdas: Celda[] }) {
  const [paso, setPaso] = useState<Paso>("inicio");
  const [capa, setCapa] = useState<CapaMapa>("clima");
  const [inclinado, setInclinado] = useState(true);
  const [punto, setPunto] = useState<Punto | null>(null);
  const [altura, setAltura] = useState<number | null>(null);
  const [clima, setClima] = useState<ClimaZona | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [cultivos, setCultivos] = useState<CultivoId[]>(["maiz", "frijol"]);
  const [prioridad, setPrioridad] = useState<Prioridad>("tierra");
  const [elegidaId, setElegidaId] = useState<string | null>(null);
  const peticion = useRef<AbortController | null>(null);

  const resultado = useMemo(() => (clima ? evaluar(clima, cultivos, prioridad) : null), [clima, cultivos, prioridad]);
  const rotacionElegida =
    resultado?.opciones.find((o) => o.rotacion.id === (elegidaId ?? resultado.sugeridaId))?.rotacion ??
    resultado?.opciones[0].rotacion;

  async function elegirPunto(lat: number, lon: number, departamento?: string | null) {
    const dep = departamento ?? departamentoDe(departamentos, lat, lon);
    if (!dep) {
      setAviso("Ese punto está fuera de Honduras. Toca dentro del país.");
      return;
    }
    const celda = celdaDePunto(celdas, lat, lon);
    setAviso(null);
    setPunto({ lat, lon, departamento: dep, pueblo: puebloMasCercano(lat, lon), celda });
    setAltura(null);
    setPaso("ubicacion");
    setClima(null);
    setElegidaId(null);

    peticion.current?.abort();
    const control = new AbortController();
    peticion.current = control;
    try {
      const res = await fetch(`/api/clima?lat=${lat.toFixed(3)}&lon=${lon.toFixed(3)}`, { signal: control.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setClima(await res.json());
    } catch {
      // Sin conexión con nuestra API: usamos el respaldo del cuadro de NASA POWER más cercano
      if (!control.signal.aborted) setClima(construirClima(celda.lat, celda.lon, celda.resumen, "respaldo", "2026-11-14"));
    }
  }

  function ubicarme() {
    if (!navigator.geolocation) {
      setAviso("Tu teléfono no comparte la ubicación. Toca tu terreno en el mapa.");
      return;
    }
    setBuscandoUbicacion(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBuscandoUbicacion(false);
        const { latitude, longitude } = pos.coords;
        if (departamentoDe(departamentos, latitude, longitude)) {
          elegirPunto(latitude, longitude);
        } else {
          elegirPunto(EJEMPLOS[0].lat, EJEMPLOS[0].lon);
          setAviso("Estás fuera de Honduras, así que te mostramos el ejemplo de Lempira.");
        }
      },
      () => {
        setBuscandoUbicacion(false);
        setAviso("No pudimos ver tu ubicación. Toca tu terreno en el mapa o busca tu municipio.");
      },
      { timeout: 10000 },
    );
  }

  function volverAlMapa() {
    peticion.current?.abort();
    setPaso("inicio");
    setPunto(null);
    setClima(null);
  }

  const indiceModulo = MODULOS.findIndex((m) => m.paso === paso);
  const irModulo = (i: number) => setPaso(i < 0 ? "ubicacion" : MODULOS[i].paso);
  const tipoZona = clima?.tipo ?? punto?.celda.tipo;

  return (
    <main className="flex h-dvh flex-col bg-background md:flex-row">
      {/* Mapa */}
      <section className="relative min-h-0 flex-1 overflow-hidden bg-mapa-fondo" aria-label="Mapa">
        <MapaReal
          departamentos={departamentos}
          capa={capa}
          inclinado={inclinado}
          punto={punto}
          onTocar={(lat, lon, dep) => elegirPunto(lat, lon, dep)}
          onAltura={setAltura}
        />

        <header className="pointer-events-none absolute top-0 left-0 z-10 flex items-center gap-3 p-4">
          {paso === "inicio" ? (
            <div className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-card py-1.5 pr-5 pl-1.5 shadow-[0_3px_0_rgb(43_29_14/0.25)]">
              <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <IconoBrote className="size-6" />
              </span>
              <span className="flex flex-col">
                <span className="font-display text-[22px] leading-none font-extrabold">Mi Parcela</span>
                <span className="text-[13px] leading-tight text-muted-foreground">Honduras con datos de NASA</span>
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={volverAlMapa}
              className="pointer-events-auto flex h-12 items-center gap-1.5 rounded-full bg-card pr-5 pl-3.5 text-[17px] font-bold shadow-[0_3px_0_rgb(43_29_14/0.25)] transition-transform duration-150 ease-out-strong active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-ring"
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
              <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-[13px] font-bold shadow-sm">
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
                  className={`h-10 rounded-full px-4 text-[15px] font-bold capitalize transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-ring ${
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
              className="flex h-12 items-center gap-1.5 rounded-full bg-card px-4 text-[15px] font-bold shadow-sm focus-visible:outline-2 focus-visible:outline-ring"
            >
              <IconoCubo className="size-4.5" />
              {inclinado ? "3D" : "Plano"}
            </button>
          </div>
        </div>
      </section>

      {/* Panel */}
      <aside className="relative z-20 -mt-6 max-h-[60dvh] w-full overflow-y-auto rounded-t-[28px] bg-card shadow-[0_-8px_24px_rgb(43_29_14/0.22)] md:mt-0 md:max-h-none md:w-[460px] md:rounded-none md:shadow-[-8px_0_24px_rgb(43_29_14/0.18)]">
        <div className="mx-auto mt-2.5 h-1.5 w-12 rounded-full bg-border md:hidden" aria-hidden="true" />
        {/* La key hace que el contenido entre suave cada vez que cambia el paso */}
        <div key={paso} className="entrar-paso flex flex-col gap-5 p-5 pb-8 md:p-7">
          {paso === "inicio" && (
            <PanelInicio
              celdas={celdas}
              aviso={aviso}
              buscandoUbicacion={buscandoUbicacion}
              ejemplos={EJEMPLOS}
              onElegir={(lat, lon) => elegirPunto(lat, lon)}
              onUbicarme={ubicarme}
            />
          )}

          {paso === "ubicacion" && punto && (
            <PanelUbicacion punto={punto} clima={clima} altura={altura} onEmpezar={() => setPaso("clima")} onCambiar={volverAlMapa} />
          )}

          {indiceModulo >= 0 && punto && (
            <>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-display text-[22px] leading-none font-extrabold">{punto.departamento}</span>
                  {tipoZona && <ChipZona tipo={tipoZona} />}
                </div>
                {/* Camino de 4 pasos: los hechos llevan palomita, el actual es el grande */}
                <ol className="relative grid grid-cols-4" aria-label={`Paso ${indiceModulo + 1} de 4`}>
                  <span className="absolute top-5 right-[12.5%] left-[12.5%] h-1 -translate-y-1/2 rounded-full bg-border" aria-hidden="true">
                    <span
                      className="block h-full origin-left rounded-full bg-primary transition-transform duration-300 ease-out-strong"
                      style={{ transform: `scaleX(${indiceModulo / (MODULOS.length - 1)})` }}
                    />
                  </span>
                  {MODULOS.map(({ paso: p, etiqueta, Icono }, i) => (
                    <li key={p} className="relative flex flex-col items-center gap-1" aria-current={i === indiceModulo ? "step" : undefined}>
                      <span
                        className={`flex size-10 items-center justify-center rounded-full border-[3px] ${
                          i < indiceModulo
                            ? "border-primary bg-primary text-primary-foreground"
                            : i === indiceModulo
                              ? "scale-110 border-primary bg-card text-primary"
                              : "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        {i < indiceModulo ? <IconoCheck className="size-5" /> : <Icono className="size-5" />}
                      </span>
                      <span className={`text-sm ${i === indiceModulo ? "font-bold" : "text-muted-foreground"}`}>{etiqueta}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {!clima || !resultado || !rotacionElegida ? (
                <p role="status" className="animate-pulse py-10 text-center text-[17px] font-bold text-muted-foreground">Preguntando a NASA POWER cómo llueve aquí…</p>
              ) : (
                <>
                  {paso === "clima" && <ModuloClima clima={clima} />}
                  {paso === "cultivos" && (
                    <ModuloCultivos cultivos={cultivos} prioridad={prioridad} onCultivos={setCultivos} onPrioridad={setPrioridad} />
                  )}
                  {paso === "tierra" && <ModuloTierra resultado={resultado} elegidaId={rotacionElegida.id} onElegir={setElegidaId} />}
                  {paso === "plan" && (
                    <ModuloPlan rotacion={rotacionElegida} clima={clima} lugar={`${punto.pueblo}, ${punto.departamento}`} />
                  )}
                </>
              )}

              <div className="grid grid-cols-[1fr_2fr] items-start gap-3">
                <BotonSecundario className="min-h-15" onClick={() => irModulo(indiceModulo - 1)}>Atrás</BotonSecundario>
                {indiceModulo < MODULOS.length - 1 ? (
                  <BotonPrimario onClick={() => irModulo(indiceModulo + 1)} disabled={!clima}>
                    {["Siguiente", "Ver mi tierra", "Ver mi plan"][indiceModulo]}
                  </BotonPrimario>
                ) : (
                  <BotonSecundario className="min-h-15" onClick={volverAlMapa}>Ver otro lugar</BotonSecundario>
                )}
              </div>
            </>
          )}
        </div>
      </aside>
    </main>
  );
}

function Leyenda({ color, texto }: { color: string; texto: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-[13px] font-bold shadow-sm">
      <i className="size-3.5 rounded-full" style={{ background: color }} />
      {texto}
    </span>
  );
}
