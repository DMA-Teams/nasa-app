// Colores del mapa. MapLibre no entiende variables CSS, así que aquí van los valores
// del tema Surco (design-tokens/build/surco.css). Si cambian los tokens, actualiza esto.
import type { Relieve, TipoZona } from "./tipos";

const TOKENS = {
  primary: "#155E4B",
  highlight: "#9C5B0A",
  chart3: "#1D6FB8",
  success: "#155E4B",
  warning: "#8A5A00",
  foreground: "#1C2420",
  card: "#FFFFFF",
};

export const COLOR_ZONA: Record<TipoZona, string> = {
  seca: TOKENS.highlight,
  equilibrada: TOKENS.primary,
  lluviosa: TOKENS.chart3,
};

export const NOMBRE_ZONA: Record<TipoZona, string> = { seca: "Déficit de lluvia", equilibrada: "Lluvia equilibrada", lluviosa: "Exceso de lluvia" };
export const NOMBRE_RELIEVE: Record<Relieve, string> = { bajo: "Costa y valles", medio: "Zona media", montana: "Montaña" };

/** Mezcla dos colores hex en sRGB (p = cuánto de `a`). Así derivamos tonos sin inventar colores. */
function mezclar(a: string, b: string, p: number): string {
  const canal = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const rgb = [0, 1, 2].map((i) => Math.round(canal(a, i) * p + canal(b, i) * (1 - p)));
  return `#${rgb.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

// Rampa de altura (metros) para la capa "Altura"
export const RAMPA_ALTURA: [number, string][] = [
  [0, mezclar(TOKENS.success, TOKENS.card, 0.45)],
  [300, mezclar(TOKENS.warning, TOKENS.card, 0.4)],
  [800, TOKENS.warning],
  [1500, mezclar(TOKENS.warning, TOKENS.foreground, 0.5)],
  [2500, TOKENS.card],
];

export const COLOR_BORDE = TOKENS.card;
export const COLOR_SELECCION = TOKENS.highlight;
export const COLOR_FONDO = mezclar(TOKENS.chart3, TOKENS.foreground, 0.25); // océano mientras carga la imagen
