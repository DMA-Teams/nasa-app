// Pantalla única: mapa real a pantalla completa + panel de vidrio encima que avanza por pasos.
// Inicio → Lugar → (Clima) → ¿Cómo quieres tu plan? → (Tus cultivos) → Plan del año
"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { armarPlan, obtenerClima, obtenerMunicipios } from "@/lib/api";
import { COLOR_ZONA, NOMBRE_ZONA } from "@/lib/colores";
import { departamentoDe } from "@/lib/geo";
import { celdaDePunto } from "@/lib/mapa";
import { municipioMasCercano } from "@/lib/municipios";
import type { Celda, ClimaZona, CultivoId, DepartamentosGeoJSON, Division, Lugar, ModoPlan, PlanAnual, TipoZona } from "@/lib/tipos";
import { ModuloClima } from "./modulos/ModuloClima";
import { ModuloCultivos } from "./modulos/ModuloCultivos";
import { ModuloPlan } from "./modulos/ModuloPlan";
import { PanelInicio, type Ejemplo } from "./PanelInicio";
import { PanelLugar } from "./PanelLugar";
import { PanelModo } from "./PanelModo";
import { PlanImprimible } from "./PlanImprimible";
import { CargaSurco } from "./CargaSurco";
import { BotonPrimario, BotonSecundario, ChipZona, IconoAlerta, IconoAtras, IconoCubo } from "./ui";

// MapLibre necesita el navegador: no se renderiza en el servidor
const MapaReal = dynamic(() => import("./MapaReal").then((m) => m.MapaReal), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-mapa-fondo" aria-hidden="true" />,
});

type Paso = "inicio" | "lugar" | "info" | "modo" | "cultivos" | "plan";

// Casos del pitch: Lempira (canícula fuerte) y Atlántida (exceso de lluvia)
const EJEMPLOS: Ejemplo[] = [
  { etiqueta: "Lempira", detalle: "Déficit de lluvia", tipo: "seca", lat: 14.3, lon: -88.6 },
  { etiqueta: "Atlántida", detalle: "Exceso de lluvia", tipo: "lluviosa", lat: 15.7, lon: -86.9 },
];

// Mensajes que se leen en voz alta mientras se espera a NASA POWER
const CARGANDO_CLIMA = "Preguntando a NASA POWER cómo llueve aquí…";
const CARGANDO_PLAN = "Armando tu plan con los datos de NASA POWER…";
const OTRA_FORMA = "Elige tu departamento o toca tu terreno en el mapa.";
const FALLO = {
  clima: { titulo: "No pudimos leer el clima de este lugar" },
  plan: { titulo: "No pudimos armar tu plan" },
};

