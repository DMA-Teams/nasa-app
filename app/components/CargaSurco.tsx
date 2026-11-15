// Animación de carga de la marca Surco: cuatro parcelas vistas desde el satélite,
// con surcos a 0°, 45°, 90° y 135° (sentido horario), que giran una tras otra.
// Se arma con figuras simples para poder animar los surcos sin mover la parcela.
import { useId, type CSSProperties } from "react";

const LADO = 98; // lado de cada parcela, como en el símbolo (viewBox 210)
const SEPARACION = 14;
const RADIO = 26;
const SURCO = 26; // grosor de cada surco
const PASO = 37.5; // distancia entre surcos

// Sentido horario: arriba izquierda, arriba derecha, abajo derecha, abajo izquierda
const PARCELAS = [
  { x: 0, y: 0, base: 0 },
  { x: LADO + SEPARACION, y: 0, base: 45 },
  { x: LADO + SEPARACION, y: LADO + SEPARACION, base: 90 },
  { x: 0, y: LADO + SEPARACION, base: 135 },
];

export function CargaSurco({ className = "size-16" }: { className?: string }) {
  // useId trae caracteres que no sirven dentro de url(#…): se dejan solo letras y números
  const id = `carga${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg viewBox="0 0 210 210" className={className} aria-hidden="true">
      <defs>
        {PARCELAS.map((p, i) => (
          <clipPath key={i} id={`${id}-${i}`}>
            <rect x={p.x} y={p.y} width={LADO} height={LADO} rx={RADIO} />
          </clipPath>
        ))}
      </defs>
      {PARCELAS.map((p, i) => (
        <g key={i} clipPath={`url(#${id}-${i})`}>
          <g transform={`translate(${p.x + LADO / 2} ${p.y + LADO / 2})`}>
            {/* Cada parcela empieza su giro 0.4 s después de la anterior */}
            <g className="surcos" style={{ "--base": `${p.base}deg`, animationDelay: `${i * 0.4}s` } as CSSProperties}>
              {[-2, -1, 0, 1, 2].map((k) => (
                <rect key={k} x={-80} y={k * PASO - SURCO / 2} width={160} height={SURCO} fill="var(--primary)" />
              ))}
            </g>
          </g>
        </g>
      ))}
    </svg>
  );
}
