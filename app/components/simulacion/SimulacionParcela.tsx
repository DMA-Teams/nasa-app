// "Tu parcela en el año": la parcela del plan, dibujada, pasando por los 12 meses.
// Es una ilustración: solo usa los meses, cultivos y lluvia que el plan ya trae. No pide nada al servidor ni al usuario.
// Se abre encima de todo en un <dialog> nativo (atrapa el foco y cierra con Esc); el plan de atrás no se desmonta.
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { nombreCultivo } from "@/lib/aspecto-cultivos";
import { agruparPlan } from "@/lib/plan";
import { ciclosDelPlan, lineasDelMes, nivelLluvia, PASOS_ANIO, PASOS_POR_MES, pasoInicial, rangoPasos, situacionCultivos } from "@/lib/simulacion";
import type { SituacionCultivo, Vista } from "@/lib/simulacion";
import { MESES_LARGOS, nombreMesesDificiles } from "@/lib/textos";
import type { PlanAnual } from "@/lib/tipos";
import { CalendarioCultivos } from "../CalendarioCultivos";
import { IconoAtras, IconoGota } from "../ui";
import { LineaTiempo } from "./LineaTiempo";
import { PlantaLeyenda } from "./Planta";
import { Terreno } from "./Terreno";

const MS_POR_PASO = 500;

// Cómo se marca cada situación: siembra en verde, cosecha o corte en el color de acento, lo que sigue creciendo en neutro
const CLASE_ETIQUETA = {
  siembra: "bg-primary text-primary-foreground",
  cosecha: "bg-highlight text-highlight-foreground",
  terreno: "border border-border bg-card text-foreground",
};
const seCorta = (s: SituacionCultivo) => s.texto.startsWith("Se corta");
const etiquetaDe = (s: SituacionCultivo) => (s.tipo === "siembra" ? "Siembra" : s.tipo === "cosecha" ? (seCorta(s) ? "Corte" : "Cosecha") : "Creciendo");

interface PropsSimulacion {
  plan: PlanAnual;
  lugar: string;
  abierta: boolean;
  onCerrar: () => void;
}

export function SimulacionParcela({ plan, lugar, abierta, onCerrar }: PropsSimulacion) {
  const dialogo = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (abierta && !d.open) d.showModal();
    if (!abierta && d.open) d.close();
  }, [abierta]);

  return (
    <dialog
      ref={dialogo}
      onClose={onCerrar}
      aria-labelledby="titulo-simulacion"
      className="m-0 h-dvh max-h-none w-dvw max-w-none overflow-hidden border-0 bg-background p-0 text-foreground print:hidden"
    >
      {/* El contenido se monta al abrir: cada vez empieza desde el inicio y, al cerrar, el temporizador se va con él */}
      {abierta && <Contenido plan={plan} lugar={lugar} onCerrar={() => dialogo.current?.close()} />}
    </dialog>
  );
}

const mayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

