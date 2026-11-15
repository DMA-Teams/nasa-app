// "Estás aquí": resumen del punto elegido y lo que la app va a revisar.
import { NOMBRE_RELIEVE } from "@/lib/colores";
import { relieveDe } from "@/lib/clima";
import type { ClimaZona, Punto } from "@/lib/tipos";
import { Escena } from "./dibujos";
import { BotonPrimario, BotonSecundario, Chip, ChipZona, IconoBrote, IconoCalendario, IconoCapas, IconoGota, IconoMontana, IconoSol } from "./ui";

const PASOS = [
  { Icono: IconoSol, texto: "Cómo es el clima aquí" },
  { Icono: IconoBrote, texto: "Qué siembras hoy" },
  { Icono: IconoCapas, texto: "Cómo estará tu tierra en 3 años" },
  { Icono: IconoCalendario, texto: "Tu plan de siembra" },
];

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
      <Escena tipo={tipo} className="h-24" />

      <div className="flex flex-col gap-1">
        <span className="text-base font-semibold text-highlight">Tu terreno está en</span>
        <h1 className="font-display text-[30px] leading-[1.05] font-semibold tracking-[-0.015em] text-balance">
          {punto.departamento}, cerca de {punto.pueblo}
        </h1>
      </div>

      <div className="flex flex-wrap gap-2">
        <ChipZona tipo={tipo} grande />
        <Chip>
          <IconoMontana className="size-4.5 text-muted-foreground" />
          {NOMBRE_RELIEVE[relieveDe(metros)]}, {metros.toLocaleString("es-HN")} m{altura === null ? " (promedio de la zona)" : ""}
        </Chip>
        <Chip>
          <IconoGota className="size-4.5 text-chart-3" />
          {lluvia.toLocaleString("es-HN")} mm de lluvia al año
        </Chip>
      </div>

      <section className="flex flex-col gap-3 rounded-2xl bg-background p-4" aria-labelledby="titulo-pasos">
        <h2 id="titulo-pasos" className="text-[17px] font-semibold">Vamos a ver 4 cosas</h2>
        <ol className="flex flex-col gap-2.5">
          {PASOS.map(({ Icono, texto }, i) => (
            <li key={texto} className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zona-equilibrada/60 text-primary">
                <Icono className="size-5.5" />
              </span>
              <span className="text-[17px] leading-snug">
                <span className="sr-only">{i + 1}. </span>
                {texto}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-col gap-3">
        <BotonPrimario onClick={onEmpezar}>Empezar</BotonPrimario>
        <BotonSecundario onClick={onCambiar}>Elegir otro lugar</BotonSecundario>
      </div>

      <p className="text-[13px] text-muted-foreground" role="status">
        {clima === null
          ? "Consultando NASA POWER…"
          : clima.fuente === "en-vivo"
            ? "Datos en vivo de NASA POWER."
            : `Datos de respaldo de NASA POWER, guardados el ${clima.consultado}.`}{" "}
        Punto: {punto.lat.toFixed(3)}° N, {Math.abs(punto.lon).toFixed(3)}° O.
      </p>
    </div>
  );
}
