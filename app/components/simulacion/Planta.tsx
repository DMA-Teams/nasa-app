// Una planta de la simulación: 7 formas base (SVG, sin librerías) que crecen desde la base según la etapa.
// Qué forma, color y detalle lleva cada cultivo sale de lib/aspecto-cultivos.ts.
// Solo se animan transform y opacity (clase .planta-sim en globals.css).
import { aspectoDe } from "@/lib/aspecto-cultivos";
import type { AspectoCultivo, Detalle, Forma } from "@/lib/aspecto-cultivos";
import { tamanoPlanta } from "@/lib/simulacion";
import type { EstadoCiclo } from "@/lib/simulacion";

const SUELO = "var(--decor-suelo)";
const TALLO = "color-mix(in oklab, var(--decor-suelo) 55%, var(--decor-hoja))";
const MONTICULO = "color-mix(in oklab, var(--decor-suelo) 70%, var(--card))";
const RASTROJO = "color-mix(in oklab, var(--decor-sol) 50%, var(--decor-suelo))";
const BRILLO = "var(--card)";
/** Caña y macolla se secan al madurar: la hoja se mezcla con el amarillo. */
const seco = (hoja: string) => `color-mix(in oklab, ${hoja} 70%, var(--decor-sol))`;

// Cada forma se dibuja con la base en (0, 0) y crece hacia arriba (y negativa), dentro de 20 de ancho.
function Cuerpo({ forma, hoja }: { forma: Forma; hoja: string }) {
  switch (forma) {
    case "cana":
      return (
        <g fill="none" stroke={hoja} strokeLinecap="round">
          <path d="M0 0V-26" strokeWidth="2" />
          <path d="M0-7C-5-12-9-10-10-6M0-13C5-18 9-16 10-12M0-19C-4-24-8-22-8-18" strokeWidth="2.2" />
        </g>
      );
    case "macolla":
      return (
        <path
          d="M0 0C-2-7-5-12-7-14M0 0C-1-8-1.5-13-1.5-17M0 0C1-8 2.5-12 3.5-16M0 0C3-6 6-10 8-12"
          fill="none"
          stroke={hoja}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      );
    case "mataBaja":
      return (
        <>
          <path d="M-8 0C-10-7-5-12 0-12C5-12 10-7 8 0Z" fill={hoja} />
          <path d="M-4-4C-3-8 1-9 4-8" fill="none" stroke={BRILLO} strokeOpacity="0.35" strokeWidth="1.4" strokeLinecap="round" />
        </>
      );
    case "rastrera":
      return (
        <>
          <path d="M-9-1C-4-3 4-3 9-1" fill="none" stroke={TALLO} strokeWidth="1.2" strokeLinecap="round" />
          <ellipse cx="-5" cy="-3" rx="5" ry="2.8" fill={hoja} />
          <ellipse cx="4.5" cy="-3.6" rx="5.5" ry="3" fill={hoja} />
          <ellipse cx="0" cy="-1.8" rx="4" ry="2.2" fill={hoja} stroke={BRILLO} strokeOpacity="0.3" strokeWidth="0.6" />
        </>
      );
    case "tutor":
      return (
        <>
          <path d="M0 0V-21" stroke={SUELO} strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="-3" cy="-7" r="4.5" fill={hoja} />
          <circle cx="3" cy="-11.5" r="4.5" fill={hoja} />
          <circle cx="-1" cy="-16.5" r="4" fill={hoja} />
        </>
      );
    case "roseta":
      return (
        <>
          <ellipse cx="0" cy="-3" rx="9" ry="4" fill={hoja} />
          <path d="M-7-3C-4-7 4-7 7-3" fill="none" stroke={BRILLO} strokeOpacity="0.4" strokeWidth="1.2" strokeLinecap="round" />
        </>
      );
    case "arbusto":
      return (
        <>
          <path d="M0 0V-13M0-9L-5-15M0-10L5-16" fill="none" stroke={TALLO} strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="-5" cy="-18" r="5" fill={hoja} />
          <circle cx="5" cy="-19" r="5" fill={hoja} />
          <circle cx="0" cy="-22" r="5.5" fill={hoja} />
        </>
      );
  }
}

// Dónde va el fruto, la vaina o la flor en cada forma
const PUNTOS: Record<Forma, [number, number][]> = {
  cana: [[3.5, -14], [-1.5, -19], [1.5, -23]],
  macolla: [[-7, -14], [-1.5, -17], [3.5, -16]],
  mataBaja: [[-4, -6], [0, -9], [4, -5]],
  rastrera: [[5, -3], [-5, -2.5], [0, -4]],
  tutor: [[-3, -8], [3, -12], [-1, -17]],
  roseta: [[0, -5], [0, -5], [0, -5]],
  arbusto: [[-5, -17], [5, -18], [0, -22]],
};

