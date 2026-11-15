// "Tu parcela en el año": la parcela del plan, dibujada, pasando por los 12 meses.
// Es una ilustración: solo usa los meses, cultivos y lluvia que el plan ya trae. No pide nada al servidor ni al usuario.
// Se abre encima de todo en un <dialog> nativo (atrapa el foco y cierra con Esc); el plan de atrás no se desmonta.
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { nombreCultivo } from "@/lib/aspecto-cultivos";
import { agruparPlan } from "@/lib/plan";
import { ciclosDelPlan, nivelLluvia, PASOS_ANIO, PASOS_POR_MES, rangoPasos } from "@/lib/simulacion";
import type { Vista } from "@/lib/simulacion";
import { MESES_LARGOS, nombreMesesDificiles } from "@/lib/textos";
import type { Division, PlanAnual } from "@/lib/tipos";
import { IconoAtras, IconoGota } from "../ui";
import { LineaTiempo } from "./LineaTiempo";
import { PlantaLeyenda } from "./Planta";
import { Terreno } from "./Terreno";

const MS_POR_PASO = 400;

interface PropsSimulacion {
  plan: PlanAnual;
  division: Division; // la que el usuario tenía en el plan: vista inicial
  lugar: string;
  abierta: boolean;
  onCerrar: () => void;
}

export function SimulacionParcela({ plan, division, lugar, abierta, onCerrar }: PropsSimulacion) {
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
      className="m-0 h-dvh max-h-none w-dvw max-w-none border-0 bg-background p-0 text-foreground print:hidden"
    >
      {/* El contenido se monta al abrir: cada vez empieza desde el inicio y, al cerrar, el temporizador se va con él */}
      {abierta && <Contenido plan={plan} division={division} lugar={lugar} onCerrar={() => dialogo.current?.close()} />}
    </dialog>
  );
}

const lista = (ids: string[]) => ids.map(nombreCultivo).join(", ");
const mayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

function Contenido({ plan, division, lugar, onCerrar }: Omit<PropsSimulacion, "abierta">) {
  const [vista, setVista] = useState<Vista>(division);
  const [periodo, setPeriodo] = useState(0);
  const [paso, setPaso] = useState(0);
  // Arranca sola, salvo que la persona haya pedido reducir el movimiento
  const [reproduciendo, setReproduciendo] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const ciclos = useMemo(() => ciclosDelPlan(plan), [plan]);
  const cultivos = useMemo(() => [...new Set(ciclos.map((c) => c.cultivo))], [ciclos]);
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
  const lineas = [
    mes.sembrados.length > 0 && `Se siembra: ${lista(mes.sembrados)}`,
    mes.cosechados.length > 0 && `Se cosecha: ${lista(mes.cosechados)}`,
    mes.cultivos.length > 0 ? `En el terreno: ${lista(mes.cultivos)}` : "Tierra en descanso",
  ].filter((l): l is string => Boolean(l));
  const lluvia = `Lluvia: ${mes.lluvia.toLocaleString("es-HN")} mm`;
  const descripcion = `${indicador}. ${lineas.join(". ")}. ${lluvia}.`;

  return (
    <div className="flex h-full flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
      <div className="flex min-h-[46dvh] flex-1 flex-col lg:min-h-0">
        <header className="flex flex-col gap-2 px-4 pt-4 lg:px-8 lg:pt-6">
          <button
            type="button"
            onClick={onCerrar}
            className="-ml-2 inline-flex min-h-11 items-center gap-1 self-start rounded-lg px-2 text-apoyo text-foreground transition-colors duration-150 hover:bg-card"
          >
            <IconoAtras className="size-5" />
            Volver al plan
          </button>
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 id="titulo-simulacion" className="font-display text-titulo font-semibold">
              Tu parcela en el año
            </h2>
            <span className="text-apoyo text-muted-foreground">(simulado)</span>
          </div>
          <p className="text-apoyo text-muted-foreground">{lugar}</p>
        </header>
        <Terreno
          ciclos={ciclos}
          paso={paso}
          lluvia={nivelLluvia(mes.lluvia)}
          dificil={mes.dificil}
          descripcion={descripcion}
          className="min-h-0 w-full flex-1"
        />
      </div>

      <div className="flex shrink-0 flex-col gap-4 border-t border-border bg-card/60 px-4 py-4 lg:w-[26rem] lg:overflow-y-auto lg:border-t-0 lg:border-l lg:px-6 lg:py-6">
        {/* Lo que el plan dice de este mes. Mientras se reproduce no se anuncia cada paso. */}
        <div className="flex min-h-[7.5rem] flex-col gap-1" aria-live={activa ? "off" : "polite"}>
          <p className="font-display text-subtitulo font-semibold">{indicador}</p>
          {lineas.map((l) => (
            <p key={l} className="text-cuerpo leading-snug">
              {l}
            </p>
          ))}
          <p className="inline-flex flex-wrap items-center gap-1.5 text-apoyo text-muted-foreground">
            <IconoGota className="size-4" />
            {lluvia}
            {mes.dificil && <span className="rounded-full bg-aviso px-2 py-0.5 text-nota text-foreground">{nombreMesesDificiles(plan.tipoZona)}</span>}
          </p>
        </div>

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

        {cultivos.length > 0 && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Cultivos del plan">
            {cultivos.map((id) => (
              <li key={id} className="inline-flex items-center gap-1.5 text-apoyo">
                <PlantaLeyenda id={id} className="size-7" />
                {nombreCultivo(id)}
              </li>
            ))}
          </ul>
        )}

        <p className="text-apoyo text-muted-foreground">Ilustración de tu plan. No es una predicción.</p>
        <p className="text-nota text-muted-foreground">
          Lluvia: {plan.fuente.dataset}, promedio {plan.fuente.periodo}, consultado el {plan.fuente.consultado.slice(0, 10)}. Meses de siembra:
          reglas de ejemplo (simulado).
        </p>
      </div>
    </div>
  );
}
