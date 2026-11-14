// "Estás aquí": resumen del punto elegido y lo que la app va a revisar.
import { NOMBRE_RELIEVE } from "@/lib/colores";
import { relieveDe } from "@/lib/clima";
import type { ClimaZona, Punto } from "@/lib/tipos";
import { BotonPrimario, BotonSecundario, Chip, ChipZona } from "./ui";

const PASOS = ["Cómo es el clima de tu zona", "Qué siembras hoy", "Cómo estará tu tierra en 3 años", "Tu plan de siembra para cuidarla"];

interface Props {
  punto: Punto;
  clima: ClimaZona | null;
  altura: number | null; // del modelo de elevación; si no hay, se usa el promedio de NASA POWER
  onEmpezar: () => void;
  onCambiar: () => void;
}

export function PanelUbicacion({ punto, clima, altura, onEmpezar, onCambiar }: Props) {
  const metros = altura ?? clima?.elevacion ?? punto.celda.elevacion;
  const tipo = clima?.tipo ?? punto.celda.tipo;
  const lluvia = clima?.lluviaAnual ?? punto.celda.lluviaAnual;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold tracking-wider text-highlight uppercase">Estás aquí</span>
        <h1 className="font-display text-2xl font-bold text-balance">
          {punto.departamento}, cerca de {punto.pueblo}
        </h1>
        <span className="text-sm text-muted-foreground">
          {punto.lat.toFixed(3)}° N, {Math.abs(punto.lon).toFixed(3)}° O
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <ChipZona tipo={tipo} />
        <Chip>
          {NOMBRE_RELIEVE[relieveDe(metros)]} · {metros.toLocaleString("es-HN")} m{altura === null ? " (promedio de la zona)" : ""}
        </Chip>
        <Chip>{lluvia.toLocaleString("es-HN")} mm de lluvia al año</Chip>
      </div>

      <section className="flex flex-col gap-2.5" aria-labelledby="titulo-pasos">
        <h2 id="titulo-pasos" className="text-[15px] font-semibold">Esto vamos a revisar de tu terreno</h2>
        <ol className="flex flex-col gap-2">
          {PASOS.map((p, i) => (
            <li key={p} className="flex items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zona-equilibrada/60 text-sm font-bold text-primary">{i + 1}</span>
              <span className="text-[15px]">{p}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="text-xs text-muted-foreground" role="status">
        {clima === null
          ? "Consultando NASA POWER…"
          : clima.fuente === "en-vivo"
            ? "Datos en vivo de NASA POWER."
            : `Datos de respaldo de NASA POWER, guardados el ${clima.consultado}.`}
      </p>

      <div className="flex flex-col gap-2.5">
        <BotonPrimario onClick={onEmpezar}>Empezar</BotonPrimario>
        <BotonSecundario onClick={onCambiar}>Cambiar ubicación</BotonSecundario>
      </div>
    </div>
  );
}