function Contenido({ plan, lugar, onCerrar }: Omit<PropsSimulacion, "abierta">) {
  // Abre en el año completo y en el primer mes con algo sembrado, para que lo primero que se vea sea la parcela creciendo
  const [vista, setVista] = useState<Vista>("anual");
  const [periodo, setPeriodo] = useState(0);
  const [paso, setPaso] = useState(() => pasoInicial(plan));
  // Arranca sola, salvo que la persona haya pedido reducir el movimiento
  const [reproduciendo, setReproduciendo] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const ciclos = useMemo(() => ciclosDelPlan(plan), [plan]);
  const periodos = useMemo(() => (vista === "anual" ? [] : agruparPlan(plan, vista).map(({ id, nombre }) => ({ id, nombre }))), [plan, vista]);

  const rango = rangoPasos(vista, periodo);
  const [inicio, fin] = rango;
  const activa = reproduciendo && paso < fin; // al llegar al final del tramo se detiene sola

  useEffect(() => {
    if (!activa) return;
    const reloj = setInterval(() => setPaso((p) => Math.min(p + 1, fin)), MS_POR_PASO);
    return () => clearInterval(reloj);
  }, [activa, fin]);

  function reproducir() {
    if (activa) return setReproduciendo(false);
    if (paso >= fin) setPaso(inicio);
    setReproduciendo(true);
  }

  function irA(nuevoPaso: number) {
    setReproduciendo(false);
    setPaso(nuevoPaso);
  }

  function elegirPeriodo(i: number) {
    setPeriodo(i);
    irA(rangoPasos(vista, i)[0]);
  }

  /** Cambiar de vista conserva el mes: se elige el periodo que lo contiene. */
  function cambiarVista(v: Vista) {
    const [a, b] = rangoPasos(v, 0);
    setVista(v);
    setPeriodo(v === "anual" ? 0 : Math.floor(paso / (b - a + 1)));
  }

  function mover(direccion: 1 | -1) {
    if (vista !== "anual") {
      const i = Math.min(Math.max(periodo + direccion, 0), periodos.length - 1);
      return elegirPeriodo(i);
    }
    const mes = Math.floor(paso / PASOS_POR_MES);
    // Hacia atrás: primero al inicio del mes actual; si ya está ahí, al mes anterior
    const destino = direccion === 1 ? mes + 1 : paso % PASOS_POR_MES === 0 ? mes - 1 : mes;
    irA(Math.min(Math.max(destino * PASOS_POR_MES, 0), PASOS_ANIO - PASOS_POR_MES));
  }

  const indiceMes = Math.floor(paso / PASOS_POR_MES);
  const mes = plan.meses[indiceMes];
  const nombreMes = mayuscula(MESES_LARGOS[indiceMes]);
  const indicador = vista === "anual" ? nombreMes : `${nombreMes} · ${periodos[periodo]?.nombre ?? ""}`;
  const lineas = lineasDelMes(mes);
  const lluvia = `Lluvia: ${mes.lluvia.toLocaleString("es-HN")} mm`;
  const situaciones = situacionCultivos(plan, ciclos, indiceMes + 1);
  // Lo que pasa este mes, en etiquetas: primero siembra y cosecha (lo que el plan fija), luego lo que sigue en el terreno
  const grupo = (titulo: string, clase: string, filtro: (s: SituacionCultivo) => boolean) => {
    const nombres = situaciones.filter(filtro).map((s) => nombreCultivo(s.id));
    return nombres.length > 0 ? [{ texto: `${titulo}: ${nombres.join(", ")}`, clase }] : [];
  };
  const eventos = [
    ...grupo("Siembra", CLASE_ETIQUETA.siembra, (s) => s.tipo === "siembra"),
    ...grupo("Cosecha", CLASE_ETIQUETA.cosecha, (s) => s.tipo === "cosecha" && !seCorta(s)),
    ...grupo("Corte", CLASE_ETIQUETA.cosecha, (s) => s.tipo === "cosecha" && seCorta(s)),
    ...grupo("Creciendo", CLASE_ETIQUETA.terreno, (s) => s.tipo === "terreno"),
    ...(mes.cultivos.length === 0 ? [{ texto: "Tierra en descanso", clase: "border border-border bg-card text-muted-foreground" }] : []),
  ];
  const descripcion = `${indicador}. ${lineas.join(". ")}. ${lluvia}.`;

  return (
    <div className="flex h-full flex-col overflow-x-hidden overflow-y-auto lg:flex-row lg:overflow-hidden">
      <div className="flex min-h-[58dvh] flex-1 flex-col lg:min-h-0">
        <header className="flex flex-col gap-1 px-4 pt-3 lg:px-8 lg:pt-6">
          <button
            type="button"
            onClick={onCerrar}
            className="-ml-2 inline-flex min-h-11 items-center gap-1 self-start rounded-lg px-2 text-apoyo text-foreground transition-colors duration-150 hover:bg-card"
          >
            <IconoAtras className="size-5" />
            Volver al plan
          </button>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h2 id="titulo-simulacion" className="font-display text-subtitulo font-semibold">
              Tu parcela en el año
            </h2>
            <span className="text-apoyo text-muted-foreground">(simulado) · {lugar}</span>
          </div>
        </header>

        {/* En qué mes va y qué pasa: grande y pegado a la parcela, para no tener que buscarlo */}
        <div className="flex flex-col gap-2 px-4 pt-3 lg:px-8 lg:pt-5">
          <p className="flex flex-wrap items-baseline gap-x-3">
            <span className="font-display text-[2.25rem] leading-none font-semibold lg:text-[3rem]">{nombreMes}</span>
            <span className="text-apoyo text-muted-foreground tabular-nums">
              Mes {indiceMes + 1} de 12{vista !== "anual" && periodos[periodo] ? ` · ${periodos[periodo].nombre}` : ""}
            </span>
          </p>
          <ul className="flex min-h-9 flex-wrap items-center gap-2" aria-label="Lo que pasa este mes">
            {eventos.map((e) => (
              <li key={e.texto} className={`rounded-full px-3 py-1 text-apoyo ${e.clase}`}>
                {e.texto}
              </li>
            ))}
            <li className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-apoyo">
              <IconoGota className="size-4 text-muted-foreground" />
              {mes.lluvia.toLocaleString("es-HN")} mm de lluvia
            </li>
            {mes.dificil && <li className="rounded-full bg-aviso px-3 py-1 text-apoyo">{nombreMesesDificiles(plan.tipoZona)}</li>}
          </ul>
        </div>

        <Terreno
          ciclos={ciclos}
          paso={paso}
          lluvia={nivelLluvia(mes.lluvia)}
          dificil={mes.dificil}
          descripcion={descripcion}
          className="min-h-0 w-full flex-1"
        />
      </div>

      <div className="relative flex shrink-0 flex-col gap-5 overflow-x-hidden border-t border-border bg-card/60 px-4 py-4 lg:w-[27rem] lg:overflow-y-auto lg:border-t-0 lg:border-l lg:px-6 lg:py-6">
        <LineaTiempo
          vista={vista}
          onVista={cambiarVista}
          periodos={periodos}
          periodo={periodo}
          onPeriodo={elegirPeriodo}
          paso={paso}
          rango={rango}
          onPaso={irA}
          reproduciendo={activa}
          onReproducir={reproducir}
          onAnterior={() => mover(-1)}
          onSiguiente={() => mover(1)}
          mesesDificiles={plan.meses.filter((m) => m.dificil).map((m) => m.mes)}
        />

        {/* Cultivo por cultivo: qué le pasa en este mes. Mientras se reproduce no se anuncia cada paso. */}
        <section className="flex flex-col gap-2" aria-labelledby="titulo-situacion">
          <h3 id="titulo-situacion" className="text-cuerpo font-semibold">
            Tus cultivos en {MESES_LARGOS[indiceMes]}
          </h3>
          {situaciones.length === 0 ? (
            <p className="text-apoyo text-muted-foreground">Tierra en descanso todo el año.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border border-y border-border" aria-live={activa ? "off" : "polite"}>
              {situaciones.map((s) => (
                <li key={s.id} className={`flex items-center gap-3 py-2.5 ${s.tipo === "fuera" ? "opacity-60" : ""}`}>
                  <PlantaLeyenda id={s.id} className="size-9" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-cuerpo leading-tight font-semibold">{nombreCultivo(s.id)}</span>
                    <span className="text-apoyo leading-snug text-muted-foreground">{s.texto}</span>
                  </span>
                  {s.tipo !== "fuera" && <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-nota ${CLASE_ETIQUETA[s.tipo]}`}>{etiquetaDe(s)}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* El mismo calendario del plan, con el mes que se está viendo marcado */}
        <CalendarioCultivos plan={plan} mesActual={indiceMes + 1} />

        <p className="text-apoyo text-muted-foreground">Ilustración de tu plan. No es una predicción.</p>
        <p className="text-nota text-muted-foreground">
          Lluvia: {plan.fuente.dataset}, promedio {plan.fuente.periodo}, consultado el {plan.fuente.consultado.slice(0, 10)}. Meses de siembra:
          reglas de ejemplo (simulado).
        </p>
      </div>
    </div>
  );
}
