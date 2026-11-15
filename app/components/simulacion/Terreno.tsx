// El terreno de la simulación: un rombo de tierra visto desde arriba y de lado (isométrico), con surcos y plantas.
// El rombo y los surcos nunca cambian de forma ni de lugar: lo único que cambia con el tiempo son las plantas y el cielo.
import { aspectoDe } from "@/lib/aspecto-cultivos";
import { estadoCarril, numCarriles, surcosPara } from "@/lib/simulacion";
import type { Ciclo, NivelLluvia } from "@/lib/simulacion";
import { Planta } from "./Planta";

const SUELO = "var(--decor-suelo)";
const SUELO_LADO = "color-mix(in oklab, var(--decor-suelo) 80%, var(--foreground))";
const SURCO = "color-mix(in oklab, var(--decor-suelo) 86%, var(--foreground))";
const CIELO = "var(--decor-cielo)";
const NUBE_CARGADA = "color-mix(in oklab, var(--decor-cielo) 70%, var(--foreground))";
const AGUA = "var(--chart-3)";
const SOL = "var(--decor-sol)";

const PLANTAS_POR_SURCO = 10;
const GOTAS: Record<NivelLluvia, number> = { poca: 0, regular: 3, mucha: 7 };

/** Número fijo por planta: decide su pequeña variación de lugar y en qué momento de la cosecha se retira. */
function semilla(s: number, p: number): number {
  return ((s + 1) * 73856093) ^ ((p + 1) * 19349663);
}

interface PropsTerreno {
  ciclos: Ciclo[];
  paso: number; // 0–47
  lluvia: NivelLluvia;
  dificil: boolean; // mes difícil
  descripcion: string; // texto alternativo del mes actual
  className?: string;
}

export function Terreno({ ciclos, paso, lluvia, dificil, descripcion, className = "" }: PropsTerreno) {
  const carriles = numCarriles(ciclos);
  const surcos = surcosPara(carriles);
  const lado = Math.max(surcos, PLANTAS_POR_SURCO);
  const dx = 160 / lado;
  const dy = 80 / lado;
  // Centro del rombo en (200, 170)
  const proyectar = (s: number, p: number): [number, number] => [
    200 + (p - s - (PLANTAS_POR_SURCO - surcos) / 2) * dx,
    170 + (p + s - (PLANTAS_POR_SURCO + surcos - 2) / 2) * dy,
  ];
  const punto = (s: number, p: number) => proyectar(s, p).join(" ");

  const m = 0.9; // margen de tierra alrededor de las plantas, en celdas
  const atras = proyectar(-m, -m);
  const derecha = proyectar(-m, PLANTAS_POR_SURCO - 1 + m);
  const frente = proyectar(surcos - 1 + m, PLANTAS_POR_SURCO - 1 + m);
  const izquierda = proyectar(surcos - 1 + m, -m);
  const grosor = 10;

  const porCarril = Array.from({ length: carriles }, (_, c) => estadoCarril(ciclos, c, paso));

  // De atrás hacia adelante, para que las plantas del frente tapen a las de atrás
  const lugares: { s: number; p: number }[] = [];
  for (let s = 0; s < surcos; s++) for (let p = 0; p < PLANTAS_POR_SURCO; p++) lugares.push({ s, p });
  lugares.sort((a, b) => a.p + a.s - (b.p + b.s));

  const gotas = GOTAS[lluvia];
  const cargada = dificil && lluvia === "mucha";

  return (
    <svg viewBox="0 0 400 280" role="img" aria-label={descripcion} className={className}>
      {/* Cielo: la lluvia del mes según NASA POWER, en tres niveles */}
      <g>
        {dificil && lluvia === "poca" && <circle cx="300" cy="44" r="16" fill={SOL} />}
        <g fill={cargada ? NUBE_CARGADA : CIELO}>
          <ellipse cx="118" cy="48" rx="34" ry="13" />
          <circle cx="104" cy="40" r="13" />
          <circle cx="126" cy="35" r="16" />
        </g>
        <g stroke={AGUA} strokeWidth="2.4" strokeLinecap="round">
          {Array.from({ length: gotas }, (_, i) => {
            const x = 92 + (i * 52) / Math.max(gotas - 1, 1);
            const y = 68 + (i % 2) * 8;
            return <path key={i} d={`M${x} ${y}l-2.5 7`} />;
          })}
        </g>
      </g>

      {/* La tierra: cara de arriba y el grosor del frente */}
      <path
        d={`M${izquierda.join(" ")}L${frente.join(" ")}L${derecha.join(" ")}v${grosor}L${frente[0]} ${frente[1] + grosor}L${izquierda[0]} ${izquierda[1] + grosor}Z`}
        fill={SUELO_LADO}
      />
      <path d={`M${atras.join(" ")}L${derecha.join(" ")}L${frente.join(" ")}L${izquierda.join(" ")}Z`} fill={SUELO} />

      {/* Surcos: más tenues donde la tierra descansa */}
      <g stroke={SURCO} strokeWidth="2" strokeLinecap="round">
        {Array.from({ length: surcos }, (_, s) => (
          <path
            key={s}
            d={`M${punto(s, -0.5)}L${punto(s, PLANTAS_POR_SURCO - 0.5)}`}
            opacity={carriles > 0 && porCarril[s % carriles] ? 1 : 0.4}
          />
        ))}
      </g>

      {lugares.map(({ s, p }) => {
        const enCarril = carriles > 0 ? porCarril[s % carriles] : null;
        if (!enCarril) return null;
        const n = semilla(s, p) >>> 0;
        const [x, y] = proyectar(s, p);
        const { estado, ciclo } = enCarril;
        return (
          <Planta
            key={`${s}-${p}`}
            aspecto={aspectoDe(ciclo.cultivo)}
            estado={estado}
            x={x + ((n % 5) - 2) * 0.6}
            y={y + (((n >>> 3) % 3) - 1) * 0.6}
            cosechada={estado.etapa === "cosecha" && (n % 1000) / 1000 < estado.avanceEtapa}
          />
        );
      })}
    </svg>
  );
}
