// Dibujos a color (SVG, sin librerías): el clima y los cultivos.
// Los colores salen de los tokens del tema Surco (--decor-* son solo para ilustración).
import type { CultivoId, TipoZona } from "@/lib/tipos";
import { apiDeCultivo } from "@/lib/cultivos";

const SOL = "var(--decor-sol)";
const CIELO = "var(--decor-cielo)";
const HOJA = "var(--decor-hoja)";
const SUELO = "var(--decor-suelo)";
const VERDE = "var(--primary)";
const AGUA = "var(--chart-3)";
const BLANCO = "var(--card)";

function Sol({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <g className="rayos" stroke={SOL} strokeWidth={r * 0.22} strokeLinecap="round">
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line
              key={i}
              x1={cx + Math.cos(a) * r * 1.35}
              y1={cy + Math.sin(a) * r * 1.35}
              x2={cx + Math.cos(a) * r * 1.75}
              y2={cy + Math.sin(a) * r * 1.75}
            />
          );
        })}
      </g>
      <circle cx={cx} cy={cy} r={r} fill={SOL} />
    </g>
  );
}

function Nube({ x, y, escala = 1, color = BLANCO }: { x: number; y: number; escala?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`} fill={color}>
      <circle cx="16" cy="20" r="12" />
      <circle cx="32" cy="14" r="15" />
      <circle cx="50" cy="20" r="12" />
      <rect x="14" y="18" width="38" height="14" rx="7" />
    </g>
  );
}

function Gotas({ x, y, n = 4 }: { x: number; y: number; n?: number }) {
  return (
    <g stroke={AGUA} strokeWidth="3" strokeLinecap="round">
      {Array.from({ length: n }, (_, i) => (
        <line
          key={i}
          className="gota"
          style={{ animationDelay: `${i * 0.3}s` }}
          x1={x + i * 13}
          y1={y + (i % 2) * 6}
          x2={x + i * 13 - 3}
          y2={y + (i % 2) * 6 + 8}
        />
      ))}
    </g>
  );
}

/** Una mata de maíz chiquita. Marchita = hojas caídas y amarillas. */
function Mata({ x, y, marchita = false }: { x: number; y: number; marchita?: boolean }) {
  const color = marchita ? "color-mix(in oklab, var(--decor-sol) 55%, var(--decor-suelo))" : VERDE;
  return (
    <g transform={`translate(${x} ${y})`} stroke={color} strokeWidth="2.6" strokeLinecap="round" fill="none">
      <path d="M0 0V-17" />
      {marchita ? (
        <path d="M0-12c-4 0-7 3-8 8M0-9c4 0 7 3 8 8" />
      ) : (
        <path d="M0-9c-5-1-8-4-9-8M0-12c5-1 8-4 9-8M0-5c-4 0-6-2-7-4" />
      )}
    </g>
  );
}

const TEXTO_ESCENA: Record<TipoZona, string> = {
  seca: "Dibujo: sol fuerte sobre una milpa seca",
  equilibrada: "Dibujo: sol y nubes sobre una milpa verde",
  lluviosa: "Dibujo: lluvia fuerte sobre el campo",
};

/**
 * El clima de la zona contado con un dibujo: se entiende sin leer.
 * `sinFondo`: sin el cielo de color, para ir directo sobre el panel. Las nubes, que son blancas,
 * pasan a celeste para que se vean sobre fondo claro (como en DibujoClima).
 */
export function Escena({ tipo, sinFondo = false, className = "" }: { tipo: TipoZona; sinFondo?: boolean; className?: string }) {
  const cielo = tipo === "seca" ? "color-mix(in oklab, var(--decor-sol) 38%, var(--card))" : tipo === "lluviosa" ? "color-mix(in oklab, var(--chart-3) 28%, var(--decor-cielo))" : CIELO;
  const nube = !sinFondo
    ? undefined
    : tipo === "lluviosa"
      ? "color-mix(in oklab, var(--chart-3) 45%, var(--card))"
      : "color-mix(in oklab, var(--decor-cielo) 75%, var(--card))";
  const cerroLejos = tipo === "seca" ? "color-mix(in oklab, var(--decor-sol) 50%, var(--decor-suelo))" : HOJA;
  const cerroCerca = tipo === "seca" ? "color-mix(in oklab, var(--decor-sol) 22%, var(--decor-suelo))" : VERDE;
  const matas = [28, 62, 96, 130, 164, 198, 232, 266, 300];

  return (
    <svg
      viewBox="0 0 320 110"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={TEXTO_ESCENA[tipo]}
      className={`block w-full ${sinFondo ? "" : "rounded-xl"} ${className}`}
    >
      {!sinFondo && <rect width="320" height="110" fill={cielo} />}
      {tipo === "seca" && <Sol cx={250} cy={36} r={20} />}
      {tipo === "equilibrada" && (
        <>
          <Sol cx={246} cy={32} r={15} />
          <Nube x={44} y={10} color={nube} />
          <Nube x={196} y={30} escala={0.8} color={nube} />
        </>
      )}
      {tipo === "lluviosa" && (
        <>
          <Nube x={30} y={4} escala={1.15} color={nube} />
          <Nube x={142} y={0} escala={1.3} color={nube} />
          <Nube x={232} y={8} escala={1.05} color={nube} />
          <Gotas x={50} y={46} />
          <Gotas x={160} y={50} n={5} />
          <Gotas x={248} y={46} n={3} />
        </>
      )}
      <path d="M0 84C50 56 96 58 150 76s112 6 170-18v52H0z" fill={cerroLejos} />
      <path d="M0 96c60-18 120-14 176-6s98 2 144-10v30H0z" fill={cerroCerca} />
      <rect y="100" width="320" height="10" fill={SUELO} />
      {matas.map((x, i) => (
        <Mata key={x} x={x} y={103 - (i % 2)} marchita={tipo === "seca"} />
      ))}
    </svg>
  );
}

/** Versión pequeña del clima para chips y tarjetas. */
export function DibujoClima({ tipo, className = "size-10" }: { tipo: TipoZona; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={`shrink-0 ${className}`} aria-hidden="true">
      {tipo === "seca" && <Sol cx={24} cy={24} r={10} />}
      {tipo === "equilibrada" && (
        <>
          <Sol cx={30} cy={17} r={8} />
          <Nube x={2} y={16} escala={0.6} color="color-mix(in oklab, var(--decor-cielo) 60%, var(--card))" />
        </>
      )}
      {tipo === "lluviosa" && (
        <>
          <Nube x={4} y={4} escala={0.62} color="color-mix(in oklab, var(--chart-3) 45%, var(--card))" />
          <g stroke={AGUA} strokeWidth="3" strokeLinecap="round">
            <path d="M15 32l-2 7M24 32l-2 7M33 32l-2 7" />
          </g>
        </>
      )}
    </svg>
  );
}

/** Cultivos dibujados a color (SVG en public/cultivos/): se reconocen sin leer el nombre. */
export function DibujoCultivo({ id, className = "size-14" }: { id: CultivoId; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG estático decorativo, no necesita optimización
    <img src={`/cultivos/${apiDeCultivo(id)}.svg`} alt="" aria-hidden="true" loading="lazy" draggable={false} className={`shrink-0 object-contain ${className}`} />
  );
}