export function Explorador({ celdas, departamentos }: { celdas: Celda[]; departamentos: DepartamentosGeoJSON }) {
  const nombresDepartamentos = useMemo(
    () => departamentos.features.map((d) => d.properties.nombre).sort((a, b) => a.localeCompare(b, "es")),
    [departamentos],
  );
  // historial: los pasos por los que pasó, para que "Atrás" vuelva al paso real anterior
  const [historial, setHistorial] = useState<Paso[]>(["inicio"]);
  const paso = historial.at(-1)!;
  const [inclinado, setInclinado] = useState(true);
  // Si el servidor de relieve no responde, se quitan "Altura" y "3D" (no tendrían nada que mostrar)
  const [sinRelieve, setSinRelieve] = useState(false);
  const [departamentoEnfocado, setDepartamentoEnfocado] = useState<string | null>(null);
  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [altura, setAltura] = useState<number | null>(null);
  const [clima, setClima] = useState<ClimaZona | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [cultivos, setCultivos] = useState<CultivoId[]>([]);
  const [division, setDivision] = useState<Division>("trimestral");
  const [plan, setPlan] = useState<PlanAnual | null>(null);
  // Error inesperado al leer el clima o armar el plan (la red caída ya se cubre con el respaldo, en lib/api.ts)
  const [fallo, setFallo] = useState<"clima" | "plan" | null>(null);
  const peticionClima = useRef<AbortController | null>(null);
  const peticionPlan = useRef<AbortController | null>(null);
  const ultimoModo = useRef<ModoPlan>("recomendado");
  // Sube con cada lugar elegido: una ubicación que llega tarde no pisa lo que el usuario ya eligió
  const turno = useRef(0);
  const panel = useRef<HTMLDivElement>(null);

  // Celular: el mapa empieza plano. El relieve 3D pesa mucho en teléfonos sencillos; el botón "3D" lo activa.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- el tamaño de pantalla solo se conoce en el navegador
    if (window.matchMedia("(max-width: 767px)").matches) setInclinado(false);
  }, []);

  // Cada paso nuevo (o cuando termina de cargar): el foco va a su título,
  // para que teclado y lector de pantalla sepan dónde están
  const listo =
    paso === "info" ? clima !== null || fallo === "clima" : paso === "plan" ? plan !== null || fallo === "plan" : true;
  // Se compara con el estado anterior (no con "primera vez") para que al abrir la app el foco no salte
  const estadoAnterior = useRef(`${paso}:${listo}:${fallo}`);
  useEffect(() => {
    const estado = `${paso}:${listo}:${fallo}`;
    if (estado === estadoAnterior.current) return;
    estadoAnterior.current = estado;
    panel.current?.scrollTo({ top: 0 });
    const titulo = panel.current?.querySelector<HTMLElement>("h1");
    if (titulo) {
      titulo.tabIndex = -1;
      titulo.focus({ preventScroll: true });
    }
  }, [paso, listo, fallo]);

  // Un doble toque no apila el mismo paso dos veces (si no, "Atrás" parecería no hacer nada)
  const irA = (p: Paso) => setHistorial((h) => (h.at(-1) === p ? h : [...h, p]));
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
    setFallo(null);
    setHistorial(["inicio", "lugar"]);
    peticionPlan.current?.abort();

    // Desde la ubicación o el mapa no sabemos el municipio: el más cercano dentro del departamento.
    // Es un extra: si falla, el lugar se queda con el nombre del departamento.
    if (!municipio) {
      const miTurno = turno.current;
      obtenerMunicipios(dep)
        .then((lista) => {
          const cercano = municipioMasCercano(lista, dep, lat, lon);
          if (cercano && miTurno === turno.current) setLugar((l) => (l ? { ...l, municipio: cercano.nombre } : l));
        })
        .catch((err) => console.error("[municipios]", err));
    }
    await pedirClima(lat, lon);
  }

  async function pedirClima(lat: number, lon: number) {
    peticionClima.current?.abort();
    const control = new AbortController();
    peticionClima.current = control;
    setFallo((f) => (f === "clima" ? null : f));
    try {
      setClima(await obtenerClima(lat, lon, control.signal));
    } catch (err) {
      if (control.signal.aborted) return; // eligió otro lugar o volvió al mapa
      console.error("[clima]", err);
      setFallo("clima");
    }
  }

  function ubicarme() {
    if (!navigator.geolocation) {
      setAviso(`Tu teléfono no comparte la ubicación. ${OTRA_FORMA}`);
      return;
    }
    // Abrir la app por la IP de la compu (http://192.168…) en el celular: el navegador niega la ubicación sin preguntar
    if (!window.isSecureContext) {
      setAviso(`La ubicación solo funciona cuando la página abre con https. ${OTRA_FORMA}`);
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
      (error) => {
        setBuscandoUbicacion(false);
        if (miTurno !== turno.current) return;
        const motivo =
          error.code === error.PERMISSION_DENIED
            ? "No diste permiso para usar tu ubicación."
            : error.code === error.TIMEOUT
              ? "Tardó mucho en encontrar dónde estás. Al aire libre suele funcionar mejor."
              : "Tu teléfono no encontró dónde estás.";
        setAviso(`${motivo} ${OTRA_FORMA}`);
      },
      // Una ubicación de hace 5 minutos sirve: el terreno no se mueve
      { timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  }

  function verPlan(modo: ModoPlan) {
    if (!lugar) return;
    irA("plan");
    pedirPlan(modo);
  }

  async function pedirPlan(modo: ModoPlan) {
    if (!lugar) return;
    ultimoModo.current = modo;
    setPlan(null);
    setFallo((f) => (f === "plan" ? null : f));
    peticionPlan.current?.abort();
    const control = new AbortController();
    peticionPlan.current = control;
    try {
      setPlan(await armarPlan({ lat: lugar.lat, lon: lugar.lon, modo, cultivos: modo === "recomendado" ? [] : cultivos }, control.signal));
    } catch (err) {
      if (control.signal.aborted) return; // volvió atrás o pidió otro plan
      console.error("[plan]", err);
      setFallo("plan");
    }
  }

  function volverAlMapa() {
    peticionClima.current?.abort();
    peticionPlan.current?.abort();
    setHistorial(["inicio"]);
    setFallo(null);
    setAviso(null);
    setLugar(null);
    setClima(null);
    setPlan(null);
    setDepartamentoEnfocado(null);
  }

  const nombreLugar = lugar ? (lugar.municipio ? `${lugar.municipio}, ${lugar.departamento}` : lugar.departamento) : "";
  const tipoZona = clima?.tipo ?? lugar?.celda.tipo;
  // Una sola región viva, siempre montada: así el lector de pantalla sí anuncia los cambios
  const anuncio =
    aviso ??
    (paso === "info" && !clima
      ? fallo === "clima"
        ? FALLO.clima.titulo
        : CARGANDO_CLIMA
      : paso === "plan" && !plan
        ? fallo === "plan"
          ? FALLO.plan.titulo
          : CARGANDO_PLAN
        : "");

  return (
    <>
      {/* Al imprimir (Guardar como PDF) la app se oculta y sale PlanImprimible */}
      <main className="relative h-dvh overflow-hidden bg-mapa-fondo print:hidden">
        {/* Mapa: ocupa toda la pantalla y pasa por detrás del panel, que lo deja ver borroso */}
        <section className="absolute inset-0" aria-label="Mapa">
          <MapaReal
            departamentos={departamentos}
            inclinado={inclinado}
            lugar={lugar}
            departamentoEnfocado={departamentoEnfocado}
            onTocar={(lat, lon, dep) => elegirLugar(lat, lon, "mapa", dep)}
            onAltura={setAltura}
            onSinRelieve={() => {
              setSinRelieve(true);
              setInclinado(false);
            }}
          />
        </section>

        {/* Celular: columna (zona libre del mapa arriba, panel abajo). Computadora: todo flota sobre el mapa. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col md:block">
         <div className="relative min-h-0 flex-1 md:absolute md:inset-0">
          <header className="pointer-events-none absolute top-0 left-0 z-10 flex items-center gap-3 p-4">
            {paso === "inicio" ? (
              // Espacio libre alrededor del logo: ¼ de la altura del símbolo (guía de marca)
              <div className="vidrio-control pointer-events-auto flex flex-col gap-1 rounded-2xl px-3 py-2.5">
                <Image src="/marca/surco-horizontal-color.svg" alt="Surco" width={102} height={32} priority />
                <span className="text-nota leading-tight text-muted-foreground">Qué sembrar, con datos de NASA</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={volverAlMapa}
                className="vidrio-control pointer-events-auto flex min-h-12 items-center gap-1.5 rounded-full pr-5 pl-3.5 text-cuerpo font-semibold transition-[transform,background-color] duration-150 ease-out-strong hover:bg-card active:scale-[0.96]"
              >
                <IconoAtras className="size-5" />
                Mapa
              </button>
            )}
          </header>

          <div className="pointer-events-none absolute bottom-3 left-3 z-10 md:bottom-4 md:left-4">
            {/* Una sola superficie de vidrio para toda la leyenda: cada desenfoque se recalcula en cada cuadro del mapa */}
            <div
              role="group"
              aria-label="Leyenda: clima de cada departamento"
              // En la computadora la leyenda se envuelve antes de llegar al panel (472 px a la derecha)
              className="vidrio-control pointer-events-auto flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl px-3 py-1.5 text-nota font-semibold md:max-w-[calc(100vw-472px-2rem)]"
            >
              {(Object.keys(NOMBRE_ZONA) as TipoZona[]).map((z) => (
                <Leyenda key={z} color={COLOR_ZONA[z]} texto={NOMBRE_ZONA[z]} />
              ))}
            </div>
          </div>

          {/* El único control del mapa. Celular: arriba a la derecha. Computadora: abajo a la izquierda, sobre la leyenda (el panel va a la derecha). */}
          {!sinRelieve && (
          <div className="pointer-events-auto absolute top-14 right-3 z-10 md:top-auto md:right-auto md:bottom-14 md:left-4">
            <div className="flex">
              <button
                type="button"
                aria-pressed={inclinado}
                onClick={() => setInclinado(!inclinado)}
                className="vidrio-control flex min-h-12 items-center gap-1.5 rounded-full px-4 text-apoyo font-semibold transition-[transform,background-color] duration-150 ease-out-strong hover:bg-card active:scale-[0.96]"
              >
                <IconoCubo className="size-4.5" />
                {inclinado ? "3D" : "Plano"}
              </button>
            </div>
          </div>
          )}
         </div>

        {/* Panel de vidrio: hoja abajo en el celular; tarjeta flotante a la derecha en la computadora, tan alta como su contenido.
            El contenido se desplaza por dentro, así la barra de desplazamiento no se sale de las esquinas redondeadas. */}
        <aside className="vidrio pointer-events-auto relative z-20 flex max-h-[60dvh] w-full flex-col overflow-hidden rounded-t-3xl md:absolute md:top-4 md:right-4 md:max-h-[calc(100dvh-2rem)] md:w-[440px] md:rounded-3xl">
          <p role="status" className="sr-only">
            {anuncio}
          </p>
          <div ref={panel} className="desplazable min-h-0 overflow-y-auto md:my-3">
          {/* La key hace que el contenido entre suave cada vez que cambia el paso */}
          <div key={paso} className="entrar-paso flex flex-col gap-5 p-5 pb-8 md:px-7 md:py-4">
            {paso === "inicio" && (
              <PanelInicio
                celdas={celdas}
                departamentos={nombresDepartamentos}
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
                falloClima={fallo === "clima"}
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
                    className="flex min-h-11 items-center gap-1 rounded-full bg-background pr-4 pl-2.5 text-cuerpo font-semibold transition-[transform,background-color] duration-150 ease-out-strong hover:bg-secondary active:scale-[0.96]"
                  >
                    <IconoAtras className="size-5" />
                    Atrás
                  </button>
                  <span className="min-w-0 truncate text-apoyo font-semibold">{nombreLugar}</span>
                  {tipoZona && <ChipZona tipo={tipoZona} />}
                </div>

                {paso === "info" &&
                  (clima ? (
                    <>
                      <ModuloClima clima={clima} />
                      <BotonPrimario onClick={() => irA("modo")}>Armar mi plan</BotonPrimario>
                    </>
                  ) : fallo === "clima" ? (
                    <Fallo titulo={FALLO.clima.titulo} onReintentar={() => pedirClima(lugar.lat, lugar.lon)} onOtroLugar={volverAlMapa} />
                  ) : (
                    <Cargando texto={CARGANDO_CLIMA} />
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
                  (plan ? (
                    <ModuloPlan plan={plan} division={division} onDivision={setDivision} lugar={nombreLugar} />
                  ) : fallo === "plan" ? (
                    <Fallo titulo={FALLO.plan.titulo} onReintentar={() => pedirPlan(ultimoModo.current)} onOtroLugar={volverAlMapa} />
                  ) : (
                    <Cargando texto={CARGANDO_PLAN} />
                  ))}
              </>
            )}
          </div>
          </div>
        </aside>
        </div>
      </main>
      {paso === "plan" && plan && <PlanImprimible plan={plan} division={division} lugar={nombreLugar} />}
    </>
  );
}

// Solo se ve: el anuncio lo hace la región viva del panel
function Cargando({ texto }: { texto: string }) {
  // Con mala señal la espera puede llegar a 12 s (lib/api.ts): pasados 5 s se explica qué está pasando
  const [lento, setLento] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLento(true), 5000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <CargaSurco className="size-16" />
      <p className="text-cuerpo font-semibold text-muted-foreground">{texto}</p>
      {lento && (
        <p className="max-w-[32ch] text-apoyo text-muted-foreground transition-opacity duration-300 starting:opacity-0">
          La señal está lenta. Si tarda un poco más, usamos los datos de NASA POWER guardados en la app.
        </p>
      )}
    </div>
  );
}

// Algo salió mal sin que sea culpa de la red (esa ya cae al respaldo): decir qué pasó y cómo seguir
function Fallo({ titulo, onReintentar, onOtroLugar }: { titulo: string; onReintentar: () => void; onOtroLugar: () => void }) {
  return (
    <div className="flex flex-col gap-4 py-4">
      <IconoAlerta className="size-10 text-highlight" />
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-titulo font-semibold text-balance">{titulo}</h1>
        <p className="text-cuerpo text-muted-foreground">
          Algo falló al preparar los datos de este lugar. Vuelve a intentar; si sigue igual, prueba con otro lugar.
        </p>
      </div>
      <BotonPrimario onClick={onReintentar}>Intentar de nuevo</BotonPrimario>
      <BotonSecundario onClick={onOtroLugar}>Elegir otro lugar</BotonSecundario>
    </div>
  );
}

function Leyenda({ color, texto }: { color: string; texto: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <i className="size-3.5 shrink-0 rounded-full" style={{ background: color }} />
      {texto}
    </span>
  );
}