function DibujoDetalle({ forma, detalle, color }: { forma: Forma; detalle: Detalle; color: string }) {
  const puntos = PUNTOS[forma];
  const [x, y] = puntos[0];
  switch (detalle) {
    case "mazorca":
      return <ellipse cx={x} cy={y} rx="2" ry="4.5" fill={color} transform={`rotate(20 ${x} ${y})`} />;
    case "panoja":
      return <ellipse cx="0" cy="-27" rx="3" ry="5" fill={color} />;
    case "capsulas":
      return <>{puntos.map(([px, py], i) => <circle key={i} cx={px} cy={py} r="1.5" fill={color} />)}</>;
    case "espiga":
      return <>{puntos.map(([px, py], i) => <ellipse key={i} cx={px} cy={py} rx="1.2" ry="2.6" fill={color} />)}</>;
    case "bulbo":
      return <ellipse cx="0" cy="-2" rx="3.6" ry="3" fill={color} />;
    case "vainas":
      return (
        <>
          {puntos.map(([px, py], i) => (
            <ellipse key={i} cx={px} cy={py} rx="1" ry="3" fill={color} transform={`rotate(${i * 25 - 25} ${px} ${py})`} />
          ))}
        </>
      );
    case "flor":
      return <>{puntos.map(([px, py], i) => <circle key={i} cx={px} cy={py} r="1.5" fill={color} />)}</>;
    case "frutoRedondo":
      return forma === "rastrera" ? (
        <circle cx={x} cy={y} r="3.4" fill={color} stroke={BRILLO} strokeOpacity="0.35" strokeWidth="0.6" />
      ) : (
        <>{puntos.slice(0, 2).map(([px, py], i) => <circle key={i} cx={px} cy={py} r="2.1" fill={color} />)}</>
      );
    case "frutoLargo":
      return forma === "rastrera" ? (
        <ellipse cx={x} cy={y} rx="4.2" ry="1.7" fill={color} stroke={BRILLO} strokeOpacity="0.35" strokeWidth="0.6" />
      ) : (
        <>{puntos.slice(0, 2).map(([px, py], i) => <ellipse key={i} cx={px} cy={py} rx="1.5" ry="3.2" fill={color} />)}</>
      );
    case "cabeza":
      return <circle cx={x} cy={y} r="4.6" fill={color} stroke={BRILLO} strokeOpacity="0.4" strokeWidth="0.6" />;
    case "ninguno":
      return null;
  }
}

/** La altura del aspecto ajusta el tamaño sin encoger demasiado a las plantas bajas (cada forma ya tiene su proporción). */
const factorAltura = (altura: number) => 0.7 + 0.3 * altura;

interface PropsPlanta {
  aspecto: AspectoCultivo;
  estado: EstadoCiclo;
  x: number; // punto de la base en el SVG del terreno
  y: number;
  cosechada: boolean; // en etapa "cosecha": esta planta ya se retiró
}

export function Planta({ aspecto, estado, x, y, cosechada }: PropsPlanta) {
  const { etapa, avanceEtapa } = estado;
  const tamano = cosechada ? 0 : tamanoPlanta(estado) * factorAltura(aspecto.altura);
  const madura = etapa === "maduracion" || etapa === "cosecha";
  const seSeca = madura && (aspecto.forma === "cana" || aspecto.forma === "macolla");
  const opacidadDetalle = etapa === "cosecha" ? 1 : etapa === "maduracion" ? avanceEtapa : 0;
  const opacidadRastrojo = etapa === "rastrojo" ? 1 - avanceEtapa / 2 : cosechada ? 1 : 0;
  const conMonticulo = etapa === "siembra" || etapa === "germinacion";

  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse className="planta-sim" cx="0" cy="0" rx="5" ry="2" fill={MONTICULO} style={{ opacity: conMonticulo ? 1 : 0 }} />
      <path
        className="planta-sim"
        d="M-3 0L-4.5-5M2 0L3.5-4"
        fill="none"
        stroke={RASTROJO}
        strokeWidth="1.4"
        strokeLinecap="round"
        style={{ opacity: opacidadRastrojo }}
      />
      <g className="planta-sim" style={{ transform: `scale(${tamano})` }}>
        <Cuerpo forma={aspecto.forma} hoja={seSeca ? seco(aspecto.hoja) : aspecto.hoja} />
        <g className="planta-sim" style={{ opacity: opacidadDetalle }}>
          <DibujoDetalle forma={aspecto.forma} detalle={aspecto.detalle} color={aspecto.colorDetalle} />
        </g>
      </g>
    </g>
  );
}

/** La misma planta, adulta y con su detalle, para la leyenda. */
const ALTO_FORMA: Record<Forma, number> = { cana: 32, macolla: 19, mataBaja: 12, rastrera: 7, tutor: 22, roseta: 7, arbusto: 28 };
const ANCHO_PLANTA = 22;

function encuadreCentrado(forma: Forma): string {
  const alto = ALTO_FORMA[forma];
  const lado = Math.max(alto, ANCHO_PLANTA) + 2;
  return `${-lado / 2} ${-alto / 2 - lado / 2} ${lado} ${lado}`;
}

export function PlantaLeyenda({ id, className = "size-6", centrada = false }: { id: string; className?: string; centrada?: boolean }) {
  const aspecto = aspectoDe(id);
  return (
    <svg viewBox={centrada ? encuadreCentrado(aspecto.forma) : "-12 -30 24 32"} className={`shrink-0 ${className}`} aria-hidden="true">
      <Cuerpo forma={aspecto.forma} hoja={aspecto.hoja} />
      <DibujoDetalle forma={aspecto.forma} detalle={aspecto.detalle} color={aspecto.colorDetalle} />
    </svg>
  );
}
