// "Tu terreno está en…": resumen del lugar elegido y los dos caminos (ver el clima o armar el plan).
import type { ClimaZona, Lugar } from "@/lib/tipos";
import { DatosLugar } from "./DatosLugar";
import { Escena } from "./dibujos";
import { BotonPrimario, BotonSecundario, IconoCalendario, IconoSol } from "./ui";

interface Props {
  lugar: Lugar;
  nombre: string; // "Gracias, Lempira" o solo el departamento si no hay municipio
  clima: ClimaZona | null;
  altura: number | null; // del modelo de elevación; si no hay, se usa el promedio de NASA POWER
  aviso: string | null; // p. ej. "Estás fuera de Honduras, así que te mostramos el ejemplo…"
  onInfo: () => void;
  onPlan: () => void;
  onCambiar: () => void;
}

export function PanelLugar({ lugar, nombre, clima, altura, aviso, onInfo, onPlan, onCambiar }: Props) {
  const tipo = clima?.tipo ?? lugar.celda.tipo;

  return (
    <div className="flex flex-col gap-5">
      {aviso && (
        <p role="status" className="rounded-xl bg-decor-maiz-suave px-4 py-3 text-cuerpo font-semibold transition-[translate,opacity] duration-200 ease-out-strong starting:-translate-y-1 starting:opacity-0">
          {aviso}
        </p>
      )}

      <Escena tipo={tipo} className="h-24" />

      <div className="flex flex-col gap-1">
        <span className="text-cuerpo font-semibold text-primary">Tu terreno está en</span>
        <h1 className="font-display text-titulo font-semibold text-balance">{nombre}</h1>
      </div>

      <DatosLugar lugar={lugar} clima={clima} altura={altura} />

      <div className="flex flex-col gap-3">
        <BotonPrimario onClick={onPlan}>
          <IconoCalendario className="size-6" />
          Armar mi plan
        </BotonPrimario>
        <BotonSecundario className="min-h-15" onClick={onInfo}>
          <IconoSol className="size-6 text-highlight" />
          Ver cómo es el clima aquí
        </BotonSecundario>
        <button
          type="button"
          onClick={onCambiar}
          className="min-h-11 self-center px-3 text-cuerpo font-semibold text-primary underline-offset-4 hover:underline"
        >
          Elegir otro lugar
        </button>
      </div>

      <p className="text-nota text-muted-foreground" role="status">
        {clima === null
          ? "Consultando NASA POWER…"
          : clima.fuente === "en-vivo"
            ? "Datos en vivo de NASA POWER."
            : `Datos de respaldo de NASA POWER, guardados el ${clima.consultado}.`}{" "}
        Punto: {lugar.lat.toFixed(3)}° N, {Math.abs(lugar.lon).toFixed(3)}° O.
      </p>
    </div>
  );
}
