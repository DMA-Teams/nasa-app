// Colores del mapa. MapLibre no entiende variables CSS, así que aquí van los valores
// del tema Surco (design-tokens/build/surco.css). Si cambian los tokens, actualiza esto:
// tests/tokens.test.ts falla si esta copia, globals.css o el themeColor de layout.tsx se desfasan.
import type { Relieve, TipoZona } from "./tipos";

export const TOKENS = {
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

/**
 * Rampa de lluvia para el mapa del plan: mm por mes (promedio del periodo elegido), de blanco azulado a azul.
 * En mm por mes y no en total, para que trimestres y semestres compartan la misma escala.
 */
export const RAMPA_LLUVIA: [number, string][] = [
  [0, mezclar(TOKENS.chart3, TOKENS.card, 0.08)],
  [50, mezclar(TOKENS.chart3, TOKENS.card, 0.3)],
  [150, mezclar(TOKENS.chart3, TOKENS.card, 0.6)],
  [300, TOKENS.chart3],
];

/** Lluvia promedio por mes en esos meses (1–12). [55, 42, 102, …], [1, 2, 3] → 66 */
export function lluviaPromedio(lluviaMensual: number[], meses: number[]): number {
  if (meses.length === 0) return 0;
  return Math.round(meses.reduce((s, m) => s + (lluviaMensual[m - 1] ?? 0), 0) / meses.length);
}

export const COLOR_BORDE = TOKENS.card;
export const COLOR_SELECCION = TOKENS.highlight;
export const COLOR_FONDO = mezclar(TOKENS.chart3, TOKENS.foreground, 0.25); // océano mientras carga la imagen
